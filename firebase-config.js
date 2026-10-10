// Import fungsi Firebase langsung dari internet (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

// Kunci akses Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyD4mMkMbLczZM0Aa7st3hDR8B1mjdY1IlU",
  authDomain: "webacademicmerdeka.firebaseapp.com",
  projectId: "webacademicmerdeka",
  storageBucket: "webacademicmerdeka.firebasestorage.app",
  messagingSenderId: "476990564451",
  appId: "1:476990564451:web:a71a7d7b7faa4ca6d8f056",
  measurementId: "G-B4CRNMZFQ7"
};

// Aktifkan Firebase di website
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);