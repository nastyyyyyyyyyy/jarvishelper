import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';

// 🔔 请求权限
export async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

// 🔁 获取所有任务（传入日期字符串如 "21.04.2025"）
export async function getTasksForDate(dateStr: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const q = query(
    collection(db, 'tasks'),
    where('uid', '==', uid),
    where('day', '==', dateStr)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}

// ✅ 晚上 22:00 提醒（如果今天无任务则显示明天的任务）
export async function scheduleEveningReminder(label: string, day: string, tomorrow: string) {
  const todayTasks = await getTasksForDate(day);
  const nextTasks = await getTasksForDate(tomorrow);

  const taskList = todayTasks.length > 0 ? todayTasks : nextTasks;
  const title = todayTasks.length > 0 ? '📌 Бүгінгі тапсырмалар' : '📌 Ертеңгі тапсырмалар';

  const body = taskList.length > 0
    ? taskList.map((t: any) => `• ${t.title} (${t.time})`).join('\n')
    : 'Тапсырмалар табылмады';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🕙 ${label}`,
      body,
    },
    trigger: {
      type: 'calendar',
      hour: 22,
      minute: 0,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });
}

// ✅ Таңғы еске салу (08:00)
export async function scheduleMorningAdvice(day: string, weather: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const tasks = await getTasksForDate(day);
  const taskList = tasks.length > 0
    ? tasks.map((t: any) => `• ${t.title} (${t.time})`).join('\n')
    : 'Бүгінге тапсырмалар жоқ';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌞 Бүгінгі тапсырмалар мен кеңестер',
      body: `${taskList}\n\n🌤 Ауа райы: ${weather}`,
    },
    trigger: {
      type: 'calendar',
      hour: 8,
      minute: 0,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });
}

// ✅ Тапсырма басталуына 1 сағат қалғанда
export async function scheduleHourlyTaskReminder(taskTime: Date, title: string, aiTip: string) {
  const oneHourBefore = new Date(taskTime.getTime() - 60 * 60 * 1000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ 1 сағаттан кейін: ${title}`,
      body: aiTip,
    },
    trigger: {
      type: 'calendar',
      year: oneHourBefore.getFullYear(),
      month: oneHourBefore.getMonth() + 1,
      day: oneHourBefore.getDate(),
      hour: oneHourBefore.getHours(),
      minute: oneHourBefore.getMinutes(),
    } as Notifications.CalendarTriggerInput,
  });
}

// ✅ Кенет ауа райының өзгерісі
export async function scheduleWeatherAlert(message: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌦 Ауа райы ескертуі',
      body: message,
    },
    trigger: null, // 즉시 көрсетіледі
  });
  
  
}
// 🟣 封装无需参数的版本：晚上提醒
export async function scheduleDailyTaskSummary() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const format = (d: Date) =>
    d.toLocaleDateString('kk-KZ').replace(/\//g, '.');

  await scheduleEveningReminder(
    'Еске салу',
    format(today),
    format(tomorrow)
  );
}

// 🟡 封装无需参数的版本：早上提醒
export async function scheduleMorningSummary() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('kk-KZ').replace(/\//g, '.');

  // 默认天气文本（可以根据实际天气 API 替换）
  const defaultWeather = '22°C, Бұлтты';

  await scheduleMorningAdvice(dateStr, defaultWeather);
}

// 🧊 封装天气提醒演示（你可以加逻辑判断风雪等情况）
export async function checkWeatherAndNotify() {
  await scheduleWeatherAlert('Ертең жаңбыр жаууы мүмкін. Қолшатырды ұмытпаңыз!');
}




