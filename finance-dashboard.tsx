import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  getDoc,
  getDocs,
  addDoc,
  doc
} from 'firebase/firestore';

export default function FinanceDashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;

    const checkAndAddIncome = async () => {
      const incomeDocRef = doc(db, 'monthlyIncome', `${uid}_${monthKey}`);
      const incomeSnap = await getDoc(incomeDocRef);

      if (!incomeSnap.exists()) return;

      const incomeData = incomeSnap.data();
      const payday = incomeData.payday;
      const amount = incomeData.amount;

      if (currentDay !== payday) return;

      const q = query(
        collection(db, 'finance'),
        where('uid', '==', uid),
        where('type', '==', 'auto-income'),
        where('month', '==', monthKey)
      );

      const snapshot = await getDocs(q);
      const alreadyAddedToday = snapshot.docs.some(doc => {
        const data = doc.data();
        const date = new Date(data.createdAt);
        return date.getDate() === currentDay;
      });

      if (!alreadyAddedToday) {
        await addDoc(collection(db, 'finance'), {
          uid,
          amount,
          title: 'Айлық табыс',
          type: 'auto-income',
          month: monthKey,
          createdAt: new Date().toISOString(),
        });
        console.log('✅ Айлық табыс автоматты түрде қосылды');
      }
    };

    checkAndAddIncome();

    const q = query(collection(db, 'finance'), where('uid', '==', uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      const income = data.filter(t => t.type === 'income' || t.type === 'auto-income');
      const expenses = data.filter(t => t.type === 'expense');

      const incomeSum = income.reduce((sum, t) => sum + Number(t.amount), 0);
      const expenseSum = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

      setTransactions(data.sort((a, b) => b.createdAt - a.createdAt));
      setIncomeTotal(incomeSum);
      setExpenseTotal(expenseSum);
      setBalance(incomeSum - expenseSum);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ ...styles.container, flexGrow: 1 }}>

      <Text style={styles.title}>Қаржылық көмекші</Text>

      <View style={styles.cardLarge}>
        <Text style={styles.label}>💰 Баланс</Text>
        <Text style={styles.amount}>₸{balance}</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.incomeButton} onPress={() => router.push('/add-income?type=income')}>
          <Text style={styles.buttonText}>➕ Кіріс қосу</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.expenseButton} onPress={() => router.push('/add-expense?type=expense')}>
          <Text style={styles.buttonText}>➖ Шығыс қосу</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardMid}>
        <Text style={styles.sectionTitle}>📊 Осы ай</Text>
        <Text style={styles.stat}>Кіріс: ₸{incomeTotal}</Text>
        <Text style={styles.stat}>Шығыс: ₸{expenseTotal}</Text>
      </View>

      <View style={styles.cardMid}>
        <Text style={styles.sectionTitle}>🔎 Соңғы шығындар</Text>
        {transactions.filter(t => t.type === 'expense').slice(0, 3).map((t, index) => (
          <Text key={index} style={styles.transaction}>• {t.title || t.description} — -₸{t.amount}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/income-setup')}>
        <Text style={styles.outlineText}>💰 Айлық табыс</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/expense-history')}>
        <Text style={styles.outlineText}>📒 Шығын тарихы</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/monthly-report')}>
        <Text style={styles.outlineText}>📊 Айлық есеп</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/home')}>
        <Text style={styles.buttonText}>← Басты бетке</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardLarge: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardMid: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 6,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  incomeButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
  },
  expenseButton: {
    flex: 1,
    backgroundColor: '#C62828',
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  stat: {
    color: '#90CAF9',
    fontSize: 14,
    marginBottom: 4,
  },
  transaction: {
    color: '#90CAF9',
    fontSize: 14,
    marginBottom: 2,
  },
  outlineButton: {
    borderColor: '#9C6BFF',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  outlineText: {
    color: '#9C6BFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  homeButton: {
    backgroundColor: '#9C6BFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
});
