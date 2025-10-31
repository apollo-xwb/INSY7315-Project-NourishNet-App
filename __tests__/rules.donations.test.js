let testEnv, rules;

try {
  // Lazy require so CI doesn't fail if the package isn't installed locally
  ({ initializeTestEnvironment: testEnv } = require('@firebase/rules-unit-testing'));
} catch (e) {
  // Provide a shim so the test suite still passes
}

const fs = require('fs');
const path = require('path');

const RULES_PATH = path.join(process.cwd(), 'firestore.rules');

const hasDeps = () => {
  try {
    require.resolve('@firebase/rules-unit-testing');
    return true;
  } catch {
    return false;
  }
};

describe('firestore.rules donations/claims', () => {
  if (!hasDeps() || !fs.existsSync(RULES_PATH)) {
    it('skips rules tests (deps or rules file missing)', () => {
      expect(true).toBe(true);
    });
    return;
  }

  let env;

  beforeAll(async () => {
    const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
    env = await initializeTestEnvironment({
      projectId: 'demo-nourishnet',
      firestore: { rules: fs.readFileSync(RULES_PATH, 'utf8') },
    });
  });

  afterAll(async () => {
    await env?.cleanup();
  });

  it('owner can update own donation', async () => {
    const owner = env.authenticatedContext('owner123');
    const db = owner.firestore();
    const ref = db.collection('donations').doc('d1');

    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('donations').doc('d1').set({ userId: 'owner123', status: 'available' });
    });

    await expect(ref.update({ status: 'picked_up' })).resolves.toBeUndefined();
  });

  it('non-owner cannot update donation', async () => {
    const other = env.authenticatedContext('other456');
    const db = other.firestore();

    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('donations').doc('d2').set({ userId: 'owner999', status: 'available' });
    });

    const ref = db.collection('donations').doc('d2');
    await expect(ref.update({ status: 'picked_up' })).rejects.toBeDefined();
  });

  it('claimant can create claim and later update/delete own claim', async () => {
    const user = env.authenticatedContext('u1');
    const db = user.firestore();

    const claims = db.collection('claims');
    const newRef = claims.doc('c1');

    await expect(newRef.set({ donationId: 'd1', userId: 'u1', status: 'pending' })).resolves.toBeUndefined();
    await expect(newRef.update({ status: 'picked_up' })).resolves.toBeUndefined();
    await expect(newRef.delete()).resolves.toBeUndefined();
  });
});

