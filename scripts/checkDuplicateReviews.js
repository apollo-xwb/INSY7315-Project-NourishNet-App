// This script checks for duplicate reviews in your Firestore database
// Run this in your browser console on the Firebase Hosting URL or localhost

console.log('='.repeat(80));
console.log('CHECKING FOR DUPLICATE REVIEWS');
console.log('='.repeat(80));
console.log('\nInstructions:');
console.log('1. Open your app in the browser');
console.log('2. Login as a user');
console.log('3. Open browser console (F12)');
console.log('4. Paste the code below and press Enter:\n');
console.log('='.repeat(80));

const checkScript = `
(async function() {
  const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { db } = window; // Assuming db is available globally in your app
  
  console.log('Fetching all reviews...');
  const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
  const reviews = [];
  
  reviewsSnapshot.forEach(doc => {
    reviews.push({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    });
  });
  
  console.log(\`Total reviews: \${reviews.length}\`);
  
  // Group by reviewerId + donationId
  const groups = {};
  reviews.forEach(review => {
    const key = \`\${review.reviewerId}_\${review.donationId}\`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(review);
  });
  
  // Find duplicates
  let duplicateCount = 0;
  console.log('\\n=== DUPLICATE REVIEWS FOUND ===');
  
  Object.entries(groups).forEach(([key, reviewGroup]) => {
    if (reviewGroup.length > 1) {
      console.log(\`\\nReviewer + Donation: \${key}\`);
      console.log(\`  Found \${reviewGroup.length} reviews:\`);
      
      reviewGroup.sort((a, b) => a.createdAt - b.createdAt);
      
      reviewGroup.forEach((r, i) => {
        console.log(\`    \${i + 1}. ID: \${r.id}\`);
        console.log(\`       Created: \${r.createdAt}\`);
        console.log(\`       Overall: \${r.ratings?.overall || 'N/A'} stars\`);
        if (i > 0) {
          console.log(\`       👉 DELETE THIS ONE\`);
          duplicateCount++;
        }
      });
    }
  });
  
  if (duplicateCount === 0) {
    console.log('\\n✅ No duplicate reviews found!');
  } else {
    console.log(\`\\n❌ Found \${duplicateCount} duplicate reviews to delete\`);
    console.log('\\nTo delete manually:');
    console.log('1. Go to Firebase Console → Firestore');
    console.log('2. Find reviews collection');
    console.log('3. Delete the review IDs marked above');
  }
})();
`;

console.log(checkScript);
console.log('\n' + '='.repeat(80));
console.log('\nOR: Check manually in Firebase Console:');
console.log('https://console.firebase.google.com/project/meals-on-wheels-d0a42/firestore');
console.log('='.repeat(80));





