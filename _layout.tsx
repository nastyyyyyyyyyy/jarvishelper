import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../hooks/useAuth';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { user, loading: authLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    'JarvisFont': require('../assets/fonts/AaHuanMengKongJianXiangSuTi-2.ttf'),
  });

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || authLoading) return null;

  if (!user) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <Drawer
      initialRouteName="home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1C1F2E' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#1C1F2E' },
        drawerActiveTintColor: '#9C6BFF',
        drawerInactiveTintColor: '#ccc',
        drawerLabelStyle: {
          fontFamily: 'JarvisFont',
          fontSize: 14,
        },
      }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} style={{ backgroundColor: '#1C1F2E' }}>

          <DrawerItem
            label={({ focused }) => (
              <View>
                <Text style={[styles.label, focused && styles.focused]}>  Басты бет</Text>
                <View style={styles.underline} />
              </View>
            )}
            onPress={() => props.navigation.navigate('home')}
          />

          <DrawerItem
            label={({ focused }) => (
              <View>
                <Text style={[styles.label, focused && styles.focused]}>  Тапсырма қосу</Text>
                <View style={styles.underline} />
              </View>
            )}
            onPress={() => props.navigation.navigate('add-task')}
          />

          <DrawerItem
            label={({ focused }) => (
              <View>
                <Text style={[styles.label, focused && styles.focused]}>  Барлық тапсырмалар</Text>
                <View style={styles.underline} />
              </View>
            )}
            onPress={() => props.navigation.navigate('all-tasks')}
          />

          <DrawerItem
            label={({ focused }) => (
              <View>
                <Text style={[styles.label, focused && styles.focused, { fontFamily: 'JarvisFont' }]}>  Jarvis</Text>
                <View style={styles.underline} />
              </View>
            )}
            onPress={() => props.navigation.navigate('chat')}
          />

          <DrawerItem
            label={({ focused }) => (
              <View>
                <Text style={[styles.label, focused && styles.focused]}>  Аудармашы</Text>
                <View style={styles.underline} />
              </View>
            )}
            onPress={() => props.navigation.navigate('translator')}
          />

          <DrawerItem
            label={({ focused }) => (
              <View>
                <Text style={[styles.label, focused && styles.focused]}>  Қаржылық көмекші</Text>
                <View style={styles.underline} />
              </View>
            )}
            onPress={() => props.navigation.navigate('finance-dashboard')}
          />

         <DrawerItem
            label={({ focused }) => (
              <View style={styles.profileRow}>
                <Image source={require('../assets/icons8-书-50.png')} style={styles.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, focused && styles.focused]}>  Пайдалану нұсқаулығы</Text>
                  <View style={styles.underline} />
                </View>
              </View>
            )}
            onPress={() => props.navigation.navigate('UserGuide')}
          />

          <DrawerItem
            label={({ focused }) => (
              <View style={styles.profileRow}>
                {user?.avatar && (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, focused && styles.focused]}>  Профиль</Text>
                  <View style={styles.underline} />
                </View>
              </View>
            )}
            onPress={() => props.navigation.navigate('profile')}
          />

          <View style={styles.logoutButton}>
            <TouchableOpacity style={styles.transparentButton} onPress={async () => await auth.signOut()}>
              <Text style={styles.transparentButtonText}> Шығу</Text>
            </TouchableOpacity>
          </View>
        </DrawerContentScrollView>
      )}
    />
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  transparentButton: {
    borderColor: '#9C6BFF',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  transparentButtonText: {
    color: '#9C6BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: 'bold',
    fontFamily: 'Noto Sans',
    letterSpacing: -1,
  },
  focused: {
    color: '#9C6BFF',
  },
  underline: {
    height: 1.5,
    backgroundColor: 'rgba(156, 107, 255, 0.3)',
    marginTop: 4,
    borderRadius: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9C6BFF',
  },
});