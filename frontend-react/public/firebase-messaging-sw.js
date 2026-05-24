importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCBKx-AaJnfU5QE0cythXGvBDnuLVPbqYY",
  authDomain: "deadline-manager-6fe56.firebaseapp.com",
  projectId: "deadline-manager-6fe56",
  messagingSenderId: "89730517722",
  appId: "1:89730517722:web:0e6f40017491b2f1a9b3e3"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});