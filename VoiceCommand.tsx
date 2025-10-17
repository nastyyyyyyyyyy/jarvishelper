// VoiceCommand.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';

export default function VoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const router = useRouter();

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      const text = event.value?.[0] || '';
      setTranscript(text);
      handleCommand(text.toLowerCase());
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setTranscript('');
      setIsListening(true);
      await Voice.start('kk-KZ'); // Қазақ тілі
    } catch (e) {
      console.error(e);
      Alert.alert('Қате!', 'Микрофонды қолдану мүмкін емес');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommand = (command: string) => {
    let found = false;
    if (command.includes('басты бет')) {
      router.push('/home');
      found = true;
    } else if (command.includes('тапсырма қос')) {
      router.push('/add-task');
      found = true;
    } else if (command.includes('барлық тапсырмалар')) {
      router.push('/all-tasks');
      found = true;
    } else if (command.includes('қаржылық көмекші')) {
      router.push('/finance-dashboard');
      found = true;
    } else if (command.includes('аударма')) {
      router.push('/translator');
      found = true;
    } else if (command.includes('джарвис') || command.includes('jarvis')) {
      router.push('/chat');
      found = true;
    } else if (command.includes('профиль')) {
      router.push('/profile');
      found = true;
    }

    if (found) {
      Speech.speak('Бет ашылды', { language: 'kk-KZ' });
    } else {
      Speech.speak('Бұйрық табылмады', { language: 'kk-KZ' });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={isListening ? stopListening : startListening}>
        <Text style={styles.buttonText}>{isListening ? '🛑 Тоқтату' : '🎙 Дауыстық басқару'}</Text>
      </TouchableOpacity>
      <Text style={styles.transcript}>{transcript}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
  },
  button: {
    borderColor: '#9C6BFF',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  buttonText: {
    color: '#9C6BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transcript: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});
