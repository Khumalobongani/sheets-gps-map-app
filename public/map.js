let map;
let markers = [];
let infoWindows = [];

/**
 * Initialize Google Map
 */
function initMap() {
    const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    console.log('Map initialized');
    loadLocations();
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
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    infoWindows.forEach(infoWindow => infoWindow.close());
    infoWindows = [];

    if (locations.length === 0) {
        showError('No valid locations found in Google Sheets');
        return;
    }

    // Create markers for each location
    locations.forEach((location, index) => {
        const marker = new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: map,
            title: `Location ${index + 1}`,
            icon: getMarkerIcon(index),
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="info-window">
                    <h3>Location ${index + 1}</h3>
                    <p><strong>Latitude:</strong> ${location.latitude.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> ${location.longitude.toFixed(6)}</p>
                    <p><strong>Timestamp:</strong> ${location.timestamp}</p>
                    <p><strong>Satellite:</strong> ${location.satellite}</p>
                </div>
            `,
        });

        marker.addListener('click', () => {
            // Close all other info windows
            infoWindows.forEach(iw => iw.close());
            infoWindow.open(map, marker);
        });

        markers.push(marker);
        infoWindows.push(infoWindow);
    });

    // Fit map bounds to all markers
    fitMapToBounds();
    hideError();
}

/**
 * Fit map view to show all markers
 */
function fitMapToBounds() {
    if (markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    markers.forEach(marker => {
        bounds.extend(marker.getPosition());
    });

    map.fitBounds(bounds);

    // Add padding to bounds
    const listener = map.addListener('idle', () => {
        map.fitBounds(bounds);
        google.maps.event.removeListener(listener);
    });
}

/**
 * Get marker icon color based on index
 */
function getMarkerIcon(index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    const color = colors[index % colors.length];

    return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
    };
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
            // Pan to marker and open info window
            map.setCenter(markers[index].getPosition());
            map.setZoom(15);
            markers[index].click();
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
