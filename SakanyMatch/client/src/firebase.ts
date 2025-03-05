import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Assuming firebaseConfig is defined elsewhere (e.g., from a config file)
const firebaseConfig = {
  // Your Firebase config here
};


// Initialize Firebase app
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Storage with specific settings
const storage = getStorage(app);
export { storage };