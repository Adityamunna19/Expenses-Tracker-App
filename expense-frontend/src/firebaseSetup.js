import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyDYHHvKmBwf9l8pEiOO1h0ZeXx5Prt5DAY",
  authDomain: "money-cockpit-e57ff.firebaseapp.com",
  projectId: "money-cockpit-e57ff",
  storageBucket: "money-cockpit-e57ff.firebasestorage.app",
  messagingSenderId: "729829993919",
  appId: "1:729829993919:web:890fc85d4ec17cd753050a",
  measurementId: "G-4DHX886KMY"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async (userId, API_BASE) => {
  try {
    const currentToken = await getToken(messaging, { 
        // PASTE YOUR VAPID KEY HERE
        vapidKey: 'BD3wNnNo2FjinmYGiMzoZuFPqIodaYAkUHrk5jXPvwCvOGJxPsMq2TUzQq0MIDhgQvSWYHOf2bA11D_X9NBx-64' 
    });
    
    if (currentToken) {
      console.log('Push token received: ', currentToken);
      
      // Send this token to our new Python endpoint
      await fetch(`${API_BASE}/settings/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({ token: currentToken })
      });
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });