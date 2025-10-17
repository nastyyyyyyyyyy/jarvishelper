
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Қате!', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jarvis</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="example@gmail.com"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Құпиясөз</Text>
      <TextInput
        placeholder="Құпиясөзді енгізіңіз"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#aaa"
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Кіру</Text>
      </TouchableOpacity>

      <Text style={styles.altText}>Тіркелмегенсіз бе?</Text>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/register')}>
        <Text style={styles.secondaryButtonText}>Тіркелу</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1F2E',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 40,
    fontFamily: 'JarvisFont',
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2C2F3F',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#9C6BFF',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  altText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 10,
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#2C2F3F',
    padding: 14,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#ccc',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
