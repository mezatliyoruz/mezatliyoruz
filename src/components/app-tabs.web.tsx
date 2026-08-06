import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { Home, Gavel, MessageSquare, User } from 'lucide-react-native';

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs>
      <View style={[styles.mainLayout, isDesktop ? styles.desktopLayout : styles.mobileLayout]}>
        {/* Left Sidebar for Desktop Web */}
        {isDesktop && (
          <ThemedView type="backgroundElement" style={[styles.sidebar, { borderRightColor: theme.backgroundSelected }]}>
            <View style={styles.logoContainer}>
              <ThemedText style={styles.logoTextMain}>MEZAT</ThemedText>
              <ThemedText style={styles.logoTextSub}>LIYORUZ</ThemedText>
            </View>

            <TabList style={styles.sidebarTabList}>
              <TabTrigger name="index" href="/" asChild>
                <SidebarButton icon={Home} label="Ana Sayfa" />
              </TabTrigger>
              <TabTrigger name="auctions" href="/auctions" asChild>
                <SidebarButton icon={Gavel} label="Mezat & İlan" />
              </TabTrigger>
              <TabTrigger name="chat" href="/chat" asChild>
                <SidebarButton icon={MessageSquare} label="Sohbet" />
              </TabTrigger>
              <TabTrigger name="profile" href="/profile" asChild>
                <SidebarButton icon={User} label="Profilim" />
              </TabTrigger>
            </TabList>

            <View style={styles.sidebarFooter}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>v1.0.0 Beta</ThemedText>
            </View>
          </ThemedView>
        )}

        {/* Content Area */}
        <View style={styles.contentSlot}>
          <TabSlot style={{ height: '100%', width: '100%' }} />
        </View>

        {/* Bottom Tab Bar for Mobile Web */}
        {!isDesktop && (
          <ThemedView type="backgroundElement" style={[styles.bottomTabBar, { borderTopColor: theme.backgroundSelected }]}>
            <TabList style={styles.bottomTabList}>
              <TabTrigger name="index" href="/" asChild>
                <BottomTabButton icon={Home} label="Ana Sayfa" />
              </TabTrigger>
              <TabTrigger name="auctions" href="/auctions" asChild>
                <BottomTabButton icon={Gavel} label="Mezat" />
              </TabTrigger>
              <TabTrigger name="chat" href="/chat" asChild>
                <BottomTabButton icon={MessageSquare} label="Sohbet" />
              </TabTrigger>
              <TabTrigger name="profile" href="/profile" asChild>
                <BottomTabButton icon={User} label="Profil" />
              </TabTrigger>
            </TabList>
          </ThemedView>
        )}
      </View>
    </Tabs>
  );
}

interface NavButtonProps extends TabTriggerSlotProps {
  icon: React.ComponentType<any>;
  label: string;
}

function SidebarButton({ icon: Icon, label, isFocused, ...props }: NavButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable {...props} style={({ pressed }) => [
      styles.sidebarBtn,
      isFocused && { backgroundColor: theme.backgroundSelected, borderLeftColor: theme.gold, borderLeftWidth: 3 },
      pressed && { opacity: 0.8 }
    ]}>
      <Icon 
        size={22} 
        color={isFocused ? theme.gold : theme.textSecondary} 
        strokeWidth={isFocused ? 2.5 : 2}
      />
      <ThemedText 
        type="smallBold" 
        style={[
          styles.sidebarBtnText,
          { color: isFocused ? theme.text : theme.textSecondary }
        ]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function BottomTabButton({ icon: Icon, label, isFocused, ...props }: NavButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable {...props} style={({ pressed }) => [
      styles.bottomTabBtn,
      pressed && { opacity: 0.8 }
    ]}>
      <Icon 
        size={20} 
        color={isFocused ? theme.gold : theme.textSecondary} 
        strokeWidth={isFocused ? 2.5 : 2}
      />
      <ThemedText 
        type="code" 
        style={[
          styles.bottomTabBtnText,
          { color: isFocused ? theme.gold : theme.textSecondary, fontSize: 10 }
        ]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  desktopLayout: {
    flexDirection: 'row',
  },
  mobileLayout: {
    flexDirection: 'column-reverse',
  },
  sidebar: {
    width: 260,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)', // Thin boundary
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  logoTextMain: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF5500', // Raw Orange
    letterSpacing: 2,
  },
  logoTextSub: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // Crisp White
    letterSpacing: 4,
    marginTop: -4,
  },
  sidebarTabList: {
    flexDirection: 'column',
    gap: 12,
    flex: 1,
  },
  sidebarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 16,
  },
  sidebarBtnText: {
    fontSize: 16,
  },
  sidebarFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  contentSlot: {
    flex: 1,
    height: '100%',
  },
  bottomTabBar: {
    height: 64,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 4,
  },
  bottomTabList: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomTabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    gap: 4,
  },
  bottomTabBtnText: {
    marginTop: 2,
  },
});
