
// Import Firebase services
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration 
// Using configuration from setup-firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBHFHlxiQE2odC4qTzF9wrAxG0Q9vkw7K0",
  authDomain: "sakany-c6645.firebaseapp.com",
  projectId: "sakany-c6645",
  storageBucket: "sakany-c6645.firebasestorage.app",
  messagingSenderId: "145901978143",
  appId: "1:145901978143:web:191c60cb6e1c97316c4b2a",
  measurementId: "G-4WZNGEY43K"
};

console.log("Initializing Firebase app...");
// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

console.log("Initializing Firebase auth...");
// Initialize Firebase authentication
export const auth = getAuth(app);

console.log("Initializing Firebase firestore...");
// Initialize Firebase Firestore
export const db = getFirestore(app);

console.log("Initializing Firebase storage...");
// Initialize Firebase Storage
export const storage = getStorage(app);

// Export RecaptchaVerifier for phone authentication
export const initRecaptchaVerifier = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
};
