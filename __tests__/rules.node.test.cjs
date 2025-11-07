const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const fs = require('fs');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-project',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('firestore security rules', () => {
  test('unauthenticated user cannot create donation', async () => {
    const ctx = testEnv.unauthenticatedContext();
    const db = ctx.firestore();
    const ref = db.collection('donations').doc('x');
    await assertFails(ref.set({ userId: 'someone', status: 'available' }));
  });

  test('authenticated user can create own donation', async () => {
    const ctx = testEnv.authenticatedContext('user_1');
    const db = ctx.firestore();
    const ref = db.collection('donations').doc();
    await assertSucceeds(ref.set({ userId: 'user_1', status: 'available', itemName: 'Bread' }));
  });
});






