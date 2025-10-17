import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function UserGuide() {
  const router = useRouter();

  const guides = [
    {
      title: '📱 Басты бет',
      image: require('../assets/01.png'),
      description: 'Jarvis-тің басты беті — күнделікті тапсырмалар, ауа райы және кеңестер көрсетілетін негізгі экран.',
    },
    {
      title: '➕ Тапсырма қосу',
      image: require('../assets/02.png'),
      description: 'Уақыты мен сипаттамасы бар жаңа тапсырма қосыңыз. Jarvis кеңес береді және еске салады.',
    },
    {
      title: '📋 Барлық тапсырмалар',
      image: require('../assets/03.png'),
      description: 'Барлық қосылған тапсырмаларды бір жерде қарап, түзетіп немесе өшіре аласыз.',
    },
    {
      title: '🤖 Jarvis көмекшісі',
      image: require('../assets/04.png'),
      description: 'Jarvis чаты арқылы сұрақ қойып, ұсыныстар алып, жеке көмекші ретінде пайдаланыңыз.',
    },
    {
      title: '🌍 Аудармашы',
      image: require('../assets/05.png'),
      description: 'Кез келген сөйлемді қазақ, орыс, қытай немесе ағылшын тіліне аударыңыз.',
    },
    {
      title: '💰 Қаржылық көмекші',
      image: require('../assets/06.png'),
      description: 'Түсетін және шығатын шығындарыңызды бақылаңыз. Қаржыңызды оңай реттеңіз.',
    },
    {
      title: '🙋 Профиль беті',
      image: require('../assets/07.png'),
      description: 'Өз атыңызды, суретіңізді өзгертіп, жеке деректерді жаңартыңыз.',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {guides.map((item, index) => (
          <View key={index} style={styles.page}>
            <Text style={styles.title}>{item.title}</Text>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
        <Text style={styles.buttonText}>🏠 Басты бетке оралу</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1F2E',
    paddingVertical: 40,
    alignItems: 'center',
  },
  page: {
    width: 300,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9C6BFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  image: {
    width: 240,
    height: 400,
    borderRadius: 10,
    marginBottom: 16,
  },
  description: {
    color: '#ccc',
    fontSize: 15,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    borderColor: '#9C6BFF',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#9C6BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
