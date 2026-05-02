// Auto-migration script to ensure Firebase is properly seeded with default phrase lists
// This will run automatically when the production app loads

import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export const autoMigrateUserLists = async () => {
  try {
    console.log('🔄 Auto-migration script started...');
    console.log('🌐 Current URL:', window.location.href);
    console.log('🌐 Hostname:', window.location.hostname);
    
    // Check if we're in production
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    
    console.log('🌐 Is production:', isProduction);
    
    if (!isProduction) {
      console.log('ℹ️ Not in production, skipping migration');
      return;
    }

    console.log('🌐 Production environment detected, running migration...');

    // Import Firebase and default phrase lists
    try {
      console.log('🔄 Importing Firebase and default lists...');
      const firebase = await import('../firebase/index');
      const { defaultPhraseLists } = await import('../data/defaultPhraseLists');
      
      console.log('📋 Default phrase lists loaded:', defaultPhraseLists.length, 'lists');
      console.log('📋 List names:', defaultPhraseLists.map(list => list.name));
      
      if (!firebase.db || !firebase.collection || !firebase.addDoc || !firebase.getDocs) {
        console.error('❌ Firebase not properly initialized');
        console.error('❌ Firebase objects:', { db: !!firebase.db, collection: !!firebase.collection, addDoc: !!firebase.addDoc, getDocs: !!firebase.getDocs });
        return;
      }

      console.log('✅ Firebase imported successfully');

      // Check if default lists already exist in Firebase
      console.log('🔄 Checking existing default lists in Firebase...');
      const existingDefaultLists = await firebase.getDocs(firebase.collection(firebase.db, 'defaultPhraseLists'));
      console.log('📊 Existing default lists count:', existingDefaultLists.size);
      
      if (existingDefaultLists.empty) {
        console.log('🔄 No default lists found, seeding Firebase...');
        
        // Seed default phrase lists
        let seededCount = 0;
        for (const list of defaultPhraseLists) {
          try {
            console.log('🔄 Seeding list:', list.name);
            await firebase.addDoc(firebase.collection(firebase.db, 'defaultPhraseLists'), {
              ...list,
              createdAt: new Date().toISOString(),
              isDefault: true
            });
            seededCount++;
            console.log('✅ Seeded default list:', list.name);
          } catch (error) {
            console.error('❌ Error seeding list', list.name, ':', error);
          }
        }
        console.log(`✅ Successfully seeded ${seededCount}/${defaultPhraseLists.length} default phrase lists to Firebase`);
      } else {
        console.log('✅ Default phrase lists already exist in Firebase');
        // Log existing lists for debugging
        existingDefaultLists.forEach((snap: unknown) => {
          const d = snap as QueryDocumentSnapshot<DocumentData>;
          console.log('📋 Existing list:', d.data().name);
        });
      }

      // Also add sample user contributions
      console.log('🔄 Adding sample user contributions...');
      const sampleUserContributions = [
        {
          id: 'sample-list-1',
          name: 'Sample User List 1',
          description: 'A sample user-created phrase list',
          category: 'Custom',
          phrases: [
            'Sample Phrase 1', 'Sample Phrase 2', 'Sample Phrase 3', 'Sample Phrase 4', 'Sample Phrase 5',
            'Sample Phrase 6', 'Sample Phrase 7', 'Sample Phrase 8', 'Sample Phrase 9', 'Sample Phrase 10',
            'Sample Phrase 11', 'Sample Phrase 12', 'Sample Phrase 13', 'Sample Phrase 14', 'Sample Phrase 15',
            'Sample Phrase 16', 'Sample Phrase 17', 'Sample Phrase 18', 'Sample Phrase 19', 'Sample Phrase 20',
            'Sample Phrase 21', 'Sample Phrase 22', 'Sample Phrase 23', 'Sample Phrase 24'
          ],
          contributorName: 'Demo User',
          contributorId: 'demo-user-1',
          createdAt: new Date().toISOString(),
          status: 'approved',
          votes: 0,
          timesUsed: 0
        },
        {
          id: 'mall-shopping',
          name: 'Mall',
          description: 'Common mall shopping experiences and activities',
          category: 'Shopping',
          phrases: [
            'Food Court Lunch', 'Window Shopping', 'Sale Signs', 'Shopping Bags', 'Escalator Ride',
            'Parking Garage', 'Mall Security', 'Fountain Display', 'Store Directory', 'Gift Cards',
            'Fitting Room', 'Cash Register', 'Shopping Cart', 'Price Tags', 'Store Hours',
            'Mall Map', 'Restroom Break', 'Bench Sitting', 'Phone Charging', 'WiFi Connection',
            'Mall Music', 'Store Displays', 'Customer Service', 'Return Policy', 'Gift Wrapping'
          ],
          contributorName: 'Mall Shopper',
          contributorId: 'mall-user-1',
          createdAt: new Date().toISOString(),
          status: 'approved',
          votes: 0,
          timesUsed: 0
        }
      ];

      // Check if user contributions already exist
      const existingContributions = await firebase.getDocs(firebase.collection(firebase.db, 'userContributions'));
      console.log('📊 Existing user contributions count:', existingContributions.size);
      
      // Clear existing contributions and add new ones (including Mall list)
      console.log('🔄 Clearing existing user contributions...');
      
      // Delete existing contributions one by one
      for (const d of existingContributions.docs as QueryDocumentSnapshot<DocumentData>[]) {
        await firebase.deleteDoc(d.ref);
      }
      console.log('✅ Cleared existing user contributions');
      
      // Add new contributions including Mall list
      for (const contribution of sampleUserContributions) {
        await firebase.addDoc(firebase.collection(firebase.db, 'userContributions'), contribution);
        console.log('✅ Added contribution:', contribution.name);
      }
      console.log('✅ All user contributions added to Firebase (including Mall list)');
      
    } catch (error: unknown) {
      console.error('❌ Error during Firebase migration:', error);
      const e = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error details:', e.message);
      console.error('❌ Error stack:', e.stack);
      return;
    }
    
    console.log('🎉 Migration complete!');
    console.log('🔄 Page will refresh in 3 seconds to load the new data...');
    
    // Refresh the page to load the new data
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error: unknown) {
    console.error('❌ Error during auto-migration:', error);
    const e = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Error details:', e.message);
    console.error('❌ Error stack:', e.stack);
  }
};

// Auto-run the migration when this script loads
if (typeof window !== 'undefined') {
  console.log('🚀 Auto-migration script loaded, will run in 3 seconds...');
  // Run after a short delay to ensure the app is loaded
  setTimeout(autoMigrateUserLists, 3000);
}
