// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB01UMzM5hYz3lFizMygjr6meubsHrF6pQ",
  authDomain: "milo-efc07.firebaseapp.com",
  projectId: "milo-efc07",
  storageBucket: "milo-efc07.firebasestorage.app",
  messagingSenderId: "999592306203",
  appId: "1:999592306203:web:9b99a0a887865f667efabe",
  measurementId: "G-CBRCF8D2B5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);