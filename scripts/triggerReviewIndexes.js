const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDpZ9Qr_gO8xkzLu2Tv6Nw4MpPwQrI5pXc',
  authDomain: 'meals-on-wheels-d0a42.firebaseapp.com',
  projectId: 'meals-on-wheels-d0a42',
  storageBucket: 'meals-on-wheels-d0a42.firebasestorage.app',
  messagingSenderId: '746346619894',
  appId: '1:746346619894:web:fd68dfd28ad5bad2d10bfd',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Triggering Firestore Review Index Queries...\n');

async function triggerQuery(queryName, queryFn) {
  try {
    console.log(`⏳ Attempting: ${queryName}`);
    await getDocs(queryFn);
    console.log(`✅ ${queryName} - Index already exists or query succeeded\n`);
  } catch (error) {
    if (error.message.includes('index')) {
      const indexUrl = error.message.match(/https:\/\/[^\s]+/);
      if (indexUrl) {
        console.log(`🔗 ${queryName} - Create index here:`);
        console.log(`   ${indexUrl[0]}\n`);
      } else {
        console.log(`❌ ${queryName} - Index needed but URL not found`);
        console.log(`   Error: ${error.message}\n`);
      }
    } else {
      console.log(`❌ ${queryName} - Error: ${error.message}\n`);
    }
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('REVIEWS COLLECTION QUERIES');
  console.log('='.repeat(80) + '\n');

  await triggerQuery(
    'reviews: donorId + createdAt (desc)',
    query(
      collection(db, 'reviews'),
      where('donorId', '==', 'test-user-id'),
      orderBy('createdAt', 'desc'),
    ),
  );

  await triggerQuery(
    'reviews: reviewerId + donationId',
    query(
      collection(db, 'reviews'),
      where('reviewerId', '==', 'test-user-id'),
      where('donationId', '==', 'test-donation-id'),
    ),
  );

  await triggerQuery(
    'reviews: donationId + createdAt (desc)',
    query(
      collection(db, 'reviews'),
      where('donationId', '==', 'test-donation-id'),
      orderBy('createdAt', 'desc'),
    ),
  );

  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log('1. Click on the index creation links above');
  console.log('2. Sign in to Firebase Console if needed');
  console.log('3. Click "Create Index" for each link');
  console.log('4. Wait for indexes to build (may take a few minutes)');
  console.log('5. Test your review features in the app');
  console.log('='.repeat(80));

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});




