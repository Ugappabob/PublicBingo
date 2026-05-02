const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(require('./service-account.json'))
});

const auth = admin.auth();
const db = admin.firestore();

async function setupAdmin() {
  const email = 'Steven@uncle-s.net';
  const password = 'Ugappabob007!';
  const displayName = 'Admin';

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    await auth.setCustomUserClaims(userRecord.uid, { admin: true });

    await db.collection('users').doc(userRecord.uid).set({
      email,
      name: displayName,
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Admin user created successfully:', userRecord.uid);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      const user = await auth.getUserByEmail(email);
      await auth.setCustomUserClaims(user.uid, { admin: true });
      console.log('Admin privileges updated for existing user:', user.uid);
    } else {
      console.error('Error creating admin:', error);
    }
  }
}

setupAdmin();