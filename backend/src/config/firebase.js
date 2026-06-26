"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = exports.admin = void 0;
// @ts-nocheck
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// We'll initialize firebase admin only if the credentials are provided
if (process.env.FIREBASE_PROJECT_ID) {
    try {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.applicationDefault(), // or cert
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin Initialized');
    }
    catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}
else {
    console.warn('Firebase credentials not found in environment variables. Using mock mode.');
}
const db = process.env.FIREBASE_PROJECT_ID ? firebase_admin_1.default.firestore() : null;
exports.db = db;
const auth = process.env.FIREBASE_PROJECT_ID ? firebase_admin_1.default.auth() : null;
exports.auth = auth;
//# sourceMappingURL=firebase.js.map