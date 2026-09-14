import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCal6UJkUbd4fGkqkN5iIYwmKpSBir7CPY",
  authDomain: "testing-room-iloilo.firebaseapp.com",
  databaseURL: "https://testing-room-iloilo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testing-room-iloilo",
  storageBucket: "testing-room-iloilo.firebasestorage.app",
  messagingSenderId: "1067666469721",
  appId: "1:1067666469721:web:ced765322dcf4680259248"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
