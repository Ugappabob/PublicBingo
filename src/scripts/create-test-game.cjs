require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

console.log('Starting test game creation script...');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Missing Firebase env vars. Create a .env file (see .env.example) with REACT_APP_FIREBASE_* set before running this script.'
  );
  process.exit(1);
}

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
console.log('Firebase initialized - new script');

console.log('Getting Firestore instance...');
const db = getFirestore(app);
console.log('Firestore instance ready - new script');

async function createTestGame() {
  try {
    console.log('Creating test game - new script...');
    const testPhrases = [
      "Someone yawns",
      "Technical difficulties",
      "Can you hear me?",
      "Kid or pet interruption",
      "You're on mute"
    ];

    console.log('Getting games collection reference...');
    const gamesRef = collection(db, 'games');
    const newGameRef = doc(gamesRef);
    console.log('New game document reference created');

    const gameData = {
      id: newGameRef.id,
      phrases: testPhrases,
      boardSize: 5,
      winningPatterns: {
        singleLine: true,
        multipleLines: false,
        fullBoard: false,
        customPatterns: {
          L: true,
          X: false,
          corners: true
        }
      },
      createdBy: 'test-user-123',
      createdAt: Timestamp.now(),
      status: 'active'
    };

    console.log('Setting game data...');
    await setDoc(newGameRef, gameData);
    console.log('Test game created successfully!');
    console.log('Game ID:', newGameRef.id);
    console.log('Access the game at:', `/game/${newGameRef.id}`);
  } catch (error) {
    console.error('Failed to create test game:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Properly handle the async function
console.log('Starting async execution...');
createTestGame().catch(error => {
  console.error('Unhandled error:', error);
  console.error('Error details:', error.message);
  process.exit(1);
});