import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'kk', name: 'Қазақша' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
];

async function translateLingva(text: string, targetLang: string): Promise<string> {
  try {
    const encodedText = encodeURIComponent(text);
    const res = await fetch(`https://lingva.ml/api/v1/auto/${targetLang}/${encodedText}`);
    const data = await res.json();
    return data.translation || '';
  } catch (error) {
    console.error("Lingva Translate error:", error);
    return 'Аударма қатесі';
  }
}

export default function TranslatorScreen() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState('en');
  const [showLangOptions, setShowLangOptions] = useState(false);

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const translated = await translateLingva(text, targetLang);
    setResult(translated);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌐 Көптілді аудармашы</Text>

      <Text style={styles.label}>Мәтін:</Text>
      <TextInput
        style={styles.input}
        placeholder="Мәтінді жазыңыз..."
        placeholderTextColor="#888"
        value={text}
        onChangeText={setText}
        multiline
      />

      <Text style={styles.label}>Аудару тілі:</Text>
      <TouchableOpacity style={styles.selectedLang} onPress={() => setShowLangOptions(!showLangOptions)}>
        <Text style={styles.selectedLangText}>{LANGUAGES.find(l => l.code === targetLang)?.name || 'Тілді таңдаңыз'}</Text>
        <Ionicons name={showLangOptions ? 'chevron-up' : 'chevron-down'} size={20} color="#fff" />
      </TouchableOpacity>

      {showLangOptions && (
        <View style={styles.langButtons}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langBtn, targetLang === lang.code && styles.langBtnActive]}
              onPress={() => {
                setTargetLang(lang.code);
                setShowLangOptions(false);
              }}>
              <Text style={styles.langBtnText}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.translateBtn} onPress={translate}>
        <Text style={styles.translateBtnText}>Аудару</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#9C6BFF" style={{ marginTop: 20 }} />}

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Нәтиже:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    color: '#fff',
    textAlignVertical: 'top',
  },
  selectedLang: {
    backgroundColor: '#1E1E2E',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedLangText: {
    color: '#fff',
    fontSize: 16,
  },
  langButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  langBtn: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '48%',
  },
  langBtnActive: {
    backgroundColor: '#9C6BFF',
  },
  langBtnText: {
    color: '#fff',
    textAlign: 'center',
  },
  translateBtn: {
    backgroundColor: '#9C6BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  translateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#1E1E2E',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#9C6BFF',
    marginBottom: 8,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
  },
});
