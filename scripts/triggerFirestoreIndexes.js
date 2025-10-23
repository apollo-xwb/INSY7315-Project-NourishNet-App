/**
 * Firestore Index Trigger Script
 * 
 * This script triggers all Firestore queries used in the app to generate
 * the index creation links. Run this to get all the links at once.
 * 
 * Usage: node scripts/triggerFirestoreIndexes.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFzJXSF8YwnnXjEBjw7NxDOLL7w4JxXjA",
  authDomain: "mealsonwheels-275c2.firebaseapp.com",
  projectId: "mealsonwheels-275c2",
  storageBucket: "mealsonwheels-275c2.firebasestorage.app",
  messagingSenderId: "834728778135",
  appId: "1:834728778135:web:2535ee06df78b7f3144cd2",
  measurementId: "G-209E40JXX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Firebase Initialized');
console.log('📊 Triggering Firestore queries to generate index links...\n');

// Test user ID and chat ID (use real ones if available, or this will still trigger the index requirement)
const TEST_USER_ID = 'test-user-123';
const TEST_CHAT_ID = 'test-chat-123';

async function triggerQueries() {
  const results = {
    successful: [],
    needsIndex: []
  };

  // Query 1: Get all available donations (status + createdAt)
  console.log('1️⃣  Testing: Get available donations (status + createdAt DESC)');
  try {
    const q1 = query(
      collection(db, 'donations'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc')
    );
    await getDocs(q1);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('Available donations query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get available donations (status + createdAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 2: Get user's posted donations (userId + createdAt)
  console.log('2️⃣  Testing: Get user\'s donations (userId + createdAt DESC)');
  try {
    const q2 = query(
      collection(db, 'donations'),
      where('userId', '==', TEST_USER_ID),
      orderBy('createdAt', 'desc')
    );
    await getDocs(q2);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('User donations query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get user\'s donations (userId + createdAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 3: Get claimed donations (claimedBy + claimedAt)
  console.log('3️⃣  Testing: Get claimed donations (claimedBy + claimedAt DESC)');
  try {
    const q3 = query(
      collection(db, 'donations'),
      where('claimedBy', '==', TEST_USER_ID),
      orderBy('claimedAt', 'desc')
    );
    await getDocs(q3);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('Claimed donations query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get claimed donations (claimedBy + claimedAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 4: Get chat messages (chatId + createdAt)
  console.log('4️⃣  Testing: Get chat messages (chatId + createdAt ASC)');
  try {
    const q4 = query(
      collection(db, 'messages'),
      where('chatId', '==', TEST_CHAT_ID),
      orderBy('createdAt', 'asc')
    );
    await getDocs(q4);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('Chat messages query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get chat messages (chatId + createdAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 5: Get user's sent messages (senderId + createdAt)
  console.log('5️⃣  Testing: Get user\'s sent messages (senderId + createdAt DESC)');
  try {
    const q5 = query(
      collection(db, 'messages'),
      where('senderId', '==', TEST_USER_ID),
      orderBy('createdAt', 'desc')
    );
    await getDocs(q5);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('User sent messages query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get user\'s sent messages (senderId + createdAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 6: Get user's received messages (receiverId + createdAt)
  console.log('6️⃣  Testing: Get user\'s received messages (receiverId + createdAt DESC)');
  try {
    const q6 = query(
      collection(db, 'messages'),
      where('receiverId', '==', TEST_USER_ID),
      orderBy('createdAt', 'desc')
    );
    await getDocs(q6);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('User received messages query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get user\'s received messages (receiverId + createdAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 7: Get user's SASSA applications (userId + checkedAt)
  console.log('7️⃣  Testing: Get SASSA applications (userId + checkedAt DESC)');
  try {
    const q7 = query(
      collection(db, 'sassaApplications'),
      where('userId', '==', TEST_USER_ID),
      orderBy('checkedAt', 'desc')
    );
    await getDocs(q7);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('SASSA applications query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get SASSA applications (userId + checkedAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 8: Get user's alerts (userId + createdAt)
  console.log('8️⃣  Testing: Get user alerts (userId + createdAt DESC)');
  try {
    const q8 = query(
      collection(db, 'alerts'),
      where('userId', '==', TEST_USER_ID),
      orderBy('createdAt', 'desc')
    );
    await getDocs(q8);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('User alerts query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get user alerts (userId + createdAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Query 9: Get unread alerts (userId + read + createdAt)
  console.log('9️⃣  Testing: Get unread alerts (userId + read + createdAt DESC)');
  try {
    const q9 = query(
      collection(db, 'alerts'),
      where('userId', '==', TEST_USER_ID),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    await getDocs(q9);
    console.log('   ✅ Success - Index exists\n');
    results.successful.push('Unread alerts query');
  } catch (error) {
    console.log('   ⚠️  Index required!');
    if (error.message.includes('index')) {
      const match = error.message.match(/https:\/\/[^\s]+/);
      if (match) {
        console.log('   🔗 Create index here:');
        console.log('   ' + match[0] + '\n');
        results.needsIndex.push({
          query: 'Get unread alerts (userId + read + createdAt)',
          link: match[0]
        });
      }
    } else {
      console.log('   ❌ Error:', error.message + '\n');
    }
  }

  // Summary
  console.log('═'.repeat(80));
  console.log('📋 SUMMARY');
  console.log('═'.repeat(80));
  console.log(`✅ Queries with existing indexes: ${results.successful.length}`);
  console.log(`⚠️  Queries needing indexes: ${results.needsIndex.length}\n`);

  if (results.needsIndex.length > 0) {
    console.log('🔗 INDEX CREATION LINKS:');
    console.log('─'.repeat(80));
    results.needsIndex.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.query}`);
      console.log(`   ${item.link}`);
    });
    console.log('\n' + '─'.repeat(80));
    console.log('\n💡 TIP: Click each link above to create the required indexes.');
    console.log('   After creating all indexes, wait 1-2 minutes for them to build,');
    console.log('   then run this script again to verify.\n');
  } else {
    console.log('🎉 All indexes are created! Your app is ready to go.\n');
  }

  process.exit(0);
}

// Run the script
triggerQueries().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

