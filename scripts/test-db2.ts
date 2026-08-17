import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountStr) throw new Error("No service account");

let serviceAccount = JSON.parse(serviceAccountStr);
// The ultimate private key fix
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
console.log("Valid private key? ", serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----\nMIIE'));

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

try {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  const db = getFirestore();
  db.collection('gameshut').doc('state').get().then(doc => {
    console.log("Success! Document exists:", doc.exists);
    process.exit(0);
  }).catch(console.error);
} catch (e) {
  console.error("SDK Init Failed!", e);
}
