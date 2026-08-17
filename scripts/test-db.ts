import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountStr) throw new Error("No service account");

let serviceAccount = JSON.parse(serviceAccountStr);
// Correctly unescape newlines from a JSON string representation
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import { getApps } from 'firebase-admin/app';

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();
db.collection('gameshut').doc('state').get().then(doc => {
  console.log("Success! Document exists:", doc.exists);
  process.exit(0);
}).catch(console.error);
