import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAunVkH1Bez176wdCVQlTZGDkR-vFaO2Qc",
  authDomain: "talkbuzz-6e0b7.firebaseapp.com",
  projectId: "talkbuzz-6e0b7",
  storageBucket: "talkbuzz-6e0b7.firebasestorage.app",
  messagingSenderId: "277929907361",
  appId: "1:277929907361:web:2e95accb18ccd5505dcce0",
  measurementId: "G-R6DL32FVGT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
