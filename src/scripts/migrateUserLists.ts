// Migration script to transfer user-created lists from development to production
// This script can be run in the browser console on the production site

export const migrateUserListsToProduction = async () => {
  try {
    // Get user contributions from localStorage (development data)
    const localContributions = localStorage.getItem('userContributions');
    if (!localContributions) {
      console.log('No user contributions found in localStorage');
      return false;
    }

    const userContributions = JSON.parse(localContributions);
    console.log(`Found ${userContributions.length} user contributions to migrate`);

    // Import Firebase functions
    const { db } = await import('../firebase/index');
    const { collection, addDoc, getDocs } = await import('firebase/firestore');
    
    if (!db) {
      console.error('Firebase not available');
      return false;
    }

    // Check if contributions already exist in Firebase
    const existingContributions = await getDocs(collection(db, 'userContributions'));
    if (!existingContributions.empty) {
      console.log('User contributions already exist in Firebase');
      return true;
    }

    // Migrate each contribution to Firebase
    for (const contribution of userContributions) {
      try {
        await addDoc(collection(db, 'userContributions'), {
          ...contribution,
          migratedAt: new Date().toISOString(),
          migratedFrom: 'development'
        });
        console.log(`✅ Migrated: ${contribution.name}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${contribution.name}:`, error);
      }
    }

    console.log('🎉 User contributions migration completed!');
    return true;
  } catch (error) {
    console.error('Error migrating user contributions:', error);
    return false;
  }
};

// Function to run migration from browser console
(window as any).migrateUserLists = migrateUserListsToProduction;

console.log('Migration script loaded. Run migrateUserLists() in the console to migrate your user-created lists to production.');
