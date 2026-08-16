import fs from "fs";
import path from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DB_FILE = path.join(process.cwd(), "src", "lib", "serverDb.json");
const TMP_DB_FILE = "/tmp/serverDb.json";

export function getFirestoreDb() {
  const isFirestore = process.env.DATABASE_TYPE?.toLowerCase() === "firestore";
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!isFirestore || !serviceAccountStr) {
    throw new Error("CRITICAL: Firestore is not configured. Local fallback is disabled for data safety.");
  }
  
  try {
    if (getApps().length === 0) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountStr);
      } catch (e) {
        // Try decoding as base64 if direct parse fails
        try {
          const decoded = Buffer.from(serviceAccountStr, 'base64').toString('utf-8');
          serviceAccount = JSON.parse(decoded);
        } catch (e2) {
          throw new Error("FIREBASE_SERVICE_ACCOUNT is neither valid JSON nor valid Base64 JSON.");
        }
      }
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    return getFirestore();
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
}

export async function readDb() {
  const firestore = getFirestoreDb();
  if (firestore) {
    try {
      const docRef = firestore.doc("gameshut/state");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Failed to read from Cloud Firestore:", error);
    }
  }

  // Fallback to local memory/file if no Firebase configured (Dev/Vercel ephemeral)
  try {
    const fs = require('fs');
    if (fs.existsSync(TMP_DB_FILE)) {
      const data = fs.readFileSync(TMP_DB_FILE, "utf-8");
      return JSON.parse(data);
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read local fallback DB", err);
  }
  return null;
}

export async function writeDb(data: any) {
  const firestore = getFirestoreDb();
  if (firestore) {
    try {
      const docRef = firestore.doc("gameshut/state");
      await docRef.set(data, { merge: true });
      return true;
    } catch (error) {
      console.error("Failed to write to Cloud Firestore:", error);
    }
  }

  // Fallback to local file
  try {
    const fs = require('fs');
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    return true;
  } catch (err) {
    console.error("Failed to write to local fallback DB", err);
    return false;
  }
}
