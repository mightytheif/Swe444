
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Using the config from your sakany project
const firebaseConfig = {
  apiKey: "AIzaSyBHFHlxiQE2odC4qTzF9wrAxG0Q9vkw7K0",
  authDomain: "sakany-c6645.firebaseapp.com",
  projectId: "sakany-c6645",
  storageBucket: "sakany-c6645.firebasestorage.app",
  messagingSenderId: "145901978143",
  appId: "1:145901978143:web:191c60cb6e1c97316c4b2a",
  measurementId: "G-4WZNGEY43K"
};

// Initialize Firebase
console.log('Initializing Firebase app...');
const app = initializeApp(firebaseConfig);

console.log('Initializing Firebase auth...');
const auth = getAuth(app);

console.log('Initializing Firebase firestore...');
const db = getFirestore(app);

console.log('Initializing Firebase storage...');
const storage = getStorage(app);

export { app, auth, db, storage };
