import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBue9z6_JuioOxPlZwQPb4q2NYUCl6_dWQ",
  authDomain: "algorand-d4a48.firebaseapp.com",
  databaseURL: "https://algorand-d4a48-default-rtdb.firebaseio.com",
  projectId: "algorand-d4a48",
  storageBucket: "algorand-d4a48.appspot.com",
  messagingSenderId: "980862557538",
  appId: "1:980862557538:web:1fff7726f2606fdfcfa03b",
  measurementId: "G-2Y2PWRFCVQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);