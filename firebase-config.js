// Firebase Configuration
// Updated with correct keys from User
const firebaseConfig = {
    apiKey: "AIzaSyBYvRv94eoOAMNBqqrqjvXuB84DUQ-DWBs",
    authDomain: "soil-test-01.firebaseapp.com",
    projectId: "soil-test-01",
    storageBucket: "soil-test-01.firebasestorage.app",
    messagingSenderId: "131756873112",
    appId: "1:131756873112:web:38bef6fb13cba529c887ed",
    measurementId: "G-YBC4WZ05WB"
};

// Initialize Firebase with proper error handling
let app, auth, db, analytics;

try {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        // Initialize analytics if available
        if (typeof firebase.analytics !== 'undefined') {
            analytics = firebase.analytics();
        }
        
        // Enable offline persistence for Firestore
        try {
            db.enablePersistence();
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn("⚠️  Multiple tabs open, offline persistence disabled");
            } else if (err.code === 'unimplemented') {
                console.warn("⚠️  Browser doesn't support offline persistence");
            }
        }
        
        console.log("✅ Firebase Initialized successfully");
        console.log("📁 Project: soil-test-01");
        console.log("🔐 Auth Domain:", firebaseConfig.authDomain);
        
    } else if (firebase.apps && firebase.apps.length > 0) {
        // Already initialized
        app = firebase.app();
        auth = firebase.auth();
        db = firebase.firestore();
        analytics = firebase.analytics ? firebase.analytics() : null;
    }
} catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
    console.error("Stack:", error.stack);
    alert("Firebase failed to initialize. Check console for details.");
}

// Configure Auth state persistence
if (auth) {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(error => {
            console.warn("⚠️  Could not set persistence:", error.message);
        });
}

// Export for global access in our vanilla JS app
window.firebaseApp = app;
window.auth = auth;
window.db = db;
window.analytics = analytics;

// Global function to check auth status
window.checkAuthStatus = async function() {
    return new Promise((resolve) => {
        if (!auth) {
            console.error("❌ Auth not initialized");
            resolve(null);
            return;
        }
        
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("✅ User logged in:", user.email);
            } else {
                console.log("⚠️  No user logged in");
            }
            resolve(user);
        });
    });
};

// Global logout function
window.logoutUser = async function() {
    try {
        if (auth) {
            await auth.signOut();
            console.log("✅ User logged out successfully");
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error("❌ Logout error:", error.message);
    }
};
