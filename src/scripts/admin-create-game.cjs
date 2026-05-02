const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, 'service-account.json'));

console.log('Starting admin test game creation script...');

try {
  console.log('Initializing Firebase Admin...');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();
console.log('Admin Firestore instance ready');

async function createTestGame() {
  try {
    console.log('Creating test game using admin SDK...');
    const testPhrases = [
      "Someone yawns",
      "Technical difficulties",
      "Can you hear me?",
      "Kid or pet interruption",
      "You're on mute"
    ];

    console.log('Getting games collection reference...');
    const gamesRef = db.collection('games');
    const newGameRef = gamesRef.doc();
    console.log('New game document reference created:', newGameRef.id);

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
      createdBy: 'admin-script',
      createdAt: admin.firestore.Timestamp.now(),
      status: 'active'
    };

    console.log('Setting game data using admin SDK...');
    await newGameRef.set(gameData);
    console.log('Test game created successfully!');
    console.log('Game ID:', newGameRef.id);
    console.log('Access the game at:', `/game/${newGameRef.id}`);

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error('Failed to create test game:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

// Properly handle the async function
console.log('Starting async execution with admin SDK...');
createTestGame().catch(error => {
  console.error('Unhandled error:', error);
  console.error('Error details:', error.message);
  if (error.code) {
    console.error('Error code:', error.code);
  }
  process.exit(1);
});