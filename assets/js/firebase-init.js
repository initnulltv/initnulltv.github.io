// firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setDoc, doc, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let app;
let db;
let auth;
let userId = 'anon_user';

// Obtener configuración global (MANDATORY)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

if (Object.keys(firebaseConfig).length > 0) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Autenticación (MANDATORY)
        if (initialAuthToken) {
            signInWithCustomToken(auth, initialAuthToken)
                .then((userCredential) => {
                    userId = userCredential.user.uid;
                    console.log("Firebase signed in with custom token. User ID:", userId);
                })
                .catch((error) => {
                    console.error("Firebase Custom Token Sign In Failed:", error);
                    signInAnonymously(auth); // Fallback to anonymous
                });
        } else {
            signInAnonymously(auth)
                .then((userCredential) => {
                    userId = userCredential.user.uid;
                    console.log("Firebase signed in anonymously. User ID:", userId);
                })
                .catch((error) => {
                    console.error("Firebase Anonymous Sign In Failed:", error);
                });
        }
    } catch (e) {
        console.error("Error initializing Firebase:", e);
    }
} else {
    console.warn("Firebase configuration not found. Firestore features will be disabled.");
}

// ✅ Exportar a window para que sean accesibles globalmente (si se necesita en otros scripts no modulares)
window.db = db;
window.auth = auth;
window.getFirestore = getFirestore;
window.initializeApp = initializeApp;