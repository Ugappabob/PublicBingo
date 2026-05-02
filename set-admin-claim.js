const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(require('./service-account.json'))
});

const auth = admin.auth();

async function setAdminClaim(email, isAdmin = true) {
  try {
    // Get the user by email
    const user = await auth.getUserByEmail(email);
    
    console.log('User found:', user.uid);
    console.log('Email:', user.email);
    console.log('Display name:', user.displayName);
    console.log('Current custom claims:', user.customClaims);
    
    // Set admin claim
    await auth.setCustomUserClaims(user.uid, { admin: isAdmin });
    
    // Get the updated user to verify
    const updatedUser = await auth.getUser(user.uid);
    console.log('Updated custom claims:', updatedUser.customClaims);
    
    if (updatedUser.customClaims && updatedUser.customClaims.admin) {
      console.log('✅ Admin privileges successfully set');
    } else {
      console.log('❌ Failed to set admin privileges');
    }
    
  } catch (error) {
    console.error('Error setting admin claim:', error);
  } finally {
    // Cleanup
    await admin.app().delete();
  }
}

// Check command line arguments
const email = process.argv[2];
const setAdmin = process.argv[3] !== 'false';

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

// Execute
setAdminClaim(email, setAdmin).catch(console.error); 