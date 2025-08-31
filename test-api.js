import fetch from "node-fetch";

async function testAPI() {
  try {
    console.log("Testing API endpoint...");
    const response = await fetch(
      "http://localhost:3000/api/weather?lat=18.52&lon=73.85"
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Success! Response:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("Error response:", response.status, errorText);
    }
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

testAPI();
