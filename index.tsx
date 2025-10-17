import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const title = 'JARVIS';

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [visibleLetters, setVisibleLetters] = useState(0);

  const [fontsLoaded] = useFonts({
    JarvisFont: require('../assets/fonts/AaHuanMengKongJianXiangSuTi-2.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const interval = setInterval(() => {
      setVisibleLetters((prev) => {
        if (prev < title.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 300);

    const timeout = setTimeout(() => {
      setShowSplash(false);
      router.replace('/login');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [fontsLoaded]);

  if (!fontsLoaded || showSplash) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/bot.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.textRow}>
          {title.split('').map((char, idx) => (
            <Text
              key={idx}
              style={[
                styles.letter,
                { opacity: idx < visibleLetters ? 1 : 0.2 },
              ]}
            >
              {char}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D', // 深黑背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 30,
  },
  textRow: {
    flexDirection: 'row',
    gap: 10,
  },
  letter: {
    fontSize: 40,
    fontFamily: 'JarvisFont',
    color: '#B388FF', // 高级感紫色
  },
});
