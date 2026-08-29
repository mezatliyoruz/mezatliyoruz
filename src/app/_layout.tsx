import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Platform, AppState, View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, Component } from 'react';
import { useAppStore } from '@/services/store';
import { ShieldAlert } from 'lucide-react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ─── Global Error Boundary (web only for debugging) ───────────────────────────
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; info: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
    this.setState({ info: info?.componentStack || '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: '#0B132B' }}
          contentContainerStyle={{ padding: 24, paddingTop: 60 }}
        >
          <Text style={{ color: '#0969da', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            ⚠️ Uygulama Hatası (Geliştirici Modu)
          </Text>
          <Text style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, fontFamily: 'monospace' }}>
            {this.state.error?.toString()}
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}>
            {this.state.info}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
// ──────────────────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { startWebSocketSim, restoreSession, loadCMSData } = useAppStore();
  const [showPrivacyMask, setShowPrivacyMask] = React.useState(false);

  useEffect(() => {
    loadCMSData();
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
    <ErrorBoundary>
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style="dark" />
        <AnimatedSplashOverlay />
        <AppTabs />
        
        {/* Privacy Mask Overlay for Background/Inactive App switcher */}
        {showPrivacyMask && (
          <View style={styles.privacyMaskContainer}>
            <ShieldAlert size={64} color="#0969da" />
            <Text style={styles.privacyMaskTitle}>Mezatliyoruz</Text>
            <Text style={styles.privacyMaskSubtitle}>İşlemleriniz ve verileriniz arka planda güvenle korunuyor...</Text>
          </View>
        )}
      </ThemeProvider>
    </ErrorBoundary>
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
