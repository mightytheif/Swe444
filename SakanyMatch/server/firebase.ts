import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin with config from service account
try {
  // Use a direct config object instead of environment variables
  const firebaseConfig = {
    projectId: "sakany-c6645",
    clientEmail: "firebase-adminsdk-sample@sakany-c6645.iam.gserviceaccount.com", // Replace with your actual service account email
    privateKey: "YOUR_PRIVATE_KEY", // You'll need to add this in Secrets
  };

  const app = initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: "sakany-c6645.firebasestorage.app"
  });

  console.log("Firebase Admin initialized successfully");

  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
} catch (error) {
  console.error("Firebase Admin initialization error:", error);

  // Create a fallback for development
  const app = initializeApp({
    projectId: "sakany-c6645"
  });

  console.warn("Using limited Firebase Admin functionality due to initialization error");

  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
}