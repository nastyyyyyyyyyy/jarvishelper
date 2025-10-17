import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getMonth, getYear } from 'date-fns';

export default function IncomeSetupScreen() {
  const [income, setIncome] = useState('');
  const [payday, setPayday] = useState('');
  const user = auth.currentUser;
  const router = useRouter();

  const handleSave = async () => {
    if (!user || !income.trim() || !payday.trim()) return;

    const uid = user.uid;
    const now = new Date();
    const year = getYear(now);
    const month = String(getMonth(now) + 1).padStart(2, '0');
    const docRef = doc(db, 'monthlyIncome', `${uid}_${year}-${month}`);

    try {
      await setDoc(docRef, {
        uid,
        amount: parseFloat(income),
        payday: parseInt(payday), // 新增字段：每月发薪日
        month: `${year}-${month}`,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('✅ Сақталды', 'Айлық табыс пен күн сәтті сақталды!');
      setIncome('');
      setPayday('');
      router.push('/finance-dashboard');
    } catch (error) {
      console.error('Сақтау қатесі:', error);
      Alert.alert('Қате!', 'Табыс сақтау мүмкін болмады');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Айлық табысыңызды енгізіңіз</Text>

      <Text style={styles.label}>Ай сайынғы табыс (₸):</Text>
      <TextInput
        placeholder="Мысалы: 300000"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={income}
        onChangeText={setIncome}
        style={styles.input}
      />

      <Text style={styles.label}>Ай сайынғы табыс күнi (1–28):</Text>
      <TextInput
        placeholder="Мысалы: 5"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={payday}
        onChangeText={setPayday}
        style={styles.input}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Сақтау</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.returnButton} onPress={() => router.push('/finance-dashboard')}>
        <Text style={styles.returnButtonText}>← Қаржылық көмекшіге қайту</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#1E1E2E',
    color: '#fff',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#9C6BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  returnButton: {
    backgroundColor: '#2C2F4A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
