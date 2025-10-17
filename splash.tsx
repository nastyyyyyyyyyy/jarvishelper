import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const title = 'JARVIS';

export default function SplashScreen() {
  const router = useRouter();
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    // 每 300ms 显示一个字母
    const interval = setInterval(() => {
      setVisibleLetters((prev) => {
        if (prev < title.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 300);

    // 3 秒后跳转到 index
    const timeout = setTimeout(() => {
      router.replace('/index');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/bot.png')} // 👈 你的机器人图片路径
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.textRow}>
        {title.split('').map((char, idx) => (
          <Text
            key={idx}
            style={[
              styles.letter,
              { opacity: idx < visibleLetters ? 1 : 0.1 },
            ]}
          >
            {char}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  textRow: {
    flexDirection: 'row',
    gap: 8,
  },
  letter: {
    fontSize: 38,
    fontFamily: 'JarvisFont', // 👈 你加载的字体名
    color: '#333',
  },
});
