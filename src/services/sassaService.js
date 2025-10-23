import {
import logger from '../utils/logger';

  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';


export const submitSassaCheck = async (userId, applicationData) => {
  try {

    const eligibility = calculateEligibility(applicationData);

    const application = {
      userId,
      idNumber: applicationData.idNumber,
      dependents: parseInt(applicationData.dependents) || 0,
      monthlyIncome: parseFloat(applicationData.monthlyIncome) || 0,
      employmentStatus: applicationData.employmentStatus || 'unemployed',
      eligibilityStatus: eligibility.status,
      eligibilityScore: eligibility.score,
      eligibilityReason: eligibility.reason,
      checkedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)),
      verified: false,
      notes: eligibility.notes || '',
    };

    const docRef = await addDoc(collection(db, 'sassaApplications'), application);

    return {
      id: docRef.id,
      ...application,
      checkedAt: application.checkedAt.toDate(),
      expiresAt: application.expiresAt.toDate(),
    };
  } catch (error) {
    logger.error('Error submitting SASSA check:', error);
    throw error;
  }
};


export const getUserSassaApplications = async (userId) => {
  try {
    const q = query(
      collection(db, 'sassaApplications'),
      where('userId', '==', userId),
      orderBy('checkedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const applications = [];

    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data(),
        checkedAt: doc.data().checkedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      });
    });

    return applications;
  } catch (error) {
    logger.error('Error getting SASSA applications:', error);
    throw error;
  }
};


export const getCurrentSassaStatus = async (userId) => {
  try {
    const q = query(
      collection(db, 'sassaApplications'),
      where('userId', '==', userId),
      orderBy('checkedAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();


    const expiresAt = data.expiresAt?.toDate();
    const isExpired = expiresAt && expiresAt < new Date();

    return {
      id: doc.id,
      ...data,
      checkedAt: data.checkedAt?.toDate(),
      expiresAt: expiresAt,
      isExpired,
    };
  } catch (error) {
    logger.error('Error getting current SASSA status:', error);
    throw error;
  }
};


function calculateEligibility(data) {
  const { monthlyIncome, dependents, employmentStatus } = data;

  let score = 0;
  let reasons = [];


  const incomeThreshold = 4000;
  const income = parseFloat(monthlyIncome) || 0;

  if (income === 0) {
    score += 40;
    reasons.push('No monthly income');
  } else if (income < incomeThreshold) {
    score += 30;
    reasons.push(`Income below R${incomeThreshold} threshold`);
  } else if (income < incomeThreshold * 1.5) {
    score += 15;
    reasons.push('Low income');
  }


  if (employmentStatus === 'unemployed') {
    score += 30;
    reasons.push('Currently unemployed');
  } else if (employmentStatus === 'self-employed') {
    score += 15;
    reasons.push('Self-employed with irregular income');
  }


  const numDependents = parseInt(dependents) || 0;
  if (numDependents > 0) {
    score += Math.min(numDependents * 5, 30);
    reasons.push(`${numDependents} dependent(s)`);
  }


  let status, notes;

  if (score >= 70) {
    status = 'eligible';
    notes = 'You appear to meet the criteria for SASSA assistance. Please visit your nearest SASSA office with your ID and proof of income for verification.';
  } else if (score >= 40) {
    status = 'potentially_eligible';
    notes = 'You may qualify for SASSA assistance. We recommend visiting your nearest SASSA office for a full assessment.';
  } else {
    status = 'not_eligible';
    notes = 'Based on the information provided, you may not qualify for SASSA grants. However, you can still use NourishNet to find food donations. For an official assessment, visit your nearest SASSA office.';
  }

  return {
    status,
    score,
    reason: reasons.join(', '),
    notes,
  };
}


