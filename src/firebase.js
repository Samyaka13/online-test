// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth" 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-O6Z0twC0-sRsG2bZD7PGXGULUqn8DJw",
  authDomain: "qandanswer-e8d92.firebaseapp.com",
  projectId: "qandanswer-e8d92",
  storageBucket: "qandanswer-e8d92.firebasestorage.app",
  messagingSenderId: "57805665748",
  appId: "1:57805665748:web:fcf9d2a522e57492d11241",
  measurementId: "G-S3LBGJ7TWK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)