const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

console.log('Starting test game creation script...');

const firebaseConfig = {
  apiKey: "AIzaSyDjdOb1AigaigKwxfx7Ijxd9lax_X8lOcA",
  authDomain: "publicbingo.firebaseapp.com",
  projectId: "publicbingo",
  storageBucket: "publicbingo.firebasestorage.app",
  messagingSenderId: "1832642672",
  appId: "1:1832642672:web:fd61b3dd61e4b2dcd5ecb5",
  measurementId: "G-2375FY1MZ6"
};

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