import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8BzB5JWfhxsee-4hXQ_2N6T5lmkkC9BI",
  authDomain: "pavelogi.firebaseapp.com",
  projectId: "pavelogi",
  storageBucket: "pavelogi.appspot.com",
  messagingSenderId: "551653065552",
  appId: "1:551653065552:web:e5800e5fc21d1c5e182255",
  measurementId: "G-9F9FLLSB2Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };