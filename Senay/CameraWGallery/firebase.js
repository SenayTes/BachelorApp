// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIQ9cf21jy5GAYtlXQ-3gJ5a9PGJ8nW34",
  authDomain: "bachelour-3b3ca.firebaseapp.com",
  projectId: "bachelour-3b3ca",
  storageBucket: "bachelour-3b3ca.appspot.com",
  messagingSenderId: "470709440909",
  appId: "1:470709440909:web:5b158348c1db882e6c2dc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
