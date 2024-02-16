// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { collection, getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeaqa--hvW3w4IijMEz-SO-M3R9iFrfjA",
  authDomain: "videochatapp-59d32.firebaseapp.com",
  projectId: "videochatapp-59d32",
  storageBucket: "videochatapp-59d32.appspot.com",
  messagingSenderId: "611890709915",
  appId: "1:611890709915:web:725e39f4c33fdfca83cd3e",
  measurementId: "G-2MGVSP8K3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app)
export const firebaseDB = getFirestore(app)

export const userRef = collection(firebaseDB, 'users')
export const meetingRef = collection(firebaseDB, 'meetings')