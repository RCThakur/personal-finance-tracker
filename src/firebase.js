// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNrY59JSIAzuFCaJ66L6iuedyRgLjewlY",
  authDomain: "personalfinancetracker-13167.firebaseapp.com",
  projectId: "personalfinancetracker-13167",
  storageBucket: "personalfinancetracker-13167.appspot.com",
  messagingSenderId: "386005506882",
  appId: "1:386005506882:web:eb1ad1e3ca68c9a79bc6db",
  measurementId: "G-PVTFST7798",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
