import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDEhkmTy1g9goAc-5P8ZNolq-d3LObxsnY",
  authDomain: "gramam-6362a.firebaseapp.com",
  projectId: "gramam-6362a",
  storageBucket: "gramam-6362a.firebasestorage.app",
  messagingSenderId: "168339487798",
  appId: "1:168339487798:web:2d15d9ddc5bb2065566c97",
  measurementId: "G-9EL47324H0"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Phone Auth helpers
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
    confirmationResult: ConfirmationResult | undefined;
  }
}

export const setupRecaptcha = (containerId: string) => {
  if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
    });
  }
  return window.recaptchaVerifier;
};

export const sendOTP = async (phoneNumber: string) => {
  const recaptchaVerifier = window.recaptchaVerifier;
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA not initialized');
  }

  const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
};

export const verifyOTP = async (otp: string) => {
  const confirmationResult = window.confirmationResult;
  if (!confirmationResult) {
    throw new Error('No confirmation result found');
  }

  const result = await confirmationResult.confirm(otp);
  return result.user;
};

export default app;
