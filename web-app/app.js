const DATA_URL = "./data/land-intelligence.json";
const BOUNDARY_URL = "./data/previous-sprints/sprint1_selected_towns.geojson";
const KNOWLEDGE_URL = "./data/chatbot-knowledge.json";

const $ = (selector) => document.querySelector(selector);
const state = {
  locations: [],
  map: null,
  markerByTown: new Map(),
  polygonByTown: new Map(),
  boundaryLayer: null,
  selectedTown: null,
  knowledge: null,
};

const els = {
  form: $("#search-form"),
  input: $("#search-input"),
  status: $("#status"),
  townList: $("#town-list"),
  details: $("#details"),
  detailTitle: $("#detail-title"),
  selectedDot: $("#selected-dot"),
  count: $("#location-count"),
  reset: $("#reset-view"),
  fit: $("#fit-map"),
  theme: $("#theme-toggle"),
  suggestions: $("#suggestions"),
  chatLauncher: $("#chat-launcher"),
  chatPanel: $("#chat-panel"),
  chatClose: $("#chat-close"),
  chatForm: $("#chat-form"),
  chatInput: $("#chat-input"),
  chatMessages: $("#chat-messages"),
  aboutButton: $("#about-button"),
  aboutDialog: $("#about-dialog"),
  aboutClose: $("#about-close"),
};

const normalize = (value) =>
  String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ");

const money = (value) => {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "Not available";
  return `₦${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
};
const pct = (value) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
  ? "Not available" : `${Number(value).toFixed(2)}%`;
const pp = (value) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
  ? "Not available" : `${Number(value).toFixed(2)} pp`;

function setStatus(message, tone = "") {
  els.status.textContent = message;
  els.status.className = `status${tone ? ` ${tone}` : ""}`;
}

function safeText(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value ?? "";
  return node;
}

function formatShortMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toLocaleString("en-NG", { maximumFractionDigits: 2 })}m`;
  if (n >= 1000) return `₦${Math.round(n / 1000)}k`;
  return money(n);
}

function getPriceColor(value) {
  const prices = state.locations.map((item) => Number(item.indicativeMarketLevel)).filter(Number.isFinite);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const t = max === min ? 0.5 : (Number(value) - min) / (max - min);
  const palette = ["#d8eee5", "#a5d9c3", "#65b895", "#278465", "#145b49"];
  return palette[Math.max(0, Math.min(palette.length - 1, Math.round(t * (palette.length - 1))))];
}

function markerIcon(location, selected = false) {
  const color = getPriceColor(location.indicativeMarketLevel);
  const size = selected ? 22 : 17;
  const cls = selected ? "custom-pin selected" : "custom-pin";
  return L.divIcon({
    className: "",
    html: `<span class="${cls}" style="display:block;width:${size}px;height:${size}px;background:${color}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function renderTownList() {
  els.townList.replaceChildren();
  els.count.textContent = String(state.locations.length);
  state.locations.forEach((location, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `town-card${state.selectedTown === location.town ? " active" : ""}`;
    button.setAttribute("aria-pressed", String(state.selectedTown === location.town));
    const indexEl = safeText("span", "town-index", String(index + 1).padStart(2, "0"));
    const body = document.createElement("span");
    body.className = "town-card-main";
    body.append(
      safeText("span", "town-name", location.town),
      safeText("span", "town-meta", `Development change · ${pp(location.developmentChange)}`)
    );
    const price = document.createElement("span");
    price.className = "town-price";
    price.append(
      safeText("span", "", formatShortMoney(location.indicativeMarketLevel)),
      safeText("small", "", "per sqm")
    );
    button.append(indexEl, body, price);
    button.addEventListener("click", () => selectLocation(location.town, { from: "list" }));
    els.townList.append(button);
  });
}

function appendMetric(parent, label, value, note = "") {
  const card = document.createElement("div");
  card.className = "metric-card";
  card.append(safeText("span", "metric-label", label));
  card.append(safeText("strong", "metric-value", value));
  if (note) card.append(safeText("span", "metric-note", note));
  parent.append(card);
}

function appendMeta(parent, label, value, url = "") {
  const row = document.createElement("div");
  row.className = "meta-row";
  row.append(safeText("span", "", label));
  const valueNode = document.createElement("strong");
  if (url && /^https?:\/\//i.test(url)) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "source-link";
    a.textContent = value || "Open source";
    valueNode.append(a);
  } else {
    valueNode.textContent = value || "Not available";
  }
  row.append(valueNode);
  parent.append(row);
}

function renderDetails(location) {
  els.details.replaceChildren();
  els.detailTitle.textContent = location ? location.town : "Select a ward";
  els.selectedDot.hidden = !location;

  if (!location) {
    els.details.className = "details-empty";
    els.details.append(
      safeText("span", "empty-symbol", "⌖"),
      safeText("p", "", "Select a ward from the list or map to see its intelligence.")
    );
    return;
  }

  els.details.className = "detail-content";
  const hero = document.createElement("div");
  hero.className = "detail-hero";
  hero.append(
    safeText("p", "eyebrow", "INDICATIVE MARKET LEVEL"),
    safeText("div", "detail-price", `${money(location.indicativeMarketLevel)} / sqm`),
    safeText("p", "detail-price-sub", `Current asking-price signal · searched ${location.dateSearched || "date unavailable"}`)
  );
  els.details.append(hero);

  const grid = document.createElement("div");
  grid.className = "detail-grid";
  appendMetric(grid, "2016 development", pct(location.earlierDevelopment), "NDBI-based proxy");
  appendMetric(grid, "2026 development", pct(location.recentDevelopment), "NDBI-based proxy");
  appendMetric(grid, "Development change", pp(location.developmentChange), "Recent minus earlier");
  appendMetric(grid, "Change level", location.developmentChangeLevel || "Not available", "GeoRAD sprint output");
  els.details.append(grid);

  const meta = document.createElement("div");
  meta.className = "detail-meta";
  appendMeta(meta, "Market range", location.currentMarketRange || "Not supplied");
  appendMeta(meta, "Selected price", `${money(location.currentLandPricePerSqm)} / sqm`);
  appendMeta(meta, "Supporting source", location.supportingSource || "Not available", location.supportingSourceUrl);
  appendMeta(meta, "Market observations", String(location.observations ?? "Not available"));
  if (location.iqrOutlierFlag) appendMeta(meta, "Data quality note", "Flagged as an IQR outlier");
  els.details.append(meta);

  const caution = document.createElement("div");
  caution.className = "caution-note";
  caution.textContent = "Interpretation note: market levels are indicative asking-price evidence, not formal valuations. NDBI is a built-up proxy, not a direct building count. Development change is an observed analysis result, not a forecast.";
  els.details.append(caution);
}

function popupContent(location) {
  const wrapper = document.createElement("div");
  wrapper.append(safeText("strong", "", location.town));
  wrapper.append(safeText("div", "", `${money(location.indicativeMarketLevel)} / sqm`));
  wrapper.append(safeText("div", "", `Development change: ${pp(location.developmentChange)}`));
  wrapper.append(safeText("div", "", `Indicator: ${location.developmentChangeLevel || "Not available"}`));
  return wrapper;
}

function fitAllMarkers() {
  if (!state.map || !state.locations.length) return;
  if (state.boundaryLayer && state.boundaryLayer.getLayers().length) {
    state.map.fitBounds(state.boundaryLayer.getBounds().pad(0.09), { padding: [24, 24] });
    return;
  }
  state.map.fitBounds(L.latLngBounds(state.locations.map((l) => [l.lat, l.lng])).pad(0.18));
}

function updateMapSelection(location) {
  for (const [town, marker] of state.markerByTown.entries()) {
    const item = state.locations.find((l) => l.town === town);
    marker.setIcon(markerIcon(item, Boolean(location && town === location.town)));
  }
  for (const [town, layer] of state.polygonByTown.entries()) {
    const item = state.locations.find((l) => l.town === town);
    layer.setStyle({
      color: location && town === location.town ? "#d3a64c" : "#286e58",
      weight: location && town === location.town ? 3 : 1.6,
      fillColor: getPriceColor(item?.indicativeMarketLevel ?? 0),
      fillOpacity: location && town === location.town ? 0.62 : 0.36,
    });
  }
}

function clearSelection() {
  state.selectedTown = null;
  renderTownList();
  renderDetails(null);
  state.markerByTown.forEach((marker) => marker.closePopup());
  updateMapSelection(null);
  fitAllMarkers();
  els.input.value = "";
  els.suggestions.hidden = true;
  setStatus(`${state.locations.length} supported wards loaded`);
}

function selectLocation(query, { from = "search" } = {}) {
  const wanted = normalize(query);
  const location = state.locations.find((item) => normalize(item.town) === wanted);
  if (!location) {
    setStatus("Town not available.", "error");
    els.suggestions.hidden = true;
    return;
  }

  state.selectedTown = location.town;
  els.input.value = location.town;
  els.suggestions.hidden = true;
  renderTownList();
  renderDetails(location);
  updateMapSelection(location);
  setStatus(`Showing ${location.town}.`, "success");

  const marker = state.markerByTown.get(location.town);
  const polygon = state.polygonByTown.get(location.town);
  if (polygon) state.map.fitBounds(polygon.getBounds().pad(0.4), { maxZoom: 14, animate: true });
  else state.map.setView([location.lat, location.lng], 14, { animate: true });
  if (marker) marker.openPopup();
  if (from === "search") $("#details").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function addMarker(location) {
  const marker = L.marker([location.lat, location.lng], { icon: markerIcon(location) })
    .bindPopup(popupContent(location), { closeButton: true, maxWidth: 260 })
    .bindTooltip(
      `<strong>${location.town}</strong><br>Land value: ${money(location.indicativeMarketLevel)} / sqm<br>Development change: ${pp(location.developmentChange)}`,
      { direction: "top", offset: [0, -8], opacity: 1, className: "ward-hover-tooltip" }
    );
  marker.on("click", () => selectLocation(location.town, { from: "map" }));
  marker.addTo(state.map);
  state.markerByTown.set(location.town, marker);
}

function initMap() {
  state.map = L.map("map", { zoomControl: false, scrollWheelZoom: true }).setView([6.54, 3.39], 13);
  L.control.zoom({ position: "topright" }).addTo(state.map);
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Tiles &copy; Esri",
  }).addTo(state.map);
}

async function loadData() {
  if (location.protocol === "file:") throw new Error("Please run the app using a local server; do not open index.html directly.");
  const [dataResponse, boundaryResponse, knowledgeResponse] = await Promise.all([
    fetch(DATA_URL), fetch(BOUNDARY_URL), fetch(KNOWLEDGE_URL),
  ]);
  if (!dataResponse.ok) throw new Error(`Could not load ${DATA_URL}`);
  if (!boundaryResponse.ok) throw new Error(`Could not load ${BOUNDARY_URL}`);
  if (!knowledgeResponse.ok) throw new Error(`Could not load ${KNOWLEDGE_URL}`);
  const payload = await dataResponse.json();
  const boundaryData = await boundaryResponse.json();
  state.knowledge = await knowledgeResponse.json();

  if (!Array.isArray(payload)) throw new Error("land-intelligence.json must contain an array of locations.");
  state.locations = payload.map((row) => ({
    ...row,
    town: row.town || row.Town || row.location || row.Location,
    lat: Number(row.lat ?? row.latitude ?? row.Latitude),
    lng: Number(row.lng ?? row.lon ?? row.longitude ?? row.Longitude),
    indicativeMarketLevel: Number(row.indicativeMarketLevel ?? row["Indicative Market Level (₦/sqm)"]),
    currentLandPricePerSqm: Number(row.currentLandPricePerSqm ?? row["Current Land Price/sqm"]),
    earlierDevelopment: Number(row.earlierDevelopment ?? row["Earlier Development"]),
    recentDevelopment: Number(row.recentDevelopment ?? row["Recent Development"]),
    developmentChange: Number(row.developmentChange ?? row["Development Change"]),
  }));

  if (state.locations.length !== 5) throw new Error(`Expected five study wards, but loaded ${state.locations.length}. Check the integrated JSON.`);
  const seen = new Set();
  for (const row of state.locations) {
    if (!row.town || !Number.isFinite(row.lat) || !Number.isFinite(row.lng)) throw new Error("Every record needs a town name and valid lat/lng coordinates.");
    if (seen.has(normalize(row.town))) throw new Error(`Duplicate location name in database: ${row.town}`);
    seen.add(normalize(row.town));
    if (!Number.isFinite(row.indicativeMarketLevel)) throw new Error(`Missing market level for ${row.town}.`);
    if (!Number.isFinite(row.developmentChange)) throw new Error(`Missing development change for ${row.town}.`);
  }

  const locationByName = new Map(state.locations.map((row) => [normalize(row.town), row]));
  state.boundaryLayer = L.geoJSON(boundaryData, {
    filter: (feature) => locationByName.has(normalize(feature?.properties?.wardname)),
    style: (feature) => {
      const row = locationByName.get(normalize(feature?.properties?.wardname));
      return { color: "#286e58", weight: 1.6, fillColor: getPriceColor(row?.indicativeMarketLevel ?? 0), fillOpacity: .36 };
    },
    onEachFeature: (feature, layer) => {
      const row = locationByName.get(normalize(feature?.properties?.wardname));
      if (!row) return;
      layer.bindPopup(popupContent(row), { maxWidth: 260 });

      // Hovering a ward polygon reveals both key indicators without requiring a click.
      const hoverCard = document.createElement("div");
      hoverCard.className = "ward-tooltip-content";
      hoverCard.append(
        safeText("strong", "ward-tooltip-name", row.town),
        safeText("span", "ward-tooltip-line", `Land value: ${money(row.indicativeMarketLevel)} / sqm`),
        safeText("span", "ward-tooltip-line", `Development change: ${pp(row.developmentChange)}`)
      );
      layer.bindTooltip(hoverCard, {
        direction: "top",
        sticky: true,
        opacity: 1,
        className: "ward-hover-tooltip",
        offset: [0, -8],
      });

      layer.on("mouseover", () => {
        layer.setStyle({
          weight: state.selectedTown === row.town ? 3.5 : 2.8,
          fillOpacity: 0.72,
        });
        if (typeof layer.bringToFront === "function") layer.bringToFront();
      });
      layer.on("mouseout", () => {
        layer.setStyle({
          color: state.selectedTown === row.town ? "#d3a64c" : "#286e58",
          weight: state.selectedTown === row.town ? 3 : 1.6,
          fillColor: getPriceColor(row.indicativeMarketLevel),
          fillOpacity: state.selectedTown === row.town ? 0.62 : 0.36,
        });
      });
      layer.on("click", () => selectLocation(row.town, { from: "map" }));
      state.polygonByTown.set(row.town, layer);
    },
  }).addTo(state.map);

  state.locations.forEach(addMarker);
  fitAllMarkers();
  renderTownList();
  renderDetails(null);
  setStatus(`${state.locations.length} supported wards loaded`, "success");
}

function showSuggestions(query) {
  const q = normalize(query);
  if (!q) { els.suggestions.hidden = true; els.suggestions.replaceChildren(); return; }
  const matches = state.locations.filter((item) => normalize(item.town).includes(q)).slice(0, 5);
  els.suggestions.replaceChildren();
  if (!matches.length) { els.suggestions.hidden = true; return; }
  matches.forEach((item) => {
    const button = safeText("button", "", item.town);
    button.type = "button";
    button.addEventListener("click", () => selectLocation(item.town));
    els.suggestions.append(button);
  });
  els.suggestions.hidden = false;
}

const OUT_OF_DOMAIN = "That question is outside the scope of this app. I can only help with Land Intelligence, its five Bariga study wards, the data, indicators, project workflow, and how to use the interface.";

function getChatAnswer(question) {
  const q = normalize(question);
  const kb = state.knowledge?.app;
  if (!q || !kb) return "I can help with this Land Intelligence prototype, its data, indicators, project workflow, and how to use the interface.";

  const rules = [
    { keys: ["who built", "who build", "creator", "developer", "built this", "made this", "author"], answer: kb.builder },
    { keys: ["how do i use", "how to use", "use the map", "search for", "find a ward", "navigate", "interface", "how do i search"], answer: kb.how_to_use.join(" ") },
    { keys: ["development change", "change mean", "negative", "percentage point", "2016", "2026"], answer: "Development Change is the difference between the measured development percentages for 2016 and 2026, expressed in percentage points. In this dataset, recent minus earlier is used. It describes the supplied analysis, not a prediction. A negative result does not prove buildings were removed. " + kb.limitations[2] },
    { keys: ["ndbi", "satellite", "built up", "built-up"], answer: "NDBI means Normalized Difference Built-up Index. In this project it is used as a proxy for built-up conditions, not a direct count of buildings. Cloud, seasonal, surface and image-processing effects can influence the result." },
    { keys: ["market level", "asking price", "price per", "land price", "market price", "valuation", "price range"], answer: "The indicative market level is the selected asking-price figure per square metre used in the sprint workflow. It is not a verified transaction price or formal valuation. " + kb.limitations[1] },
    { keys: ["limitation", "reliable", "accuracy", "trust", "risk", "investment", "buy land", "purchase"], answer: kb.limitations.join(" ") },
    { keys: ["benefit", "benefits", "purpose", "why build", "what is land intelligence", "what is this app", "what is this project", "what is this tool", "what does this do", "problem"], answer: kb.purpose + " Benefits: " + kb.benefits.join(" ") },
    { keys: ["how was", "workflow", "built with", "technology", "technologies", "sprint", "method"], answer: kb.workflow + " The web prototype uses a static JSON dataset and Leaflet for the interactive map." },
    { keys: ["ward", "location", "towns", "which locations", "study area", "supported"], answer: "The five supported study areas are: " + kb.study_area + " " + kb.how_to_use[0] },
    { keys: ["dark mode", "light mode", "theme", "colour", "color"], answer: "Use the sun/moon button in the top-right area of the left panel to switch between light and dark themes. Your preference is saved in this browser." },
    { keys: ["not available", "unknown place", "outside the data"], answer: "The app only supports the five loaded ward records. Search using a supported ward's full name. For any unsupported location, the app displays: Town not available." },
  ];
  const match = rules.find((rule) => rule.keys.some((key) => q.includes(normalize(key))));
  if (match) return match.answer;

  // Keep the FAQ deliberately narrow: generic words such as "what", "who", or
  // "how" are not enough to classify an unrelated question as in-domain.
  const domainTerms = [
    "land intelligence", "bariga", "ward", "town", "map", "search", "asking price",
    "land price", "market", "development change", "development level", "ndbi",
    "satellite", "sprint", "georad", "source", "dataset", "indicator", "valuation",
    "coordinate", "location", "2016", "2026", "light mode", "dark mode", "theme",
    "chatbot", "faq", "limitation", "workflow", "prototype", "leaflet", "geojson",
    "study area", "supported location", "town not available"
  ];
  const hasDomain = domainTerms.some((term) => q.includes(normalize(term)));
  if (!hasDomain) return OUT_OF_DOMAIN;
  return "I can help with how to use the map, the five Bariga wards, market asking-price fields, the NDBI development-change indicator, project workflow and limitations. Could you ask your question in one of those areas?";
}

function appendChatMessage(text, role) {
  const message = safeText("div", `chat-message ${role}`, text);
  els.chatMessages.append(message);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}
function sendChatQuestion(question) {
  const text = String(question || "").trim();
  if (!text) return;
  appendChatMessage(text, "user");
  appendChatMessage(getChatAnswer(text), "bot");
}
function setChatOpen(open) {
  els.chatPanel.hidden = !open;
  els.chatLauncher.setAttribute("aria-expanded", String(open));
  if (open) setTimeout(() => els.chatInput.focus(), 40);
}

function bindEvents() {
  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = els.input.value.trim();
    if (!query) { setStatus("Enter a ward name to search.", "error"); return; }
    const exact = state.locations.find((row) => normalize(row.town) === normalize(query));
    if (exact) selectLocation(exact.town);
    else {
      const partial = state.locations.filter((row) => normalize(row.town).includes(normalize(query)));
      if (partial.length === 1) selectLocation(partial[0].town);
      else if (partial.length > 1) showSuggestions(query);
      else { els.suggestions.hidden = true; setStatus("Town not available.", "error"); }
    }
  });
  els.input.addEventListener("input", () => showSuggestions(els.input.value));
  els.input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") els.suggestions.hidden = true;
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-section")) els.suggestions.hidden = true;
  });
  els.reset.addEventListener("click", clearSelection);
  els.fit.addEventListener("click", clearSelection);
  els.theme.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("landintel-theme", next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#101614" : "#f6f7f8");
  });
  els.chatLauncher.addEventListener("click", () => setChatOpen(els.chatPanel.hidden));
  els.chatClose.addEventListener("click", () => setChatOpen(false));
  els.chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendChatQuestion(els.chatInput.value);
    els.chatInput.value = "";
  });
  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => sendChatQuestion(button.dataset.question));
  });
  els.aboutButton.addEventListener("click", () => els.aboutDialog.showModal());
  els.aboutClose.addEventListener("click", () => els.aboutDialog.close());
  els.aboutDialog.addEventListener("click", (event) => {
    if (event.target === els.aboutDialog) els.aboutDialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      event.preventDefault(); els.input.focus();
    }
    if (event.key === "Escape" && !els.chatPanel.hidden) setChatOpen(false);
  });
}

async function boot() {
  const savedTheme = localStorage.getItem("landintel-theme");
  if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
  initMap();
  bindEvents();
  try {
    await loadData();
  } catch (error) {
    console.error(error);
    setStatus(error instanceof Error ? error.message : "Could not load the Land Intelligence database.", "error");
    els.details.replaceChildren(safeText("p", "empty-details", "The database could not be loaded. Check the data files and run this app through a local server."));
  }
  setTimeout(() => state.map?.invalidateSize(), 100);
}
boot();
