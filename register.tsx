
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Тіркелу сәтті өтті!');
      router.push('/home');
    } catch (error: any) {
      console.log("Тіркелу қатесі:", error);
      Alert.alert('Қате!', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Жаңа тіркелгі жасау</Text>

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

      <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
        <Text style={styles.primaryButtonText}>Тіркелу</Text>
      </TouchableOpacity>

      <Text style={styles.altText}>Тіркелгіңіз бар ма?</Text>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
        <Text style={styles.secondaryButtonText}>Кіру бетіне өту</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
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
