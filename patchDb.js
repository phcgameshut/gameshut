const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  let serviceAccount = JSON.parse(serviceAccountStr);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\\\n/g, '\n');
  }
  
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();
  const docRef = db.doc('gameshut/state');
  const docSnap = await docRef.get();
  let state = docSnap.exists ? docSnap.data() : {};
  
  if (!state.events) state.events = [];
  if (!state.tickets) state.tickets = [];

  state.events = [
    {
      id: 'ttwdot1',
      title: 'The Things We Do On Tables',
      date: 'August 10, 2024',
      time: '4:00 PM - 10:00 PM',
      location: 'Lagos, Nigeria',
      price: 5000,
      description: 'Our premier tabletop gaming meetup. A night of Catan, Jenga, Chess, and unmatched vibes.',
      posterUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600&auto=format&fit=crop',
      revenue: 250000,
      tiers: [
        { name: 'General Entry', price: 5000 }
      ],
      sessions: [
        { date: 'August 10, 2024', time: '4:00 PM - 10:00 PM' }
      ]
    }
  ];

  state.tickets = state.tickets.filter(t => !['e1', 'e2', 'e3'].includes(t.eventId));
  
  if (!state.tickets.find(t => t.id === 'tk_restore')) {
    state.tickets.push({
      id: 'tk_restore',
      eventId: 'ttwdot1',
      eventTitle: 'The Things We Do On Tables',
      playerId: 'admin',
      buyerName: 'Total Historical Sales',
      buyerEmail: 'admin@gameshut.ng',
      quantity: 50,
      totalPaid: 250000,
      status: 'purchased',
      tierName: 'General Entry',
      sessionDate: 'August 10, 2024',
      sessionTime: '4:00 PM - 10:00 PM'
    });
  }

  await docRef.set(state);
  console.log('Firestore patched successfully! Events count:', state.events.length, 'Tickets count:', state.tickets.length);
}

main().catch(console.error);
