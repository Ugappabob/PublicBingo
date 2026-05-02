const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(require('./service-account.json'))
});

const auth = admin.auth();

async function checkAdminClaim(email) {
  try {
    // Get the user by email
    const user = await auth.getUserByEmail(email);
    
    console.log('User found:', user.uid);
    console.log('Email:', user.email);
    console.log('Display name:', user.displayName);
    console.log('Email verified:', user.emailVerified);
    console.log('Custom claims:', user.customClaims);
    
    if (user.customClaims && user.customClaims.admin) {
      console.log('✅ User has admin privileges');
    } else {
      console.log('❌ User does NOT have admin privileges');
    }
    
  } catch (error) {
    console.error('Error checking admin claim:', error);
  } finally {
    // Cleanup
    await admin.app().delete();
  }
}

// Check command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

// Execute
checkAdminClaim(email).catch(console.error); 