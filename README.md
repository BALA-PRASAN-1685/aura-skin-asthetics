# Aura Skin & Aesthetics – React + Vite

Skin & hair education site converted from a single HTML file to React + Vite + Tailwind CSS.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where to edit content (JSON)

| File | What it controls |
|---|---|
| `src/data/site.json` | Header, hero, sections, contact details, footer, dialog text |
| `src/data/conditions.json` | The 15 condition guides (title, search keywords, 7 detail fields each) |
| `src/data/checker.json` | Symptom checker choices, questions, results and urgent-warning rules |

To add a condition, append one object to `conditions` in `conditions.json` — the card, search and popup update automatically.

## Logo

`public/logo.svg` is a placeholder. Put your real logo in `public/` and update `logo.src` in `src/data/site.json`.

## Interactive Skin / Hair Explorer (inside "Start exploring")

Click **Skin Health** or **Hair & Scalp** in *Start exploring* (or use the Skin / Hair tabs) to open a clickable
2D or 3D model. Click an area, describe the problem in the dialog (press Enter to submit) and get educational
topics that link to the existing condition guides.

| File | Purpose |
|---|---|
| `src/components/Explorer.jsx` | Tabs, 2D/3D toggle, area list, opens the dialog |
| `src/components/BodyMap2D.jsx` | Clickable 2D SVG body (front/back) and scalp (top view) |
| `src/components/Scene3D.jsx` | 3D body and 3D head (three.js, lazy-loaded) |
| `src/components/ProblemDialog.jsx` | Describe-the-problem form + results |
| `src/utils/analyze.js` | Educational keyword/symptom matcher (no diagnosis) |
| `src/data/explorer.json` | Regions, 2D shapes, symptom lists, all explorer text |
| `src/data/rules.json` | Matching weights per condition, urgent-warning words |

## Hero visual (sphere + orbiting photos)

Component: `src/components/HeroVisual.jsx`. The photo bubbles and caption come from `hero.orbit` / `hero.artCaption` in
`src/data/site.json`. To use real photos, put them in `public/hero/` and change each `src` (square images look best).

## Explorer behaviour

- The hero's **Explore Skin Health** button scrolls to the Interactive Explorer and opens the Skin model.
- The explorer opens in 3D by default (`ui.defaultView` in `src/data/explorer.json`; use `"2d"` to change it).
- In 3D the model turns constantly, pauses only while the cursor is on it, and turns again when the cursor leaves
  (speed: `autoRotateSpeed` in `src/components/Scene3D.jsx`).

## Face explorer

The **Face** tab (between Skin and Hair & Scalp) has a 2D face map and a 3D head. Areas: forehead, eyes & eyebrows, nose,
cheeks, lips & mouth, chin & jawline, ears, plus "whole face". Face areas, symptoms and text live in
`modes.face` in `src/data/explorer.json`; matching rules live in `face` in `src/data/rules.json`.
The 3D head is `FaceHead` in `src/components/Scene3D.jsx`.
