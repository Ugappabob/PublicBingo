import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './service-account.json';

// Initialize Firebase Admin with service account
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(email: string, isAdmin = true) {
  try {
    // Get the user by email
    const user = await getAuth().getUserByEmail(email);
    
    // Verify user exists and is email verified
    if (!user.emailVerified) {
      console.error('User email is not verified');
      return;
    }

    // Set admin claim
    await getAuth().setCustomUserClaims(user.uid, { admin: isAdmin });
    
    console.log(`Successfully ${isAdmin ? 'set' : 'removed'} admin claim for user: ${email}`);
    
    // Get the updated user to verify
    const updatedUser = await getAuth().getUser(user.uid);
    console.log('Updated user claims:', updatedUser.customClaims);
    
  } catch (error) {
    console.error('Error setting admin claim:', error);
  } finally {
    // Cleanup
    await app.delete();
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