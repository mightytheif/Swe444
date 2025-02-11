import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBHFHlxiQE2odC4qTzF9wrAxG0Q9vkw7K0",
    authDomain: "sakany-c6645.firebaseapp.com",
    projectId: "sakany-c6645",
    storageBucket: "sakany-c6645.firebasestorage.app",
    messagingSenderId: "145901978143",
    appId: "1:145901978143:web:191c60cb6e1c97316c4b2a",
    measurementId: "G-4WZNGEY43K"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);