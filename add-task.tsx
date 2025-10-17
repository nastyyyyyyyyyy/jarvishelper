// app/add-task.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Platform, Alert, TouchableOpacity
} from 'react-native';
import { scheduleHourlyTaskReminder } from '../utils/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db, auth } from '../firebase';

export default function AddTaskScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleSave = async () => {
    if (!title || !date) {
      Alert.alert('Қате!', 'Атауы мен уақыты қажет.');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const formattedDay = date.toLocaleDateString('kk-KZ');
    const formattedTime = date.toTimeString().slice(0, 5);

    await addDoc(collection(db, 'tasks'), {
      uid,
      title,
      description,
      day: formattedDay,
      time: formattedTime,
      createdAt: serverTimestamp(),
    });
    const taskTime = new Date(`${date.toDateString()} ${formattedTime}`);

const prompt = `I have a task titled "${title}" at ${formattedTime}. Give me a short helpful tip.`;

try {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer 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',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Give a short tip.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const data = await res.json();
  const aiTip = data.choices?.[0]?.message?.content?.trim() || 'Еске салу.';

  await scheduleHourlyTaskReminder(taskTime, title, aiTip);

} catch (e) {
  console.error('AI кеңес қатесі:', e);
}


    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontWeight: 'bold' }]}>➕ Тапсырма қосу</Text>

      <Text style={[styles.label, { fontWeight: 'bold' }]}>Атауы</Text>
      <TextInput
        placeholder="Атауы"
        placeholderTextColor="#888"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { fontWeight: 'bold' }]}>Сипаттамасы</Text>
      <TextInput
        placeholder="Сипаттамасы (міндетті емес)"
        placeholderTextColor="#888"
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={[styles.label, { fontWeight: 'bold' }]}>Күні</Text>
      <TouchableOpacity style={styles.transparentButton} onPress={() => setShowDate(true)}>
        <Text style={styles.transparentButtonText}>{date?.toLocaleDateString('kk-KZ')}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowDate(false);
            if (selected) setDate(new Date(selected.setHours(date?.getHours() || 0, date?.getMinutes() || 0)));
          }}
        />
      )}

      <Text style={[styles.label, { fontWeight: 'bold' }]}>Уақыты</Text>
      <TouchableOpacity style={styles.transparentButton} onPress={() => setShowTime(true)}>
        <Text style={styles.transparentButtonText}>{date?.toTimeString().slice(0, 5)}</Text>
      </TouchableOpacity>

      {showTime && (
        <DateTimePicker
          value={date || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowTime(false);
            if (selected) setDate(new Date((date || new Date()).setHours(selected.getHours(), selected.getMinutes())));
          }}
        />
      )}

      <TouchableOpacity style={[styles.transparentButton, { marginTop: 30 }]} onPress={handleSave}>
        <Text style={styles.transparentButtonText}> Сақтау</Text>
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
  transparentButton: {
    borderColor: '#9C6BFF',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  transparentButtonText: {
    color: '#9C6BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});