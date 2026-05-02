// Re-export Firebase services from config
export { 
  app, 
  db, 
  auth, 
  firebaseDoc as doc, 
  firebaseSetDoc as setDoc, 
  firebaseGetDoc as getDoc, 
  firebaseOnSnapshot as onSnapshot,
  firebaseCollection as collection,
  firebaseUpdateDoc as updateDoc,
  firebaseArrayUnion as arrayUnion,
  firebaseArrayRemove as arrayRemove,
  firebaseServerTimestamp as serverTimestamp,
  firebaseAddDoc as addDoc,
  firebaseQuery as query,
  firebaseOrderBy as orderBy,
  firebaseLimit as limit,
  firebaseGetDocs as getDocs,
  firebaseDeleteDoc as deleteDoc,
  usingMockFirebase
} from './config'; 