import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const routes = ['', 'about', ...Object.keys(site.projects).map((slug) => `design/${slug}`), 'test', 'gallery/photography'];
const productionOrigin = 'https://www.emilyhs1eh.com';
const docs = await readdir('dist', { recursive: true });
const buildRoots = ['/', '/portfolio/'];
const indexable = new Set(['', 'about', ...Object.keys(site.projects).map((slug) => `design/${slug}`)]);
const titles = new Set();
const descriptions = new Set();
const socialImages = new Set();
const canonicalUrls = [];
let references = 0;

async function reader(path) {
  const file = join('dist', path);
  const info = await stat(file).catch(() => null);
  assert(info, `Missing generated file ${file}`);
  return info.isDirectory() ? join(file, 'index.html') : file;
}

for (const route of routes) {
  const markup = await readFile(join('dist', route, 'index.html'), 'utf8');
  const canonical = `${productionOrigin}/${route ? route + '/' : ''}`;
  assert.match(markup, /<html lang="en">/);
  assert.match(markup, /<meta name="description" content="[^"]+"/);
  assert(markup.includes(`rel="canonical" href="${canonical}"`), route);
  assert.equal((markup.match(/id="main"/g) || []).length, 1, route);
  assert.doesNotMatch(markup, /framerusercontent|events\.framer|data-framer|\{\{\w+\}\}/i, route);
  const schema = markup.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  const analytics = markup.match(/<script data-analytics>([^<]+)<\/script>/);
  if (indexable.has(route)) {
    const title = markup.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = markup.match(/<meta name="description" content="([^"]+)"/)?.[1];
    const image = markup.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    assert(title && !titles.has(title), `Missing or duplicate title on ${route || '/'}`);
    assert(description && !descriptions.has(description), `Missing or duplicate description on ${route || '/'}`);
    assert(image && !socialImages.has(image), `Missing or duplicate sharing image on ${route || '/'}`);
    assert(image.startsWith(`${productionOrigin}/media/social/`), image);
    const imagePath = await reader(new URL(image).pathname.slice(1));
    assert((await readFile(imagePath)).subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])), image);
    assert(markup.includes(`name="twitter:image" content="${image}"`), route);
    assert.match(markup, /<meta property="og:image:alt" content="[^"]+"/, route);
    assert.match(markup, /<meta name="twitter:image:alt" content="[^"]+"/, route);
    assert.equal((markup.match(/<h1\b/g) || []).length, 1, route);
    assert(schema, route);
    const data = JSON.parse(schema[1]);
    assert.equal(data.url, canonical);
    assert.equal(data['@type'], route === '' ? 'WebSite' : route === 'about' ? 'ProfilePage' : 'CreativeWork');
    if (route.startsWith('design/')) assert(data.keywords?.length, route);
    assert(analytics, route);
    if (route === '') {
      for (const hostname of [new URL(productionOrigin).hostname, 'portfolio-preview.example']) {
        const scripts = [];
        const window = {};
        const document = { createElement: () => ({}), head: { append: (script) => scripts.push(script) } };
        runInNewContext(analytics[1], { location: { protocol: 'https:', hostname }, document, window });
        if (hostname === new URL(productionOrigin).hostname) {
          assert.equal(scripts.length, 1);
          assert.equal(scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${site.googleAnalyticsId}`);
          assert(window.dataLayer.some(([command, id]) => command === 'config' && id === site.googleAnalyticsId));
        } else {
          assert.equal(scripts.length, 0);
          assert.equal(window.dataLayer, undefined);
        }
      }
    }
    titles.add(title);
    descriptions.add(description);
    socialImages.add(image);
    canonicalUrls.push(canonical);
  } else {
    assert.match(markup, /<meta name="robots" content="noindex">/, route);
    assert(!schema, route);
    assert(!analytics, route);
  }
  if (route) {
    const alias = await readFile(join('dist', route + '.html'), 'utf8');
    assert(alias.includes(`url=./${route.split('/').at(-1)}/`), `Redirect for ${route}`);
  }
  for (const img of markup.matchAll(/<img\b[^>]+>/g)) {
    assert.match(img[0], /\balt="[^"]*"/, route);
    assert.match(img[0], /\bwidth="\d+" height="\d+"/, route);
  }
  for (const buildRoot of buildRoots) {
    const url = new URL(buildRoot + (route ? route + '/' : ''), 'https://preview.example');
    const addresses = [...markup.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(([, address]) => address);
    for (const [, srcset] of markup.matchAll(/\bsrcset="([^"]+)"/g)) {
      addresses.push(...srcset.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]));
    }
    for (const address of addresses) {
      const link = new URL(address, url);
      if (link.origin !== url.origin) continue;
      assert(link.pathname.startsWith(buildRoot), `Link escapes the site from ${url.pathname}: ${address}`);
      const target = await reader(link.pathname.slice(buildRoot.length));
      if (link.hash) {
        const destination = await readFile(target, 'utf8');
        assert(destination.includes(`id="${decodeURIComponent(link.hash.slice(1))}"`), `Broken fragment ${link}`);
      }
      references++;
    }
  }
}

for (const file of docs.filter((file) => file.endsWith('.css'))) {
  const css = await readFile(join('dist', file), 'utf8');
  for (const [, asset] of css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
    await reader(asset);
  }
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url), canonicalUrls);
assert.match(await readFile('dist/robots.txt', 'utf8'), /^Sitemap: https:\/\/www\.emilyhs1eh\.com\/sitemap\.xml$/m);
console.log(`Validated SEO metadata, structured data, sharing images, sitemap entries, and production-only analytics for ${indexable.size} portfolio pages.`);
console.log(`Validated ${routes.length} routes, ${routes.length - 1} legacy aliases, and ${references} local references across root and GitHub Pages paths.`);
