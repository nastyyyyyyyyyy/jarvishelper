import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Easing } from 'react-native';

interface VoiceModalProps {
  visible: boolean;
  transcript: string;
}

export default function VoiceModal({ visible, transcript }: VoiceModalProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
        <Text style={styles.text}>Тыңдап жатырмын...</Text>
        {transcript ? <Text style={styles.transcript}>"{transcript}"</Text> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#9C6BFF',
    opacity: 0.7,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginTop: 30,
    fontWeight: 'bold',
  },
  transcript: {
    color: '#ccc',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
