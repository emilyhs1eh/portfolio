# Framer migration checklist

## 1. Audit and compare

- [x] Inventory the homepage, About, and six case studies linked from the live navigation.
- [x] Reconcile the sitemap with the work links. It exposed an empty photography page and an unlinked test page. The Prudential case study was linked from the homepage but absent from the original sitemap.
- [x] Prioritize Data Visualization, Links, and Taishin, whose cards pointed to placeholders. Then address layout changes across breakpoints, media hosting, and shared components.

## 2. Design system

- [x] Centralize IBM Plex typography, neutral colors, spacing, layout width, corner radius, and motion. Keep the project image palettes.
- [x] Share the document, route metadata, navigation, contact footer, project cards, related-project cards, and case-study layout patterns.
- [x] Use the live site's 810 px and 1440 px breakpoints. Offer a single-column work list below the wide layout.

## 3. Implement

- [x] Complete all six case studies using the live copy, project imagery, and demo links. Retain the root, About, and case-study routes and add redirects for the old HTML URLs.
- [x] Keep the unlinked test page and empty photography route reachable. Exclude both from indexing and navigation. Correct the sitemap to include Prudential.
- [x] Bundle original-resolution Framer images, self-hosted demo MP4s, and IBM Plex font files. Generate the site from local files.
- [x] Support keyboard access, focus outlines, skip navigation, card insights on pointer and keyboard, and reduced motion. Darken muted copy for readability. Use labeled native video controls and muted autoplay when a demo is in view. Respect the reduced-motion preference.

## 4. QA and optimization

- [x] Production build generated 10 routes. Static verification checked 9 aliases and 564 local references across root and GitHub Pages project URL prefixes. This includes assets, fragments, canonical URLs, image dimensions, and the sitemap.
- [x] Compared rendered route screenshots against the live site in Chromium, with a 1348 px desktop viewport and 390 px, 810 px, and 1440 px comparison frames. Refined home spacing, work-card sizes, and case-study heroes after review. The 30 final responsive route checks found no horizontal overflow or failed loaded images.
- [x] Checked Work anchor navigation, legacy redirect, keyboard skip and focus transfer, Sortafy card disclosure, arrow-key navigation, pagination, and wraparound in Chromium. Case-study demos now use self-hosted MP4 files.
- [x] Compared all ten routes with their Framer counterparts at 390 px, 810 px, 1363 px, 1440 px, and 1728 px in Chromium. Restored breakpoint-specific image variants, media panel colors, the About layout, and the right-hand text column on wide case studies.
- [x] Captured side-by-side Chromium screenshots for all 10 routes at 390px and 1536px. Rechecked for horizontal overflow and failed images in the visible region after the layout fixes.
- [x] Paired the wide AINSI THÉ walkthroughs with their illustrations and grouped Taishin’s feed videos. At 1536px the page-height gap reduced from about 3,200px to 724px for AINSI THÉ and from 1,600px to 248px for Taishin. Native controls stay available on both layouts.
- [x] Rechecked keyboard skip navigation, the Work anchor, a homepage project card, Sortafy arrow keys, insight expansion and wraparound, plus native inline video playback in Chromium.
- [x] Improved the contrast of muted homepage copy to 4.95:1 against white and kept the sticky About photo below the navigation. The specified red hover color has 3.88:1 contrast against white. Focus indicators and underlined inline links provide additional cues.
- [x] Verified browser selection of optimized image variants. The About portrait went from 627 KiB to 31 KiB and the mobile Prudential hero from 781 KiB to 55 KiB. Original assets remain as fallbacks. All 11 MP4s are local and use deferred loading.
- [x] Rebuilt all 10 routes and verified 9 aliases and 594 internal references. Checked canonical URLs, unique metadata, 1200 × 630 sharing images, structured data, the sitemap, and production-only GA4 configuration.
- [ ] Exact spacing parity remains open for some long case-study sections. Framer transitions and native video controls differ in presentation. The legacy gallery has no supplied photography content.
- [ ] Full-page screenshot coverage beyond the inspected sections, Safari/Firefox, a formal accessibility audit, and a deployed Lighthouse run remain open.

## 5. Deploy

- [x] Add a GitHub Actions workflow for build, checks, and GitHub Pages deployment. Document certificate, DNS cutover, and rollback in the README.
- [x] Push the migration branch and open pull request #1.
- [x] Verify HTTPS on the existing Framer domain and prepare the standalone GitHub Pages build. The public domain continues to use Framer during this phase.
- [ ] Enable GitHub Actions as the Pages source and verify the generated `.github.io/portfolio/` URL, HTTPS, and basic routes on the hosted copy.
- [ ] After a separate cutover decision, configure the custom domain, verify canonical URLs and sharing images on that host, and confirm public routing, HTTPS and GA4 before disconnecting Framer.
