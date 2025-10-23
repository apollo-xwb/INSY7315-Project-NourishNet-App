import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../utils/IconWrapper';


const DatePickerWrapper = ({
  modal,
  open,
  date,
  mode,
  minimumDate,
  onConfirm,
  onCancel
}) => {
  const { theme } = useTheme();


  if (!date || !(date instanceof Date)) {
    return null;
  }


  if (Platform.OS === 'web') {
    if (!open) return null;

    return (
      <View style={[styles.webModal, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.webModalContent, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.webModalTitle, { color: theme.colors.text }]}>
            Select Date
          </Text>

          <input
            type="date"
            value={date.toISOString().split('T')[0]}
            min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              onConfirm(selectedDate);
            }}
            style={styles.webDateInput}
          />

          <View style={styles.webModalButtons}>
            <TouchableOpacity
              style={[styles.webModalButton, { backgroundColor: theme.colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.webModalButtonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.webModalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => onConfirm(date)}
            >
              <Text style={[styles.webModalButtonText, { color: theme.colors.surface }]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }



  if (!open) return null;

  return (
    <View style={[styles.webModal, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.webModalContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.webModalTitle, { color: theme.colors.text }]}>
          Select Date
        </Text>

        <input
          type="date"
          value={date.toISOString().split('T')[0]}
          min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
          onChange={(e) => {
            const selectedDate = new Date(e.target.value);
            onConfirm(selectedDate);
          }}
          style={styles.webDateInput}
        />

        <View style={styles.webModalButtons}>
          <TouchableOpacity
            style={[styles.webModalButton, { backgroundColor: theme.colors.border }]}
            onPress={onCancel}
          >
            <Text style={[styles.webModalButtonText, { color: theme.colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.webModalButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => onConfirm(date)}
          >
            <Text style={[styles.webModalButtonText, { color: theme.colors.surface }]}>
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webModalContent: {
    padding: 20,
    borderRadius: 10,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  webModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  webDateInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
  },
  webModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  webModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  webModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DatePickerWrapper;
