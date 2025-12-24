/**
 * Map Module - Interactive Choropleth Map
 * Handles map visualization using Leaflet.js
 */

let map;
let geojsonLayer;
let currentYear;
let currentBenefitType; // Changed from currentBenefitTypes (now single selection)
let matchingProperty;
let legendControl = null;
let currentPopup = null;
let geojsonData = null; // Store GeoJSON data for area lookup
let currentSelectedArea = null; // Track selected area for focus

// Factor-specific color schemes
const factorColorSchemes = {
    'air_quality': {
        baseColor: '#4CAF50', // Green
        colors: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20']
    },
    'congestion': {
        baseColor: '#FF9800', // Orange
        colors: ['#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100']
    },
    'noise': {
        baseColor: '#9C27B0', // Purple
        colors: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c']
    },
    'physical_activity': {
        baseColor: '#FFC107', // Yellow/Gold
        colors: ['#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b', '#fdd835', '#f9a825', '#f57f17', '#ff6f00']
    },
    'road_repairs': {
        baseColor: '#2196F3', // Blue
        colors: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1']
    }
};

/**
 * Initialize map
 */
function initMap() {
    // Initialize config values
    if (typeof config !== 'undefined') {
        currentYear = config.currentYear || 2025;
        currentBenefitType = config.selectedMapBenefitType || 'air_quality'; // Single selection now
        matchingProperty = config.matchingProperty || 'local_authority'; // Fallback to default
        console.log('Config loaded:', { currentYear, currentBenefitType, matchingProperty });
    } else {
        currentYear = 2025;
        currentBenefitType = 'air_quality'; // Default factor
        matchingProperty = 'local_authority'; // Default matching property
        console.log('Using default config:', { currentYear, currentBenefitType, matchingProperty });
    }
    
    // Initialize Leaflet map centered on UK
    map = L.map('map').setView([54.5, -3.5], 6);
    
    // Add tile layer with better styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Load GeoJSON and data
    loadMapData();
    
    // Setup event listeners
    setupMapEventListeners();
}

/**
 * Setup event listeners for map controls
 */
function setupMapEventListeners() {
    // Year select
    document.getElementById('yearSelect').addEventListener('change', function() {
        currentYear = parseInt(this.value);
        updateMap();
    });

    // Factor select (single selection)
    document.getElementById('factorSelect').addEventListener('change', function() {
        currentBenefitType = this.value;
        updateMap();
    });

    // Area select
    document.getElementById('areaSelect').addEventListener('change', function() {
        currentSelectedArea = this.value;
        if (currentSelectedArea) {
            focusOnArea(currentSelectedArea);
        }
    });

    // Focus button
    document.getElementById('focusBtn').addEventListener('click', function() {
        if (currentSelectedArea) {
            focusOnArea(currentSelectedArea);
        }
    });
}

/**
 * Load map data from API
 */
async function loadMapData() {
    try {
        showLoading();
        
        // Load GeoJSON
        const geojsonResponse = await fetch('/api/geojson');
        geojsonData = await geojsonResponse.json(); // Store for area lookup
        
        // Populate area dropdown
        populateAreaDropdown(geojsonData);
        
        // Load map data with selected benefit type
        const params = new URLSearchParams({
            year: currentYear,
            benefit_type: currentBenefitType
        });

        const dataResponse = await fetch(`/api/map-data?${params}`);
        const result = await dataResponse.json();

        if (result.success) {
            renderMap(geojsonData, result.data || []);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading map data:', error);
        hideLoading();
        showError('Error loading map data. Please try again.');
    }
}

/**
 * Render map with data
 */
function renderMap(geojson, data) {
    // Close any existing popup
    if (currentPopup) {
        map.closePopup(currentPopup);
        currentPopup = null;
    }
    
    // Remove existing layer
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }
    
    // Remove existing legend
    if (legendControl) {
        map.removeControl(legendControl);
    }
    
    // Create data lookup map
    const dataMap = {};
    let maxValue = -Infinity;
    let minValue = Infinity;
    
    console.log('Rendering map with data count:', data.length);
    console.log('Current benefit type:', currentBenefitType);
    console.log('Matching property:', matchingProperty);
    
    data.forEach(item => {
        const key = item.local_authority;
        dataMap[key] = item.value;
        
        if (item.value > maxValue) maxValue = item.value;
        if (item.value < minValue) minValue = item.value;
    });
    
    console.log('Data map keys count:', Object.keys(dataMap).length);
    console.log('Value range:', { minValue, maxValue });
    console.log('Sample data entries:', Object.entries(dataMap).slice(0, 3));
    
    // Color scale function using factor-specific colors
    function getColor(value) {
        if (value === null || value === undefined) return '#cccccc';

        const normalized = maxValue !== minValue
            ? (value - minValue) / (maxValue - minValue)
            : 0.5;

        // Use factor-specific color scheme
        const colorScheme = factorColorSchemes[currentBenefitType] || factorColorSchemes['air_quality'];
        const colors = colorScheme.colors;

        const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
        return colors[index];
    }
    
    // Style function
    function style(feature) {
        const areaName = feature.properties[matchingProperty];
        const value = dataMap[areaName];
        
        // Debug first few features
        if (Object.keys(dataMap).length > 0 && Math.random() < 0.01) {
            console.log('Styling feature:', {
                areaName,
                value,
                hasData: value !== undefined,
                matchingProperty,
                availableProperties: Object.keys(feature.properties)
            });
        }
        
        return {
            fillColor: getColor(value),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    
    // Highlight feature
    function highlightFeature(e) {
        const layer = e.target;
        
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.9
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
    
    // Reset highlight
    function resetHighlight(e) {
        geojsonLayer.resetStyle(e.target);
    }
    
    // Click handler
    function onFeatureClick(e) {
        const feature = e.target.feature;
        const areaName = feature.properties[matchingProperty];
        const value = dataMap[areaName];
        
        // Create popup content
        let popupContent = `<div class="map-popup">
            <h6><i class="fas fa-map-marker-alt me-2"></i>${areaName}</h6>
            <hr style="margin: 10px 0;">`;
        
        if (value !== undefined && value !== null) {
            popupContent += `<p class="mb-2"><strong>Nilai:</strong> ${value.toFixed(2)}</p>`;
            popupContent += `<p class="mb-2"><strong>Tahun:</strong> ${currentYear}</p>`;
            
            if (currentBenefitType) {
                const btConfig = config.benefitConfigs[currentBenefitType];
                if (btConfig) {
                    popupContent += `<p class="mb-1"><strong>Faktor:</strong></p>`;
                    popupContent += `<p class="mb-0"><i class="fas ${btConfig.icon}" style="color: ${btConfig.color}"></i> ${btConfig.label}</p>`;
                }
            }
        } else {
            popupContent += `<p class="text-muted">Tidak ada data untuk tahun ini</p>`;
        }
        
        popupContent += `<button class="btn btn-sm btn-primary mt-2 w-100" onclick="viewAreaDetails('${areaName}')">
            <i class="fas fa-chart-line me-1"></i>Lihat Detail
        </button></div>`;
        
        // Show popup
        currentPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);
    }
    
    // Add GeoJSON layer
    geojsonLayer = L.geoJson(geojson, {
        style: style,
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: onFeatureClick
            });
        }
    }).addTo(map);
    
    // Add legend
    addLegend(minValue, maxValue);
}

/**
 * Add legend to map
 */
function addLegend(minValue, maxValue) {
    legendControl = L.control({position: 'bottomright'});
    
    legendControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'map-legend');
        const grades = [];
        const steps = 8;
        
        for (let i = 0; i <= steps; i++) {
            grades.push(minValue + (maxValue - minValue) * i / steps);
        }
        
        // Get factor-specific colors
        const colorScheme = factorColorSchemes[currentBenefitType] || factorColorSchemes['air_quality'];
        const colors = colorScheme.colors;
        
        // Get factor label
        const factorLabel = config.benefitConfigs[currentBenefitType]?.label || 'Faktor';
        
        div.innerHTML = `<h6><i class="fas fa-layer-group me-2"></i>Legenda - ${factorLabel}</h6>`;
        
        for (let i = 0; i < grades.length - 1; i++) {
            div.innerHTML +=
                '<div class="legend-item">' +
                '<i style="background:' + colors[i] + '"></i> ' +
                grades[i].toFixed(2) + ' &ndash; ' + grades[i + 1].toFixed(2) +
                '</div>';
        }
        
        return div;
    };
    
    legendControl.addTo(map);
}

/**
 * View area details - scroll to charts and select area
 */
function viewAreaDetails(areaName) {
    // Set the chart select to this area
    const chartSelect = document.getElementById('chart-la-select');
    if (chartSelect) {
        chartSelect.value = areaName;
        
        // Trigger change event to load charts
        const event = new Event('change');
        chartSelect.dispatchEvent(event);
        
        // Scroll to charts section
        scrollToSection('charts-section');
    }
}

/**
 * Focus map on selected area
 */
function focusOnArea(areaName) {
    if (!geojsonData || !areaName) return;

    // Find the feature for the selected area
    const feature = geojsonData.features.find(f =>
        f.properties[matchingProperty] === areaName
    );

    if (feature) {
        // Fit map bounds to the selected area
        const bounds = L.geoJSON(feature).getBounds();
        map.fitBounds(bounds, { padding: [20, 20] });

        // Highlight the selected area (optional visual feedback)
        if (geojsonLayer) {
            geojsonLayer.eachLayer(function(layer) {
                if (layer.feature.properties[matchingProperty] === areaName) {
                    layer.setStyle({
                        weight: 4,
                        color: '#000000',
                        fillOpacity: 0.9
                    });
                } else {
                    layer.setStyle({
                        weight: 2,
                        color: 'white',
                        fillOpacity: 0.7
                    });
                }
            });
        }
    }
}

/**
 * Populate area dropdown with available areas
 */
function populateAreaDropdown(geojson) {
    const areaSelect = document.getElementById('areaSelect');
    if (!areaSelect) {
        console.error('areaSelect element not found');
        return;
    }

    // Ensure matchingProperty is set
    if (!matchingProperty) {
        matchingProperty = 'local_authority';
        console.warn('matchingProperty was not set, using default:', matchingProperty);
    }

    console.log('Populating area dropdown with matchingProperty:', matchingProperty);
    console.log('GeoJSON features count:', geojson.features.length);
    
    // Check first feature properties
    if (geojson.features.length > 0) {
        console.log('Sample feature properties:', Object.keys(geojson.features[0].properties));
    }

    // Clear existing options except the first one
    areaSelect.innerHTML = '<option value="">Pilih daerah untuk fokus...</option>';

    // Sort areas alphabetically
    const areas = geojson.features
        .map(f => f.properties[matchingProperty])
        .filter(name => name) // Remove null/undefined
        .sort();

    console.log('Total areas found:', areas.length);
    console.log('First 5 areas:', areas.slice(0, 5));

    // Add options
    areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        areaSelect.appendChild(option);
    });
}

/**
 * Update map with current selections
 */
function updateMap() {
    loadMapData();
}

// Initialize map when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
} else {
    initMap();
}
