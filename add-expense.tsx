import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getMonth, getYear } from 'date-fns';

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const user = auth.currentUser;
  const router = useRouter();

  const handleSave = async () => {
    if (!user || !amount.trim() || !description.trim()) return;

    const uid = user.uid;
    const year = getYear(date);
    const month = String(getMonth(date) + 1).padStart(2, '0');

    try {
      await addDoc(collection(db, 'finance'), {
        uid,
        amount: parseFloat(amount),
        title: description,         // ⚠️ 用 title 代替 description 保持一致
        description,                // 如果你希望在 expense-history 里用 description，就保留这行
        type: 'expense',
        date: date.toISOString(),
        month: `${year}-${month}`,
        createdAt: Date.now(),     // ⚠️ 用时间戳方便排序
      });

      Alert.alert('✅ Сақталды', 'Шығын сәтті сақталды!');
      setAmount('');
      setDescription('');
      router.push('/expense-history'); // 自动跳转查看效果
    } catch (error) {
      console.error('Сақтау қатесі:', error);
      Alert.alert('Қате!', 'Шығынды сақтау мүмкін болмады');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➖ Шығын қосу</Text>

      <Text style={styles.label}>Сипаттамасы:</Text>
      <TextInput
        placeholder="Мысалы: Кофе, Кітап, Жолақы"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <Text style={styles.label}>Сомасы (₸):</Text>
      <TextInput
        placeholder="Мысалы: 1200"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <Text style={styles.label}>Күні:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDate(true)}>
        <Text style={styles.dateButtonText}>{date.toLocaleDateString('kk-KZ')}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowDate(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

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
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#1E1E2E',
    color: '#fff',
  },
  dateButton: {
    backgroundColor: '#1E1E2E',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  dateButtonText: {
    color: '#ccc',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#9C6BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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
    marginTop: 16,
  },
  returnButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
