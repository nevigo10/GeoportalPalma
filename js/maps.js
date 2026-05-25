// Registrar la proyección UTM Zona 16N (Honduras) en Proj4
proj4.defs("EPSG:32616", "+proj=utm +zone=16 +datum=WGS84 +units=m +no_defs");

// Inicializar el mapa de Leaflet
const map = L.map('map', {
    zoomControl: false // Ocultar control por defecto para colocarlo abajo a la derecha
}).setView([15.65, -87.05], 11);

// Añadir control de zoom en la parte inferior derecha
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Control dinámico de clases de zoom para optimizar la visualización de etiquetas
map.on('zoomend', function() {
    const zoom = map.getZoom();
    const container = map.getContainer();
    container.classList.remove('zoom-far', 'zoom-medium', 'zoom-close');
    
    if (zoom < 10) {
        container.classList.add('zoom-far');
    } else if (zoom >= 10 && zoom < 13) {
        container.classList.add('zoom-medium');
    } else {
        container.classList.add('zoom-close');
    }
});
map.fire('zoomend');

// Capa base topográfica (OpenTopoMap)
const osm = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17
}).addTo(map);

// Capa base satelital híbrida (Google Satelital con etiquetas de calles/ciudades)
const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps',
    maxZoom: 20
});

// Capas de GeoServer (WMS)
const departamentos = L.tileLayer.wms("http://localhost:8080/geoserver/ne/wms?", {
    layers: "ne:Departamentoswgs84",
    format: "image/png",
    transparent: true,
    attribution: "GeoServer"
});

// Capa de Municipios (WMS para renderizado robusto e inmune a CORS)
const municipios = L.tileLayer.wms("http://localhost:8080/geoserver/ne/wms?", {
    layers: "ne:Municipios2013",
    format: "image/png",
    transparent: true,
    attribution: "GeoServer"
});

// Capa de Aldeas (WMS para renderizado robusto e inmune a CORS)
const aldeas = L.tileLayer.wms("http://localhost:8080/geoserver/ne/wms?", {
    layers: "ne:Aldeas2001",
    format: "image/png",
    transparent: true,
    attribution: "GeoServer"
});

// Etiquetas de Municipios Offline (Inmunes a CORS y de Carga Instantánea)
const municipiosLabels = L.featureGroup();
const localMunicipios = [
    { name: "La Ceiba", coords: [15.7597, -86.7954] },
    { name: "Olanchito", coords: [15.4806, -86.5742] },
    { name: "Tela", coords: [15.7739, -87.4514] },
    { name: "El Progreso", coords: [15.4008, -87.8039] },
    { name: "San Pedro Sula", coords: [15.5042, -88.0250] },
    { name: "La Masica", coords: [15.6322, -87.1264] },
    { name: "Jutiapa", coords: [15.7424, -86.5168] },
    { name: "Arizona", coords: [15.6881, -87.3236] },
    { name: "Esparta", coords: [15.6747, -87.1856] },
    { name: "El Porvenir", coords: [15.7550, -86.8906] },
    { name: "San Francisco", coords: [15.6833, -86.9667] }
];

localMunicipios.forEach(mun => {
    L.marker(mun.coords, {
        icon: L.divIcon({
            className: 'polygon-label',
            html: `<span>${mun.name}</span>`,
            iconSize: null
        })
    }).addTo(municipiosLabels);
});

// Etiquetas de Aldeas Offline (Inmunes a CORS y de Carga Instantánea)
const aldeasLabels = L.featureGroup();
const localAldeas = [
    { name: "Corozal", coords: [15.8000, -86.7167] },
    { name: "Sambo Creek", coords: [15.8167, -86.6333] },
    { name: "Triunfo de la Cruz", coords: [15.7833, -87.4167] },
    { name: "Tornabé", coords: [15.8000, -87.5000] },
    { name: "San Juan", coords: [15.8167, -87.5333] },
    { name: "La Ensenada", coords: [15.7833, -87.4333] },
    { name: "El Pino", coords: [15.7167, -86.9167] },
    { name: "Roma", coords: [15.7167, -86.5833] },
    { name: "Lis Lis", coords: [15.7833, -86.5000] },
    { name: "Mangrove Bight", coords: [16.4258, -85.8972] },
    { name: "San Juan Pueblo", coords: [15.5833, -87.2167] }
];

localAldeas.forEach(ald => {
    L.marker(ald.coords, {
        icon: L.divIcon({
            className: 'polygon-label-aldeas',
            html: `<span>Aldea: ${ald.name}</span>`,
            iconSize: null
        })
    }).addTo(aldeasLabels);
});

// Icono SVG personalizado de palma para la simbología en el mapa
const palmIcon = L.divIcon({
    html: `<div class="palm-marker-badge">
     <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
       <path fill="#C1694F" d="M21.978 20.424a29.331 29.331 0 0 0-.247-2.325a30.78 30.78 0 0 0-1.885-6.93c-.527-1.299-.943-2.043-.943-2.043l-3.613.466s.417.87.868 2.575c.183.692.371 1.524.54 2.495c.086.49.166 1.012.238 1.573c.1.781.183 1.632.242 2.549c.034.518.058 1.058.074 1.619c.006.204.015.401.018.611a14.52 14.52 0 0 1-.118 1.989c-.074.6-.182 1.197-.311 1.789a26.225 26.225 0 0 1-.67 2.475a34.793 34.793 0 0 1-.655 1.84c-.344.891-.69 1.692-.989 2.359c-.502 1.119-.871 1.863-.871 2.018c0 .49.35 1.408 2.797 2.02c3.827.956 4.196-.621 4.196-.621s.243-.738.526-2.192c.14-.718.289-1.605.424-2.678c.081-.642.156-1.348.222-2.116a61.85 61.85 0 0 0 .22-4.864c.002-.246.008-.484.008-.737c0-.64-.03-1.261-.071-1.872z"></path>
       <path fill="#D99E82" d="M18.306 30.068c-1.403-.244-2.298-.653-2.789-.959c-.344.891-.69 1.692-.989 2.359c.916.499 2.079.895 3.341 1.114c.729.127 1.452.191 2.131.191c.414 0 .803-.033 1.176-.08c.14-.718.289-1.605.424-2.678c-.444.157-1.548.357-3.294.053zm1.06-4.673c-1.093-.108-1.934-.348-2.525-.602a26.225 26.225 0 0 1-.67 2.475c.864.326 1.881.561 2.945.666c.429.042.855.064 1.27.064c.502 0 .978-.039 1.435-.099c.068-.8.125-1.667.165-2.605c-.628.135-1.509.21-2.62.101zm.309-2.133c.822 0 1.63-.083 2.366-.228c.002-.246.008-.484.008-.737c0-.641-.029-1.262-.071-1.873c-.529.138-1.285.272-2.352.286c-1.084-.005-1.847-.155-2.374-.306c.006.204.015.401.018.611a14.52 14.52 0 0 1-.118 1.989c.763.161 1.605.253 2.461.257l.062.001zm-.249-4.577a12.08 12.08 0 0 0 2.304-.585a30.343 30.343 0 0 0-.485-2.513c-.496.204-1.199.431-2.181.572a9.03 9.03 0 0 1-2.129.077c.1.781.183 1.632.242 2.549c.152.006.29.029.446.029c.588.001 1.2-.043 1.803-.129zm1.271-5.116a30.223 30.223 0 0 0-.852-2.4a9.452 9.452 0 0 1-1.737.659a9.23 9.23 0 0 1-1.951.339c.183.692.371 1.524.54 2.495a12.42 12.42 0 0 0 2.094-.376c.679-.188 1.31-.44 1.906-.717z"></path>
       <path fill="#3E721D" d="M32.61 4.305c-.044-.061-4.48-5.994-10.234-3.39c-2.581 1.167-4.247 3.074-4.851 5.535c-1.125-1.568-2.835-2.565-5.093-2.968C6.233 2.376 2.507 9.25 2.47 9.32c-.054.102-.031.229.056.305s.217.081.311.015c.028-.02 2.846-1.993 7.543-1.157c4.801.854 8.167 1.694 8.201 1.702a.254.254 0 0 0 .245-.073c.032-.035 3.22-3.46 6.153-4.787c4.339-1.961 7.298-.659 7.326-.646a.252.252 0 0 0 .298-.07a.246.246 0 0 0 .007-.304z"></path>
       <path fill="#5C913B" d="M27.884 7.63c-4.405-2.328-7.849-1.193-9.995.22c-2.575-.487-7.334-.459-11.364 4.707c-4.983 6.387-.618 14.342-.573 14.422a.376.376 0 0 0 .689-.086c.015-.054 1.527-5.52 5.35-10.118c2.074-2.496 4.55-4.806 6.308-6.34c1.762.298 4.327.947 6.846 2.354c4.958 2.773 7.234 7.466 7.257 7.513a.372.372 0 0 0 .379.212a.377.377 0 0 0 .325-.287c.02-.088 1.968-8.8-5.222-12.597z"></path>
     </svg>
    </div>`,
    className: 'custom-palm-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Capa WFS de Parcelas
let allCacaoFeatures = [];
const cacaoLayer = L.geoJSON(null, {
    // Proyección dinámica: si las coordenadas están en formato UTM, las convierte en lat/lng de WGS84
    coordsToLatLng: function (coords) {
        if (Math.abs(coords[0]) > 180) {
            try {
                const wgs84 = proj4("EPSG:32616", "WGS84", [coords[0], coords[1]]);
                return L.latLng(wgs84[1], wgs84[0]);
            } catch (e) {
                console.error("Error convirtiendo coordenadas UTM a WGS84:", e);
            }
        }
        return L.latLng(coords[1], coords[0]);
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: palmIcon });
    },
    onEachFeature: function (feature, layer) {
        let popupContent = '<div style="font-family: Inter, sans-serif; min-width: 220px;">';
        popupContent += '<h4 style="margin:0 0 8px 0; color:#5c913b; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-leaf"></i> Parcela de Palma</h4>';
        if (feature.properties) {
            popupContent += '<table style="width:100%; font-size:0.85rem; border-collapse:collapse;">';
            for (let key in feature.properties) {
                if (feature.properties.hasOwnProperty(key) && feature.properties[key] !== null && feature.properties[key] !== '') {
                    popupContent += `<tr><td style="padding:4px; border-bottom:1px solid #444; font-weight:bold;">${key}:</td><td style="padding:4px; border-bottom:1px solid #444; color:#ddd;">${feature.properties[key]}</td></tr>`;
                }
            }
            popupContent += '</table>';
        }

        popupContent += '<div style="margin-top: 10px; display: flex; gap: 8px;">';
        popupContent += '<button class="route-btn" onclick="setRouteStartFromPopup()">📍 Desde aquí</button>';
        popupContent += '<button class="route-btn" onclick="setRouteEndFromPopup()">🏁 Hasta aquí</button>';
        popupContent += '</div>';
        popupContent += '</div>';

        layer.bindPopup(popupContent, { maxWidth: 300 });

        layer.on('click', function () {
            showSelectedParcelStats(feature);
        });

        layer.on('popupclose', function () {
            clearSelectedParcelStats();
        });
    }
}).addTo(map);

// Función para cargar los datos en el Geoportal (soporta tanto GeoServer como Respaldo Local)
function loadCacaoData(data, isLocal = false) {
    cacaoLayer.clearLayers();
    cacaoLayer.addData(data);
    allCacaoFeatures = data.features || [];
    updateStats();

    // Centrar automáticamente en el Bounding Box
    if (allCacaoFeatures.length > 0) {
        map.fitBounds(cacaoLayer.getBounds(), { padding: [50, 50] });
    }

    // Si está usando el respaldo offline local, agregar una advertencia elegante
    if (isLocal) {
        setTimeout(() => {
            const totalElem = document.getElementById('stat-total');
            if (totalElem) {
                const currentVal = totalElem.innerText;
                totalElem.innerHTML = `${currentVal} <br><span style="color: #ffaa44; font-size: 0.72rem; font-weight: normal; display: block; margin-top: 4px;"><i class="fa-solid fa-triangle-exclamation"></i> Respaldo Offline Activo</span>`;
            }
        }, 120);
    }
}

// Intentar hacer fetch al WFS de GeoServer. Si falla, carga el respaldo local offline al instante.
fetch("http://localhost:8080/geoserver/ne/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ne:Parcelas&outputFormat=application/json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Respuesta del servidor no fue exitosa. Código: " + response.status);
        }
        return response.json();
    })
    .then(data => {
        loadCacaoData(data, false);
    })
    .catch(err => {
        console.warn("Fallo cargando capa WFS de GeoServer (CORS o desconexión). Usando respaldo offline local:", err);
        loadCacaoData(localPalmaGeoJSON, true);
    });

// Mostrar coordenadas en tiempo real al mover el mouse
map.on('mousemove', function (e) {
    document.getElementById('coords-display').innerHTML = 
        `Lat: ${e.latlng.lat.toFixed(5)}<br>Lng: ${e.latlng.lng.toFixed(5)}`;
});

// Función para centrar rápidamente en las parcelas
window.zoomToParcelas = function() {
    if (cacaoLayer.getLayers().length > 0) {
        map.fitBounds(cacaoLayer.getBounds(), { padding: [50, 50] });
    }
};

// Control de enrutamiento (Leaflet Routing Machine)
let routeControl = null;
let routeStart = null;
let routeEnd = null;
let currentPopupLatLng = null;

map.on('popupopen', function (e) {
    currentPopupLatLng = e.popup.getLatLng();
});

function initRoutingControl() {
    if (!routeControl) {
        routeControl = L.Routing.control({
            waypoints: [],
            routeWhileDragging: true,
            language: 'es',
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#ff3333', opacity: 0.9, weight: 8 }]
            },
            createMarker: function (i, wp, nWps) {
                return L.marker(wp.latLng, {
                    draggable: true
                }).bindPopup(i === 0 ? 'Inicio' : 'Destino');
            }
        }).addTo(map);

        // Mover el panel de enrutamiento hacia la barra lateral derecha
        const container = routeControl.getContainer();
        const customDiv = document.getElementById('routing-container');
        if (customDiv && container) {
            customDiv.appendChild(container);
        }
    }
}

function updateRoute() {
    initRoutingControl();
    routeControl.setWaypoints([
        routeStart || null,
        routeEnd || null
    ]);

    const routingCard = document.getElementById('routing-container-card');
    if (routingCard) {
        if (routeStart && routeEnd) {
            routingCard.style.display = 'block';
            const panel = document.getElementById('right-panel');
            if (panel && panel.classList.contains('collapsed')) {
                toggleRightPanel();
            }
        } else {
            routingCard.style.display = 'none';
        }
    }
}

window.setRouteStartFromPopup = function () {
    if (currentPopupLatLng) {
        routeStart = currentPopupLatLng;
        updateRoute();
        map.closePopup();
    }
};

window.setRouteEndFromPopup = function () {
    if (currentPopupLatLng) {
        routeEnd = currentPopupLatLng;
        updateRoute();
        map.closePopup();
    }
};

window.clearRoute = function () {
    routeStart = null;
    routeEnd = null;
    if (routeControl) {
        routeControl.setWaypoints([]);
    }
    const routingCard = document.getElementById('routing-container-card');
    if (routingCard) {
        routingCard.style.display = 'none';
    }
};

// Vinculación de Capas Temáticas y Controles de HTML
document.getElementById('basemap-topo').addEventListener('change', function(e) {
    if (e.target.checked) {
        googleSat.remove();
        osm.addTo(map);
    }
});

document.getElementById('basemap-sat').addEventListener('change', function(e) {
    if (e.target.checked) {
        osm.remove();
        googleSat.addTo(map);
    }
});

document.getElementById('layer-departamentos').addEventListener('change', function(e) {
    if (e.target.checked) {
        departamentos.addTo(map);
    } else {
        map.removeLayer(departamentos);
    }
});

document.getElementById('layer-municipios').addEventListener('change', function(e) {
    if (e.target.checked) {
        municipios.addTo(map);
        municipiosLabels.addTo(map);
    } else {
        map.removeLayer(municipios);
        map.removeLayer(municipiosLabels);
    }
});

document.getElementById('layer-aldeas').addEventListener('change', function(e) {
    if (e.target.checked) {
        aldeas.addTo(map);
        aldeasLabels.addTo(map);
    } else {
        map.removeLayer(aldeas);
        map.removeLayer(aldeasLabels);
    }
});

document.getElementById('layer-parcelas').addEventListener('change', function(e) {
    if (e.target.checked) {
        map.addLayer(cacaoLayer);
    } else {
        map.removeLayer(cacaoLayer);
    }
});

// --- LÓGICA ESTADÍSTICA Y GRÁFICOS (APEXCHARTS) ---
let statsChart = null;

// Rangos de clasificación para el histograma de ha
const bins = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
const binLabels = ['≤ 0.5', '0.5 - 1.0', '1.0 - 1.5', '1.5 - 2.0', '2.0 - 2.5', '2.5 - 3.0', '3.0 - 3.5', '> 3.5'];

function calculateHistogram(values, bins) {
    let counts = new Array(bins.length).fill(0);
    values.forEach(v => {
        for (let i = 0; i < bins.length; i++) {
            if (i === 0) {
                if (v <= bins[i]) { counts[i]++; break; }
            } else if (i === bins.length - 1) {
                if (v > bins[i - 1]) { counts[i]++; break; }
            } else {
                if (v > bins[i - 1] && v <= bins[i]) { counts[i]++; break; }
            }
        }
    });
    return counts;
}

function initChart() {
    const options = {
        series: [{
            name: 'Parcelas',
            data: new Array(bins.length).fill(0)
        }],
        chart: {
            type: 'bar',
            height: 180,
            toolbar: { show: false },
            background: 'transparent'
        },
        theme: {
            mode: 'dark'
        },
        colors: ['#8cb885'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '70%',
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val > 0 ? val : '';
            },
            offsetY: -18,
            style: {
                fontSize: '10px',
                colors: ["#f1f1f1"]
            }
        },
        grid: {
            show: false
        },
        xaxis: {
            categories: binLabels,
            labels: {
                style: {
                    fontSize: '9px',
                    colors: '#aaaaaa'
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { show: false }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: "vertical",
                shadeIntensity: 0.5,
                gradientToColors: ['#E55A15'], // Transición de verde a naranja-rojo (fruto de palma africana)
                inverseColors: true,
                opacityFrom: 0.85,
                opacityTo: 0.85,
                stops: [0, 100]
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val) {
                    return val + " parcelas";
                }
            }
        }
    };

    statsChart = new ApexCharts(document.querySelector("#superficie-chart"), options);
    statsChart.render();
}

// Actualizar estadísticas del panel derecho en tiempo real
window.updateStats = function () {
    const spatialFilterActive = document.getElementById('spatial-filter-switch').checked;
    let filteredFeatures = [];

    if (spatialFilterActive) {
        const bounds = map.getBounds();
        allCacaoFeatures.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                let lng = feature.geometry.coordinates[0];
                let lat = feature.geometry.coordinates[1];
                if (Math.abs(lng) > 180) {
                    try {
                        const wgs84 = proj4("EPSG:32616", "WGS84", [lng, lat]);
                        lng = wgs84[0];
                        lat = wgs84[1];
                    } catch (e) {
                        if (feature.properties && feature.properties.Latitud__e && feature.properties.Longitud__) {
                            lat = feature.properties.Latitud__e;
                            lng = feature.properties.Longitud__;
                        }
                    }
                }
                const latLng = L.latLng(lat, lng);
                if (bounds.contains(latLng)) {
                    filteredFeatures.push(feature);
                }
            }
        });
    } else {
        filteredFeatures = [...allCacaoFeatures];
    }

    const count = filteredFeatures.length;
    let total = 0;
    let average = 0;
    let max = 0;
    let min = count > 0 ? Infinity : 0;
    let superficies = [];

    filteredFeatures.forEach(f => {
        const sup = parseFloat(f.properties.Superficie);
        if (!isNaN(sup)) {
            total += sup;
            superficies.push(sup);
            if (sup > max) max = sup;
            if (sup < min) min = sup;
        }
    });

    if (count > 0) {
        average = total / count;
    } else {
        min = 0;
    }

    // Actualizar elementos HTML
    document.getElementById('stat-count').innerText = count;
    document.getElementById('stat-avg').innerText = average.toFixed(2);
    document.getElementById('stat-total').innerText = total.toFixed(2) + " ha";
    document.getElementById('stat-min').innerText = min === Infinity ? "0.00" : min.toFixed(2);
    document.getElementById('stat-max').innerText = max.toFixed(2);

    // Calcular histograma y actualizar gráfico
    const histData = calculateHistogram(superficies, bins);
    if (statsChart) {
        statsChart.updateSeries([{
            name: 'Parcelas',
            data: histData
        }]);
    }
};

// Escuchar cambios de zoom/paneo para filtro espacial
map.on('moveend', function() {
    updateStats();
});

document.getElementById('spatial-filter-switch').addEventListener('change', function() {
    updateStats();
});

// Mostrar tarjeta con estadísticas específicas de una parcela clickeada
window.showSelectedParcelStats = function (feature) {
    const card = document.getElementById('selected-parcel-card');
    const idVal = feature.properties.FLOID || feature.properties.id || 'N/A';
    const supVal = parseFloat(feature.properties.Superficie);

    document.getElementById('selected-parcel-id').innerText = idVal;
    document.getElementById('selected-parcel-sup').innerText = !isNaN(supVal) ? supVal.toFixed(2) + " ha" : "0.00 ha";

    // Asegurarse de abrir el panel estadístico derecho si estuviera colapsado
    const panel = document.getElementById('right-panel');
    if (panel.classList.contains('collapsed')) {
        toggleRightPanel();
    }

    card.style.display = 'flex';
};

window.clearSelectedParcelStats = function () {
    const card = document.getElementById('selected-parcel-card');
    card.style.display = 'none';
};

// Alternar colapsado del panel estadístico derecho
window.toggleRightPanel = function () {
    const panel = document.getElementById('right-panel');
    const icon = document.getElementById('toggle-icon');
    panel.classList.toggle('collapsed');
    if (panel.classList.contains('collapsed')) {
        icon.className = 'fa-solid fa-chart-simple';
    } else {
        icon.className = 'fa-solid fa-xmark';
    }
};

// Inicializar el gráfico al cargar la página
initChart();

// --- RESPALDO OFFLINE LOCAL 100% GARANTIZADO DE PARCELAS ---
const localPalmaGeoJSON = {
    "type": "FeatureCollection",
    "name": "ParcelasGeo",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::32616" } },
    "features": [
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.82, "Latitud__e": 15.567455, "Longitud__": -87.311539 }, "geometry": { "type": "Point", "coordinates": [466597.048396951693576, 1721114.984911844367161] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.3, "Latitud__e": 15.603535, "Longitud__": -87.263926 }, "geometry": { "type": "Point", "coordinates": [471707.047653896384872, 1725098.95758878486231] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.1, "Latitud__e": 15.60329, "Longitud__": -87.257331 }, "geometry": { "type": "Point", "coordinates": [472414.005189268966205, 1725070.992770140524954] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.42, "Latitud__e": 15.731509, "Longitud__": -87.345232 }, "geometry": { "type": "Point", "coordinates": [463013.972250898019411, 1739266.978817412164062] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.4, "Latitud__e": 15.596578, "Longitud__": -87.275587 }, "geometry": { "type": "Point", "coordinates": [470455.981193068262655, 1724331.016736450372264] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.53, "Latitud__e": 15.602945, "Longitud__": -87.056931 }, "geometry": { "type": "Point", "coordinates": [493896.978712141397409, 1725016.985138162272051] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.54, "Latitud__e": 15.602023, "Longitud__": -87.054953 }, "geometry": { "type": "Point", "coordinates": [494108.994689681625459, 1724914.946637546643615] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.54, "Latitud__e": 15.642974, "Longitud__": -87.068371 }, "geometry": { "type": "Point", "coordinates": [492672.029493510490283, 1729444.979879140853882] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.05, "Latitud__e": 15.734125, "Longitud__": -87.343519 }, "geometry": { "type": "Point", "coordinates": [463197.964827615243848, 1739556.044414010131732] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.57, "Latitud__e": 15.601461, "Longitud__": -87.061128 }, "geometry": { "type": "Point", "coordinates": [493447.011735716485418, 1724852.963927165605128] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.29, "Latitud__e": 15.65048, "Longitud__": -86.679583 }, "geometry": { "type": "Point", "coordinates": [534341.032852578326128, 1730299.950048816157505] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.5, "Latitud__e": 15.595732, "Longitud__": -87.051864 }, "geometry": { "type": "Point", "coordinates": [494439.968651086033788, 1724219.013668630504981] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.65, "Latitud__e": 15.596238, "Longitud__": -87.051304 }, "geometry": { "type": "Point", "coordinates": [494500.016412134864368, 1724274.967978579225019] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.7, "Latitud__e": 15.697452, "Longitud__": -86.903603 }, "geometry": { "type": "Point", "coordinates": [510329.047299904457759, 1735472.021528095239773] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.23, "Latitud__e": 15.670549, "Longitud__": -86.979984 }, "geometry": { "type": "Point", "coordinates": [502145.017178065958433, 1732493.998571142321452] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.22, "Latitud__e": 15.620341, "Longitud__": -87.080473 }, "geometry": { "type": "Point", "coordinates": [491373.994910945824813, 1726941.980564234545454] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.09, "Latitud__e": 15.717853, "Longitud__": -86.945557 }, "geometry": { "type": "Point", "coordinates": [505833.046753824746702, 1737727.005480565363541] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.66, "Latitud__e": 15.601282, "Longitud__": -87.27341 }, "geometry": { "type": "Point", "coordinates": [470690.033415567013435, 1724851.032297502504662] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.1, "Latitud__e": 15.597619, "Longitud__": -87.27446 }, "geometry": { "type": "Point", "coordinates": [470576.949162502831314, 1724446.007302737329155] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.17, "Latitud__e": 15.752714, "Longitud__": -86.767397 }, "geometry": { "type": "Point", "coordinates": [524916.997008541366085, 1741596.021231797290966] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.75, "Latitud__e": 15.751624, "Longitud__": -86.762955 }, "geometry": { "type": "Point", "coordinates": [525392.972538649686612, 1741475.982837167568505] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.26, "Latitud__e": 15.654272, "Longitud__": -86.676097 }, "geometry": { "type": "Point", "coordinates": [534714.012264918419532, 1730719.959024413954467] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.22, "Latitud__e": 15.757435, "Longitud__": -86.881805 }, "geometry": { "type": "Point", "coordinates": [512661.020168504095636, 1742108.035375841660425] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.0, "Latitud__e": 15.755543, "Longitud__": -86.878007 }, "geometry": { "type": "Point", "coordinates": [513067.982540922355838, 1741898.98875828506425] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.7, "Latitud__e": 15.759179, "Longitud__": -86.881281 }, "geometry": { "type": "Point", "coordinates": [512717.04243825643789, 1742300.974500369513407] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.12, "Latitud__e": 15.760373, "Longitud__": -86.882886 }, "geometry": { "type": "Point", "coordinates": [512545.043159870489035, 1742432.949334304081276] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.34, "Latitud__e": 15.756393, "Longitud__": -86.878818 }, "geometry": { "type": "Point", "coordinates": [512981.053497825574595, 1741992.959023325936869] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.77, "Latitud__e": 15.757831, "Longitud__": -86.879686 }, "geometry": { "type": "Point", "coordinates": [512887.982247379724868, 1742151.96609175298363] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.5, "Latitud__e": 15.691685, "Longitud__": -86.966795 }, "geometry": { "type": "Point", "coordinates": [503558.05194161349209, 1734832.054051450453699] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.03, "Latitud__e": 15.688678, "Longitud__": -86.94382 }, "geometry": { "type": "Point", "coordinates": [506020.006161355413496, 1734499.965204648207873] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.9, "Latitud__e": 15.603594, "Longitud__": -87.126147 }, "geometry": { "type": "Point", "coordinates": [486477.036541145120282, 1725091.959957518614829] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.73, "Latitud__e": 15.753836, "Longitud__": -86.880239 }, "geometry": { "type": "Point", "coordinates": [512828.99586845387239, 1741710.03688871441409] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.3, "Latitud__e": 15.746564, "Longitud__": -86.765341 }, "geometry": { "type": "Point", "coordinates": [525137.998007004964165, 1740915.997151032090187] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.01, "Latitud__e": 15.747216, "Longitud__": -86.766498 }, "geometry": { "type": "Point", "coordinates": [525013.973273656214587, 1740987.979164214106277] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.92, "Latitud__e": 15.589224, "Longitud__": -87.119068 }, "geometry": { "type": "Point", "coordinates": [487235.0185146543663, 1723502.049846991663799] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.91, "Latitud__e": 15.691506, "Longitud__": -87.001988 }, "geometry": { "type": "Point", "coordinates": [499786.977470552548766, 1734811.976783454883844] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.09, "Latitud__e": 15.68511, "Longitud__": -86.955915 }, "geometry": { "type": "Point", "coordinates": [504724.040053655218799, 1734104.997568420134485] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.07, "Latitud__e": 15.628101, "Longitud__": -86.636125 }, "geometry": { "type": "Point", "coordinates": [539002.97896696231328, 1727832.052391572622582] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.81, "Latitud__e": 15.670152, "Longitud__": -86.678769 }, "geometry": { "type": "Point", "coordinates": [534424.981823150534183, 1732476.050190342357382] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.44, "Latitud__e": 15.671408, "Longitud__": -86.704363 }, "geometry": { "type": "Point", "coordinates": [531681.964494475047104, 1732610.991200921824202] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.33, "Latitud__e": 15.753119, "Longitud__": -86.765763 }, "geometry": { "type": "Point", "coordinates": [525091.986160257831216, 1741641.012971462216228] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.56, "Latitud__e": 15.730424, "Longitud__": -86.929331 }, "geometry": { "type": "Point", "coordinates": [507571.043348248116672, 1739118.019146378152072] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.0, "Latitud__e": 15.742832, "Longitud__": -86.945821 }, "geometry": { "type": "Point", "coordinates": [505804.053349751105998, 1740489.968294581165537] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.45, "Latitud__e": 15.72356, "Longitud__": -86.953947 }, "geometry": { "type": "Point", "coordinates": [504934.000837728905026, 1738358.052364578470588] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.6, "Latitud__e": 15.696732, "Longitud__": -87.004629 }, "geometry": { "type": "Point", "coordinates": [499503.995887653669342, 1735390.035901116905734] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.61, "Latitud__e": 15.701659, "Longitud__": -87.005842 }, "geometry": { "type": "Point", "coordinates": [499374.036201126640663, 1735935.021284703398123] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.75, "Latitud__e": 15.696307, "Longitud__": -87.00532 }, "geometry": { "type": "Point", "coordinates": [499429.953047125833109, 1735343.027823845855892] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.53, "Latitud__e": 15.694535, "Longitud__": -87.004312 }, "geometry": { "type": "Point", "coordinates": [499537.95795318268938, 1735147.022105878219008] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.87, "Latitud__e": 15.67938, "Longitud__": -86.966713 }, "geometry": { "type": "Point", "coordinates": [503567.052360784437042, 1733470.984153103549033] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.64, "Latitud__e": 15.617422, "Longitud__": -87.099512 }, "geometry": { "type": "Point", "coordinates": [489333.027266432764009, 1726619.971053391229361] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.96, "Latitud__e": 15.589186, "Longitud__": -87.121064 }, "geometry": { "type": "Point", "coordinates": [487021.029704737244174, 1723497.967156950384378] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.15, "Latitud__e": 15.59806, "Longitud__": -87.128392 }, "geometry": { "type": "Point", "coordinates": [486236.003216944693122, 1724479.984647996257991] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.14, "Latitud__e": 15.599932, "Longitud__": -87.128029 }, "geometry": { "type": "Point", "coordinates": [486275.042349671362899, 1724687.024253613548353] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.21, "Latitud__e": 15.589883, "Longitud__": -87.120757 }, "geometry": { "type": "Point", "coordinates": [487053.986120570509229, 1723575.043986757518724] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.83, "Latitud__e": 15.657483, "Longitud__": -87.18154 }, "geometry": { "type": "Point", "coordinates": [480543.97885280783521, 1731056.972680261125788] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.96, "Latitud__e": 15.604968, "Longitud__": -87.178415 }, "geometry": { "type": "Point", "coordinates": [480874.018836074334104, 1725247.944967228220776] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.27, "Latitud__e": 15.613525, "Longitud__": -87.214077 }, "geometry": { "type": "Point", "coordinates": [477052.011324281804264, 1726197.966689425054938] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.86, "Latitud__e": 15.575828, "Longitud__": -87.269263 }, "geometry": { "type": "Point", "coordinates": [471131.04524643404875, 1722034.96612089080736] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.89, "Latitud__e": 15.676479, "Longitud__": -86.969607 }, "geometry": { "type": "Point", "coordinates": [503256.975775381724816, 1733150.054608214180917] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.94, "Latitud__e": 15.595041, "Longitud__": -87.275669 }, "geometry": { "type": "Point", "coordinates": [470446.970496276160702, 1724161.018353193998337] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.06, "Latitud__e": 15.582277, "Longitud__": -87.251858 }, "geometry": { "type": "Point", "coordinates": [472997.970139604061842, 1722746.0182196830865] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.4, "Latitud__e": 15.60084, "Longitud__": -87.325227 }, "geometry": { "type": "Point", "coordinates": [465135.050524795777164, 1724809.946414925623685] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.82, "Latitud__e": 15.600207, "Longitud__": -87.325469 }, "geometry": { "type": "Point", "coordinates": [465109.000463721400592, 1724739.968699395423755] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.04, "Latitud__e": 15.620427, "Longitud__": -86.648173 }, "geometry": { "type": "Point", "coordinates": [537712.969383255462162, 1726981.039963351329789] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.2, "Latitud__e": 15.751599, "Longitud__": -86.765111 }, "geometry": { "type": "Point", "coordinates": [525162.017303322791122, 1741472.959304094081745] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.69, "Latitud__e": 15.754096, "Longitud__": -86.877802 }, "geometry": { "type": "Point", "coordinates": [513090.035011439118534, 1741738.945700727868825] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.16, "Latitud__e": 15.717541, "Longitud__": -86.968378 }, "geometry": { "type": "Point", "coordinates": [503387.999734788725618, 1737691.997197905089706] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.3, "Latitud__e": 15.73221, "Longitud__": -87.481313 }, "geometry": { "type": "Point", "coordinates": [448435.016743971733376, 1739373.032171705272049] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.86, "Latitud__e": 15.601487, "Longitud__": -87.127275 }, "geometry": { "type": "Point", "coordinates": [486355.975482089503203, 1724858.975311356363818] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.17, "Latitud__e": 15.620891, "Longitud__": -87.250701 }, "geometry": { "type": "Point", "coordinates": [473127.040601654152852, 1727017.016348970355466] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.69, "Latitud__e": 15.583134, "Longitud__": -87.260664 }, "geometry": { "type": "Point", "coordinates": [472053.977545752073638, 1722841.946289643645287] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.0, "Latitud__e": 15.581742, "Longitud__": -87.260793 }, "geometry": { "type": "Point", "coordinates": [472039.9589961990132, 1722687.992446945281699] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.53, "Latitud__e": 15.655588, "Longitud__": -87.274191 }, "geometry": { "type": "Point", "coordinates": [470614.052689056843519, 1730858.020838337717578] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.71, "Latitud__e": 15.721007, "Longitud__": -87.360428 }, "geometry": { "type": "Point", "coordinates": [461383.967761479783803, 1738108.033937705913559] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.31, "Latitud__e": 15.726691, "Longitud__": -87.344673 }, "geometry": { "type": "Point", "coordinates": [463072.991570665733889, 1738733.945788804674521] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.7, "Latitud__e": 15.727091, "Longitud__": -87.337907 }, "geometry": { "type": "Point", "coordinates": [463797.954159293614794, 1738777.020725160837173] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.2, "Latitud__e": 15.716555, "Longitud__": -87.303272 }, "geometry": { "type": "Point", "coordinates": [467506.973712003964465, 1737605.975133253727108] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.86, "Latitud__e": 15.716424, "Longitud__": -87.306716 }, "geometry": { "type": "Point", "coordinates": [467137.954257463745307, 1737592.016917932778597] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.6, "Latitud__e": 15.758711, "Longitud__": -87.297089 }, "geometry": { "type": "Point", "coordinates": [468175.993012611637823, 1742268.037665052339435] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.7, "Latitud__e": 15.726472, "Longitud__": -87.338229 }, "geometry": { "type": "Point", "coordinates": [463763.346426446980331, 1738708.60627121431753] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.76, "Latitud__e": 15.728472, "Longitud__": -87.339197 }, "geometry": { "type": "Point", "coordinates": [463659.992315948707983, 1738929.999069291166961] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.79, "Latitud__e": 15.671471, "Longitud__": -86.979937 }, "geometry": { "type": "Point", "coordinates": [502150.0442931674188, 1732595.982463375898078] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.76, "Latitud__e": 15.630358, "Longitud__": -87.049736 }, "geometry": { "type": "Point", "coordinates": [494668.993736152653582, 1728048.959397123893723] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.34, "Latitud__e": 15.636126, "Longitud__": -87.050829 }, "geometry": { "type": "Point", "coordinates": [494551.991861144895665, 1728686.989798967726529] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.11, "Latitud__e": 15.604302, "Longitud__": -87.053899 }, "geometry": { "type": "Point", "coordinates": [494222.048140372266062, 1725166.998949463712052] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.7, "Latitud__e": 15.686686, "Longitud__": -87.092603 }, "geometry": { "type": "Point", "coordinates": [490076.963829632091802, 1734280.997659547021613] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.83, "Latitud__e": 15.686884, "Longitud__": -87.094096 }, "geometry": { "type": "Point", "coordinates": [489916.988409785612021, 1734302.969184874556959] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.7, "Latitud__e": 15.647441, "Longitud__": -87.065695 }, "geometry": { "type": "Point", "coordinates": [492958.994763448485173, 1729938.98818822321482] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.63, "Latitud__e": 15.588357, "Longitud__": -87.239459 }, "geometry": { "type": "Point", "coordinates": [474328.045353883877397, 1723417.002344393869862] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.63, "Latitud__e": 15.714793, "Longitud__": -87.339874 }, "geometry": { "type": "Point", "coordinates": [463585.028862064471468, 1737417.036831479053944] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.53, "Latitud__e": 15.725929, "Longitud__": -87.346352 }, "geometry": { "type": "Point", "coordinates": [462892.969653453619685, 1738649.952427647542208] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.7, "Latitud__e": 15.738092, "Longitud__": -87.350171 }, "geometry": { "type": "Point", "coordinates": [462486.03949848935008, 1739996.018081755377352] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.45, "Latitud__e": 15.724137, "Longitud__": -87.341934 }, "geometry": { "type": "Point", "coordinates": [463365.984099749010056, 1738450.962792227510363] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.26, "Latitud__e": 15.732437, "Longitud__": -87.480632 }, "geometry": { "type": "Point", "coordinates": [448508.033577038091607, 1739397.975716510321945] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.15, "Latitud__e": 15.734553, "Longitud__": -87.476278 }, "geometry": { "type": "Point", "coordinates": [448975.03132217307575, 1739630.980810318142176] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.36, "Latitud__e": 15.610311, "Longitud__": -86.648899 }, "geometry": { "type": "Point", "coordinates": [537636.993022416951135, 1725861.957371527794749] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.78, "Latitud__e": 15.609444, "Longitud__": -86.648938 }, "geometry": { "type": "Point", "coordinates": [537632.970409734756686, 1725766.049659862881526] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.1, "Latitud__e": 15.68711, "Longitud__": -86.967188 }, "geometry": { "type": "Point", "coordinates": [503516.018744514731225, 1734326.000901908380911] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.64, "Latitud__e": 15.609244, "Longitud__": -87.296043 }, "geometry": { "type": "Point", "coordinates": [468264.947735941153951, 1725734.965272103669122] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.13, "Latitud__e": 15.643179, "Longitud__": -87.194216 }, "geometry": { "type": "Point", "coordinates": [479184.014316014770884, 1729475.989294012077153] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.88, "Latitud__e": 15.714107, "Longitud__": -86.981669 }, "geometry": { "type": "Point", "coordinates": [501964.027014077058993, 1737311.989035908831283] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.67, "Latitud__e": 15.607377, "Longitud__": -87.049339 }, "geometry": { "type": "Point", "coordinates": [494710.957271119696088, 1725507.007631823187694] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.06, "Latitud__e": 15.570778, "Longitud__": -87.216747 }, "geometry": { "type": "Point", "coordinates": [476760.991651672462467, 1721469.969478689134121] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.33, "Latitud__e": 15.686509, "Longitud__": -86.945024 }, "geometry": { "type": "Point", "coordinates": [505891.052931819867808, 1734260.015484116505831] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.95, "Latitud__e": 15.770239, "Longitud__": -87.43127 }, "geometry": { "type": "Point", "coordinates": [453805.010589759680443, 1743568.016679409192875] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.12, "Latitud__e": 15.599549, "Longitud__": -87.324283 }, "geometry": { "type": "Point", "coordinates": [465236.032690623716917, 1724666.992204977897927] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.36, "Latitud__e": 15.694949, "Longitud__": -87.34545 }, "geometry": { "type": "Point", "coordinates": [462984.013452701503411, 1735222.99734992091544] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.5, "Latitud__e": 15.714954, "Longitud__": -87.340705 }, "geometry": { "type": "Point", "coordinates": [463496.021175467118155, 1737434.988783639622852] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.07, "Latitud__e": 15.723888, "Longitud__": -87.345126 }, "geometry": { "type": "Point", "coordinates": [463023.952123392315116, 1738423.975766209885478] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.45, "Latitud__e": 15.672107, "Longitud__": -87.365483 }, "geometry": { "type": "Point", "coordinates": [460833.03719176602317, 1732699.974810640560463] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.3, "Latitud__e": 15.572313, "Longitud__": -87.441888 }, "geometry": { "type": "Point", "coordinates": [452622.046229079773184, 1721677.00387406651862] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.05, "Latitud__e": 15.725744, "Longitud__": -87.349245 }, "geometry": { "type": "Point", "coordinates": [462582.985921978310216, 1738629.998901623534039] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.31, "Latitud__e": 15.614522, "Longitud__": -87.284212 }, "geometry": { "type": "Point", "coordinates": [469533.989174120011739, 1726317.045530345989391] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.72, "Latitud__e": 15.638741, "Longitud__": -87.291439 }, "geometry": { "type": "Point", "coordinates": [468762.958188208634965, 1728997.001669867429882] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.22, "Latitud__e": 15.7209597, "Longitud__": -87.337112 }, "geometry": { "type": "Point", "coordinates": [463882.04680729447864, 1738098.681676448322833] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.0, "Latitud__e": 15.7536784369, "Longitud__": -86.873835133699998 }, "geometry": { "type": "Point", "coordinates": [513514.999933615152258, 1741693.008211410138756] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.86, "Latitud__e": 15.6088965, "Longitud__": -87.2343598 }, "geometry": { "type": "Point", "coordinates": [474877.222602919966448, 1725688.292480844305828] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.37, "Latitud__e": 15.6858226, "Longitud__": -86.9712199 }, "geometry": { "type": "Point", "coordinates": [503083.993799248710275, 1734183.537199153797701] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.59, "Latitud__e": 15.679561, "Longitud__": -86.969364 }, "geometry": { "type": "Point", "coordinates": [503282.966894418350421, 1733490.96194821363315] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.4, "Latitud__e": 15.68543827, "Longitud__": -86.972470393400002 }, "geometry": { "type": "Point", "coordinates": [502949.99998562654946, 1734141.008181210840121] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.4, "Latitud__e": 15.68543827, "Longitud__": -86.972470393400002 }, "geometry": { "type": "Point", "coordinates": [502949.99998562654946, 1734141.008181210840121] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.65, "Latitud__e": 15.7447827, "Longitud__": -87.3702759 }, "geometry": { "type": "Point", "coordinates": [460333.465982954599895, 1740739.774703242117539] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.5, "Latitud__e": 15.7439971, "Longitud__": -87.3698043 }, "geometry": { "type": "Point", "coordinates": [460383.835471775091719, 1740652.787965116323903] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.43, "Latitud__e": 15.73284639, "Longitud__": -86.96502465 }, "geometry": { "type": "Point", "coordinates": [503746.999582120624837, 1739385.008051121141762] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.57, "Latitud__e": 15.718467807, "Longitud__": -86.945631941800002 }, "geometry": { "type": "Point", "coordinates": [505824.99997151712887, 1737795.00819591479376] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.8, "Latitud__e": 15.664298, "Longitud__": -87.213458 }, "geometry": { "type": "Point", "coordinates": [477124.005609933985397, 1731813.973275641445071] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.58, "Latitud__e": 15.628207, "Longitud__": -87.049045 }, "geometry": { "type": "Point", "coordinates": [494743.004455661517568, 1727811.018602270167321] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.1, "Latitud__e": 15.590392, "Longitud__": -87.238277 }, "geometry": { "type": "Point", "coordinates": [474455.017579676874448, 1723641.953917894745246] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.4, "Latitud__e": 15.728943, "Longitud__": -87.518127 }, "geometry": { "type": "Point", "coordinates": [444490.01088530512061, 1739020.978555365931243] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.9, "Latitud__e": 15.707155, "Longitud__": -86.982043 }, "geometry": { "type": "Point", "coordinates": [501924.021020240790676, 1736543.014592258026823] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.75, "Latitud__e": 15.665193, "Longitud__": -87.213888 }, "geometry": { "type": "Point", "coordinates": [477078.022714587394148, 1731913.017125746002421] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 0.45, "Latitud__e": 15.707251, "Longitud__": -86.817492 }, "geometry": { "type": "Point", "coordinates": [519555.024180562992115, 1736561.98331989813596] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 1.25, "Latitud__e": 15.572581, "Longitud__": -87.075464 }, "geometry": { "type": "Point", "coordinates": [491909.045682754076552, 1721659.030786022311077] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.3, "Latitud__e": 15.590878, "Longitud__": -87.285858 }, "geometry": { "type": "Point", "coordinates": [469354.035964396374766, 1723701.981775074265897] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.8, "Latitud__e": 15.659997, "Longitud__": -87.254136 }, "geometry": { "type": "Point", "coordinates": [472764.009129288955592, 1731343.034404484322295] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 3.6, "Latitud__e": 15.689735, "Longitud__": -86.940236 }, "geometry": { "type": "Point", "coordinates": [506404.01926000637468, 1734616.986435272265226] } },
        { "type": "Feature", "properties": { "FLOID": 42484.0, "Superficie": 2.25, "Latitud__e": 15.598245, "Longitud__": -87.121182 }, "geometry": { "type": "Point", "coordinates": [487008.948900369636249, 1724499.994953213026747] } }
    ]
};
