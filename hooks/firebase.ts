import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjvLHis8U7-t-byOmpl00vaO15nylSu3c",
  authDomain: "roadmateassist-b7ebe.firebaseapp.com",
  projectId: "roadmateassist-b7ebe",
  storageBucket: "roadmateassist-b7ebe.firebasestorage.app",
  messagingSenderId: "986834107956",
  appId: "1:986834107956:web:4cbab79dd36d2a3e5b9461",
  measurementId: "G-7PP8Z9D97Q"
};


const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();
  
export const auth = getAuth(app);

export default app;