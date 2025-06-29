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
  storageBucket: "produkstok-a7412.appspot.com",
  messagingSenderId: "908619745272",
  appId: "1:908619745272:web:ac622a5ed7f9cada4df80d",
};

// Inisialisasi Firebase menggunakan pola singleton untuk mencegah inisialisasi ganda
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: Storage = getStorage(app);

export { app, auth, db, storage };
