// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js"
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB6X1XJnf25CgpPNS1z_z_Uzbn6kq85zJM",
    authDomain: "milo-user-auth-11f29.firebaseapp.com",
    projectId: "milo-user-auth-11f29",
    storageBucket: "milo-user-auth-11f29.firebasestorage.app",
    messagingSenderId: "999804773239",
    appId: "1:999804773239:web:e8efdcfd126e44efc3b772",
    measurementId: "G-8Q2ZV0FQQL"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const analytics = getAnalytics(app);

  // submit button
  const submitButton = document.getElementById("submit");
  submitButton.addEventListener("click", function(event) {
    event.preventDefault();

  // inputs
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // error message display
  const errorMessageDisplay = document.querySelector(".error-message");
  if (!email && !password) {
    errorMessageDisplay.textContent = "Please enter a valid email and password.";
    return;
  }

  if (!email) {
    errorMessageDisplay.textContent = "Please enter a valid email.";
    return;
  }

  if (!password) {
    errorMessageDisplay.textContent = "Please enter a valid password.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up
    const user = userCredential.user;
    window.location.href = "index.html"
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // alert(errorMessage);
    // ..
  });
  })