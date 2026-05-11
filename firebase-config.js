// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDB_ymNmTN9eFoY9amgRbLJoeTjRzF61HE",
  authDomain: "club-5d681.firebaseapp.com",
  projectId: "club-5d681",
  storageBucket: "club-5d681.firebasestorage.app",
  messagingSenderId: "424424836125",
  appId: "1:424424836125:web:5ca5709b23bcea63228af4",
  measurementId: "G-CCZ4RC9DD6"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };
