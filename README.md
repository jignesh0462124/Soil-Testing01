# SoilHive Dashboard

A professional-grade soil data dashboard powered by the SoilHive API, featuring real-time soil property analysis, OAuth2 authentication, and a modern glassmorphism UI.

## Features

- 🌍 Location-based soil property search (lat/lon)
- 🧪 83+ soil properties: chemical, physical, biological, derived
- 📊 Professional dashboard UI (glassmorphism, Inter fonts, responsive)
- 🔐 OAuth 2.0 authentication (SoilHive API)
- 📝 Comprehensive logging and data quality metrics
- 🧪 Mock mode for offline/local development
- 🔄 Real-time search/filter for properties

## Getting Started

### 1. Install dependencies

```powershell
npm install
```

### 2. Run the server

#### Production (real SoilHive API, requires valid credentials):

```powershell
npm start
```

#### Mock mode (no external API calls, for local/offline testing):

```powershell
npm run start:mock
```

### 3. Open the dashboard

Open your browser to:

```
http://localhost:3000/index.html
```

### 4. Test API endpoints

- Soil properties (real or mock):
  - `http://localhost:3000/api/test-token?lat=18.52&lon=73.85`
- Weather alias (returns same soil data):
  - `http://localhost:3000/api/weather?lat=18.52&lon=73.85`
- Health check:
  - `http://localhost:3000/api/health`

### 5. Run API test script

```powershell
node test-api.js
```

## Project Structure

- `index.html` — Main dashboard UI
- `javascript.js` — Node.js Express backend (API proxy, OAuth, mock mode)
- `test-api.js` — Script to test API endpoints
- `india_district_coordinates.json` — (Optional) Location data
- `package.json` — Project config and scripts

## Customization

- To use real SoilHive API, ensure valid credentials in `javascript.js`.
- To develop offline, use `npm run start:mock` (returns 4 sample properties).

## License

MIT

---

**Made with ❤️ for soil data analysis.**
