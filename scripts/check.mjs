import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const routes = ['', 'about', ...Object.keys(site.projects).map((slug) => `design/${slug}`), 'test', 'gallery/photography'];
const productionOrigin = 'https://www.emilyhs1eh.com';
const docs = await readdir('dist', { recursive: true });
const buildRoots = ['/', '/portfolio/'];
let references = 0;

async function reader(path) {
  const file = join('dist', path);
  const info = await stat(file).catch(() => null);
  assert(info, `Missing generated file ${file}`);
  return info.isDirectory() ? join(file, 'index.html') : file;
}

for (const route of routes) {
  const markup = await readFile(join('dist', route, 'index.html'), 'utf8');
  assert.match(markup, /<html lang="en">/);
  assert.match(markup, /<meta name="description" content="[^"]+"/);
  assert(markup.includes(`rel="canonical" href="${productionOrigin}/${route ? route + '/' : ''}"`), route);
  assert.equal((markup.match(/id="main"/g) || []).length, 1, route);
  assert.doesNotMatch(markup, /framerusercontent|events\.framer|data-framer|\{\{\w+\}\}/i, route);
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
    for (const [, address] of markup.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
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
assert.equal((sitemap.match(/<loc>/g) || []).length, 8);
assert(!sitemap.includes('/test') && !sitemap.includes('/gallery/photography'));
console.log(`Validated ${routes.length} routes, ${routes.length - 1} legacy aliases, and ${references} local references across root and GitHub Pages paths.`);
