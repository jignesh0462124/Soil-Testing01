/**
 * SoilHive Interactive Soil Map
 * Modular architecture: Map Layer → API Layer → Data Processing → Visualization Layer → UI Layer
 */

// ============================================================================
// DATA VALIDATION & NORMALIZATION UTILITIES
// ============================================================================

const DataValidator = {
  isValidLatitude(lat) {
    const num = parseFloat(lat);
    return !isNaN(num) && num >= -90 && num <= 90;
  },

  isValidLongitude(lng) {
    const num = parseFloat(lng);
    return !isNaN(num) && num >= -180 && num <= 180;
  },

  isValidPH(ph) {
    const num = parseFloat(ph);
    return !isNaN(num) && num >= 0 && num <= 14;
  },

  isValidNutrient(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  },

  clampPH(ph) {
    const num = parseFloat(ph);
    if (isNaN(num)) return 7;
    return Math.max(0, Math.min(14, num));
  },

  normalizeNutrient(value, maxValue = 100) {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, (num / maxValue) * 100));
  },

  validateSoilData(data) {
    return {
      valid:
        this.isValidLatitude(data.lat) &&
        this.isValidLongitude(data.lng) &&
        this.isValidPH(data.pH),
      errors: {
        lat: !this.isValidLatitude(data.lat) ? 'Invalid latitude' : null,
        lng: !this.isValidLongitude(data.lng) ? 'Invalid longitude' : null,
        ph: !this.isValidPH(data.pH) ? 'Invalid pH' : null,
      },
    };
  },
};

// ============================================================================
// SOIL DATA NORMALIZATION & GEOJSON CONVERSION
// ============================================================================

const DataNormalizer = {
  normalizeSoilPoint(rawData) {
    return {
      lat: parseFloat(rawData.lat),
      lng: parseFloat(rawData.lng),
      pH: DataValidator.clampPH(rawData.pH),
      soilType: rawData.soil_type || 'unknown',
      nitrogen: DataValidator.normalizeNutrient(rawData.nitrogen),
      phosphorus: DataValidator.normalizeNutrient(rawData.phosphorus),
      potassium: DataValidator.normalizeNutrient(rawData.potassium),
      // New Ingredients
      moisture: parseFloat(rawData.moisture || 0).toFixed(1),
      organicMatter: parseFloat(rawData.organic_matter || 0).toFixed(1),
      conductivity: parseFloat(rawData.conductivity || 0).toFixed(2),

      timestamp: rawData.timestamp || new Date().toISOString(),
      locationName: rawData.location_name || `Area ${parseFloat(rawData.lat).toFixed(2)}, ${parseFloat(rawData.lng).toFixed(2)}`
    };
  },

  toGeoJSON(soilDataArray) {
    const features = soilDataArray
      .filter((data) => DataValidator.validateSoilData(data).valid)
      .map((data) => {
        const normalized = this.normalizeSoilPoint(data);
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [normalized.lng, normalized.lat],
          },
          properties: {
            pH: normalized.pH,
            soilType: normalized.soilType,
            nitrogen: normalized.nitrogen,
            phosphorus: normalized.phosphorus,
            potassium: normalized.potassium,
            moisture: normalized.moisture,
            organicMatter: normalized.organicMatter,
            conductivity: normalized.conductivity,
            timestamp: normalized.timestamp,
            locationName: normalized.locationName,
            npkAverage: (normalized.nitrogen + normalized.phosphorus + normalized.potassium) / 3,
          },
        };
      });

    return {
      type: 'FeatureCollection',
      features: features,
    };
  },

  filterByPHRange(geoJSON, minPH, maxPH) {
    return {
      ...geoJSON,
      features: geoJSON.features.filter(
        (feature) => feature.properties.pH >= minPH && feature.properties.pH <= maxPH
      ),
    };
  },

  filterBySoilType(geoJSON, soilType) {
    if (!soilType || soilType === 'all') return geoJSON;
    return {
      ...geoJSON,
      features: geoJSON.features.filter((feature) => feature.properties.soilType === soilType),
    };
  },

  applyFilters(geoJSON, filters) {
    let filtered = geoJSON;
    if (filters.phMin !== undefined && filters.phMax !== undefined) {
      filtered = this.filterByPHRange(filtered, filters.phMin, filters.phMax);
    }
    if (filters.soilType) {
      filtered = this.filterBySoilType(filtered, filters.soilType);
    }
    return filtered;
  },
};

// ============================================================================
// SOIL DATA API LAYER - BOUNDS-BASED FETCHING WITH DEBOUNCING
// ============================================================================

const SoilDataManager = {
  debounceTimer: null,
  debounceDelay: 400, // ms
  lastFetchBounds: null,
  cachedData: null,
  isLoading: false,

  getBoundsFromMap(map) {
    const bounds = map.getBounds();
    return {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };
  },

  boundsSame(bounds1, bounds2) {
    if (!bounds1 || !bounds2) return false;
    const tolerance = 0.005; // Reduced tolerance to trigger updates more easily
    return (
      Math.abs(bounds1.north - bounds2.north) < tolerance &&
      Math.abs(bounds1.south - bounds2.south) < tolerance &&
      Math.abs(bounds1.east - bounds2.east) < tolerance &&
      Math.abs(bounds1.west - bounds2.west) < tolerance
    );
  },

  fetchWithDebounce(map) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fetch(map);
    }, this.debounceDelay);
  },

  async fetch(map) {
    const bounds = this.getBoundsFromMap(map);

    if (this.boundsSame(bounds, this.lastFetchBounds)) {
      return this.cachedData;
    }

    this.isLoading = true;
    console.log('🔄 Fetching soil data for bounds:', bounds);

    try {
      // Calls the Backend API which now has the dynamic generator
      const response = await fetch('/api/soil/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bounds),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.lastFetchBounds = bounds;
      this.cachedData = data.features || [];

      console.log(`✅ Fetched ${this.cachedData.length} soil data points`);

      // Notify map to update
      if (window.mapManager) {
        window.mapManager.updateMarkers();
      }

      return this.cachedData;
    } catch (error) {
      console.error('❌ Error fetching soil data:', error);
      return [];
    } finally {
      this.isLoading = false;
    }
  },

  getCachedData() {
    return this.cachedData || [];
  },
};

// ============================================================================
// SOIL MARKER VISUALIZATION LAYER
// ============================================================================

const SoilMarkerRenderer = {
  markers: [],
  markerGroup: null,

  getColorForPH(pH) {
    if (pH < 6.5) return '#EF4444';
    if (pH <= 7.5) return '#22C55E';
    return '#3B82F6';
  },

  getPHCategory(pH) {
    if (pH < 6.5) return 'Acidic';
    if (pH <= 7.5) return 'Neutral';
    return 'Alkaline';
  },

  getRadiusForNitrogen(nitrogen) {
    return 6 + (nitrogen / 100) * 12;
  },

  clearMarkers() {
    if (this.markerGroup) {
      this.markerGroup.clearLayers();
    }
    this.markers = [];
  },

  renderMarkers(geoJSON, map) {
    this.clearMarkers();

    if (!this.markerGroup) {
      this.markerGroup = L.featureGroup().addTo(map);
    }

    geoJSON.features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      const lat = coords[1];
      const lng = coords[0];
      const color = this.getColorForPH(feature.properties.pH);
      const radius = this.getRadiusForNitrogen(feature.properties.nitrogen);

      const marker = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.8,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        window.mapManager.openDetails(feature);
      });

      marker.addTo(this.markerGroup);
      this.markers.push(marker);
    });

    console.log(`🎯 Rendered ${this.markers.length} soil markers`);
  },
};

// ============================================================================
// MAP MANAGER
// ============================================================================

const MapManager = {
  map: null,
  initialized: false,
  currentFilters: { phMin: 0, phMax: 14, soilType: 'all' },
  currentGeoJSON: null,
  selectedFeature: null,

  async initializeMap() {
    if (this.initialized) return;

    console.log('🗺️  Initializing Leaflet map...');

    this.map = L.map('soil-map', {
      zoomControl: false
    }).setView([21.1458, 79.0882], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    this.renderLegend();
    this.renderFilters();

    this.map.on('moveend', () => this.onMapInteraction());

    this.map.on('click', (e) => {
      if (e.originalEvent.target.classList.contains('leaflet-container')) {
        this.closeDetails();
      }
    });

    this.initialized = true;
    await this.onMapInteraction();
    console.log('✅ Map initialized successfully');
  },

  openDetails(feature) {
    this.selectedFeature = feature;
    const props = feature.properties;
    const panel = document.getElementById('details-panel');

    if (!panel) return;

    // Populate Data
    document.getElementById('detail-location').innerText = props.locationName || `Lat: ${feature.geometry.coordinates[1].toFixed(4)}`;

    // pH
    const phVal = document.getElementById('detail-ph');
    const phMsg = document.getElementById('detail-ph-msg');
    if (phVal && phMsg) {
      phVal.innerText = props.pH.toFixed(1);
      phVal.style.color = SoilMarkerRenderer.getColorForPH(props.pH);
      phMsg.innerText = SoilMarkerRenderer.getPHCategory(props.pH);
    }

    // Soil Type
    const typeEl = document.getElementById('detail-type');
    if (typeEl) typeEl.innerText = props.soilType;

    // New Ingredients
    if (document.getElementById('detail-moisture')) document.getElementById('detail-moisture').innerText = props.moisture + '%';
    if (document.getElementById('detail-organic')) document.getElementById('detail-organic').innerText = props.organicMatter + '%';
    if (document.getElementById('detail-conductivity')) document.getElementById('detail-conductivity').innerText = props.conductivity + ' dS/m';

    // NPK Bars
    if (document.getElementById('detail-n')) document.getElementById('detail-n').innerText = parseFloat(props.nitrogen).toFixed(0) + '%';
    if (document.getElementById('bar-n')) document.getElementById('bar-n').style.width = props.nitrogen + '%';

    if (document.getElementById('detail-p')) document.getElementById('detail-p').innerText = parseFloat(props.phosphorus).toFixed(0) + '%';
    if (document.getElementById('bar-p')) document.getElementById('bar-p').style.width = props.phosphorus + '%';

    if (document.getElementById('detail-k')) document.getElementById('detail-k').innerText = parseFloat(props.potassium).toFixed(0) + '%';
    if (document.getElementById('bar-k')) document.getElementById('bar-k').style.width = props.potassium + '%';

    // Recommendations Logic
    this.generateRecommendations(props);

    // Show Panel
    panel.style.display = 'block';

    // Fly to location
    this.map.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 13);
  },

  closeDetails() {
    const panel = document.getElementById('details-panel');
    if (panel) panel.style.display = 'none';
    this.selectedFeature = null;
  },

  generateRecommendations(props) {
    const recBox = document.getElementById('detail-rec');
    if (!recBox) return;

    let recs = [];

    // pH Logic
    if (props.pH < 6.0) recs.push("Soil is **Acidic**. Add **Lime**.");
    else if (props.pH > 7.5) recs.push("Soil is **Alkaline**. Add **Sulfur**.");

    // NPK Logic
    if (props.nitrogen < 30) recs.push("Low **Nitrogen**. Use Urea/Compost.");
    if (props.phosphorus < 30) recs.push("Low **Phosphorus**. Use Bone Meal.");
    if (props.potassium < 30) recs.push("Low **Potassium**. Add Potash.");

    // New Ingredient Logic
    if (props.organicMatter < 2.0) recs.push("Low **Organic Matter**. Add Compost.");
    if (props.moisture < 20.0) recs.push("Low **Moisture**. Irrigation needed.");
    if (props.conductivity > 4.0) recs.push("High **Salinity**. Improve drainage.");

    if (recs.length === 0) {
      recBox.innerHTML = "Soil health is **Optimal**.";
      recBox.style.color = "#00E676";
    } else {
      const htmlRecs = recs.map(r => `• ${r.replace(/\*\*(.*?)\*\*/g, '<span style="color:var(--primary); font-weight:600;">$1</span>')}`).join('<br>');
      recBox.innerHTML = htmlRecs;
      recBox.style.color = "var(--text-main)";
    }
  },

  async onMapInteraction() {
    // This calls fetchWithDebounce -> fetch -> API
    // The API response then triggers updateMarkers() IF it returns data
    const data = await SoilDataManager.fetch(this.map);
    if (data && data.length > 0) {
      this.updateMarkers();
    }
  },

  updateMarkers() {
    const cachedData = SoilDataManager.getCachedData();
    if (cachedData.length === 0) return;

    let geoJSON = cachedData;
    if (!geoJSON.type || geoJSON.type !== 'FeatureCollection') {
      geoJSON = DataNormalizer.toGeoJSON(cachedData);
    }

    this.currentGeoJSON = geoJSON;
    const filtered = DataNormalizer.applyFilters(geoJSON, this.currentFilters);
    SoilMarkerRenderer.renderMarkers(filtered, this.map);
  },

  renderLegend() {
    const container = document.getElementById('legend-container');
    if (!container) return;
    const legendHtml = `
      <div class="soil-legend glass-card" style="padding: 16px; min-width: 150px; background: var(--bg-card);">
        <h4 style="margin: 0 0 12px 0; font-size: 14px; border-bottom: 2px solid var(--primary); padding-bottom: 4px; display:inline-block; color: var(--text-main);">pH Key</h4>
        <div class="legend-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; color: var(--text-muted);">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #EF4444;"></div>
          <div>Acidic (< 6.5)</div>
        </div>
        <div class="legend-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; color: var(--text-muted);">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #22C55E;"></div>
          <div>Neutral (6.5 - 7.5)</div>
        </div>
        <div class="legend-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; color: var(--text-muted);">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #3B82F6;"></div>
          <div>Alkaline (> 7.5)</div>
        </div>
      </div>
    `;
    container.innerHTML = legendHtml;
  },

  renderFilters() {
    const container = document.getElementById('filter-container');
    if (!container) return;
    const filterHtml = `
      <div class="filter-panel" style="padding: 20px;">
        <h4 style="margin: 0 0 16px 0; font-size: 14px; color: var(--text-main);">Filters</h4>
        <div class="filter-group" style="margin-bottom: 20px;">
          <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:500;">pH Range</label>
          <div style="display: flex; gap: 10px; align-items: center;">
             <input type="range" id="pH-min" min="0" max="14" step="0.1" value="${this.currentFilters.phMin}" style="flex:1;">
             <input type="range" id="pH-max" min="0" max="14" step="0.1" value="${this.currentFilters.phMax}" style="flex:1;">
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-main); margin-top: 4px;">
            <span id="pH-min-display">${this.currentFilters.phMin.toFixed(1)}</span>
            <span id="pH-max-display">${this.currentFilters.phMax.toFixed(1)}</span>
          </div>
        </div>
        <div class="filter-group">
          <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:500;">Soil Type</label>
          <select id="soil-type-select" class="input-field" style="padding: 10px;">
            <option value="all">All Types</option>
            <option value="clay">Clay</option>
            <option value="sandy">Sandy</option>
            <option value="loam">Loam</option>
            <option value="peaty">Peaty</option>
            <option value="silty">Silty</option>
          </select>
        </div>
      </div>
    `;
    container.innerHTML = filterHtml;

    document.getElementById('pH-min').addEventListener('input', (e) => {
      this.currentFilters.phMin = parseFloat(e.target.value);
      document.getElementById('pH-min-display').textContent = this.currentFilters.phMin.toFixed(1);
      this.updateMarkers();
    });

    document.getElementById('pH-max').addEventListener('input', (e) => {
      this.currentFilters.phMax = parseFloat(e.target.value);
      document.getElementById('pH-max-display').textContent = this.currentFilters.phMax.toFixed(1);
      this.updateMarkers();
    });

    document.getElementById('soil-type-select').addEventListener('change', (e) => {
      this.currentFilters.soilType = e.target.value;
      this.updateMarkers();
    });
  },
};

window.mapManager = MapManager;
console.log('🌱 SoilHive Map System Loaded - Client Side Mock Removed (Using Backend)');
