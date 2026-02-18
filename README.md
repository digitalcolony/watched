# Watched Reviews (Astro)

Single-page Astro site that fetches TV/movie review data from your Google Sheets endpoint at build time and renders a searchable, sortable grid.

## Data shape

```ts
interface ReviewData {
	timestamp: string;
	show_name: string;
	review: string;
	finished: string;
	show_type: string;
	comments: string;
}
```

## Local setup

1. Install dependencies:

```sh
npm install
```

2. Copy environment template:

```sh
cp .env.example .env
```

3. Set `REVIEWS_ENDPOINT` in `.env` to your deployed Apps Script JSON URL.

4. Run dev server:

```sh
npm run dev
```

## Build-time Google Sheets connection

- The build loader is in `src/lib/reviews.ts`.
- Astro page fetch happens in `src/pages/index.astro` frontmatter.
- If the endpoint returns `{ data: [...] }`, that shape is supported.
- If it returns an array `[...]`, that shape is also supported.

## Deploy on Netlify

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `REVIEWS_ENDPOINT` (same value as local)

## Trigger Netlify build from Zapier on Sheet updates

1. In Netlify, create a Build Hook:
   - Site settings → Build & deploy → Build hooks → Add build hook.
2. In Zapier, create a Zap:
   - Trigger: Google Sheets event such as **Updated Spreadsheet Row**.
   - Optional filter: only run for your target sheet/tab or relevant column changes.
   - Action: **Webhooks by Zapier** → `POST`.
   - URL: paste Netlify Build Hook URL.
3. Test the Zap and confirm Netlify starts a deploy after a sheet edit.

### Optional anti-noise controls

- Add **Delay After Queue** (1–5 minutes) to reduce rapid repeated builds.
- Add a filter/dedupe key so unchanged edits do not trigger unnecessary deploys.

## Scripts

- `npm run dev` — local development server
- `npm run build` — production build to `dist`
- `npm run preview` — preview built site locally
