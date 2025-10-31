const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function cleanupDuplicateReviews() {
  try {
    console.log('Starting cleanup of duplicate reviews...');

    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const reviews = [];

    reviewsSnapshot.forEach((docSnap) => {
      reviews.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    console.log(`Total reviews found: ${reviews.length}`);

    // Group reviews by reviewerId + donationId
    const reviewGroups = {};

    reviews.forEach((review) => {
      const key = `${review.reviewerId}_${review.donationId}`;
      if (!reviewGroups[key]) {
        reviewGroups[key] = [];
      }
      reviewGroups[key].push(review);
    });

    // Find and delete duplicates (keep the oldest one)
    let duplicatesFound = 0;
    let duplicatesDeleted = 0;

    for (const [key, groupReviews] of Object.entries(reviewGroups)) {
      if (groupReviews.length > 1) {
        duplicatesFound += groupReviews.length - 1;
        console.log(`\nFound ${groupReviews.length} reviews for ${key}`);

        // Sort by createdAt (oldest first)
        groupReviews.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0);
          const timeB = b.createdAt?.toDate?.() || new Date(0);
          return timeA - timeB;
        });

        // Keep the first one, delete the rest
        for (let i = 1; i < groupReviews.length; i++) {
          console.log(`  Deleting duplicate review: ${groupReviews[i].id}`);
          await deleteDoc(doc(db, 'reviews', groupReviews[i].id));
          duplicatesDeleted++;
        }
      }
    }

    console.log('\n=== Cleanup Summary ===');
    console.log(`Total reviews: ${reviews.length}`);
    console.log(`Duplicates found: ${duplicatesFound}`);
    console.log(`Duplicates deleted: ${duplicatesDeleted}`);
    console.log(`Remaining reviews: ${reviews.length - duplicatesDeleted}`);
  } catch (error) {
    console.error('Error cleaning up duplicate reviews:', error);
  }
}

cleanupDuplicateReviews()
  .then(() => {
    console.log('\nCleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
