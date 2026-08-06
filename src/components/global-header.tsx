import React from 'react';
import { View, StyleSheet, Pressable, Text, Platform, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/services/store';
import { Heart, ShoppingCart, Bell, MessageSquare, User as UserIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlobalHeader() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const {
    currentUser,
    cart,
    logoutAccount,
    setCartModalVisible,
    setCheckoutStep,
    setAuthModalVisible,
    setAuthStep,
    setAuthMode
  } = useAppStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View style={[styles.header, { borderBottomColor: theme.backgroundSelected, backgroundColor: theme.background, paddingTop: Math.max(12, insets.top) }]}>
      <Pressable 
        style={styles.logoContainer}
        onPress={() => {
          router.push('/');
        }}
      >
        <Image 
          source={require('../../assets/images/mezatliyoruz-logo.png')} 
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
          onPress={() => alert('Bildirimleriniz bulunmamaktadır.')}
        >
          <Bell size={19} color={theme.text} />
        </Pressable>

        <Pressable 
          style={styles.headerIconButton}
          onPress={() => alert('Mesaj kutunuz boş.')}
        >
          <MessageSquare size={19} color={theme.text} />
        </Pressable>

        {currentUser ? (
          <Pressable 
            style={styles.headerIconButton}
            onPress={() => {
              logoutAccount();
              alert('Çıkış yapıldı.');
            }}
          >
            <UserIcon size={18} color={theme.gold} />
          </Pressable>
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
    backgroundColor: '#FF5500',
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
    borderColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  sellerHeaderBtnText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '800',
  },
  sellerHeaderBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sellerHeaderBadgeText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '800',
  },
  headerLoginBtn: {
    backgroundColor: '#FF6B00',
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
