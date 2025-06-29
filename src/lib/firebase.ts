import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Konfigurasi ini diambil dari variabel lingkungan untuk keamanan.
// Pastikan Anda membuat file .env.local di root proyek Anda
// dan menambahkan kredensial Firebase Anda di sana.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Inisialisasi Firebase hanya jika kunci API ada.
// Ini mencegah error jika variabel lingkungan tidak diatur.
if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (e) {
    console.error("Gagal menginisialisasi Firebase. Periksa konfigurasi Anda.", e);
  }
} else {
  console.warn("Kunci API Firebase hilang. Fitur terkait Firebase akan dinonaktifkan. Harap tambahkan NEXT_PUBLIC_FIREBASE_API_KEY ke file .env.local Anda.");
}

export { app, auth };
