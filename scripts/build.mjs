import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { escape, page, projectCard, relatedProjects } from './components.mjs';

const output = 'dist';
const origin = new URL('https://www.emilyhs1eh.com/');
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const projects = Object.entries(site.projects);
const routes = [
  { route: '', source: 'home', meta: site.home, pageClass: 'home-page' },
  { route: 'about', source: 'about', meta: site.about, pageClass: 'about-page' },
  ...projects.map(([slug, meta]) => ({ route: `design/${slug}`, source: slug, meta, pageClass: `case-page ${slug}-page` })),
  { route: 'test', source: 'test', meta: site.test, pageClass: 'case-page test-page', noindex: true },
  { route: 'gallery/photography', meta: site['gallery/photography'], pageClass: 'photography-page', empty: true, noindex: true },
];
const canonical = (route) => new URL(route ? route + '/' : '', origin);
const rootFrom = (route) => route ? '../'.repeat(route.split('/').length) : './';

async function write(path, data) {
  const file = join(output, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, data);
}

await rm(output, { recursive: true, force: true });
await mkdir(output);
await Promise.all(['media', 'style.css', 'fonts.css', 'interactions.js'].map((path) => (
  cp(path, join(output, path), { recursive: true })
)));

for (const entry of routes) {
  const { route, source, meta } = entry;
  const root = rootFrom(route);
  const fragment = source ? await readFile(`content/${source}.html`, 'utf8') : '';
  const body = fragment
    .replace('{{projects}}', () => projects.map(([slug, project], index) => projectCard(slug, project, root, index === 0)).join('\n'))
    .replace('{{related}}', () => relatedProjects(meta.related, meta.relatedMobile, site.projects, root))
    .replaceAll('{{root}}', root);
  if (/\{\{\w+\}\}/.test(body)) throw new Error(`Unresolved component in ${route || '/'}`);
  await write(join(route, 'index.html'), page({ ...entry, site, root, body, canonical: canonical(route) }));
  if (route) {
    const target = `./${route.split('/').at(-1)}/`;
    await write(`${route}.html`, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escape(meta.title)}</title>
  <link rel="canonical" href="${canonical(route)}">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0;url=${target}">
</head>
<body><a href="${target}">Continue to ${escape(meta.title)}</a></body>
</html>
`);
  }
}

await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.filter(({ noindex }) => !noindex).map(({ route }) => `  <url><loc>${canonical(route)}</loc></url>`).join('\n')}
</urlset>
`);
await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', origin)}\n`);
await write('.nojekyll', '');
await write('404.html', `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — Emily Hsieh</title></head>
<body><main><h1>Page not found</h1><a href="/">Return to Emily Hsieh’s portfolio</a></main></body>
</html>
`);
console.log(`Built ${routes.length} routes in ${output}/`);
