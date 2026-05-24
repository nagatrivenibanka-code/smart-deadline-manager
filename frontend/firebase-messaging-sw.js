importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCBKx-AaJnfU5QE0cythXGvBDnuLVPbqYY",
    authDomain: "deadline-manager-6fe56.firebaseapp.com",
    projectId: "deadline-manager-6fe56",
    storageBucket: "deadline-manager-6fe56.firebasestorage.app",
    messagingSenderId: "89730517722",
    appId: "1:89730517722:web:0e6f40017491b2f1a9b3e3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

    console.log(
        '[firebase-messaging-sw.js] Background message ',
        payload
    );

    const notificationTitle =
        payload.notification.title;

    const notificationOptions = {

        body: payload.notification.body,

        icon:
        'https://cdn-icons-png.flaticon.com/512/1827/1827349.png'

    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

