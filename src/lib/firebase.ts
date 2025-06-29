import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type Storage } from "firebase/storage";

// Konfigurasi ini diambil dari variabel lingkungan untuk keamanan.
// Pastikan Anda membuat file .env.local di root proyek Anda
// dan menambahkan kredensial Firebase Anda di sana.
const firebaseConfig = {
  apiKey: "AIzaSyBKd3d9RFP-W8i7G9KwUmg7LKFoz9yCTck",
  authDomain: "produkstok-a7412.firebaseapp.com",
  projectId: "produkstok-a7412",
  storageBucket: "produkstok-a7412.firebasestorage.app",
  messagingSenderId: "908619745272",
  appId: "1:908619745272:web:ac622a5ed7f9cada4df80d",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: Storage | null = null;

// Inisialisasi Firebase hanya jika kunci API ada.
// Ini mencegah error jika variabel lingkungan tidak diatur.
if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Gagal menginisialisasi Firebase. Periksa konfigurasi Anda.", e);
  }
} else {
  console.warn("Kunci API Firebase hilang. Fitur terkait Firebase akan dinonaktifkan. Harap tambahkan kredensial Anda ke file .env.local dan restart server pengembangan Anda.");
}

export { app, auth, db, storage };
