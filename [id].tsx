import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import {
  View, Text, TextInput, StyleSheet, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      const ref = doc(db, 'tasks', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        setDescription(data.description || '');
        const [d, m, y] = data.day.split('.');
        const [h, min] = data.time.split(':');
        const full = new Date(+y, +m - 1, +d, +h, +min);
        setDate(full);
      }
      setLoading(false);
    };
    fetchTask();
  }, [id]);

  const handleSave = async () => {
    if (!title || !date || !id) {
      Alert.alert('Қате!', 'Барлық өрістер қажет.');
      return;
    }

    const formattedDay = date.toLocaleDateString('kk-KZ');
    const formattedTime = date.toTimeString().slice(0, 5);

    await updateDoc(doc(db, 'tasks', id), {
      title,
      description,
      day: formattedDay,
      time: formattedTime,
    });

    router.replace('/home');
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#9C6BFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Тапсырманы өңдеу</Text>

      <Text style={styles.label}>Атауы</Text>
      <TextInput
        placeholder="Атауы"
        placeholderTextColor="#888"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Сипаттамасы</Text>
      <TextInput
        placeholder="Сипаттамасы"
        placeholderTextColor="#888"
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Күні</Text>
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

      <Text style={styles.label}>Уақыты</Text>
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