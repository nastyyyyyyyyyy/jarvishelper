import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import {
  registerForPushNotificationsAsync,
  scheduleDailyTaskSummary,
  scheduleMorningSummary,
  checkWeatherAndNotify
} from '../utils/notifications';
import { lingvaTranslate } from '../utils/translate';
import { Calendar, CalendarList, LocaleConfig } from 'react-native-calendars';
import { TouchableOpacity, View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  DocumentData,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

type Task = {
  id: string;
  uid: string;
  title: string;
  time: string;
  day: string;
  description?: string;
};

LocaleConfig.locales['kk'] = {
  monthNames: ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'],
  monthNamesShort: ['Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'],
  dayNames: ['Жексенбі', 'Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі'],
  dayNamesShort: ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн'],
};
LocaleConfig.defaultLocale = 'kk';

function detectLanguage(text: string): 'kk' | 'ru' | 'zh' | 'en' {
  if (/[а-яёүқғөңіһәӘҢӨҮҰҚҒІҺ]/i.test(text)) return 'kk';
  if (/[а-яё]/i.test(text)) return 'ru';
  if (/[一-鿿]/.test(text)) return 'zh';
  if (/[a-zA-Z]/.test(text)) return 'en';
  return 'en';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [latestAdvice, setLatestAdvice] = useState('Жүктелуде...');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [modalTasks, setModalTasks] = useState([]);
  const todayISO = new Date().toISOString().split('T')[0];
  const todayFormatted = todayISO.split('-').reverse().join('.');
  const [showTasksModal, setShowTasksModal] = useState(false);
  

  const handleModalDayPress = (day) => {
    const formatted = day.dateString.split('-').reverse().join('.');
    const filtered = tasks.filter(t => t.uid === currentUid && t.day === formatted);
    setModalDate(day.dateString);
    setModalTasks(filtered);
    setShowTasksModal(true); // 打开任务窗口
  };
  
  const currentUid = auth.currentUser?.uid ?? '';

  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync();
      await scheduleDailyTaskSummary();
      await scheduleMorningSummary();
      await checkWeatherAndNotify();
    })();
  }, [tasks]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Орналасу рұқсаты қажет!');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo.length > 0) setCity(geo[0].city || 'Беймәлім');

      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&units=metric&appid=d8508275dd91371160b3fb90f67864a9`
      );
      const weather = await weatherRes.json();
      if (weather?.main?.temp) setTemperature(weather.main.temp);
    })();
  }, []);

  useEffect(() => {
    if (!currentUid) return;
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          uid: data.uid,
          title: data.title,
          time: data.time,
          day: data.day,
          description: data.description || '',
        };
      });
      setTasks(taskList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUid]);

  const generateSmartAdvice = async () => {
    if (!auth.currentUser || tasks.length === 0 || temperature === null) return;

    const now = new Date();
    const sorted = tasks
      .filter((t) => t.uid === currentUid && t.day && t.time)
      .map((t) => {
        const [d, m, y] = t.day.split('.');
        return {
          ...t,
          dateObj: new Date(`${y}-${m}-${d}T${t.time}`),
        };
      })
      .filter((t) => t.dateObj > now)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    if (sorted.length === 0) {
      setLatestAdvice('Алдағы тапсырма табылмады.');
      return;
    }

    const next = sorted[0];
    const lang = detectLanguage(next.title);
    const [d, m, y] = next.day.split('.');
    const taskDate = new Date(`${y}-${m}-${d}`);
    const clothing = temperature > 25
      ? "It's warm today. Light clothes and sunglasses are fine."
      : temperature > 10
        ? "Wear a light jacket. It's a bit chilly."
        : "It's cold. Wear warm clothes like coats and scarves.";

    let prompt = `My task is: ${next.title}. Date: ${next.day}, ${next.time}. Weather: ${temperature}°C. ${clothing} Please provide a short, helpful suggestion.`;

    if (lang === 'kk') {
      prompt = await lingvaTranslate(prompt, 'kk', 'en');
    }

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
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
        }),
      });

      const data = await res.json();
      let reply = data.choices?.[0]?.message?.content?.trim() || '';

      if (lang === 'kk') {
        reply = await lingvaTranslate(reply, 'en', 'kk');
      }

      setLatestAdvice(reply);
      await addDoc(collection(db, 'advice'), {
        uid: currentUid,
        text: reply,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('AI кеңес қатесі:', e);
      setLatestAdvice('Кеңес алу мүмкін болмады 😢');
    }
  };

  const today = new Date().toLocaleDateString('kk-KZ');
  const todayTasks = tasks.filter((t) => t.uid === currentUid && t.day === today);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Қош келдіңіз, {user?.name || user?.email}!</Text>
      <View style={styles.card}>
  <TouchableOpacity onPress={() => setModalVisible(true)}>
    <Text style={styles.cardTitle}>📅 Бүгін: {todayFormatted}</Text>
  </TouchableOpacity>
</View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Қала: {city}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌡 Температура: {temperature?.toFixed(1)}°C</Text>
        <Text style={styles.subText}>
          {
            temperature !== null
              ? temperature > 25
                ? '👕 Жеңіл киім жеткілікті.'
                : temperature > 10
                  ? '🧥 Жеңіл күрте кисеңіз болады.'
                  : '🧣 Суық, жылы киініңіз.'
              : ''
          }
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Бүгінгі тапсырмалар</Text>
        {todayTasks.length === 0 ? (
          <Text style={styles.subText}>Бүгінге тапсырмалар табылмады.</Text>
        ) : (
          todayTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>📌 {task.title}</Text>
              <Text style={styles.subText}>🕓 {task.time}</Text>
              {task.description && <Text style={styles.subText}>📝 {task.description}</Text>}
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤖 Jarvis кеңесі</Text>
        <Text style={styles.subText}>{latestAdvice}</Text>
      </View>

      <TouchableOpacity style={styles.transparentButton} onPress={generateSmartAdvice}>
        <Text style={styles.transparentButtonText}>📅 Кеңес алу</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide">
  <View style={{ flex: 1, backgroundColor: '#1C1F2E', paddingTop: 40 }}>
    
    {/* 🔙 返回主页按钮 */}
    <TouchableOpacity onPress={() => setModalVisible(false)} style={{ position: 'absolute', top: 60, left: 20, zIndex: 10,padding: 8, }}>
      <Text style={{ color: '#ccc', fontSize: 16 }}>🔙 Қайту</Text>
    </TouchableOpacity>

    <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center' }}>📆 Толық күнтізбе</Text>

    <CalendarList
      pastScrollRange={12}
      futureScrollRange={12}
      scrollEnabled
      showScrollIndicator
      onDayPress={handleModalDayPress}
      markedDates={{
        ...tasks.reduce((acc, t) => {
          const [d, m, y] = t.day.split('.');
          acc[`${y}-${m}-${d}`] = { marked: true, dotColor: '#9C6BFF' };
          return acc;
        }, {}),
        ...(modalDate && { [modalDate]: { selected: true, selectedColor: '#9C6BFF', dotColor: '#fff' } })
      }}
      theme={{
        calendarBackground: '#1C1F2E',
        dayTextColor: '#fff',
        monthTextColor: '#9C6BFF',
        arrowColor: '#9C6BFF',
      }}
    />

    {/* ✅ 当天任务弹出窗口 */}
    {showTasksModal && (
      <View style={{
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        backgroundColor: '#2C2F4A',
        padding: 16,
        borderRadius: 10,
        zIndex: 20,
      }}>
        <TouchableOpacity
          onPress={() => setShowTasksModal(false)}
          style={{ position: 'absolute', top: 8, right: 12 }}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>✖</Text>
        </TouchableOpacity>

        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          📌 {modalDate.split('-').reverse().join('.')} күнгі тапсырмалар
        </Text>

        {modalTasks.length > 0 ? modalTasks.map(t => (
          <Text key={t.id} style={{ color: '#ccc', marginBottom: 4 }}>• {t.title}</Text>
        )) : (
          <Text style={{ color: '#888' }}>Тапсырма табылмады.</Text>
        )}
      </View>
    )}

  </View>
</Modal>


  
    </ScrollView>
    
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1C1F2E',
    flexGrow: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#2C2F4A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
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
  taskItem: {
    marginBottom: 10,
  },
  taskTitle: {
    fontWeight: '600',
    color: '#fff',
  },
  subText: {
    color: '#ccc',
  },
});
