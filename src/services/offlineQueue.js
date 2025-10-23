import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import logger from '../utils/logger';


const QUEUE_KEY = '@nourishnet_offline_queue';

export const queueOfflineOperation = async (type, data) => {
  try {
    const queue = await getQueue();
    const operation = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending'
    };

    queue.push(operation);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    logger.log('Queued offline operation:', type);
    return { success: true, queueId: operation.id };
  } catch (error) {
    logger.error('Error queuing operation:', error);
    return { success: false, error: error.message };
  }
};

export const getQueue = async () => {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    logger.error('Error getting queue:', error);
    return [];
  }
};

export const processQueue = async () => {
  try {
    const queue = await getQueue();
    if (queue.length === 0) return { success: true, processed: 0 };

    const { createDonation } = require('./donationService');
    const { claimDonation } = require('./firestoreService');

    let processed = 0;
    const updatedQueue = [];

    for (const operation of queue) {
      try {
        let result;

        switch (operation.type) {
          case 'CREATE_DONATION':
            result = await createDonation(operation.data.donationData, operation.data.userId);
            break;
          case 'CLAIM_DONATION':
            result = await claimDonation(operation.data.donationId, operation.data.userId, operation.data.claimData);
            break;
          default:
            logger.warn('Unknown operation type:', operation.type);
        }

        if (result?.success || result?.id) {
          processed++;
          logger.log('Processed queued operation:', operation.type);
        } else {
          operation.retries += 1;
          operation.status = operation.retries > 3 ? 'failed' : 'pending';
          updatedQueue.push(operation);
        }
      } catch (error) {
        logger.error('Error processing operation:', error);
        operation.retries += 1;
        operation.status = operation.retries > 3 ? 'failed' : 'pending';
        updatedQueue.push(operation);
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
    return { success: true, processed, remaining: updatedQueue.length };
  } catch (error) {
    logger.error('Error processing queue:', error);
    return { success: false, error: error.message };
  }
};

export const initializeOfflineSync = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      logger.log('Network restored, processing offline queue...');
      processQueue();
    }
  });
};

export const clearQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};

