import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [birth, setBirth] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setNickname(data.name || '');
          setAvatar(data.avatar || '');
          setBirth(data.birth || '');
          setCity(data.city || '');
        }
      }
    };
    fetchProfile();
  }, []);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Рұқсат қажет', 'Сурет галереясына рұқсат беріңіз');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, {
        name: nickname,
        avatar,
        birth,
        city
      }, { merge: true });

      await updateProfile(auth.currentUser, {
        displayName: nickname,
        photoURL: avatar,
      });

      Alert.alert('✅ Сақталды', 'Профиль жаңартылды');
      router.push('/profile');
    } catch (error) {
      console.error('Сақтау қатесі:', error);
      Alert.alert('Қате!', 'Профильді сақтау мүмкін болмады');
    }
  };

  return (
    <View style={styles.container}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <Text style={styles.noAvatar}>Аватар жоқ</Text>
      )}

      <TouchableOpacity style={styles.transparentButton} onPress={pickAvatar}>
        <Text style={styles.transparentButtonText}> Аватар таңдау</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Аты-жөніңіз:</Text>
      <TextInput
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
        placeholder="Мысалы: Yedil"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Туған күніңіз:</Text>
      <TextInput
        value={birth}
        onChangeText={setBirth}
        style={styles.input}
        placeholder="Мысалы: 2002-05-10"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Қала:</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        style={styles.input}
        placeholder="Мысалы: Астана"
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={[styles.button, { marginTop: 30 }]} onPress={handleSave}>
        <Text style={styles.buttonText}> Сақтау</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#121212',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#9C6BFF',
    alignSelf: 'center',
    marginBottom: 20,
  },
  noAvatar: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#1E1E2E',
    color: '#fff',
  },
  button: {
    backgroundColor: '#9C6BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transparentButton: {
    borderColor: '#9C6BFF',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  transparentButtonText: {
    color: '#9C6BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
