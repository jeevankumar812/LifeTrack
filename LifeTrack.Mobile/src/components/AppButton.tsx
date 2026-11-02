
import React from 'react';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 17,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  disabled: {
    opacity: 0.6,
  },

  text: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
