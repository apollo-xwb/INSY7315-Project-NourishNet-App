import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { submitRating } from '../services/ratingService';
import logger from '../utils/logger';
import { useToast } from '../contexts/AlertContext';

const RatingModal = ({
  visible,
  onClose,
  donation,
  ratedUser,
  raterUserId,
  type,
  onRatingSubmitted,
}) => {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showWarning('Please select a star rating');
      return;
    }

    setSubmitting(true);

    try {
      // Validate required fields
      if (!donation?.id) {
        showError('Missing donation information. Cannot submit rating.');
        setSubmitting(false);
        return;
      }
      
      if (!ratedUser?.id) {
        showError('Missing user information. Cannot submit rating.');
        setSubmitting(false);
        return;
      }
      
      if (!raterUserId) {
        showError('You must be logged in to submit a rating.');
        setSubmitting(false);
        return;
      }
      
      if (raterUserId === ratedUser.id) {
        showError('You cannot rate yourself.');
        setSubmitting(false);
        return;
      }
      
      const result = await submitRating({
        donationId: donation.id,
        ratedUserId: ratedUser.id,
        raterUserId: raterUserId,
        rating: rating,
        review: review.trim(),
        type: type,
      });

      if (result.success) {
        setRating(0);
        setReview('');
        if (onRatingSubmitted) onRatingSubmitted();
        onClose();
        showSuccess('Thank you for your feedback!');
      } else {
        showError(result.error || 'Failed to submit rating. Please try again.');
      }
    } catch (error) {
      logger.error('Error submitting rating:', error);
      const message =
        error?.code === 'permission-denied'
          ? 'You cannot rate yourself or lack permission to rate this donor.'
          : 'Something went wrong. Please try again.';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Rate {type === 'donor' ? 'Donor' : 'Recipient'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.donationInfo}>
              <Text style={[styles.donationName, { color: theme.colors.text }]}>
                {donation.itemName}
              </Text>
              <Text style={[styles.userName, { color: theme.colors.textSecondary }]}>
                {ratedUser.name || 'User'}
              </Text>
            </View>

            <View style={styles.starsContainer}>
              <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>Your Rating</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.star}>
                    <Icon
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#FFC107' : theme.colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.reviewContainer}>
              <Text style={[styles.reviewLabel, { color: theme.colors.text }]}>
                Review (Optional)
              </Text>
              <TextInput
                style={[
                  styles.reviewInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Share your experience..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                value={review}
                onChangeText={setReview}
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
                {review.length}/500
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={[styles.submitButtonText, { color: theme.colors.surface }]}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  donationInfo: {
    marginBottom: 24,
    alignItems: 'center',
  },
  donationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
  },
  starsContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    padding: 4,
  },
  reviewContainer: {
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RatingModal;
