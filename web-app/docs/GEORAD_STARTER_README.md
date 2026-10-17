# Land Intelligence starter (Sprint 5 / Week 6)

GeoRAD starter for the final mentorship technical sprint: connect your Market Intelligence and Development Change outputs to a simple web map.

## What this app does

- Shows a base map (Esri World Street Map via Leaflet, same as Sprint 3 / 4)
- Lets users search a town or ward by name
- Displays the matching location on the map
- Shows Market Intelligence and Development Change when the location is selected or clicked
- Shows **Town not available.** when the search is not one of the loaded locations

No charts or advanced UI are required for the sprint.

## Folder contents

```text
land-intelligence/
  index.html
  app.js
  styles.css
  README.md
  data/
    land-intelligence.json
    previous-sprints/
      sprint1_selected_towns.geojson
      sprint2_market_dataset.csv
      sprint3_market_intelligence.csv
      sprint4_development_change.csv
  notebooks/
    01_land_intelligence_starter.ipynb
```

## Run locally

Do not open `index.html` as a `file://` path. Browsers block loading the JSON that way.

From this folder:

```bash
npx --yes serve .
```

Or with Python:

```bash
python -m http.server 5500
```

Then open the `http://localhost:...` URL shown in the terminal.

## Task 1: Add previous sprint outputs, then merge

Drop what you already have into:

```text
data/previous-sprints/sprint1_selected_towns.geojson   # Sprint 1 selected towns GeoJSON
data/previous-sprints/sprint2_market_dataset.csv       # Sprint 2 Colab table (optional)
data/previous-sprints/sprint3_market_intelligence.csv  # Sprint 3 Colab: Town, Current Market Range, Indicative Market Level
data/previous-sprints/sprint4_development_change.csv   # Sprint 4 Colab development change table
```

Run `notebooks/01_land_intelligence_starter.ipynb` (Colab or local). It joins Sprint 3 + Sprint 4 on town name, gets coordinates from the Sprint 1 GeoJSON, and writes:

```text
data/land-intelligence.json
```

## Notebook companion

Open `notebooks/01_land_intelligence_starter.ipynb` to:

- upload / inspect Sprint 1 GeoJSON + Sprint 3 / 4 tables
- merge them into one Land Intelligence table
- save `data/land-intelligence.json` for the web app
- map locations and confirm **Town not available.**

Needs `pandas` and `folium`. In Colab keep `RUN_IN_COLAB = True` and upload your files.

## Task 2: Connect and verify

1. Put your merged JSON at `data/land-intelligence.json`.
2. Serve the app over localhost.
3. Confirm:
   - searching a supported town finds it
   - the marker appears
   - clicking the marker shows intelligence details
   - searching an unknown name shows **Town not available.**

## Suggested submission package

- Your final `land-intelligence.json`
- This project (or your GitHub fork) with your data wired in
- Screenshots: successful search, map location, intelligence panel, unavailable message
- README notes: database structure + how to run the app
