export function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function image(asset, root, eager = false, alt = asset.alt) {
  return `<img src="${root}${asset.src}" width="${asset.width}" height="${asset.height}" alt="${escape(alt)}" decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
}

function navigation(route, root) {
  return `<nav class="site-nav" aria-label="Primary navigation">
  <a href="${root}"${route === '' ? ' aria-current="page"' : ''}><span class="nav-desktop">HOME</span><span class="nav-mobile">Emily Hsieh</span></a>
  <a href="${root}#works">WORK</a>
  <a href="${root}about/"${route === 'about' ? ' aria-current="page"' : ''}>ABOUT</a>
  <a href="${root}#contact">CONTACT</a>
</nav>`;
}

const contact = `<footer class="footer" id="contact">
  <h2>CONTACT</h2>
  <div class="footer-content">
    <a href="mailto:emily86818@gmail.com">emily86818@gmail.com</a>
    <div class="social-links">
      <a href="https://emilyhs1eh.github.io/" target="_blank" rel="noopener">GITHUB</a>
      <a href="https://www.cosmos.so/emilyhs1eh" target="_blank" rel="noopener">COSMOS</a>
      <a class="connect" href="https://www.linkedin.com/in/emilyhs1eh" target="_blank" rel="noopener">LET'S CONNECT <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</footer>`;

export function projectCard(slug, project, root, eager) {
  return `<a class="project-card ${slug}" href="${root}design/${slug}/">
  <span class="project-image">${image(project.card, root, eager, '')}</span>
  <span class="project-meta">
    <span><strong>${escape(project.name)}</strong><small>${escape(project.subtitle)}</small></span>
    <span><strong>${escape(project.year)}</strong><small>${escape(project.category)}</small></span>
  </span>
</a>`;
}

export function relatedProjects(slugs, mobileSlugs, projects, root) {
  const cards = (entries) => entries.map((slug) => {
    const project = projects[slug];
    const desktop = image(project.card, root, false, '');
    const picture = project.card.relatedMobile
      ? `<picture><source media="(max-width: 809.98px)" srcset="${root}${project.card.relatedMobile}">${desktop}</picture>`
      : desktop;
    return `<a class="${slug}" href="${root}design/${slug}/">${picture}<span class="visually-hidden">${escape(project.name)}</span></a>`;
  }).join('\n    ');
  return `<section class="related-projects" aria-labelledby="related-title">
  <div class="related-heading">
    <h2 id="related-title">RELATED PROJECTS</h2>
    <a href="${root}#works">ALL PROJECTS <span aria-hidden="true">↗</span></a>
  </div>
  <div class="related-grid${mobileSlugs ? ' related-grid-desktop' : ''}">${cards(slugs)}</div>
  ${mobileSlugs ? `<div class="related-grid related-grid-mobile">${cards(mobileSlugs)}</div>` : ''}
</section>`;
}

export function page({ site, route, root, meta, canonical, body, pageClass, noindex, empty }) {
  const title = escape(meta.title);
  const description = escape(meta.description);
  const socialImage = meta.image || site.home.image;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="${noindex ? 'noindex' : 'max-image-preview:large'}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${new URL(socialImage, canonical.origin)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${root}${site.icon}">
  <link rel="stylesheet" href="${root}fonts.css">
  <link rel="stylesheet" href="${root}style.css">
  ${empty ? '' : `<script src="${root}interactions.js" type="module"></script>`}
</head>
<body class="${pageClass}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    ${navigation(route, root)}
  </header>
  <main id="main" tabindex="-1">
    ${body}
  </main>
  ${contact}
</body>
</html>
`;
}
