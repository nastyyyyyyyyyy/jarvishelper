
import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { lingvaTranslate } from '../utils/translate';
import { auth } from '../firebase';
import { db } from '../firebase';
import { TouchableOpacity } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type Message = { role: 'user' | 'assistant'; content: string };

function detectLanguage(text: string): 'kk' | 'ru' | 'zh' | 'en' {
  if (/[а-яёүқғөңіһәӘҢӨҮҰҚҒІҺ]/i.test(text)) return 'kk';
  if (/[а-яё]/i.test(text)) return 'ru';
  if (/[一-鿿]/.test(text)) return 'zh';
  if (/[a-zA-Z]/.test(text)) return 'en';
  return 'en';
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const lang = detectLanguage(input);
    const isKazakh = lang === 'kk';

    let translatedInput = input;
    if (isKazakh) {
      translatedInput = await lingvaTranslate(input, 'kk', 'en');
    }

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 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',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Reply short and friendly.' },
          { role: 'user', content: translatedInput },
        ],
      }),
    });

    const data = await aiRes.json();
    const aiReplyEn = data.choices?.[0]?.message?.content?.trim() || 'Кешіріңіз, жауап табылмады 😢';
    const finalReply = isKazakh ? await lingvaTranslate(aiReplyEn, 'en', 'kk') : aiReplyEn;

    setMessages((prev) => [...prev, { role: 'user', content: input }, { role: 'assistant', content: finalReply }]);
    setInput('');

    const currentUser = auth.currentUser;
    if (currentUser) {
      await addDoc(collection(db, 'aiReplies'), {
        uid: currentUser.uid,
        question: input,
        reply: finalReply,
        createdAt: serverTimestamp(),
      });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { fontFamily: 'JarvisFont' }]}>Jarvis</Text>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.bubble,
              msg.role === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{msg.content}</Text>
          </View>
        ))}

<View style={styles.inputWrapper}>
  <TextInput
    style={styles.input}
    placeholder="Сұрағыңызды жазыңыз..."
    placeholderTextColor="#999"
    value={input}
    onChangeText={setInput}
    editable={!loading}
  />

<TouchableOpacity
  style={[
    styles.sendBtn,
    loading && { backgroundColor: '#fff' }, // 加载时白底
  ]}
  onPress={handleSend}
  disabled={!input.trim() || loading}
>
  {loading ? (
    <View style={{ width: 10, height: 10, backgroundColor: '#000', borderRadius: 2 }} />
  ) : (
    <Text style={styles.sendIcon}>↑</Text>
  )}
</TouchableOpacity>

</View>


      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  inputWrapper: {
    position: 'relative',
    marginTop: 15,
  },
  input: {
    backgroundColor: '#1E1E2E',
    color: '#fff',
    paddingVertical: 14,     // ↑ 更高
    paddingLeft: 16,
    paddingRight: 50,        // 留出右侧按钮空间
    borderRadius: 12,        // ↑ 更圆润
    fontSize: 16,            // ↑ 更清晰
    borderWidth: 1,
    borderColor: '#444',
  },
  
  bubble: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#9C6BFF',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#2A2E3B',
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 16,
    color: '#fff',
  },
  
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  sendBtn: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9C6BFF',
    backgroundColor: 'transparent',
  },
  
  sendIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C6BFF',
  },
  
  
  
});
