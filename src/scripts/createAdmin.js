import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***' // Hide API key in logs
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdminUser() {
  const email = process.env.REACT_APP_ADMIN_EMAIL;
  const password = process.env.REACT_APP_ADMIN_PASSWORD;
  const name = process.env.REACT_APP_ADMIN_NAME;

  if (!email || !password || !name) {
    console.error('Missing required environment variables:');
    console.error('REACT_APP_ADMIN_EMAIL:', email ? '✓' : '✗');
    console.error('REACT_APP_ADMIN_PASSWORD:', password ? '✓' : '✗');
    console.error('REACT_APP_ADMIN_NAME:', name ? '✓' : '✗');
    process.exit(1);
  }

  console.log('Setting up admin user with email:', email);

  try {
    let userCredential;
    
    try {
      // First try to sign in
      console.log('Attempting to sign in...');
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Successfully signed in existing admin user');
    } catch (signInError) {
      console.log('Sign in failed:', signInError.code);
      
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-login-credentials') {
        // If user doesn't exist or credentials are invalid, try to create new user
        console.log('Attempting to create new admin user...');
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log('Successfully created new admin user');
        } catch (createError) {
          if (createError.code === 'auth/email-already-in-use') {
            console.error('Error: Email exists but password is incorrect. Please check your password in .env file');
            process.exit(1);
          }
          throw createError;
        }
      } else {
        throw signInError;
      }
    }

    // Update or create the admin user document
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      email,
      name,
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('Successfully set admin role for user');
    console.log('Admin setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error during admin setup:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 'auth/invalid-api-key') {
      console.error('\nPlease check your Firebase configuration in .env file');
    } else if (error.code === 'auth/wrong-password') {
      console.error('\nIncorrect password. Please check REACT_APP_ADMIN_PASSWORD in .env');
    } else if (error.code === 'auth/weak-password') {
      console.error('\nPassword is too weak. It should be at least 6 characters long');
    }
    
    process.exit(1);
  }
}

setupAdminUser(); 