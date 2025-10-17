import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { View, Button } from 'react-native';
import { auth } from '../firebase';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// 字体
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const router = useRouter();

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

  if (!fontsLoaded) return null;

  return (
    <Drawer
      initialRouteName="splash" // 应用启动时先进入 splash.tsx
      screenOptions={{ headerShown: true }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <DrawerItem label="🏠 Басты бет" onPress={() => router.push('/home')} />
          <DrawerItem label="➕ Тапсырма қосу" onPress={() => router.push('/add-task')} />
          <DrawerItem label="📋 Барлық тапсырмалар" onPress={() => router.push('/all-tasks')} />
          <DrawerItem label="🤖 Jarvis көмекшісі" onPress={() => router.push('/chat')} />
          <DrawerItem label="🌐 Аудармашы" onPress={() => router.push('/translator')} />
          <DrawerItem label="👤 Профиль" onPress={() => router.push('/profile')} />

          <View style={{ marginTop: 40, padding: 10 }}>
            <Button
              title="🔓 Шығу"
              color="gray"
              onPress={async () => {
                await auth.signOut();
                router.replace('/login');
              }}
            />
          </View>
        </DrawerContentScrollView>
      )}
    />
  );
}
