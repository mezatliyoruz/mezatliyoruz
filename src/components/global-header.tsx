import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Platform, Image, Modal, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAppStore, getListingSeoUrl } from '@/services/store';
import { Heart, ShoppingCart, Bell, MessageSquare, User as UserIcon, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlobalHeader() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);

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

  return (
    <View style={[styles.header, { borderBottomColor: theme.backgroundSelected, backgroundColor: theme.background, paddingTop: Math.max(12, insets.top) }]}>
      <Pressable 
        style={styles.logoContainer}
        onPress={() => {
          router.push('/');
        }}
      >
        <Image 
          source={require('../../assets/images/mezatliyoruz-logo-both.png')} 
          style={styles.logoImage} 
        />
      </Pressable>

      <View style={styles.headerRightIcons}>
        <Pressable style={styles.headerIconButton} onPress={() => alert('Favorileriniz listeleniyor.')}>
          <Heart size={20} color={theme.text} />
        </Pressable>
        
        <Pressable 
          style={styles.headerIconButton}
          onPress={() => {
            setCheckoutStep('cart');
            setCartModalVisible(true);
          }}
        >
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
          <ShoppingCart size={19} color={theme.text} />
        </Pressable>



        <Pressable 
          style={styles.headerIconButton}
          onPress={() => setModalVisible(true)}
        >
          {unreadNotificationsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{unreadNotificationsCount}</Text>
            </View>
          )}
          <Bell size={19} color={theme.text} />
        </Pressable>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
            onPress={() => setModalVisible(false)}
          >
            <Pressable 
              style={{ 
                width: '100%', 
                maxWidth: 340, 
                backgroundColor: theme.backgroundElement || theme.background, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: theme.backgroundSelected,
                padding: 16, 
                maxHeight: '70%'
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected }}>
                <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 15 }}>Bildirimler</Text>
                {userNotifications.length > 0 && (
                  <Pressable onPress={() => clearNotifications()}>
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>Temizle</Text>
                  </Pressable>
                )}
              </View>

              {userNotifications.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
                  Bildiriminiz bulunmamaktadır.
                </Text>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 250 }}>
                  {userNotifications.map((n) => (
                    <Pressable 
                      key={n.id}
                      onPress={() => {
                        markNotificationAsRead(n.id);
                        if (n.type === 'cart') {
                          setModalVisible(false);
                          setCheckoutStep('cart');
                          setCartModalVisible(true);
                        } else if (n.type === 'product' && (n as any).productId) {
                          const pid = (n as any).productId;
                          const notifListing = useAppStore.getState().listings.find(l => l.id === pid);
                          setModalVisible(false);
                          if (notifListing) {
                            router.push(getListingSeoUrl(notifListing) as any);
                          } else {
                            router.push(`/product/${pid}` as any);
                          }
                        }
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 8,
                        borderRadius: 6,
                        backgroundColor: n.isRead ? 'transparent' : (scheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F5F9'),
                        marginBottom: 6,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 13, flex: 1 }}>{n.title}</Text>
                        {!n.isRead && (
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginTop: 3 }} />
                        )}
                      </View>
                      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 3 }}>{n.message}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              <Pressable 
                onPress={() => setModalVisible(false)}
                style={{
                  marginTop: 16,
                  backgroundColor: theme.gold,
                  height: 40,
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Kapat</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Pressable 
          style={styles.headerIconButton}
          onPress={() => router.push('/chat')}
        >
          <MessageSquare size={19} color={theme.text} />
        </Pressable>

        {currentUser ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable 
              onPress={() => router.push('/profile')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(9, 105, 218, 0.04)',
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 12,
                borderWidth: 0.5,
                borderColor: 'rgba(9, 105, 218, 0.1)',
              }}
            >
              <Text style={{ fontSize: 11, color: theme.text, fontWeight: '600', marginRight: 4 }}>
                {currentUser.name.split(' ')[0]}
              </Text>
              <UserIcon size={12} color={theme.gold} />
            </Pressable>
            <Pressable 
              style={styles.headerIconButton}
              onPress={() => {
                logoutAccount();
                alert('Çıkış yapıldı.');
              }}
            >
              <LogOut size={16} color={theme.textSecondary} />
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={styles.headerLoginBtn}
            onPress={() => {
              setAuthModalVisible(true);
              setAuthStep('login');
              setAuthMode('login');
            }}
          >
            <Text style={styles.headerLoginBtnText}>Giriş Yap</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    height: 54,
    width: 110,
    resizeMode: 'contain',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#0969da',
    borderRadius: 8,
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  sellerHeaderBtn: {
    borderWidth: 1.5,
    borderColor: '#0969da',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(9, 105, 218, 0.08)',
  },
  sellerHeaderBtnText: {
    color: '#0969da',
    fontSize: 11,
    fontWeight: '800',
  },
  sellerHeaderBadge: {
    backgroundColor: 'rgba(9, 105, 218, 0.15)',
    borderWidth: 1,
    borderColor: '#0969da',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sellerHeaderBadgeText: {
    color: '#0969da',
    fontSize: 10,
    fontWeight: '800',
  },
  headerLoginBtn: {
    backgroundColor: '#0969da',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  headerLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
