import { useEffect } from "react";
import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";

function App() {
  useEffect(() => {
    const requestPermissionAndGetToken = async () => {
      try {
        console.log("Requesting notification permission...");

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log("Permission denied");
          return;
        }

        console.log("Permission granted");

        // ✅ IMPORTANT: Register service worker first
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        console.log("Service Worker registered");

        // ✅ Get FCM token using SW
        const token = await getToken(messaging, {
          vapidKey:
            "BKFVMt4P_JrFkk72ODdNSlm36MetakmESq7wR0Klk3CSiZcFhDLH-NwWe5m1K5bocymVzY9sq_4hqMFMUkWn4hA",
          serviceWorkerRegistration: registration,
        });

        if (token) {
          console.log("FCM TOKEN:", token);
        } else {
          console.log("No registration token available");
        }
      } catch (error) {
        console.error("Error getting notification token:", error);
      }
    };

    requestPermissionAndGetToken();
  }, []);

  return <h1>Notification Test</h1>;
}

export default App;