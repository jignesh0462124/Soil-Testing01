// backend (Node.js)
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = 3000;

// Enhanced CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static("."));

// Your SoilHive credentials
const CLIENT_ID = "01986bc2a43d77f3a2cbd580b03b4a3e";
const CLIENT_SECRET = "qGDLpz6PXJ4tClUN7dz52NCmgmb4c7X2";

// Function to get access token
async function getAccessToken() {
  try {
    const tokenUrl = "https://auth.soilhive.ag/oauth/token";

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

// Enhanced soil data endpoint with detailed prompts and data descriptions
app.get("/api/test-token", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 18.52;
    const lon = parseFloat(req.query.lon) || 73.85;

    // Enhanced logging with detailed prompts
    console.log(`🌍 SOIL DATA FETCH REQUEST INITIATED`);
    console.log(`📍 Target Location: ${lat}°N, ${lon}°E`);
    console.log(`🔄 Data Type: Comprehensive Soil Properties Database`);
    console.log(`📊 Expected Data Categories:`);
    console.log(`   • Chemical Properties (pH, nutrients, minerals)`);
    console.log(`   • Physical Properties (texture, density, moisture)`);
    console.log(`   • Biological Properties (organic matter, microorganisms)`);
    console.log(`   • Derived Properties (calculated soil metrics)`);
    console.log(`🌐 API Source: SoilHive Global Soil Database`);
    console.log(`⏰ Request Time: ${new Date().toISOString()}`);
    console.log(`─────────────────────────────────────────────────────────`);

    // Get fresh access token with detailed logging
    console.log(`🔐 AUTHENTICATION PHASE`);
    console.log(`📝 Requesting OAuth2 access token...`);
    const accessToken = await getAccessToken();
    console.log(`✅ Authentication successful - Token obtained`);
    console.log(`🔑 Token Type: Bearer (OAuth 2.0)`);
    console.log(`🎯 Scope: soilhive-api-services`);

    // Detailed API request logging
    console.log(`🚀 SOIL PROPERTIES API REQUEST`);
    console.log(`🌐 Endpoint: https://api.soilhive.ag/v1/soil-properties`);
    console.log(`📋 Method: GET`);
    console.log(`🔧 Headers: Authorization Bearer + Content-Type JSON`);
    console.log(`📡 Requesting comprehensive soil property catalog...`);

    // Get soil properties
    const propertiesResponse = await fetch(
      "https://api.soilhive.ag/v1/soil-properties",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`⏳ Awaiting API response...`);

    if (!propertiesResponse.ok) {
      console.log(`❌ API REQUEST FAILED`);
      console.log(`🚨 HTTP Status: ${propertiesResponse.status}`);
      console.log(`📝 Status Text: ${propertiesResponse.statusText}`);
      throw new Error(`HTTP error! status: ${propertiesResponse.status}`);
    }

    console.log(`✅ API RESPONSE RECEIVED`);
    console.log(
      `📦 Response Status: ${propertiesResponse.status} ${propertiesResponse.statusText}`
    );
    console.log(`🔍 Processing response data...`);

    const properties = await propertiesResponse.json();

    console.log(`📊 DATA ANALYSIS INITIATED`);
    console.log(`🧪 Raw API Response Structure:`, {
      context: properties["@context"]?.length || 0,
      id: properties["@id"] || "Unknown",
      type: properties.type || "Unknown",
      description: properties.description || "No description",
    });

    // Handle different API response formats with detailed analysis
    let propertiesArray = [];
    if (Array.isArray(properties)) {
      propertiesArray = properties;
    } else if (
      properties &&
      properties.items &&
      Array.isArray(properties.items)
    ) {
      propertiesArray = properties.items;
      console.log(`📋 Data Format: ItemList with items array`);
    } else if (
      properties &&
      properties.data &&
      Array.isArray(properties.data)
    ) {
      propertiesArray = properties.data;
      console.log(`📋 Data Format: Object with data array`);
    } else if (properties && typeof properties === "object") {
      // If it's an object with properties, convert to array format
      propertiesArray = Object.keys(properties).map((key) => ({
        name: key,
        ...properties[key],
        type: properties[key].type || "Property",
      }));
      console.log(`📋 Data Format: Object converted to array`);
    }

    // Detailed data analysis and categorization
    console.log(`🎯 DATA PROCESSING COMPLETE`);
    console.log(`📊 Total Properties Retrieved: ${propertiesArray.length}`);

    // Categorize properties
    const categorization = {
      ChemicalProperty: [],
      PhysicalProperty: [],
      BiologicalProperty: [],
      DerivedProperty: [],
      Other: [],
    };

    propertiesArray.forEach((prop) => {
      const category = prop.type || "Other";
      if (categorization[category]) {
        categorization[category].push(prop);
      } else {
        categorization.Other.push(prop);
      }
    });

    console.log(`📈 SOIL DATA CATEGORIZATION:`);
    console.log(
      `🧪 Chemical Properties: ${categorization.ChemicalProperty.length} (pH, minerals, nutrients)`
    );
    console.log(
      `🏗️  Physical Properties: ${categorization.PhysicalProperty.length} (texture, density, structure)`
    );
    console.log(
      `🌱 Biological Properties: ${categorization.BiologicalProperty.length} (organic matter, microbes)`
    );
    console.log(
      `📊 Derived Properties: ${categorization.DerivedProperty.length} (calculated metrics)`
    );
    console.log(`📋 Other Properties: ${categorization.Other.length}`);

    // Analyze property details
    const withDescriptions = propertiesArray.filter(
      (p) => p.description && p.description.length > 0
    );
    const withUnits = propertiesArray.filter((p) => p.unitText || p.unit);
    const withIdentifiers = propertiesArray.filter((p) => p.identifier);

    console.log(`📝 PROPERTY DETAILS ANALYSIS:`);
    console.log(
      `📖 Properties with descriptions: ${withDescriptions.length}/${propertiesArray.length}`
    );
    console.log(
      `📏 Properties with units: ${withUnits.length}/${propertiesArray.length}`
    );
    console.log(
      `🔢 Properties with identifiers: ${withIdentifiers.length}/${propertiesArray.length}`
    );

    // Sample property details
    if (propertiesArray.length > 0) {
      const sampleProp = propertiesArray[0];
      console.log(`🔬 SAMPLE PROPERTY DETAILS:`);
      console.log(`   Name: ${sampleProp.name || "Unknown"}`);
      console.log(`   Type: ${sampleProp.type || "Unknown"}`);
      console.log(`   ID: ${sampleProp.identifier || "N/A"}`);
      console.log(`   Units: ${sampleProp.unitText || "N/A"}`);
      console.log(
        `   Description: ${
          sampleProp.description
            ? sampleProp.description.substring(0, 100) + "..."
            : "N/A"
        }`
      );
    }

    console.log(`✅ DATA FETCH OPERATION COMPLETED SUCCESSFULLY`);
    console.log(`📤 Preparing response payload...`);

    res.json({
      success: true,
      location: { lat, lon },
      timestamp: new Date().toISOString(),
      properties: {
        items: propertiesArray,
      },
      stats: {
        total: propertiesArray.length,
        withDescriptions: propertiesArray.filter((p) => p.description).length,
        withUnits: propertiesArray.filter((p) => p.unit || p.unitText).length,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "SoilHive API server is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 SoilHive API Server Started!");
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Dashboard: http://localhost:${PORT}/index.html`);
  console.log(`🧪 API Test: http://localhost:${PORT}/api/test-token`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log("=".repeat(50));
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});
