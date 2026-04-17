importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// PASTE THE EXACT SAME FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyDYHHvKmBwf9l8pEiOO1h0ZeXx5Prt5DAY",
  authDomain: "money-cockpit-e57ff.firebaseapp.com",
  projectId: "money-cockpit-e57ff",
  storageBucket: "money-cockpit-e57ff.firebasestorage.app",
  messagingSenderId: "729829993919",
  appId: "1:729829993919:web:890fc85d4ec17cd753050a",
  measurementId: "G-4DHX886KMY"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg' // Or your app's icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});