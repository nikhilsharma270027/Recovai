import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzfmlSbrin2xL7jyMhboohFlL2-DExGUo",
  authDomain: "fruitsinmug.firebaseapp.com",
  projectId: "fruitsinmug",
  storageBucket: "fruitsinmug.appspot.com",
  messagingSenderId: "483523562273",
  appId: "1:483523562273:web:f99cd514796839ad830c60",
  measurementId: "G-PDKLCMQLW7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Make sure this is correctly imported
export const storage = getStorage(app);
export const db = getFirestore(app); // Export Firestore instance

// Enable Analytics only on the client-side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, provider, analytics };
