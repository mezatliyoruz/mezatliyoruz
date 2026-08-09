import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Platform, AppState, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useAppStore } from '@/services/store';
import { ShieldAlert } from 'lucide-react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TabLayout() {
  const { startWebSocketSim, restoreSession } = useAppStore();
  const [showPrivacyMask, setShowPrivacyMask] = React.useState(false);

  useEffect(() => {
    restoreSession();
    startWebSocketSim();

    async function requestNotificationPermission() {
      if (Platform.OS === 'web') return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permissions rejected');
        return;
      }
    }
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setShowPrivacyMask(true);
      } else if (nextAppState === 'active') {
        setShowPrivacyMask(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />
      <AppTabs />
      
      {/* Privacy Mask Overlay for Background/Inactive App switcher */}
      {showPrivacyMask && (
        <View style={styles.privacyMaskContainer}>
          <ShieldAlert size={64} color="#FF6B00" />
          <Text style={styles.privacyMaskTitle}>Mezatliyoruz</Text>
          <Text style={styles.privacyMaskSubtitle}>İşlemleriniz ve verileriniz arka planda güvenle korunuyor...</Text>
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  privacyMaskContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#080E1C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    gap: 16,
    paddingHorizontal: 24,
  },
  privacyMaskTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  privacyMaskSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
