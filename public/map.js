let map;
let markers = [];
let userMarker;

/**
 * Initialize MapLibre map
 */
function initMap() {
    const defaultCenter = [ -122.4194, 37.7749 ]; // San Francisco [lng, lat]

    map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: defaultCenter,
        zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
        console.log('Map initialized');
        loadLocations();
        requestCurrentLocation();
    });
}

/**
 * Fetch locations from backend API
 */
async function loadLocations() {
    try {
        const response = await fetch('/api/locations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const locations = await response.json();
        console.log(`Loaded ${locations.length} locations`);

        displayLocations(locations);
        updateUI(locations);
    } catch (error) {
        console.error('Error loading locations:', error);
        showError(`Failed to load locations: ${error.message}`);
    }
}

/**
 * Display locations on map
 */
function displayLocations(locations) {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    if (locations.length === 0) {
        showError('No valid locations found in Google Sheets');
        return;
    }

    // Create markers for each location
    locations.forEach((location, index) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'gps-marker';
        markerElement.style.backgroundColor = getMarkerColor(index);

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div class="info-window">
                <h3>Location ${index + 1}</h3>
                <p><strong>Latitude:</strong> ${location.latitude.toFixed(6)}</p>
                <p><strong>Longitude:</strong> ${location.longitude.toFixed(6)}</p>
                <p><strong>Timestamp:</strong> ${location.timestamp}</p>
                <p><strong>Satellite:</strong> ${location.satellite}</p>
            </div>
        `);

        const marker = new maplibregl.Marker({ element: markerElement })
            .setLngLat([location.longitude, location.latitude])
            .setPopup(popup)
            .addTo(map);

        markers.push(marker);
    });

    // Fit map bounds to all markers
    fitMapToBounds();
    hideError();
}

/**
 * Request and display current user location on map
 */
function requestCurrentLocation() {
    if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            const currentLngLat = [coords.longitude, coords.latitude];

            if (!userMarker) {
                const userElement = document.createElement('div');
                userElement.className = 'user-location-marker';

                userMarker = new maplibregl.Marker({ element: userElement })
                    .setLngLat(currentLngLat)
                    .setPopup(new maplibregl.Popup({ offset: 20 }).setText('Your current location'))
                    .addTo(map);
            } else {
                userMarker.setLngLat(currentLngLat);
            }
        },
        (error) => {
            console.warn('Unable to get current location:', error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
        }
    );
}

/**
 * Fit map view to show all markers
 */
function fitMapToBounds() {
    if (markers.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    markers.forEach(marker => {
        bounds.extend(marker.getLngLat());
    });

    map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
}

/**
 * Get marker color based on index
 */
function getMarkerColor(index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[index % colors.length];
}

/**
 * Update sidebar UI with location list
 */
function updateUI(locations) {
    const locationsList = document.getElementById('locations-ul');
    const locationCount = document.getElementById('location-count');
    const lastUpdated = document.getElementById('last-updated');

    locationsList.innerHTML = '';
    locationCount.textContent = locations.length;
    lastUpdated.textContent = new Date().toLocaleString();

    locations.forEach((location, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="location-item-lat">📍 Lat: ${location.latitude.toFixed(6)}</div>
            <div class="location-item-lng">Lng: ${location.longitude.toFixed(6)}</div>
            <div class="location-item-time">${location.timestamp}</div>
            <div class="location-item-time">Satellite: ${location.satellite}</div>
        `;

        li.addEventListener('click', () => {
            map.easeTo({
                center: [location.longitude, location.latitude],
                zoom: 15,
            });
            markers[index].togglePopup();
        });

        locationsList.appendChild(li);
    });
}

/**
 * Show error message
 */
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    const errorContainer = document.getElementById('error-container');
    errorContainer.style.display = 'none';
}

/**
 * Event Listeners
 */
document.getElementById('refresh-btn').addEventListener('click', () => {
    console.log('Refreshing data...');
    loadLocations();
    requestCurrentLocation();
});

document.getElementById('center-map-btn').addEventListener('click', () => {
    if (markers.length > 0) {
        fitMapToBounds();
    }
});

// Initialize map when page loads
window.addEventListener('load', initMap);

// Add custom info window styles
const style = document.createElement('style');
style.textContent = `
    .info-window {
        font-family: Arial, sans-serif;
        font-size: 12px;
        padding: 10px;
        background: white;
        border-radius: 5px;
    }
    .info-window h3 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 14px;
    }
    .info-window p {
        margin: 4px 0;
        color: #666;
    }
    .info-window strong {
        color: #667eea;
    }
`;
document.head.appendChild(style);
