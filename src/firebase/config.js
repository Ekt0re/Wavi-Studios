import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBp1zw-1T-WzAnVSd1XjCJ0-yGPMsnv1YA",
  authDomain: "tonystudo-e4068.firebaseapp.com",
  projectId: "tonystudo-e4068",
  storageBucket: "tonystudo-e4068.firebasestorage.app",
  messagingSenderId: "307275003099",
  appId: "1:307275003099:web:85bb80c6ff8563720a88fe",
  measurementId: "G-2CQ331F5H5"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza Firestore e Analytics
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 