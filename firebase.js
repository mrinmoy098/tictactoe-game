import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrx_B1SeUxYp-5Yld4jMzqa1NicmrKeGA",
  authDomain: "tictactoeonline-51c8c.firebaseapp.com",
  databaseURL: "https://tictactoeonline-51c8c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tictactoeonline-51c8c",
  storageBucket: "tictactoeonline-51c8c.firebasestorage.app",
  messagingSenderId: "287992378497",
  appId: "1:287992378497:web:850d60eb9b4249a9734980"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

const auth = getAuth(app);

signInAnonymously(auth)
.then(() => {
    console.log("✅ Firebase Connected");
})
.catch((error) => {
    console.error(error);
});