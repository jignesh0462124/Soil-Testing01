# SoilHive Dashboard 

The **SoilHive Dashboard** is a comprehensive web interface for visualizing soil data, analyzing nutrient levels, and generating actionable recommendations. It features a modern **Solid Dark Theme** UI, interactive maps, and modular data processing.

## 🚀 Features

-   **Interactive Soil Map**: Visualizes soil health data using Leaflet.js with custom markers for pH (color) and Nitrogen (size).
-   **Solid Dark Theme**: A high-contrast, professional UI designed for data visibility.
-   **Soil Analysis Panel**: Detailed breakdown of soil properties (pH, Nitrogen, Phosphorus, Potassium, Soil Type).
-   **Smart Recommendations**: Automated rule-based advice to improve soil health (e.g., "Add Lime for Acidic Soil").
-   **Firebase Authentication**: Secure Google and Email/Password login flows.
-   **Responsive Design**: optimized for both desktop and mobile devices.

## 🛠️ Technology Stack

-   **Frontend**: HTML5, CSS3 (Custom Variables), JavaScript (Vanilla)
-   **Mapping**: Leaflet.js, OpenStreetMap / CartoDB Tiles
-   **Backend**: Node.js, Express (serves static files & API proxy)
-   **Database/Auth**: Firebase (Firestore, Authentication)
-   **Data Processing**: Modular JS architecture (`DataValidator`, `DataNormalizer`)

## 📋 Prerequisites

Ensure you have **Node.js** installed on your system.
-   [Download Node.js](https://nodejs.org/)

## 📦 Installation

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd Soil-Testing01
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configuration**:
    -   Ensure `firebase-config.js` is present in the root directory with your Firebase project credentials.
    -   (Optional) If connecting to the real SoilHive API, configure credentials in `javascript.js`.

## ▶️ Usage

1.  **Start the Server**:
    ```bash
    npm start
    ```
    This runs the local Node.js server.

2.  **Access the Dashboard**:
    -   Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)
    -   You will be redirected to the **Landing Page**.

3.  **Application Flow**:
    -   **Landing**: Click "Start Analyzing" or "Login".
    -   **Login**: Sign in with Google or create an account.
    -   **Map**: View the dashboard.
        -   **Navigate**: Pan and zoom around the map.
        -   **Inspect**: Click on any map marker to open the **Soil Details Panel**.
        -   **Filter**: Use the sidebar/bottom-sheet to filter by pH or Soil Type.

## 📂 Project Structure

```
├── index.html          # Main Dashboard & Map Interface
├── landing.html        # Landing Page
├── login.html          # Authentication Page
├── style.css           # Global Styles (Solid Dark Theme)
├── soil-map.js         # Core Map Logic (MapManager, Renderer, DataFetch)
├── firebase-config.js  # Firebase Credentials
├── javascript.js       # Node.js Server Entry Point
├── package.json        # Project Dependencies & Scripts
└── README.md           # Project Documentation
```

## 🧪 Mock Data
By default, the application uses **client-side mock data** for demonstration purposes if the backend API endpoint `/api/soil/batch` is unavailable. This ensures the map is populated immediately for testing.

---
*Built for SoilHive Intelligence*
