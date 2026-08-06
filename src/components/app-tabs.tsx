import React from 'react';
import { Tabs } from 'expo-router';
import {
  useColorScheme,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import { Home, Play, MessageSquare, User, Plus } from 'lucide-react-native';
import GlobalCartModal from '@/components/global-cart-modal';
import GlobalAuthModal from '@/components/global-auth-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VISIBLE_TAB_NAMES = ['index', 'auctions', 'create', 'chat', 'profile'];

// SVG viewBox: 375 x 80
// Path notch: sol 130px, sağ 245px, merkez 187.5px, notch derinliği 24px
// Biz bunu ekran genişliğine scale edeceğiz

function NotchBackground({ width, height, notchWidth, notchDepth, bg }: { width: number; height: number; notchWidth: number; notchDepth: number; bg: string }) {
  const center = width / 2;
  const startX = center - notchWidth / 2;
  const endX = center + notchWidth / 2;

  // Custom bezier curve path for smooth notch dip
  const path = `
    M 0 0
    L ${startX} 0
    C ${startX + 15} 0, ${startX + 20} ${notchDepth}, ${startX + 32.5} ${notchDepth}
    C ${startX + 45} ${notchDepth}, ${startX + 50} ${notchDepth}, ${center} ${notchDepth}
    C ${endX - 50} ${notchDepth}, ${endX - 45} ${notchDepth}, ${endX - 32.5} ${notchDepth}
    C ${endX - 20} ${notchDepth}, ${endX - 15} 0, ${endX} 0
    L ${width} 0
    L ${width} ${height}
    L 0 ${height}
    Z
  `;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Path d={path} fill={bg} />
    </Svg>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();

  const BAR_H = 64;         // Compact height
  const NOTCH_W = 100;      // Notch width
  const NOTCH_D = 18;       // Notch dip depth

  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || (Platform.OS === 'ios' ? 20 : 0);
  const totalHeight = BAR_H + bottomInset;

  const BG = theme.backgroundElement;
  const GOLD = theme.gold;
  const MUTED = theme.textSecondary;

  const routes = state.routes.filter((r: any) => VISIBLE_TAB_NAMES.includes(r.name));

  const TAB_ICONS: Record<string, (c: string, f: boolean) => React.ReactNode> = {
    index:    (c, f) => <Home size={22} color={c} strokeWidth={f ? 2.5 : 2} />,
    auctions: (c, f) => <Play size={22} color={c} fill={f ? c : 'transparent'} strokeWidth={f ? 2.5 : 2} />,
    create:   () => null,
    chat:     (c, f) => <MessageSquare size={22} color={c} strokeWidth={f ? 2.5 : 2} />,
    profile:  (c, f) => <User size={22} color={c} strokeWidth={f ? 2.5 : 2} />,
  };

  const TAB_LABELS: Record<string, string> = {
    index: 'Ana Sayfa', auctions: 'Reels', create: '', chat: 'Sohbet', profile: 'Profil',
  };

  const createRoute = routes.find((r: any) => r.name === 'create');
  const handleCreatePress = () => {
    if (createRoute) {
      const event = navigation.emit({ type: 'tabPress', target: createRoute.key, canPreventDefault: true });
      if (!event.defaultPrevented) navigation.navigate(createRoute.name);
    }
  };

  return (
    <View style={{ height: totalHeight, width, position: 'relative' }}>
      {/* SVG background with dynamic notch path */}
      <NotchBackground width={width} height={totalHeight} notchWidth={NOTCH_W} notchDepth={NOTCH_D} bg={BG} />

      {/* Tab icons row */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: bottomInset,
        flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 8,
        zIndex: 10,
      }}>
        {routes.map((route: any) => {
          const globalIdx = state.routes.indexOf(route);
          const isFocused = state.index === globalIdx;
          const isCreate = route.name === 'create';
          const color = isFocused && !isCreate ? GOLD : MUTED;
          const label = TAB_LABELS[route.name] ?? '';
          const iconFn = TAB_ICONS[route.name];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (isCreate) {
            // Empty placeholder to keep the flex layout width correct
            return <View key={route.key} style={{ flex: 1 }} />;
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabCell}>
              {iconFn && iconFn(color, isFocused)}
              {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      {/* Absolutely positioned central button inside the notch */}
      <Pressable
        onPress={handleCreatePress}
        style={[
          styles.plusBtn,
          {
            position: 'absolute',
            top: -10, // Center it vertically on the notch curve
            left: width / 2 - 37.5, // Center it horizontally (75 / 2 = 37.5)
            zIndex: 20,
          },
          Platform.OS === 'ios' ? { shadowColor: '#FF6B00' } : {}
        ]}
        android_ripple={{ color: 'rgba(255,255,255,0.25)', radius: 34 }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
        <Tabs.Screen name="auctions" options={{ title: 'Reels' }} />
        <Tabs.Screen name="create" options={{ title: '', headerShown: false }} />
        <Tabs.Screen name="chat" options={{ title: 'Sohbet' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
        <Tabs.Screen name="product/[id]" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="chat/[id]" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="featured-auction" options={{ href: null, headerShown: false }} />
      </Tabs>
      <GlobalCartModal />
      <GlobalAuthModal />
    </View>
  );
}

const styles = StyleSheet.create({
  tabCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  plusBtn: {
    width: 75,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
});
