import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAIMS_KEY = '@nourishnet_claims';

export const getClaims = async () => {
  try {
    const claimsData = await AsyncStorage.getItem(CLAIMS_KEY);
    if (claimsData) {
      const claims = JSON.parse(claimsData);

      return claims.map(claim => ({
        ...claim,
        claimedAt: new Date(claim.claimedAt),
        donation: {
          ...claim.donation,
          expiryDate: claim.donation.expiryDate ? new Date(claim.donation.expiryDate) : null,
        },
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading claims:', error);
    return [];
  }
};

export const saveClaim = async (claim) => {
  try {
    const existingClaims = await getClaims();


    const alreadyClaimed = existingClaims.find(c => c.donationId === claim.donationId);
    if (alreadyClaimed) {
      console.log('Donation already claimed');
      return false;
    }

    const newClaim = {
      id: `claim_${Date.now()}`,
      donationId: claim.donationId,
      donation: claim.donation,
      claimedAt: new Date(),
      qrData: claim.qrData,
      status: 'pending',
    };

    const updatedClaims = [...existingClaims, newClaim];
    await AsyncStorage.setItem(CLAIMS_KEY, JSON.stringify(updatedClaims));
    return true;
  } catch (error) {
    console.error('Error saving claim:', error);
    return false;
  }
};

export const updateClaimStatus = async (claimId, status) => {
  try {
    const claims = await getClaims();
    const updatedClaims = claims.map(claim =>
      claim.id === claimId ? { ...claim, status } : claim
    );
    await AsyncStorage.setItem(CLAIMS_KEY, JSON.stringify(updatedClaims));
    return true;
  } catch (error) {
    console.error('Error updating claim status:', error);
    return false;
  }
};

export const deleteClaim = async (claimId) => {
  try {
    const claims = await getClaims();
    const updatedClaims = claims.filter(claim => claim.id !== claimId);
    await AsyncStorage.setItem(CLAIMS_KEY, JSON.stringify(updatedClaims));
    return true;
  } catch (error) {
    console.error('Error deleting claim:', error);
    return false;
  }
};

export const clearAllClaims = async () => {
  try {
    await AsyncStorage.removeItem(CLAIMS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing claims:', error);
    return false;
  }
};



