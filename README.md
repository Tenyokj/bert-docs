<p align="center">
  <img src="https://img.shields.io/badge/version-BERT%20V2-cddc39?style=for-the-badge&labelColor=171717" alt="BERT V2" />
  <img src="https://img.shields.io/badge/docs-standalone-8bc34a?style=for-the-badge&labelColor=171717" alt="Standalone docs" />
  <img src="https://img.shields.io/badge/theme-day%20%2F%20night-f4d03f?style=for-the-badge&labelColor=171717" alt="Day and night theme" />
  <img src="https://img.shields.io/badge/domain-docs.bert.app-7cb342?style=for-the-badge&labelColor=171717" alt="docs.bert.app" />
</p>

<p align="center">
  <img src="./assets/banner.png" alt="BERT V2 Docs banner" width="720" />
</p>

# BERT V2 Docs

Standalone documentation site for the **BERT V2** protocol.

This folder is intentionally isolated from the main frontend so it can be:
- deployed as a separate static site
- moved into its own repository later
- maintained as the canonical public docs experience for BERT V2

## Live domain

- `https://bertdao-docs.vercel.app`

## Local preview

```bash
cd bert-docs
python3 -m http.server 4040
```

Open:

- `http://localhost:4040`

## What is inside

- `index.html` - docs app shell
- `assets/styles.css` - docs UI, theme system, layout
- `assets/docs-data.js` - docs content and navigation structure
- `assets/app.js` - routing, search, theme toggle, in-page search jump
- `assets/banner.png` - docs brand banner
- `CNAME` - custom domain for static hosting
- `robots.txt` - crawler rules
- `sitemap.xml` - sitemap for indexing

## Search behavior

Search checks:

- page title
- page summary
- full page text content

When a user opens a result:

- the matching page opens
- the view scrolls to the first matching occurrence
- the matching text is highlighted

## SEO / indexing

This static docs site now includes:

- `robots.txt`
- `sitemap.xml`

For Google Search Console verification, place the verification file in the **root of `bert-docs`**, next to:

- `index.html`
- `CNAME`
- `robots.txt`
- `sitemap.xml`

Example:

- `bert-docs/google1234567890abcdef.html`

If Google gives you a meta-tag instead of a file, place it inside the `<head>` of `bert-docs/index.html`.

## Move to a separate repo later

```bash
cd ..
cp -R bert-docs /path/to/new/location/bert-docs
cd /path/to/new/location/bert-docs
git init
git add .
git commit -m "init bert v2 docs"
```

## Recommended next upgrades

- split `docs-data.js` into per-page markdown or MDX
- add release/version history pages
- add copy buttons for command/code blocks
- add analytics and Search Console verification
- add optional search hit navigation (`next / previous match`)
