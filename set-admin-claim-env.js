require('dotenv').config();
const admin = require('firebase-admin');

// Log environment variables for debugging
console.log('Checking environment variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Present' : 'Missing');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Present' : 'Missing');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Present' : 'Missing');

// Format private key
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Remove any extra quotes around the key
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  // Debug private key format
  console.log('\nPrivate key format check:');
  console.log('Starts with -----BEGIN PRIVATE KEY-----:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
  console.log('Ends with -----END PRIVATE KEY-----:', privateKey.endsWith('-----END PRIVATE KEY-----'));
  console.log('Contains newlines:', privateKey.includes('\n'));
}

// Initialize Firebase Admin SDK
let app;
try {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    })
  });
  console.log('\nFirebase Admin SDK initialized successfully');
} catch (error) {
  console.error('\nError initializing Firebase Admin SDK:', error);
  process.exit(1);
}

async function setAdminClaim(email, isAdmin = true) {
  try {
    console.log(`\nSetting admin claim for email: ${email} to ${isAdmin}`);
    
    // Get the user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log('User found:', user.uid);
    console.log('Email verified:', user.emailVerified);
    
    // Set admin claim regardless of email verification
    await admin.auth().setCustomUserClaims(user.uid, { admin: isAdmin });
    console.log(`Successfully ${isAdmin ? 'set' : 'removed'} admin claim`);
    
    // Verify the change
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Updated custom claims:', updatedUser.customClaims);
    console.log('Is admin?', updatedUser.customClaims?.admin === true);
    
    // Bypass email verification - removed the code that sends verification email
    
    return updatedUser;
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw error;
  } finally {
    if (app) {
      await app.delete();
    }
  }
}

// Check command line arguments
const email = process.argv[2];
const setAdmin = process.argv[3] !== 'false'; // Optional second argument to remove admin (default: true)

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node set-admin-claim-env.js <email> [true|false]');
  process.exit(1);
}

// Execute
setAdminClaim(email, setAdmin).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 