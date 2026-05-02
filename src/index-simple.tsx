import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple test component to verify React is working
const SimpleApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🎯 PublicBingo Test Page</h1>
      <p>If you can see this, React is working!</p>
      <button 
        onClick={() => console.log('JavaScript is working!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
      <div style={{ marginTop: '20px' }}>
        <p>Console should show: React is rendering correctly</p>
      </div>
    </div>
  );
};

console.log('React is rendering correctly');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<SimpleApp />);
