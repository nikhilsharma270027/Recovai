import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_hGht3h5Cp_wGsLb8qBmGpg9oQxunvAM",
  authDomain: "freshdrink-b55c3.firebaseapp.com",
  projectId: "freshdrink-b55c3",
  storageBucket: "freshdrink-b55c3.appspot.com",
  messagingSenderId: "321714451247",
  appId: "1:321714451247:web:de4a274128e44528e8a7da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Make sure this is correctly imported

// Enable Analytics only on the client-side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, provider, analytics };
