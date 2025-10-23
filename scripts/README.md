# Scripts

Utility scripts for the NourishNet app.

## triggerFirestoreIndexes.js

Triggers all Firestore queries to generate index creation links.

### Usage

```bash
node scripts/triggerFirestoreIndexes.js
```

### What it does

This script executes all the Firestore queries used in the app:
1. Get available donations (status + createdAt)
2. Get user's posted donations (userId + createdAt)
3. Get claimed donations (claimedBy + claimedAt)

For each query that needs an index, it will output a direct link to create it in Firebase Console.

### Example Output

```
🔥 Firebase Initialized
📊 Triggering Firestore queries to generate index links...

1️⃣  Testing: Get available donations (status + createdAt DESC)
   ⚠️  Index required!
   🔗 Create index here:
   https://console.firebase.google.com/...

2️⃣  Testing: Get user's donations (userId + createdAt DESC)
   ✅ Success - Index exists

...

📋 SUMMARY
✅ Queries with existing indexes: 1
⚠️  Queries needing indexes: 2

🔗 INDEX CREATION LINKS:
[Links listed here]
```

### After Creating Indexes

Wait 1-2 minutes for indexes to build, then run the script again to verify all indexes are created.


