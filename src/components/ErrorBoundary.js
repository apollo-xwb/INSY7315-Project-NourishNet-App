import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../utils/IconWrapper';
import logger from '../utils/logger';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);

  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Icon name="error-outline" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>
          Oops! Something went wrong
        </Text>
        <Text style={styles.errorMessage}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#212121',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    color: '#757575',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ErrorBoundary;
