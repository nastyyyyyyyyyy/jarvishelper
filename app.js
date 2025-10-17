import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';

export default function App() {
  const handleGmailLogin = () => {
    alert("Gmail арқылы кіру (әзірше демо)");
  };

  const handleGuest = () => {
    alert("Қонақ ретінде жалғасу");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>JARVIS</Text>
      <Text style={styles.subtitle}>Күн тәртібіне арналған ақылды көмекші</Text>

      <View style={styles.buttonContainer}>
        <Button title="Gmail арқылы кіру" onPress={handleGmailLogin} />
        <View style={{ height: 10 }} />
        <Button title="Қонақ ретінде кіру" onPress={handleGuest} color="#888" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
  },
});
