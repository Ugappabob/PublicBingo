import { defaultPhraseLists } from '../data/defaultPhraseLists';

// This script can be run to seed production Firebase with default data
export const seedDefaultPhraseLists = async () => {
  try {
    // Import Firebase dynamically to avoid issues in development
    const { db } = await import('../firebase/index');
    const { collection, addDoc, getDocs, query, where } = await import('firebase/firestore');
    
    if (!db) {
      console.error('Firebase not available');
      return false;
    }

    // Check if default lists already exist
    const existingLists = await getDocs(collection(db, 'defaultPhraseLists'));
    if (!existingLists.empty) {
      console.log('Default phrase lists already exist in Firebase');
      return true;
    }

    // Add each default phrase list to Firebase
    for (const list of defaultPhraseLists) {
      await addDoc(collection(db, 'defaultPhraseLists'), {
        ...list,
        createdAt: new Date().toISOString(),
        isDefault: true
      });
      console.log(`Added default list: ${list.name}`);
    }

    console.log('Successfully seeded default phrase lists to Firebase');
    return true;
  } catch (error) {
    console.error('Error seeding default phrase lists:', error);
    return false;
  }
};

// Function to migrate user contributions from localStorage to Firebase
export const migrateUserContributions = async () => {
  try {
    const { db } = await import('../firebase/index');
    const { collection, addDoc, getDocs } = await import('firebase/firestore');
    
    if (!db) {
      console.error('Firebase not available');
      return false;
    }

    // Get user contributions from localStorage
    const contributions = localStorage.getItem('userContributions');
    if (!contributions) {
      console.log('No user contributions to migrate');
      return true;
    }

    const userContributions = JSON.parse(contributions);
    
    // Check if contributions already exist in Firebase
    const existingContributions = await getDocs(collection(db, 'userContributions'));
    if (!existingContributions.empty) {
      console.log('User contributions already exist in Firebase');
      return true;
    }

    // Add each user contribution to Firebase
    for (const contribution of userContributions) {
      await addDoc(collection(db, 'userContributions'), {
        ...contribution,
        migratedAt: new Date().toISOString()
      });
      console.log(`Migrated user contribution: ${contribution.name}`);
    }

    console.log('Successfully migrated user contributions to Firebase');
    return true;
  } catch (error) {
    console.error('Error migrating user contributions:', error);
    return false;
  }
};

// Main function to seed all production data
export const seedProductionData = async () => {
  console.log('Starting production data seeding...');
  
  const defaultListsResult = await seedDefaultPhraseLists();
  const contributionsResult = await migrateUserContributions();
  
  if (defaultListsResult && contributionsResult) {
    console.log('✅ Production data seeding completed successfully!');
    return true;
  } else {
    console.log('❌ Production data seeding failed');
    return false;
  }
};
