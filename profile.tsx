import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [birth, setBirth] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    const fetchExtraData = async () => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBirth(data.birth || '');
          setCity(data.city || '');
        }
      }
    };
    fetchExtraData();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#9C6BFF" />;

  return (
    <View style={styles.container}>
      <Image
        source={user?.avatar ? { uri: user.avatar } : require('../assets/default-avatar.png')}
        style={styles.avatar}
      />
      <Text style={styles.name}>{user?.name || 'Аты-жөніңізді енгізіңіз😊'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {birth ? (
        <View style={styles.card}><Text style={styles.meta}>🎂 {birth}</Text></View>
      ) : null}
      {city ? (
        <View style={styles.card}><Text style={styles.meta}>📍 {city}</Text></View>
      ) : null}

      <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
        <Text style={styles.editButtonText}>✏️ Профильді өңдеу</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#9C6BFF',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E1E2E',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  meta: {
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#9C6BFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
