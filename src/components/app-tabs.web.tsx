import React, { useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  useColorScheme,
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Text,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { Home, Play, MessageSquare, User, Plus, ShoppingCart, Bell, LogOut } from 'lucide-react-native';
import GlobalCartModal from '@/components/global-cart-modal';
import GlobalAuthModal from '@/components/global-auth-modal';
import { useAppStore, getListingSeoUrl } from '@/services/store';

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Top Header Navigation Bar
// ─────────────────────────────────────────────────────────────────────────────
function DesktopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const [showNotifications, setShowNotifications] = useState(false);

  const {
    currentUser,
    cart,
    logoutAccount,
    setCartModalVisible,
    setCheckoutStep,
    setAuthModalVisible,
    setAuthStep,
    setAuthMode,
    notifications,
    markNotificationAsRead,
    clearNotifications
  } = useAppStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const userNotifications = (notifications || []).filter(
    (n) => n.userId === 'all' || (currentUser && n.userId === currentUser.id)
  );
  const unreadNotificationsCount = userNotifications.filter((n) => !n.isRead).length;

  const NAV_ITEMS = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/orders', label: 'Siparişlerim' },
    { href: '/my-listings', label: 'İlanlarım' },
  ];

  return (
    <View style={[
      styles.desktopHeaderContainer,
      { 
        backgroundColor: theme.background, 
        borderBottomColor: theme.backgroundSelected,
      }
    ]}>
      {/* Left: Logo */}
      <Pressable onPress={() => router.push('/')} style={styles.logoRow}>
        <Image 
          source={require('../../assets/images/mezatliyoruz-logo-both.png')} 
          style={styles.logoImage} 
        />
      </Pressable>

      {/* Center: Navigation Menu */}
      <View style={styles.desktopNavRow}>
        {NAV_ITEMS.map(({ href, label }) => {
          const isFocused = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Pressable
              key={href}
              onPress={() => {
                if (href !== '/' && !currentUser) {
                  useAppStore.setState({ authModalVisible: true, authStep: 'login', authMode: 'login' });
                } else {
                  router.push(href as any);
                }
              }}
              style={styles.desktopNavBtn}
            >
              <Text style={[
                styles.desktopNavBtnText,
                { color: isFocused ? '#0969da' : theme.textSecondary },
                isFocused && { fontWeight: 'bold' }
              ]}>
                {label}
              </Text>
              {isFocused && <View style={styles.desktopNavActiveLine} />}
            </Pressable>
          );
        })}
      </View>

      {/* Right: Actions */}
      <View style={styles.desktopActionsRow}>
        {/* Cart Icon */}
        <Pressable 
          style={styles.desktopHeaderIconButton}
          onPress={() => {
            setCheckoutStep('cart');
            setCartModalVisible(true);
          }}
        >
          {cartCount > 0 && (
            <View style={styles.desktopBadge}>
              <Text style={styles.desktopBadgeText}>{cartCount}</Text>
            </View>
          )}
          <ShoppingCart size={20} color={theme.text} />
        </Pressable>

        {/* Chat Icon */}
        <Pressable 
          style={styles.desktopHeaderIconButton}
          onPress={() => router.push('/chat')}
        >
          <MessageSquare size={20} color={theme.text} />
        </Pressable>

        {/* Notifications Icon */}
        <View style={{ position: 'relative' }}>
          <Pressable 
            style={styles.desktopHeaderIconButton}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            {unreadNotificationsCount > 0 && (
              <View style={styles.desktopBadge}>
                <Text style={styles.desktopBadgeText}>{unreadNotificationsCount}</Text>
              </View>
            )}
            <Bell size={20} color={theme.text} />
          </Pressable>

          {showNotifications && (
            <View style={{
              position: 'absolute',
              top: 46,
              right: 0,
              width: 320,
              backgroundColor: theme.backgroundElement || theme.background,
              borderColor: theme.backgroundSelected,
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected }}>
                <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 13 }}>Bildirimler</Text>
                {userNotifications.length > 0 && (
                  <Pressable onPress={() => clearNotifications()}>
                    <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '700' }}>Temizle</Text>
                  </Pressable>
                )}
              </View>

              {userNotifications.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center', paddingVertical: 12 }}>
                  Bildiriminiz bulunmamaktadır.
                </Text>
              ) : (
                <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                  {userNotifications.map((n) => (
                    <Pressable 
                      key={n.id}
                      onPress={() => {
                        markNotificationAsRead(n.id);
                        if (n.type === 'cart') {
                          setCheckoutStep('cart');
                          setCartModalVisible(true);
                        } else if (n.type === 'product' && (n as any).productId) {
                          const pid = (n as any).productId;
                          const notifListing = useAppStore.getState().listings.find(l => l.id === pid);
                          if (notifListing) {
                            router.push(getListingSeoUrl(notifListing) as any);
                          } else {
                            router.push(`/product/${pid}` as any);
                          }
                        }
                      }}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 6,
                        borderRadius: 4,
                        backgroundColor: n.isRead ? 'transparent' : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#F1F5F9'),
                        marginBottom: 4,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 12, flex: 1 }}>{n.title}</Text>
                        {!n.isRead && (
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginTop: 3 }} />
                        )}
                      </View>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>{n.message}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

         {/* Auth / Profile Area */}
        {currentUser ? (
          <View style={styles.desktopUserSection}>
            <Pressable onPress={() => router.push('/profile')}>
              <Text style={[styles.desktopUserName, { color: theme.text }]}>{currentUser.name}</Text>
            </Pressable>
            <Pressable 
              style={styles.desktopLogoutBtn} 
              onPress={() => {
                logoutAccount();
                alert('Çıkış yapıldı.');
              }}
            >
              <LogOut size={15} color={theme.textSecondary} />
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={styles.desktopLoginBtn}
            onPress={() => {
              setAuthModalVisible(true);
              setAuthStep('login');
              setAuthMode('login');
            }}
          >
            <Text style={styles.desktopLoginBtnText}>Giriş Yap</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Floating Action Button (FAB) for Create Listing
// ─────────────────────────────────────────────────────────────────────────────
function DesktopFloatingCreateBtn() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/create') return null;

  return (
    <Pressable
      onPress={() => router.push('/create')}
      style={({ pressed }) => [
        styles.floatingCreateBtn,
        pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }
      ]}
    >
      <Plus size={20} color="#fff" strokeWidth={2.5} />
      <Text style={styles.floatingCreateBtnText}>İlan Oluştur</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Bottom Tab Bar (Custom)
// ─────────────────────────────────────────────────────────────────────────────
function MobileWebTabBar({ state, navigation }: any) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const NAV_ITEMS = [
    { name: 'index', icon: Home, label: 'Ana Sayfa' },
    { name: 'auctions', icon: Play, label: 'Mezat' },
    { name: 'create', icon: Plus, label: '' },
    { name: 'chat', icon: MessageSquare, label: 'Sohbet' },
    { name: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <View style={[
      styles.bottomBar,
      { backgroundColor: theme.backgroundElement, borderTopColor: theme.backgroundSelected }
    ]}>
      {NAV_ITEMS.map(({ name, icon: Icon, label }) => {
        const route = state.routes.find((r: any) => r.name === name);
        if (!route) return null;
        const globalIdx = state.routes.indexOf(route);
        const isFocused = state.index === globalIdx;
        const isCreate = name === 'create';

        return (
          <Pressable
            key={name}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={({ pressed }) => [
              styles.bottomTabBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            {isCreate ? (
              <View style={styles.createBtnInner}>
                <Icon size={22} color="#fff" strokeWidth={2.5} />
              </View>
            ) : (
              <>
                <Icon
                  size={20}
                  color={isFocused ? theme.gold : theme.textSecondary}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
                {label ? (
                  <Text style={[styles.bottomTabLabel, { color: isFocused ? theme.gold : theme.textSecondary }]}>
                    {label}
                  </Text>
                ) : null}
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppTabs Root Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const SCREEN_OPTS = { headerShown: false };

  if (isDesktop) {
    // Desktop layout: Header top (fixed) + Content Area below (full page)
    return (
      <View style={[styles.root, { backgroundColor: theme.background, flexDirection: 'column' }]}>
        <DesktopHeader />
        <View style={styles.contentArea}>
          <Tabs
            tabBar={() => null}
            screenOptions={SCREEN_OPTS}
          >
            <Tabs.Screen name="index"            options={{ title: 'Ana Sayfa' }} />
            <Tabs.Screen name="auctions"          options={{ title: 'Mezat & İlan' }} />
            <Tabs.Screen name="create"            options={{ title: '' }} />
            <Tabs.Screen name="chat"              options={{ title: 'Sohbet' }} />
            <Tabs.Screen name="profile"           options={{ title: 'Profil' }} />
            <Tabs.Screen name="product/[id]"      options={{ href: null }} />
            <Tabs.Screen name="chat/[id]"         options={{ href: null }} />
            <Tabs.Screen name="featured-auction"  options={{ href: null }} />
            <Tabs.Screen name="seller/[name]"     options={{ href: null }} />
            <Tabs.Screen name="designs"           options={{ href: null }} />
            <Tabs.Screen name="orders"            options={{ href: null }} />
            <Tabs.Screen name="my-auctions"        options={{ href: null }} />
            <Tabs.Screen name="my-listings"        options={{ href: null }} />
          </Tabs>
        </View>
        <DesktopFloatingCreateBtn />
        <GlobalCartModal />
        <GlobalAuthModal />
      </View>
    );
  }

  // Mobile layout: Tabs with custom bottom bar
  return (
    <View style={[styles.root, { backgroundColor: theme.background, flexDirection: 'row' }]}>
      <Tabs
        tabBar={(props) => <MobileWebTabBar {...props} />}
        screenOptions={SCREEN_OPTS}
      >
        <Tabs.Screen name="index"            options={{ title: 'Ana Sayfa' }} />
        <Tabs.Screen name="auctions"          options={{ title: 'Mezat' }} />
        <Tabs.Screen name="create"            options={{ title: '' }} />
        <Tabs.Screen name="chat"              options={{ title: 'Sohbet' }} />
        <Tabs.Screen name="profile"           options={{ title: 'Profil' }} />
        <Tabs.Screen name="product/[id]"      options={{ href: null }} />
        <Tabs.Screen name="chat/[id]"         options={{ href: null }} />
        <Tabs.Screen name="featured-auction"  options={{ href: null }} />
        <Tabs.Screen name="seller/[name]"     options={{ href: null }} />
        <Tabs.Screen name="designs"           options={{ href: null }} />
        <Tabs.Screen name="orders"            options={{ href: null }} />
        <Tabs.Screen name="my-auctions"        options={{ href: null }} />
        <Tabs.Screen name="my-listings"        options={{ href: null }} />
      </Tabs>
      <GlobalCartModal />
      <GlobalAuthModal />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
  },
  desktopHeaderContainer: {
    height: 88,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.04)',
    zIndex: 1000,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoImage: {
    height: 72,
    width: 270,
    resizeMode: 'contain',
  },
  logoTextMain: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#0969da',
  },
  logoTextSub: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  desktopNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 40,
  },
  desktopNavBtn: {
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  desktopNavBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  desktopNavActiveLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0969da',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  desktopActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  desktopHeaderIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(9, 105, 218, 0.05)',
  },
  desktopBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 10,
  },
  desktopBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  desktopUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(9, 105, 218, 0.04)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(9, 105, 218, 0.1)',
  },
  desktopUserName: {
    fontSize: 13,
    fontWeight: '600',
  },
  desktopLogoutBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(9, 105, 218, 0.08)',
  },
  desktopLoginBtn: {
    backgroundColor: '#0969da',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    boxShadow: '0 2px 6px rgba(9, 105, 218, 0.2)',
  },
  desktopLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contentArea: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  floatingCreateBtn: {
    ...Platform.select({
      web: {
        position: 'fixed',
      },
      default: {
        position: 'absolute',
      }
    }),
    bottom: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0969da',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    boxShadow: '0px 4px 16px rgba(9, 105, 218, 0.3)',
    zIndex: 9999,
    gap: 8,
  },
  floatingCreateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // ── Mobile Layout ──────────────────────────────────────────────────────────
  bottomBar: {
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
    height: '100%',
  },
  createBtnInner: {
    width: 48,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0969da',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});

