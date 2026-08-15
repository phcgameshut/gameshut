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
    return null;
  }
  
  try {
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(serviceAccountStr);
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
      return null;
    }
  }

  if (fs.existsSync(TMP_DB_FILE)) {
    try {
      const data = fs.readFileSync(TMP_DB_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to read from tmp:", e);
    }
  }

  if (!fs.existsSync(DB_FILE)) {
    return null;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read server DB file:", error);
    return null;
  }
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
      return false;
    }
  }

  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write to server DB file. Falling back to /tmp/...", error);
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error("Failed to write to /tmp:", e);
      return false;
    }
  }
}
