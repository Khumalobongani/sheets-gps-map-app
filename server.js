require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));
app.use(express.json());

// Initialize Google Sheets API
const sheets = google.sheets('v4');

// Authenticate with Google Cloud
const auth = new google.auth.GoogleAuth({
  keyFilename: path.join(__dirname, 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = process.env.SHEET_NAME || 'Sheet1';

/**
 * API Endpoint: Get locations from Google Sheets
 */
app.get('/api/locations', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`, // Adjust range as needed
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    // Parse header row
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const latIndex = headers.indexOf('latitude');
    const lngIndex = headers.indexOf('longitude');
    const timeIndex = headers.indexOf('timestamp');
    const satelliteIndex = headers.indexOf('satellite');

    if (latIndex === -1 || lngIndex === -1) {
      return res.status(400).json({
        error: 'Google Sheets must have "Latitude" and "Longitude" columns',
      });
    }

    // Parse data rows
    const locations = rows.slice(1).map((row, idx) => {
      const lat = parseFloat(row[latIndex]);
      const lng = parseFloat(row[lngIndex]);
      const timestamp = row[timeIndex] || 'N/A';
      const satellite = row[satelliteIndex] || 'N/A';

      return {
        id: idx,
        latitude: lat,
        longitude: lng,
        timestamp,
        satellite,
      };
    }).filter(loc => !isNaN(loc.latitude) && !isNaN(loc.longitude));

    res.json(locations);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to fetch locations',
      details: error.message,
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Serve main page
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 Spreadsheet ID: ${spreadsheetId}`);
  console.log(`📄 Sheet Name: ${sheetName}`);
});
