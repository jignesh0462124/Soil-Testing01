#!/bin/bash
# Firebase Authentication Verification Script
# Run this to verify all components are properly configured

echo ""
echo "🔍 Firebase Authentication Verification"
echo "======================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Check function
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((FAIL++))
    fi
}

# 1. Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Node.js not installed${NC}"
    ((FAIL++))
fi
echo ""

# 2. Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ npm not installed${NC}"
    ((FAIL++))
fi
echo ""

# 3. Check node_modules
echo "📦 Checking Dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules directory exists${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  node_modules not found, run 'npm install'${NC}"
    ((FAIL++))
fi
echo ""

# 4. Check Firebase files
echo "🔐 Checking Firebase Files..."

FILES=(
    "firebase-config.js"
    "login.html"
    "index.html"
    "package.json"
    "firebase-auth-test.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ $file missing${NC}"
        ((FAIL++))
    fi
done
echo ""

# 5. Check Firebase config
echo "🔑 Checking Firebase Configuration..."
if grep -q "soil-test-01" firebase-config.js; then
    echo -e "${GREEN}✅ Firebase project ID configured${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Firebase project ID missing${NC}"
    ((FAIL++))
fi

if grep -q "firebaseApp\|auth\|db" firebase-config.js; then
    echo -e "${GREEN}✅ Firebase services configured${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Firebase services not configured${NC}"
    ((FAIL++))
fi
echo ""

# 6. Check Firebase CDN scripts
echo "🌐 Checking Firebase CDN Scripts..."
SCRIPTS=(
    "firebase-app-compat.js"
    "firebase-auth-compat.js"
    "firebase-firestore-compat.js"
)

for script in "${SCRIPTS[@]}"; do
    if grep -q "$script" login.html; then
        echo -e "${GREEN}✅ $script included in login.html${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ $script missing from login.html${NC}"
        ((FAIL++))
    fi
done
echo ""

# 7. Check authentication functions
echo "🔐 Checking Authentication Functions..."

if grep -q "handleLogin" login.html; then
    echo -e "${GREEN}✅ handleLogin function present${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ handleLogin function missing${NC}"
    ((FAIL++))
fi

if grep -q "handleSignup" login.html; then
    echo -e "${GREEN}✅ handleSignup function present${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ handleSignup function missing${NC}"
    ((FAIL++))
fi

if grep -q "handleGoogleLogin" login.html; then
    echo -e "${GREEN}✅ handleGoogleLogin function present${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ handleGoogleLogin function missing${NC}"
    ((FAIL++))
fi

if grep -q "handleLogout" index.html; then
    echo -e "${GREEN}✅ handleLogout function present${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ handleLogout function missing${NC}"
    ((FAIL++))
fi
echo ""

# 8. Check documentation
echo "📚 Checking Documentation..."

DOCS=(
    "FIREBASE_SETUP.md"
    "README_FIREBASE.md"
    ".env.example"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc present${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  $doc not found${NC}"
        ((FAIL++))
    fi
done
echo ""

# Summary
echo "======================================="
echo "📊 Verification Summary"
echo "======================================="
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo "======================================="
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Your Firebase setup is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm start"
    echo "2. Open: http://localhost:3000/login.html"
    echo "3. Test the authentication flows"
    exit 0
else
    echo -e "${YELLOW}⚠️  Please fix the failed checks above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Run 'npm install' to install dependencies"
    echo "2. Check Firebase configuration in firebase-config.js"
    echo "3. Verify all required files are present"
    exit 1
fi
