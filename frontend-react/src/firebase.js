console.log("Firebase Started ✅");
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCBKx-AaJnfU5QE0cythXGvBDnuLVPbqYY",
  authDomain: "deadline-manager-6fe56.firebaseapp.com",
  projectId: "deadline-manager-6fe56",
  messagingSenderId: "89730517722",
  appId: "1:89730517722:web:0e6f40017491b2f1a9b3e3"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);