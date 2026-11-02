
import React from 'react';

import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';

export default function Loading() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LifeTrack.</Text>

      <ActivityIndicator
        size="large"
        color="#FFFFFF"
        style={styles.loader}
      />

      <Text style={styles.text}>
        Getting things ready...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 35,
  },

  loader: {
    marginBottom: 20,
  },

  text: {
    color: '#888888',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
