# Bariga Land Intelligence

A responsive web-based Land Intelligence prototype for five selected ward study areas associated with Bariga, Shomolu, Lagos. It combines the project's Sprint 3 indicative market signal and Sprint 4 observed development-change output in one searchable map.

## What is included

- A Leaflet map with the five ward polygons and selectable markers.
- Search by ward name, suggestions, and the exact `Town not available.` response for unsupported locations.
- A location brief with market and development-change details.
- Light and dark themes, including a saved theme preference.
- A small deterministic FAQ chat assistant backed by `data/chatbot-knowledge.json`. It is intentionally not a general-purpose AI chatbot or RAG system; out-of-scope questions receive an explicit scope response.
- The integrated database at `data/land-intelligence.json`.
- Source files used to build the integrated dataset under `data/previous-sprints/`.
- The original GeoRAD notebook preserved under `notebooks/`.

## Run locally

You need Python 3 or Node.js. No frontend build step or package installation is required.

### Option A: Python

From the root of this project:

```bash
python3 -m http.server 5500
```

Open [http://localhost:5500](http://localhost:5500).

### Option B: Node

```bash
npx --yes serve . -l 5500
```

Open the URL shown in the terminal.

Do not open `index.html` directly with a `file://` URL: the browser must fetch the JSON and GeoJSON files through a local web server.

The map uses Leaflet and Esri map tiles loaded from their public CDNs/services, and Google Fonts is loaded online. An internet connection is needed for the basemap and those external assets.

## Project structure

```text
web-app/
├── index.html
├── styles.css
├── app.js
├── README.md
├── data/
│   ├── land-intelligence.json
│   ├── chatbot-knowledge.json
│   └── previous-sprints/
│       ├── sprint1_selected_towns.geojson
│       ├── sprint2_market_dataset.csv
│       ├── sprint3_market_intelligence.csv
│       ├── sprint4_development_change.csv
│       ├── ai_overview_raw.json
│       └── experiment_sensitivity.csv
├── assets/
│   └── indicative_market_levels.png
├── docs/
│   └── GEORAD_STARTER_README.md
└── notebooks/
    └── 01_land_intelligence_starter.ipynb
```

## Integrated database fields

Every object in `data/land-intelligence.json` represents one ward and includes:

- `town`, `lat`, `lng`: display name and representative point derived from the supplied ward polygon.
- `currentMarketRange`: indicative range described in the Sprint 2 AI overview text.
- `currentLandPricePerSqm` and `indicativeMarketLevel`: selected asking-price figure carried through the Sprint 3 dataset.
- `supportingSource`, `supportingSourceUrl`, `dateSearched`: provenance from the market dataset.
- `observations`, `iqrOutlierFlag`: Sprint 3 summary fields.
- `earlierYear`, `earlierDevelopment`, `recentYear`, `recentDevelopment`: Sprint 4 values.
- `developmentChange`, `developmentChangeLevel`: Sprint 4 output.
- `geometry`: ward polygon geometry copied from the supplied GeoJSON so the app can show actual study boundaries.

The app also loads the GeoJSON independently to draw ward polygons. The JSON includes geometry to keep the integrated record self-describing.

## Study areas and data

The application supports exactly these five ward names:

1. Ibuowo / Owotutu
2. Ilaje
3. Pedro / Gbagada
4. Aiyetoro / Mafowoku
5. Owode / Orile Bariga

Market figures are the selected Sprint 3 indicative levels from the provided files:

| Ward | Indicative market level |
|---|---:|
| Ibuowo / Owotutu | ₦415,000/sqm |
| Ilaje | ₦320,000/sqm |
| Pedro / Gbagada | ₦1,200,000/sqm |
| Aiyetoro / Mafowoku | ₦420,000/sqm |
| Owode / Orile Bariga | ₦250,000/sqm |

The source market dataset contains one selected observation per ward. These figures are asking-price indicators, not verified transaction prices, a robust ward-wide average, or formal property valuations. Pedro / Gbagada is flagged as an IQR outlier by the supplied Sprint 3 output, but with only one observation per ward, that flag should be interpreted cautiously.

## Development-change output

The app preserves the Sprint 4 main-run values exactly as provided:

| Ward | 2016 development | 2026 development | Change | Supplied level |
|---|---:|---:|---:|---|
| Aiyetoro / Mafowoku | 100.00% | 100.00% | 0.00 pp | Low |
| Ibuowo / Owotutu | 96.53% | 95.18% | -1.36 pp | Low |
| Ilaje | 93.62% | 90.13% | -3.48 pp | Low |
| Owode / Orile Bariga | 97.64% | 91.79% | -5.86 pp | Low |
| Pedro / Gbagada | 83.28% | 66.01% | -17.27 pp | Low |

The notebook's method uses NDBI as a proxy for built-up conditions. A negative change means the measured percentage is lower in the recent period under this workflow; it does not, by itself, prove that buildings were removed. The 2026 imagery is year-to-date rather than a complete calendar year, and Aiyetoro / Mafowoku's 100% result in both periods needs further validation. The `Low` labels are the supplied classification output and should be interpreted cautiously.

## FAQ assistant

The floating **Ask LandIntel** panel uses `data/chatbot-knowledge.json`. It responds to common questions about the project, its use, the five wards, market levels, NDBI, development change and limitations using keyword matching and curated answers. It does not call an external LLM, store conversations, or implement RAG.

When a question is clearly outside the app's intended domain, it replies that the question is outside scope and explains which topics it can cover. The knowledge file can be edited directly to add or refine answers.

## Acceptance test checklist

- [ ] App opens through localhost and the basemap loads.
- [ ] Five ward polygons and markers appear.
- [ ] Each ward can be selected from the list and by clicking the map.
- [ ] Searching each full ward name shows the correct details.
- [ ] Searching an unsupported place displays `Town not available.`
- [ ] Light/dark mode toggles and the selected theme persists after refresh.
- [ ] Chat answers project questions and explicitly declines unrelated questions.
- [ ] Market and development values match the source files.

## Known limitations

- This is a static educational prototype; there is no backend, authentication, or live market-data refresh.
- External basemap/font assets require internet access.
- Market data contains one selected observation per ward and may reflect listing quality, property condition, plot size, title and micro-location differences.
- NDBI is a proxy rather than a building inventory; the analysis outputs require cautious interpretation.
- The prototype is limited to the five supplied wards and is not a formal valuation, investment recommendation or planning approval tool.

## Credits

Built by Unekwuojo James as a GeoRAD Academy Emerging Spatial Professional mentorship project, building on the GeoRAD Land Intelligence starter and Sprint 1–4 outputs. Ward geometry is taken from the supplied GeoJSON. Market evidence and development-change values are retained from the provided sprint datasets.
