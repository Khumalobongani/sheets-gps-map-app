# 📍 GPS Tracker - Google Sheets to Map

A web application that pulls GPS coordinates and sensor data from Google Sheets and displays them on an interactive Google Map.

## Features

- 🗺️ **Interactive Google Map** with marker display
- 📊 **Real-time data** from Google Sheets
- 🎯 **Location sidebar** with clickable list
- 🔄 **Refresh functionality** to update data
- 📱 **Responsive design** for mobile and desktop
- 🛰️ **Satellite info** display on markers
- ⏰ **Timestamp tracking**

## Prerequisites

Before you start, you'll need:

1. **Google Cloud Project** with:
   - Google Sheets API enabled
   - Google Maps API enabled
   - Service Account with JSON credentials

2. **Google Sheets** formatted with columns:
   - `Latitude`
   - `Longitude`
   - `Timestamp`
   - `Satellite` (or other metadata)

3. **Node.js** (v14+) and npm

## Setup Instructions

### 1. Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Sheets API**:
   - Navigate to APIs & Services → Library
   - Search for "Google Sheets API"
   - Click Enable
4. Enable **Google Maps API**:
   - Search for "Maps JavaScript API"
   - Click Enable
5. Create a Service Account:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → Service Account
   - Fill in the details
   - Skip optional steps
   - Go to the service account → Keys tab
   - Add a new JSON key
   - Download and save as `credentials.json` in project root
6. Get your **Google Maps API Key**:
   - Go to Credentials
   - Create a new API Key
   - Restrict to Google Maps JavaScript API

### 2. Set Up Google Sheets

1. Create a new Google Sheet
2. Add column headers (row 1):
   - `Latitude`
   - `Longitude`
   - `Timestamp`
   - `Satellite`
3. Add your GPS data starting from row 2
4. Share the sheet with your service account email (found in `credentials.json`)
5. Copy the Spreadsheet ID from the URL (after `/d/`)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add:
   ```env
   GOOGLE_SHEETS_API_KEY=<path to credentials.json or JSON content>
   SPREADSHEET_ID=<your sheet id>
   SHEET_NAME=Sheet1
   GOOGLE_MAPS_API_KEY=<your maps api key>
   PORT=3000
   ```

3. Update `public/index.html`:
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual Google Maps API key

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm start
```

The app will start at `http://localhost:3000`

### For Development

Use nodemon for auto-restart on file changes:

```bash
npm run dev
```

## Project Structure

```
sheets-gps-map-app/
├── server.js              # Express backend
├── package.json           # Dependencies
├── .env.example           # Environment template
├── credentials.json       # Google Cloud service account (create this)
├── public/
│   ├── index.html         # Main page
│   ├── style.css          # Styling
│   ├── map.js             # Map functionality
└── README.md              # This file
```

## API Endpoints

### `GET /api/locations`

Fetches all GPS locations from Google Sheets.

**Response:**
```json
[
  {
    "id": 0,
    "latitude": 37.7749,
    "longitude": -122.4194,
    "timestamp": "2024-01-15 10:30:00",
    "satellite": "GPS"
  }
]
```

### `GET /api/health`

Health check endpoint.

## Usage

1. **View Locations**: Markers appear on the map automatically
2. **Click Markers**: Show info window with details
3. **Click Locations List**: Pan to location and show info
4. **Refresh Data**: Click "🔄 Refresh Data" to pull latest from Sheets
5. **Center Map**: Click "🎯 Center Map" to fit all markers

## Troubleshooting

### "Failed to fetch locations"
- Check that `credentials.json` is in the project root
- Verify the service account has access to the Sheet
- Check that `SPREADSHEET_ID` is correct

### No markers showing
- Verify Google Sheets has `Latitude` and `Longitude` columns
- Ensure data starts from row 2 (row 1 is headers)
- Check that latitude/longitude values are valid numbers

### Map not loading
- Verify `GOOGLE_MAPS_API_KEY` is correct in `public/index.html`
- Check that Google Maps API is enabled in Cloud Console
- Ensure API key restrictions allow Maps JavaScript API

### CORS Issues
- This shouldn't occur as the backend serves the frontend
- If issues persist, restart the server

## Google Sheets Data Format Example

| Latitude  | Longitude  | Timestamp           | Satellite |
|-----------|-----------|---------------------|----------|
| 37.7749   | -122.4194 | 2024-01-15 10:30:00 | GPS       |
| 37.7750   | -122.4195 | 2024-01-15 10:31:00 | GPS+GLONASS |
| 37.7751   | -122.4196 | 2024-01-15 10:32:00 | GPS       |

## Next Steps

- Integrate with your microcontroller to send data to Google Sheets
- Add real-time updates using WebSockets
- Implement data filtering by date range
- Add route visualization between points
- Export location data as KML or CSV

## License

MIT

## Support

For issues or questions, open an issue on GitHub or check the troubleshooting section above.
