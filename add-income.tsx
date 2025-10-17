import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function AddIncomeScreen() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !amount) {
      Alert.alert('Қате', 'Сома енгізіңіз');
      return;
    }

    try {
      await addDoc(collection(db, 'finance'), {
        uid,
        type: 'income',
        amount: Number(amount),
        note,
        createdAt: serverTimestamp(),
      });
      router.push('/finance-dashboard');
    } catch (e) {
      console.error('Сақтау қатесі:', e);
      Alert.alert('Қате', 'Сақтау мүмкін болмады');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Кіріс қосу</Text>

      <Text style={styles.label}>Сома:</Text>
      <TextInput
        placeholder="Мысалы: 10000"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Түсініктеме:</Text>
      <TextInput
        placeholder="Мысалы: Айлық"
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Сақтау</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#1E1E2E',
    color: '#fff',
  },
  button: {
    backgroundColor: '#9C6BFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});