import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { createReview } from '../services/reviewService';
import logger from '../utils/logger';
import { useToast } from '../contexts/AlertContext';

const ReviewModal = ({ visible, onClose, claim, reviewerUserId, onReviewSubmitted }) => {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const [ratings, setRatings] = useState({
    punctuality: 0,
    quality: 0,
    communication: 0,
    overall: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingCategories = [
    { key: 'punctuality', label: 'Punctuality', description: 'Did they pick up on time?' },
    { key: 'quality', label: 'Item Quality', description: 'Was the item as described?' },
    { key: 'communication', label: 'Communication', description: 'Were they responsive?' },
    { key: 'overall', label: 'Overall Experience', description: 'Overall satisfaction' },
  ];

  const renderStars = (category) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRatings((prev) => ({ ...prev, [category]: star }))}
            style={styles.starButton}
          >
            <Icon
              name={star <= ratings[category] ? 'star' : 'star-outline'}
              size={32}
              color={star <= ratings[category] ? '#FFD700' : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      showWarning('Please provide at least an overall rating.');
      return;
    }

    if (ratings.punctuality === 0 || ratings.quality === 0 || ratings.communication === 0) {
      showWarning('Please rate all categories to submit your review.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use claim.donationId (the actual donation ID)
      const donationId = claim.donationId || claim.id;
      // Expanded claims have userId from the donation 
      const donorId = claim.donorId || claim.userId;
      
      // Validate required fields
      if (!donationId) {
        showError('Missing donation ID. Cannot submit review.');
        setIsSubmitting(false);
        return;
      }
      
      if (!donorId) {
        showError('Missing donor information. Cannot submit review.');
        setIsSubmitting(false);
        return;
      }
      
      if (!reviewerUserId) {
        showError('You must be logged in to submit a review.');
        setIsSubmitting(false);
        return;
      }
      
      if (reviewerUserId === donorId) {
        showError('You cannot review yourself.');
        setIsSubmitting(false);
        return;
      }
      
      logger.info('Submitting review:', { 
        donationId, 
        donorId, 
        reviewerId: reviewerUserId,
        ratings: ratings,
        hasRatings: !!ratings,
        ratingsKeys: Object.keys(ratings || {})
      });
      
      const result = await createReview({
        donationId: donationId,
        donorId: donorId,
        reviewerId: reviewerUserId,
        ratings: ratings,
        comment: comment.trim(),
        claimId: claim.claimId || claim.id,
      });

      if (result.success) {
        // Reset form
        setRatings({
          punctuality: 0,
          quality: 0,
          communication: 0,
          overall: 0,
        });
        setComment('');

        // Call callback and close modal
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        onClose();

        // Show success message AFTER modal closes
        showSuccess('Thank you for your review!');
      } else {
        // Show error message
        showError(result.error || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      logger.error('Error submitting review:', error);
      const message =
        error?.code === 'permission-denied'
          ? 'You cannot review yourself or lack permission to review this donor.'
          : 'Failed to submit review. Please try again.';
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!claim) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Rate Your Experience
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.donationName, { color: theme.colors.text }]}>
              {claim.itemName}
            </Text>
            <Text style={[styles.donorName, { color: theme.colors.textSecondary }]}>
              Donated by {claim.donorName || 'Anonymous'}
            </Text>

            {ratingCategories.map((category) => (
              <View key={category.key} style={styles.ratingSection}>
                <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                  {category.label}
                </Text>
                <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
                  {category.description}
                </Text>
                {renderStars(category.key)}
              </View>
            ))}

            <View style={styles.commentSection}>
              <Text style={[styles.commentLabel, { color: theme.colors.text }]}>
                Additional Comments (Optional)
              </Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Share more about your experience..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
                {comment.length}/500
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={[styles.submitButtonText, { color: theme.colors.surface }]}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  donationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  donorName: {
    fontSize: 14,
    marginBottom: 24,
  },
  ratingSection: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  commentSection: {
    marginTop: 8,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  commentInput: {
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
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewModal;
