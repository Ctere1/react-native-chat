import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getReactNativePersistence,
  browserSessionPersistence,
} from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.apiKey,
  authDomain: Constants.expoConfig.extra.authDomain,
  projectId: Constants.expoConfig.extra.projectId,
  storageBucket: Constants.expoConfig.extra.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
  appId: Constants.expoConfig.extra.appId,
  databaseURL: Constants.expoConfig.extra.databaseURL,
  measurementId: Constants.expoConfig.extra.measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const persistence =
  Platform.OS === 'web'
    ? browserSessionPersistence
    : getReactNativePersistence(ReactNativeAsyncStorage);

export const auth = initializeAuth(app, { persistence });

export const database = getFirestore();
