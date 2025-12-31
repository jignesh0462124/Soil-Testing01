/**
 * SOIL API ENDPOINT SPECIFICATION
 * Implementation guide for Node.js/Express backend
 */

/**
 * Endpoint: POST /api/soil/batch
 * Description: Fetch soil testing data for a geographic region (bounds)
 * 
 * This endpoint is called by the frontend map when user pans or zooms.
 * The SoilDataManager sends map bounds and expects normalized soil data back.
 */

// ============================================================================
// REQUEST FORMAT
// ============================================================================

/*
POST /api/soil/batch
Content-Type: application/json

{
  "north": 21.18,     // Top boundary latitude
  "south": 21.12,     // Bottom boundary latitude
  "east": 79.12,      // Right boundary longitude
  "west": 79.06       // Left boundary longitude
}
*/

// ============================================================================
// RESPONSE FORMAT
// ============================================================================

/*
HTTP 200 OK
Content-Type: application/json

{
  "features": [
    {
      "lat": 21.15,
      "lng": 79.09,
      "pH": 6.8,
      "soil_type": "loam",
      "nitrogen": 65,
      "phosphorus": 55,
      "potassium": 60,
      "timestamp": "2025-12-31T10:00:00Z"  // Optional but recommended
    },
    {
      "lat": 21.16,
      "lng": 79.08,
      "pH": 7.2,
      "soil_type": "clay",
      "nitrogen": 45,
      "phosphorus": 35,
      "potassium": 40,
      "timestamp": "2025-12-31T10:01:00Z"
    }
  ]
}
*/

// ============================================================================
// IMPLEMENTATION EXAMPLE (Express.js)
// ============================================================================

/*
// Add this to your existing javascript.js (Node.js backend)

app.post('/api/soil/batch', async (req, res) => {
  try {
    const { north, south, east, west } = req.body;

    // Validate bounds
    if (!north || !south || !east || !west) {
      return res.status(400).json({
        error: 'Missing bounds: north, south, east, west required'
      });
    }

    // TODO: Replace with actual database query
    // Example: Query your soil testing database for points within bounds
    // SELECT * FROM soil_data WHERE latitude BETWEEN south AND north
    //   AND longitude BETWEEN west AND east

    // For now, return mock data
    const soilData = [
      {
        lat: (north + south) / 2 + 0.01,
        lng: (east + west) / 2 - 0.01,
        pH: 6.8,
        soil_type: 'loam',
        nitrogen: 65,
        phosphorus: 55,
        potassium: 60,
      },
      {
        lat: (north + south) / 2 - 0.01,
        lng: (east + west) / 2 + 0.01,
        pH: 7.2,
        soil_type: 'clay',
        nitrogen: 45,
        phosphorus: 35,
        potassium: 40,
      },
    ];

    res.json({
      success: true,
      bounds: { north, south, east, west },
      features: soilData,
      count: soilData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching soil data:', error);
    res.status(500).json({
      error: 'Failed to fetch soil data',
      message: error.message,
    });
  }
});
*/

// ============================================================================
// RESPONSE CODE HANDLING
// ============================================================================

/*
200 OK
- Data successfully retrieved

400 Bad Request
- Missing or invalid bounds
- Example: { "error": "Missing bounds" }

401 Unauthorized
- User not authenticated
- Example: { "error": "Authentication required" }

403 Forbidden
- User not authorized to access this area
- Example: { "error": "Access denied" }

404 Not Found
- No data available for requested bounds
- Example: { "features": [] }

500 Internal Server Error
- Database error or server issue
- Example: { "error": "Database connection failed" }
*/

// ============================================================================
// DATA QUALITY REQUIREMENTS
// ============================================================================

/*
For optimal visualization, ensure:

1. LATITUDE/LONGITUDE
   - Latitude: -90 to +90 (decimal degrees)
   - Longitude: -180 to +180 (decimal degrees)
   - Precision: At least 4 decimal places (~10m)

2. pH VALUE
   - Range: 0 to 14
   - Precision: 0.1 decimal places
   - Invalid values will be clamped to valid range

3. NPK (NITROGEN, PHOSPHORUS, POTASSIUM)
   - Raw values or 0-100 scale (both supported)
   - Will be normalized to 0-100 scale
   - Invalid values treated as 0

4. SOIL TYPE
   - Recommended values: 'clay', 'sandy', 'loam'
   - Can be extended with new types
   - Falls back to 'unknown' if not provided

5. TIMESTAMP (Optional)
   - ISO 8601 format: "2025-12-31T10:00:00Z"
   - Used for tracking data age
   - Defaults to current time if not provided

6. MISSING DATA HANDLING
   - Return empty array for no results: { "features": [] }
   - NULL values will be skipped during rendering
   - Use DataValidator to clean dirty data
*/

// ============================================================================
// PERFORMANCE CONSIDERATIONS
// ============================================================================

/*
CACHING
- Leaflet map caches results by bounds
- Change tolerance: ~1km
- Small map movements won't trigger new API calls

DEBOUNCING
- Frontend debounces API calls by 400ms
- Multiple rapid zoom/pan actions = 1 API call
- Reduces server load

BATCH SIZE
- Each API call returns ALL points in bounds
- Typical bounds: ~10-30 points per view
- Scale tested up to 500+ points without issues

PAGINATION
- Not implemented (handled by spatial bounds)
- If needed, implement with offset/limit

DATABASE OPTIMIZATION
- Create spatial index on (latitude, longitude)
- Example (PostgreSQL): CREATE INDEX idx_soil_geom ON soil_data USING GIST(ST_GeomFromText(...));
- Consider GiST or BRIN indexes for large datasets
*/

// ============================================================================
// TESTING ENDPOINTS
// ============================================================================

/*
CURL EXAMPLES

1. Test with bounds around Nagpur, India
curl -X POST http://localhost:3000/api/soil/batch \
  -H "Content-Type: application/json" \
  -d '{
    "north": 21.18,
    "south": 21.12,
    "east": 79.12,
    "west": 79.06
  }'

2. Test with wider bounds
curl -X POST http://localhost:3000/api/soil/batch \
  -H "Content-Type: application/json" \
  -d '{
    "north": 22,
    "south": 20,
    "east": 80,
    "west": 78
  }'

3. Test empty bounds (should return no results)
curl -X POST http://localhost:3000/api/soil/batch \
  -H "Content-Type: application/json" \
  -d '{
    "north": 90,
    "south": 89,
    "east": 180,
    "west": 179
  }'
*/

// ============================================================================
// DATABASE SCHEMA EXAMPLE (PostgreSQL)
// ============================================================================

/*
CREATE TABLE soil_data (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  pH DECIMAL(3, 2) NOT NULL,
  soil_type VARCHAR(50),
  nitrogen DECIMAL(5, 2),
  phosphorus DECIMAL(5, 2),
  potassium DECIMAL(5, 2),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_ph CHECK (pH >= 0 AND pH <= 14),
  CONSTRAINT valid_lat CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_lon CHECK (longitude >= -180 AND longitude <= 180)
);

CREATE INDEX idx_soil_bounds ON soil_data(latitude, longitude);
CREATE INDEX idx_soil_timestamp ON soil_data(timestamp DESC);
*/

// ============================================================================
// INTEGRATION WITH FRONTEND
// ============================================================================

/*
The frontend automatically:

1. Calls /api/soil/batch on map load and interaction
2. Validates all returned data using DataValidator
3. Normalizes values using DataNormalizer
4. Converts to GeoJSON format
5. Renders with SoilMarkerRenderer
6. Applies user-selected filters

No additional frontend code needed after implementing the endpoint!

Flow:
MapManager.onMapInteraction()
  → SoilDataManager.fetch()
    → POST /api/soil/batch (your endpoint)
      → DataValidator validates response
        → DataNormalizer converts to GeoJSON
          → SoilMarkerRenderer renders markers
*/

// ============================================================================
// MIGRATION FROM TEST-API.JS
// ============================================================================

/*
If using existing test-api.js endpoint, adapt response format:

BEFORE (test-api.js):
{
  "success": true,
  "location": { "lat": 18.52, "lon": 73.85 },
  "properties": { ... }
}

AFTER (soil/batch):
{
  "features": [
    {
      "lat": 21.15,
      "lng": 79.09,
      "pH": 6.8,
      "soil_type": "loam",
      "nitrogen": 65,
      "phosphorus": 55,
      "potassium": 60
    }
  ]
}

The frontend expects the new format for automatic visualization!
*/

// ============================================================================
// ERROR HANDLING
// ============================================================================

/*
FRONTEND ERROR RECOVERY:

1. Network Error
   - Logs error to console
   - Returns empty array
   - Map shows existing markers (doesn't clear)
   - User can retry by panning

2. Validation Error
   - Invalid data is filtered out
   - DataValidator.validateSoilData() checks each point
   - Valid points still render

3. Empty Response
   - Handled gracefully
   - Message: "📭 No soil data in cache"
   - Map remains interactive

Best Practice:
- Always return { "features": [] } for no results
- Include error message in HTTP status code
- Log errors on server for debugging
*/

export default {
  // Export for API documentation
  endpoint: '/api/soil/batch',
  method: 'POST',
  description: 'Fetch soil data for geographic bounds',
};
