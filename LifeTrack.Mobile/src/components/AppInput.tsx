
import React from 'react';

import {
  TextInput,
  StyleSheet,
  View,
  Text,
} from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#777777"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        selectionColor="#FFFFFF"
        underlineColorAndroid="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 23,
    width: '100%',
  },

  label: {
    color: '#FFFFFF',
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  input: {
    backgroundColor: '#191919',
    color: '#FFFFFF',
    paddingHorizontal: 17,
    paddingVertical: 17,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#303030',
    fontSize: 15,
    width: '100%',
  },
});
