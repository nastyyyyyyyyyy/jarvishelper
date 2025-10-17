// app/firebase.ts
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth/react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "jarvis-7bad8.firebaseapp.com",
  projectId: "jarvis-7bad8",
  storageBucket: "jarvis-7bad8.appspot.com",
  messagingSenderId: "386578160629",
  appId: "1:386578160629:web:13a031a74123bbeafa9ebc"
};

const app = initializeApp(firebaseConfig);

//  持久化 auth 状态
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
