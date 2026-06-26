// @ts-nocheck
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// We'll initialize firebase admin only if the credentials are provided
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // or cert
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin Initialized');
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
} else {
  console.warn('Firebase credentials not found in environment variables. Using mock mode.');
}

const db = process.env.FIREBASE_PROJECT_ID ? admin.firestore() : null;
const auth = process.env.FIREBASE_PROJECT_ID ? admin.auth() : null;

export { admin, db, auth };
