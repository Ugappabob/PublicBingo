import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/index';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('Testing Firebase connection...');
      
      // Test reading from Firestore
      const testCollection = collection(db, 'test');
      const querySnapshot = await getDocs(testCollection);
      
      setStatus('Firebase connection successful!');
      console.log('Firebase connection test passed');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Firebase connection failed: ${errorMessage}`);
      console.error('Firebase connection test failed:', err);
    }
  };

  const testWriteOperation = async () => {
    try {
      setStatus('Testing write operation...');
      
      const testData = {
        test: true,
        timestamp: new Date(),
        message: 'Test write operation'
      };
      
      await addDoc(collection(db, 'test'), testData);
      setStatus('Write operation successful!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Write operation failed: ${errorMessage}`);
      console.error('Write operation test failed:', err);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Firebase Connection Test</h3>
      <p><strong>Status:</strong> {status}</p>
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      <button onClick={testWriteOperation} style={{ marginTop: '10px' }}>
        Test Write Operation
      </button>
    </div>
  );
};

export default FirebaseTest; 