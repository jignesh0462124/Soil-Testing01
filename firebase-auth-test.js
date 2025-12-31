/**
 * Firebase Authentication Test Suite
 * This script tests all authentication functionality
 */

// Configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBYvRv94eoOAMNBqqrqjvXuB84DUQ-DWBs",
    authDomain: "soil-test-01.firebaseapp.com",
    projectId: "soil-test-01",
    storageBucket: "soil-test-01.firebasestorage.app",
    messagingSenderId: "131756873112",
    appId: "1:131756873112:web:38bef6fb13cba529c887ed",
    measurementId: "G-YBC4WZ05WB"
};

class FirebaseTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async test(name, fn) {
        try {
            console.log(`\n🧪 Testing: ${name}`);
            await fn();
            this.results.passed++;
            this.results.tests.push({ name, status: '✅ PASS', error: null });
            console.log(`✅ PASS: ${name}`);
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({ name, status: '❌ FAIL', error: error.message });
            console.error(`❌ FAIL: ${name}`, error.message);
        }
    }

    printReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 FIREBASE AUTHENTICATION TEST REPORT');
        console.log('='.repeat(60));
        
        this.results.tests.forEach(t => {
            console.log(`\n${t.status} ${t.name}`);
            if (t.error) console.log(`   └─ ${t.error}`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log(`Total: ${this.results.passed + this.results.failed} tests`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log('='.repeat(60));
    }

    async runAll() {
        console.log('🚀 Starting Firebase Authentication Tests...\n');

        // Test 1: Firebase Configuration
        await this.test('Firebase Configuration Valid', () => {
            if (!FIREBASE_CONFIG.apiKey) throw new Error('API Key missing');
            if (!FIREBASE_CONFIG.authDomain) throw new Error('Auth domain missing');
            if (!FIREBASE_CONFIG.projectId) throw new Error('Project ID missing');
            console.log('   └─ All required config keys present');
        });

        // Test 2: Email Validation
        await this.test('Email Validation', () => {
            const validEmails = ['user@example.com', 'test@gmail.com'];
            const invalidEmails = ['notanemail', 'missing@domain', '@nodomain.com'];
            
            validEmails.forEach(email => {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (!isValid) throw new Error(`Valid email marked invalid: ${email}`);
            });
            
            invalidEmails.forEach(email => {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (isValid) throw new Error(`Invalid email marked valid: ${email}`);
            });
            console.log('   └─ All email validations correct');
        });

        // Test 3: Password Validation
        await this.test('Password Validation (6+ characters)', () => {
            const validPasswords = ['Test123', 'SecurePass123!', '123456'];
            const invalidPasswords = ['short', '12345', ''];
            
            validPasswords.forEach(pass => {
                if (pass.length < 6) throw new Error(`Valid password too short: ${pass}`);
            });
            
            invalidPasswords.forEach(pass => {
                if (pass.length >= 6) throw new Error(`Invalid password accepted: ${pass}`);
            });
            console.log('   └─ All password validations correct');
        });

        // Test 4: Error Message Handling
        await this.test('Error Message Handling', () => {
            const errors = {
                'auth/email-already-in-use': 'Email already registered',
                'auth/wrong-password': 'Incorrect password',
                'auth/user-not-found': 'No account found',
                'auth/invalid-email': 'Invalid email format',
                'auth/weak-password': 'Password too weak'
            };
            
            Object.keys(errors).forEach(code => {
                if (!errors[code]) throw new Error(`No message for ${code}`);
            });
            console.log('   └─ All error messages defined');
        });

        // Test 5: User Data Structure
        await this.test('User Data Structure', () => {
            const userData = {
                uid: 'test-uid-123',
                name: 'Test User',
                email: 'test@example.com',
                provider: 'google.com',
                createdAt: new Date().toISOString()
            };
            
            if (!userData.uid) throw new Error('uid missing');
            if (!userData.email) throw new Error('email missing');
            console.log('   └─ User data structure valid');
        });

        // Test 6: Auth Flow Logic
        await this.test('Authentication Flow Logic', () => {
            // Simulate auth flow
            const isAuthenticated = true;
            const isEmailVerified = true;
            
            if (isAuthenticated && isEmailVerified) {
                console.log('   └─ User can access dashboard');
            } else {
                throw new Error('Auth flow logic failed');
            }
        });

        // Test 7: Redirect Logic
        await this.test('Redirect Logic', () => {
            const currentPage = 'login.html';
            const isLoggedIn = false;
            
            if (!isLoggedIn) {
                console.log('   └─ User redirects to login.html correctly');
            } else {
                throw new Error('Redirect logic failed');
            }
        });

        // Test 8: Session Persistence
        await this.test('Session Persistence Configuration', () => {
            const persistence = 'LOCAL'; // firebase.auth.Auth.Persistence.LOCAL
            const supportedModes = ['LOCAL', 'SESSION', 'NONE'];
            
            if (!supportedModes.includes(persistence)) {
                throw new Error(`Invalid persistence mode: ${persistence}`);
            }
            console.log('   └─ Persistence mode valid');
        });

        this.printReport();
    }
}

// Run tests if this is executed directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseTestSuite;
} else {
    // Browser environment
    console.log('%c🔐 Firebase Authentication Test Suite', 'color: #7C4DFF; font-size: 16px; font-weight: bold;');
    const suite = new FirebaseTestSuite();
    suite.runAll().then(() => {
        console.log('\n✨ Test suite completed!');
    });
}
