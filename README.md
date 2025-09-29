# Salon CRM Demo — GitHub Pages Ready

This repository contains a front-end only marketing + CRM demonstration site for a multi-location salon franchise. It is optimized for GitHub Pages hosting and illustrates the flow from lead capture through segmentation and campaign previews.

## Local development

Serve the files with any static web server or simply open `index.html` in your browser. Because all functionality is client-side, no build step is required.

```bash
python -m http.server 3000
```

Navigate to `http://localhost:3000/` to explore the marketing site. Visit `/demo.html` for the internal dashboard walkthrough.

## Resetting demo data

The lead form stores submissions in `localStorage` under the key `demo_leads`. To clear the demo data, run the following in the browser console:

```js
localStorage.removeItem('demo_leads');
```

Refresh `/demo.html` and click **Refresh leads** to reload seeded data only.

## Google Analytics 4 (Optional)

Analytics is controlled via `data/config.json`:

- `ga4MeasurementId`: supply your GA4 property ID (e.g., `G-XXXXXXX`).
- `features.enableAnalytics`: set to `false` to disable GA script injection.

The following custom events are fired when analytics is enabled:

- `lead_submit` — after the form is successfully validated and stored.
- `segment_apply` — when filters change in the demo dashboard.
- `campaign_preview` — when the preview button is clicked in the campaign studio.

## Data seeds

Sample data lives in `/data/*.json` and is fetched on the client. Feel free to extend the seed files with additional leads, services, or locations to tailor demos.

## Keyboard shortcuts

Press the `D` key on any page to jump directly to the demo dashboard (`/demo.html`).

## Lighthouse & performance

The site uses Tailwind via CDN and no heavy frameworks to stay within the 150 KB JS budget. Images are lazy-loaded via the `loading="lazy"` attribute.

## Deployment checklist

1. Enable GitHub Pages for the repository root (or `/docs` if you relocate files).
2. Ensure `.nojekyll` remains present so data files load.
3. Update `data/config.json` with your GA measurement ID if tracking is desired.
4. Optionally add a Lighthouse report under `/reports` before sharing the public URL.
