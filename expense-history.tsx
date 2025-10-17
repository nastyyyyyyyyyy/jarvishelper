import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getMonth, getYear } from 'date-fns';

export default function ExpenseHistoryScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;

      const now = new Date();
      const year = getYear(now);
      const month = String(getMonth(now) + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      const q = query(
        collection(db, 'finance'),
        where('uid', '==', user.uid),
        where('type', '==', 'expense'),
        where('month', '==', monthKey)
      );

      try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setExpenses(data);
      } catch (error) {
        Alert.alert('Қате!', 'Шығындарды жүктеу кезінде қате орын алды');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'finance', id));
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      Alert.alert('Қате!', 'Жою сәтсіз болды');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📒 Айлық шығындар</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#9C6BFF" style={{ marginTop: 30 }} />
      ) : expenses.length === 0 ? (
        <Text style={styles.noData}>Әзірге шығын жазбалары жоқ.</Text>
      ) : (
        expenses.map((exp: any) => (
          <View key={exp.id} style={styles.card}>
            <Text style={styles.desc}>{exp.title || exp.description}</Text>
            <Text style={styles.amount}>- {exp.amount} ₸</Text>
            <Text style={styles.date}>
              {exp.date ? new Date(exp.date).toLocaleDateString('kk-KZ') : ''}
            </Text>
            <TouchableOpacity style={styles.smallButton} onPress={() => handleDelete(exp.id)}>
              <Text style={styles.smallButtonText}>🗑 Жою</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.returnButton} onPress={() => router.push('/finance-dashboard')}>
        <Text style={styles.returnButtonText}>← Қаржылық көмекшіге қайту</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  noData: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#1E1E2E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  desc: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    color: '#9C6BFF',
    fontSize: 16,
    marginTop: 5,
  },
  date: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  smallButton: {
    backgroundColor: '#FF5C5C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
