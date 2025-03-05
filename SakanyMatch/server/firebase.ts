
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin with proper error handling
try {
  // Check if we have the environment variables
  if (!process.env.VITE_FIREBASE_PROJECT_ID || 
      !process.env.FIREBASE_CLIENT_EMAIL || 
      !process.env.FIREBASE_PRIVATE_KEY) {
    
    console.warn("Firebase credentials missing. Using empty dummy values for development.");
    
    // Use dummy credentials for development to prevent crash
    const app = initializeApp({
      projectId: "dummy-project",
    });
    
    console.log("Firebase initialized with dummy project configuration");
    
    export const auth = getAuth(app);
    export const db = getFirestore(app);
    export const storage = getStorage(app);
  } else {
    // Initialize with actual credentials
    const app = initializeApp({
      credential: cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    
    console.log("Firebase initialized successfully with project:", process.env.VITE_FIREBASE_PROJECT_ID);
    
    export const auth = getAuth(app);
    export const db = getFirestore(app);
    export const storage = getStorage(app);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Create dummy exports to prevent app crashes
  const dummyApp = initializeApp({
    projectId: "dummy-project",
  });
  
  export const auth = getAuth(dummyApp);
  export const db = getFirestore(dummyApp);
  export const storage = getStorage(dummyApp);
}
