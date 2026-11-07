
/* KOMPLI - Firebase Authentication */

(function () {
  "use strict";

  const config = {
    apiKey: "AIzaSyBya8W8JkYyhua_5DX6FDlRCWsb3vW8C2E",
    authDomain: "kompli-99d42.firebaseapp.com",
    projectId: "kompli-99d42",
    storageBucket: "kompli-99d42.firebasestorage.app",
    messagingSenderId: "374584557787",
    appId: "1:374584557787:web:36f563e292c3d83c188cfe"
  };

  let auth, db;
  let mode = "signin";

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(
        new Error("Firebase SDK failed to load.")
      );
      document.head.appendChild(script);
    });
  }

  function showError(message) {
    const el = document.getElementById("kompliAuthError");
    if (el) {
      el.textContent = message;
      el.classList.remove("hidden");
    }
  }

  function clearError() {
    const el = document.getElementById("kompliAuthError");
    if (el) {
      el.textContent = "";
      el.classList.add("hidden");
    }
  }

  function friendlyError(error) {
    const messages = {
      "auth/email-already-in-use":
        "This email is already registered. Please sign in.",
      "auth/invalid-email":
        "Please enter a valid email address.",
      "auth/weak-password":
        "Password must contain at least 6 characters.",
      "auth/user-not-found":
        "No account found. Please create an account.",
      "auth/wrong-password":
        "Incorrect email or password.",
      "auth/invalid-credential":
        "Email or password is incorrect.",
      "auth/popup-closed-by-user":
        "Google sign-in was closed.",
      "auth/unauthorized-domain":
        "Add kompli.in to Firebase authorised domains."
    };

    return messages[error.code] ||
      error.message ||
      "Authentication failed. Please try again.";
  }

  function buildLogin() {
    const card = document.querySelector("#login .login-card");

    if (!card) {
      throw new Error("KOMPLI login panel not found.");
    }

    card.innerHTML = `
      <div class="brand">KOMPLI</div>
      <div class="tag">LEARN. COMPLY. GROW.</div>

      <h1 id="kompliTitle">
        Welcome to your learning hub
      </h1>

      <p class="muted">
        Sign in to access your learning and skills workspace.
      </p>

      <div id="kompliNameField" class="field hidden">
        <label>YOUR NAME</label>
        <input id="kompliName"
          autocomplete="name"
          placeholder="Enter your name">
      </div>

      <div class="field">
        <label>EMAIL ADDRESS</label>
        <input id="kompliEmail"
          type="email"
          autocomplete="email"
          placeholder="you@organization.com">
      </div>

      <div class="field">
        <label>PASSWORD</label>
        <input id="kompliPassword"
          type="password"
          autocomplete="current-password"
          placeholder="Enter password">
      </div>

      <div id="kompliAuthError"
        class="notice hidden"
        role="alert"></div>

      <button id="kompliEmailButton"
        class="btn"
        type="button">
        SIGN IN WITH EMAIL
      </button>

      <button id="kompliGoogleButton"
        class="btn light"
        type="button">
        CONTINUE WITH GOOGLE
      </button>

      <p style="text-align:center;font-size:12px;margin-top:18px">
        <a id="kompliForgot" href="#" style="color:var(--r)">
          Forgot password?
        </a>
      </p>

      <p style="text-align:center;font-size:12px">
        <span id="kompliSwitchText">New to KOMPLI?</span>
        <a id="kompliSwitch" href="#"
          style="color:var(--r);font-weight:bold">
          Create account
        </a>
      </p>

      <div class="note">
        New accounts start with the learner role.
        Institution and administrator permissions
        are assigned separately.
      </div>
    `;

    document.getElementById("kompliEmailButton")
      .onclick = emailAuth;

    document.getElementById("kompliGoogleButton")
      .onclick = googleAuth;

    document.getElementById("kompliForgot").onclick = e => {
      e.preventDefault();
      forgotPassword();
    };

    document.getElementById("kompliSwitch").onclick = e => {
      e.preventDefault();

      mode = mode === "signin" ? "signup" : "signin";
      clearError();

      document.getElementById("kompliTitle").textContent =
        mode === "signup"
          ? "Create your KOMPLI account"
          : "Welcome to your learning hub";

      document.getElementById("kompliNameField")
        .classList.toggle("hidden", mode !== "signup");

      document.getElementById("kompliEmailButton").textContent =
        mode === "signup"
          ? "CREATE ACCOUNT"
          : "SIGN IN WITH EMAIL";

      document.getElementById("kompliSwitchText").textContent =
        mode === "signup"
          ? "Already registered?"
          : "New to KOMPLI?";

      document.getElementById("kompliSwitch").textContent =
        mode === "signup" ? "Sign in" : "Create account";
    };
  }

  async function saveUserProfile(user) {
    const ref = db.collection("users").doc(user.uid);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      const name =
        user.displayName ||
        document.getElementById("kompliName").value.trim() ||
        user.email.split("@")[0];

      await ref.set({
        name: name,
        email: user.email,
        photoURL: user.photoURL || null,
        role: "learner",
        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  async function emailAuth() {
    clearError();

    const email =
      document.getElementById("kompliEmail").value.trim();

    const password =
      document.getElementById("kompliPassword").value;

    const name =
      document.getElementById("kompliName").value.trim();

    if (!email || !password) {
      return showError(
        "Enter your email address and password."
      );
    }

    if (mode === "signup" && !name) {
      return showError("Please enter your name.");
    }

    try {
      let credential;

      if (mode === "signup") {
        credential =
          await auth.createUserWithEmailAndPassword(
            email,
            password
          );

        await credential.user.updateProfile({
          displayName: name
        });
      } else {
        credential =
          await auth.signInWithEmailAndPassword(
            email,
            password
          );
      }

      await saveUserProfile(credential.user);

    } catch (error) {
      showError(friendlyError(error));
    }
  }

  async function googleAuth() {
    clearError();

    try {
      const provider =
        new firebase.auth.GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      const credential =
        await auth.signInWithPopup(provider);

      await saveUserProfile(credential.user);

    } catch (error) {
      showError(friendlyError(error));
    }
  }

  async function forgotPassword() {
    clearError();

    const email =
      document.getElementById("kompliEmail").value.trim();

    if (!email) {
      return showError("Enter your email address first.");
    }

    try {
      await auth.sendPasswordResetEmail(email);

      showError(
        "Password reset email sent. Please check your inbox."
      );

    } catch (error) {
      showError(friendlyError(error));
    }
  }

  async function initialiseKOMPLI() {
    buildLogin();

    const base =
      "https://www.gstatic.com/firebasejs/9.22.0/";

    await loadScript(base + "firebase-app-compat.js");
    await loadScript(base + "firebase-auth-compat.js");
    await loadScript(base + "firebase-firestore-compat.js");

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    auth = firebase.auth();
    db = firebase.firestore();

    auth.onAuthStateChanged(async user => {

      if (!user) {
        document.getElementById("app")
          .classList.add("hidden");

        document.getElementById("login")
          .classList.remove("hidden");

        return;
      }

      try {
        await saveUserProfile(user);

        document.getElementById("login")
          .classList.add("hidden");

        document.getElementById("app")
          .classList.remove("hidden");

        if (typeof render === "function") {
          render("overview");
        }

      } catch (error) {
        await auth.signOut();

        showError(
          "Secure profile could not be saved. " +
          "Please check Firestore security rules."
        );

        console.error(error);
      }
    });

    window.logout = function () {
      return auth.signOut();
    };
  }

  function start() {
    initialiseKOMPLI().catch(error => {
      console.error(error);
      alert(
        "KOMPLI authentication could not start. " +
        "Please check Firebase settings."
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();
