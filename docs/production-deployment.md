# Production Deployment Guide

## 🚀 **Deployment Options**

### **Option 1: Firebase Hosting (Recommended)**

1. **Set up Firebase project:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```

2. **Configure environment variables:**
   Create `.env.production` with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

### **Option 2: Vercel**

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### **Option 3: Netlify**

1. **Connect to Netlify:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

2. **Set environment variables in Netlify dashboard**

## 🔧 **Backend Options**

### **Firebase (Easiest)**
- ✅ Already integrated in codebase
- ✅ Real-time database (Firestore)
- ✅ Authentication
- ✅ Hosting
- ✅ Free tier available

### **Custom Backend**
- **Node.js + Express + MongoDB**
- **Python + FastAPI + PostgreSQL**
- **Go + Gin + PostgreSQL**

## 📊 **Database Schema**

### **Game Sessions Collection:**
```javascript
{
  id: string,
  createdBy: string,
  createdAt: timestamp,
  status: 'creating' | 'active' | 'completed',
  phrases: [
    {
      text: string,
      addedBy: string,
      addedByName: string,
      timestamp: timestamp
    }
  ],
  participants: {
    [uid]: {
      displayName: string,
      lastActive: timestamp
    }
  },
  players: {
    [uid]: {
      displayName: string,
      markedCells: string[],
      hasWon: boolean,
      lastActive: timestamp
    }
  },
  markedPhrases: string[]
}
```

### **User Contributions Collection:**
```javascript
{
  id: string,
  name: string,
  description: string,
  category: string,
  phrases: string[],
  contributorName: string,
  contributorId: string,
  createdAt: timestamp,
  status: 'approved',
  votes: number,
  timesUsed: number
}
```

## 🔒 **Security Rules**

### **Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Game sessions - read/write for participants
    match /gameSessions/{gameId} {
      allow read, write: if request.auth != null;
    }
    
    // User contributions - read for all, write for authenticated users
    match /userContributions/{contributionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🌐 **Environment Detection**

The app automatically detects the environment:

- **Development:** Uses localStorage
- **Production:** Uses Firebase

```javascript
// Automatic environment detection
const isProduction = window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';
```

## 📈 **Scaling Considerations**

### **For High Traffic:**
1. **CDN:** Use CloudFlare or AWS CloudFront
2. **Database:** Consider Firebase Firestore limits
3. **Caching:** Implement Redis for frequently accessed data
4. **Load Balancing:** Use multiple Firebase projects

### **For Multiplayer:**
1. **WebSockets:** Real-time updates
2. **Presence:** Track online users
3. **Rooms:** Limit players per game
4. **Rate Limiting:** Prevent spam

## 🚀 **Quick Start Production**

1. **Create Firebase project**
2. **Enable Firestore**
3. **Set up authentication**
4. **Configure environment variables**
5. **Deploy to Firebase Hosting**

The app will automatically switch to Firebase mode in production!
