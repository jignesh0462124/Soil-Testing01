import fetch from "node-fetch";

async function testSoilProperties() {
  try {
    console.log("Testing soil properties endpoint...");
    const response = await fetch("http://localhost:3000/api/soil-properties");

    if (response.ok) {
      const data = await response.json();
      console.log("Success! Soil Properties:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("Error response:", response.status, errorText);
    }
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

testSoilProperties();
