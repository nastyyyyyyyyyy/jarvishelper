import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getMonth, getYear } from 'date-fns';

export default function MonthlyReportScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [incomeCount, setIncomeCount] = useState(0);
  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;

      const now = new Date();
      const year = getYear(now);
      const month = String(getMonth(now) + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      const q = query(collection(db, 'finance'), where('uid', '==', user.uid), where('month', '==', monthKey));
      const snapshot = await getDocs(q);
      const allRecords = snapshot.docs.map((docSnap) => docSnap.data());

      const expenses = allRecords.filter((item: any) => item.type === 'expense');
      const incomes = allRecords.filter((item: any) => item.type === 'income' || item.type === 'auto-income');

      const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const totalGained = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const expenseDescriptions = expenses.map((item) => `${item.title || item.description} - -${item.amount}₸`);
      const incomeDescriptions = incomes.map((item) => `${item.title || 'Айлық табыс'} +${item.amount}₸`);
      const allDescriptions = [...incomeDescriptions, ...expenseDescriptions].join(', ');

      const prompt = `This month, I earned ${totalGained}₸ and spent ${totalSpent}₸. Here are the records: ${allDescriptions}. Please give me a short and friendly financial tip.`;

      try {
        const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer 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',
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
              { role: 'system', content: 'You are a helpful financial assistant. Keep advice friendly and short.' },
              { role: 'user', content: prompt },
            ],
          }),
        });

        const data = await aiRes.json();
        const result = data.choices?.[0]?.message?.content || 'AI жауап таба алмады.';

        setSummary(result);
        setExpenseTotal(totalSpent);
        setIncomeTotal(totalGained);
        setExpenseCount(expenses.length);
        setIncomeCount(incomes.length);
        setLoading(false);
      } catch (error) {
        console.error('AI қатесі:', error);
        Alert.alert('Қате', 'AI жауап ала алмадық.');
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Айлық есеп</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#9C6BFF" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.cardBox}>
            <Text style={styles.amount}>💰 Барлық кіріс: {incomeTotal} ₸</Text>
            <Text style={styles.amount}>➕ Кіріс саны: {incomeCount}</Text>
            <Text style={styles.amount}>📌 Барлық шығын: {expenseTotal} ₸</Text>
            <Text style={styles.amount}>➖ Шығын саны: {expenseCount}</Text>
          </View>

          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>🧠 Jarvis кеңесі:</Text>
            <Text style={styles.adviceText}>{summary}</Text>
          </View>

          <TouchableOpacity style={styles.returnButton} onPress={() => router.push('/finance-dashboard')}>
            <Text style={styles.returnButtonText}>← Қаржылық көмекшіге қайту</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  amount: {
    color: '#ccc',
    fontSize: 18,
    marginBottom: 6,
  },
  cardBox: {
    backgroundColor: '#1E1E2E',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  adviceBox: {
    backgroundColor: '#1E1E2E',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C6BFF',
    marginBottom: 10,
  },
  adviceText: {
    color: '#fff',
    fontSize: 16,
  },
  returnButton: {
    backgroundColor: '#2C2F4A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  returnButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
