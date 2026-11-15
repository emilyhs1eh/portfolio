# Emily Hsieh · Portfolio

Static portfolio source for [emilyhs1eh.com](https://www.emilyhs1eh.com/). The build uses Node.js 22 and has no package dependencies. Framer images, project demo videos, and IBM Plex fonts are included with the source. Case-study videos play directly from local MP4 files.

## Develop and validate

```sh
npm run dev
npm run build
npm test
```

The preview defaults to `http://127.0.0.1:4173/`. Build output is written to `dist/`. Run the build before the tests.

- `content/site.json` contains project cards, route metadata, and related-project lists.
- `content/*.html` contains page and case-study copy in semantic HTML.
- `scripts/components.mjs` renders the common document, navigation, contact footer, project cards, and related-work sections.
- `style.css` defines the color, type, spacing, size, and motion tokens. Layouts switch at 810 px and 1440 px. Case studies share introductory copy, metadata, article, figure, and video patterns.
- `media/` contains original-resolution Framer images, project demo MP4s, and self-hosted IBM Plex fonts. The font license is bundled there.
- `interactions.js` enables Sortafy carousel controls and keyboard navigation. The cards can also be expanded without JavaScript.

## Publish with GitHub Pages

1. Push the migration branch to `emilyhs1eh/portfolio` and review it in a pull request. The Pages workflow builds and tests pull requests. It publishes from `main`.
2. In the repo, open **Settings → Pages** and select **GitHub Actions** under **Source**. Merge the PR, then verify a successful **Portfolio Pages** workflow run. Open the deployment URL shown in the run and check the home page, About, all six case studies, and the case-study links. Verify several of the legacy `.html` URLs on the deployed host.
3. Verify ownership of `emilyhs1eh.com` in your GitHub account's Pages settings with the DNS TXT record GitHub supplies. Record your existing Framer DNS values so you can restore them if needed.
4. Add `www.emilyhs1eh.com` as the repository’s Pages custom domain. At your DNS provider, replace the existing `www` record with a CNAME pointing to `emilyhs1eh.github.io`. If you also serve the apex, follow GitHub's current apex DNS instructions and verify its redirect to `www`.
5. When the Pages DNS check passes and the certificate is available, enable **Enforce HTTPS**. On the custom domain, test all routes over HTTPS and check `/sitemap.xml`, `/robots.txt`, canonical links, and social image URLs. Disconnect Framer only after these checks pass. If the custom-domain cutover fails, restore the saved DNS records and verify the Framer site is serving again.

[GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Custom domain and HTTPS](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) · [Domain ownership verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

See [the migration checklist and QA notes](docs/migration.md) for verified behavior and remaining work.
