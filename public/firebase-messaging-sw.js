// This file must be in the public directory
// It is important to use the compat libraries for the service worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKd3d9RFP-W8i7G9KwUmg7LKFoz9yCTck",
  authDomain: "produkstok-a7412.firebaseapp.com",
  projectId: "produkstok-a7412",
  storageBucket: "produkstok-a7412.appspot.com",
  messagingSenderId: "908619745272",
  appId: "1:908619745272:web:ac622a5ed7f9cada4df80d",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Logo Dreampuff.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
