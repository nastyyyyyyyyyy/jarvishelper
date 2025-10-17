
import { auth } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../firebase';
import { TouchableOpacity } from 'react-native';
import { collection, getDocs, query, orderBy, onSnapshot, DocumentData, where } from 'firebase/firestore';

export default function AllTasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const currentUid = auth.currentUser?.uid;

  const handleDelete = async (id: string) => {
    Alert.alert('Назар аударыңыз', 'Сіз шынымен бұл тапсырманы жойғыңыз келе ме?', [
      {
        text: 'Болдырмау',
        style: 'cancel',
      },
      {
        text: 'Иә, жою',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'tasks', id));
            setTasks((prev) => prev.filter((task) => task.id !== id));
            Alert.alert('Тапсырма жойылды ✅');
          } catch (error) {
            console.error('Жою қатесі:', error);
            Alert.alert('Қате!', 'Тапсырма жойылмады 😢');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setTasks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const myTasks = tasks.filter((task) => task.uid === currentUid);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 Менің тапсырмаларым</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#9C6BFF" />
      ) : myTasks.length === 0 ? (
        <Text style={styles.noTasks}>Әзірге ешқандай тапсырма жоқ.</Text>
      ) : (
        myTasks.map((task) => (
          <View key={task.id} style={styles.card}>
            <Text style={styles.taskTitle}>📌 {task.title}</Text>
            <Text style={styles.taskText}>🗓 {task.day} ⏰ {task.time}</Text>
            {task.description ? <Text style={styles.taskText}>📝 {task.description}</Text> : null}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
  <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#9C6BFF' }]} onPress={() => router.push(`/edit-task/${task.id}`)}>
    <Text style={styles.smallButtonText}>✏️ Өңдеу</Text>
  </TouchableOpacity>
  <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#FF5C5C' }]} onPress={() => handleDelete(task.id)}>
    <Text style={styles.smallButtonText}>🗑 Жою</Text>
  </TouchableOpacity>
</View>

          </View>
          
        ))
      )}
      <TouchableOpacity style={styles.transparentButton} onPress={() => router.push('/home')}>
        <Text style={styles.transparentButtonText}>← Басты бетке қайту</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  noTasks: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E1E2E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  taskText: {
    color: '#ccc',
    marginBottom: 2,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  transparentButton: {
    borderColor: '#9C6BFF',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  transparentButtonText: {
    color: '#9C6BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});