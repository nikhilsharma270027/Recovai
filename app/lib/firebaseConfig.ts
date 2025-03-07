import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQUMNh-ARruxS0K-azjCK6aNTKzceU7kQ",
  authDomain: "recovai-5bb22.firebaseapp.com",
  projectId: "recovai-5bb22",
  storageBucket: "recovai-5bb22.appspot.com",
  messagingSenderId: "57825583310",
  appId: "1:57825583310:web:90544a5bb74acdd77ff09f",
  measurementId: "G-ZX996ZJJGF",
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
