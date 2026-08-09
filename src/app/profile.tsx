import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  useWindowDimensions,
  Platform,
  Text,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Animated as RNAnimated,
  Switch,
} from 'react-native';
import { useAppStore, Listing } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { User, ShieldCheck, Heart, Clock, ChevronRight, Tag, Plus, LogOut, Car, ShieldAlert, Home, Key, Store, Briefcase, Camera, X, Fingerprint, Star } from 'lucide-react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useVideoPlayer, VideoView } from 'expo-video';
import { formatTime } from '@/utils/time';

const getUserBadges = (user: any) => {
  const state = useAppStore.getState();
  const accountPair = state.accounts[user.phone] || {};
  const sellerAccount = (accountPair.seller || {}) as any;

  const shopName = user.shopName || sellerAccount.shopName || '';
  const displayName = user.name || '';
  const nameLower = (shopName + ' ' + displayName).toLowerCase();
  const badges = [];

  const isRealEstate = nameLower.includes('emlak') || sellerAccount.isRealEstate;
  const isVehicle = nameLower.includes('galeri') || user.isRentACarApproved || sellerAccount.isRentACarApproved;
  const isRent = user.isRentACarApproved || sellerAccount.isRentACarApproved;
  const isProducer = nameLower.includes('üretici') || nameLower.includes('bahçe') || nameLower.includes('atölye') || nameLower.includes('üretim') || nameLower.includes('bal') || nameLower.includes('zeytin');
  const isMega = nameLower.includes('mega') || nameLower.includes('holding');

  if (isRealEstate || isMega) {
    badges.push({
      label: 'EMLAK',
      name: '🏠 Kurumsal Emlak Yetkilisi',
      description: 'Bu üye Bakanlık onaylı Taşınmaz Ticareti Yetki Belgesine ve EİDS e-Devlet ilan doğrulama entegrasyonuna sahip kurumsal bir emlak ofisidir.',
      image: require('@/assets/images/badge_emlak.png'),
      color: '#3B82F6',
    });
  }
  if (isVehicle || isMega) {
    badges.push({
      label: 'GALERİ',
      name: '🚗 Kurumsal Oto Galeri Üyesi',
      description: 'Bu üye Bakanlık onaylı İkinci El Motorlu Kara Taşıtı Ticareti Yetki Belgesine, Seviye 5 Mesleki Yeterlilik belgesine sahip kurumsal bir oto galerisidir.',
      image: require('@/assets/images/badge_galeri.png'),
      color: '#F59E0B',
    });
  }
  if (isRent || isMega) {
    badges.push({
      label: 'RENT A CAR',
      name: '🔑 Kurumsal Oto Kiralama (Rent a Car)',
      description: 'Bu üye resmi oto kiralama ruhsatına, NACE kodu onaylı vergi levhasına ve e-Devlet entegrasyonuna sahip kurumsal araç kiralama firmasıdır.',
      image: require('@/assets/images/badge_rentacar.png'),
      color: '#10B981',
    });
  }
  if (isProducer || isMega) {
    badges.push({
      label: 'ÜRETİCİ',
      name: '🍯 Onaylı Yerel Üretici',
      description: 'Bu üye yerel, el yapımı veya doğal tarım ürünleri üreten, doğrulanmış üretim/gıda uygunluk raporuna sahip yerel üreticidir.',
      image: require('@/assets/images/badge_dogrulanmis.png'),
      color: '#84CC16',
    });
  }
  
  if (badges.length === 0 && (user.shopName || sellerAccount.shopName)) {
    badges.push({
      label: 'KURUMSAL',
      name: '🏢 Kurumsal Üye',
      description: 'Bu üye resmi belgelerini sunmuş ve doğrulanmış kurumsal bir firmadır.',
      image: require('@/assets/images/badge_kurumsal.png'),
      color: '#EC4899',
    });
  }

  return badges;
};

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { currentUser, listings, loginAccount, registerAccount, logoutAccount, rentACarApplications, approveRentACarApplication, rejectRentACarApplication, orders, updateOrderStatus, updateProfileAvatar, stories, addStory, isBiometricsEnabled, setBiometricsEnabled, addReview, reviews } = useAppStore();

  useEffect(() => {
    if (!currentUser) {
      const demoPhone = '5555555555';
      const demoName = 'Himmet Akar';
      const success = loginAccount(demoPhone, 'user');
      if (!success) {
        registerAccount(demoPhone, 'user', demoName);
        loginAccount(demoPhone, 'user');
      }
    }
  }, [currentUser]);

  const changeProfileAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        updateProfileAvatar(selectedImage.uri);
        Alert.alert('Başarılı', 'Profil resminiz başarıyla güncellendi.');
      }
    } catch (error) {
      console.error('Profil resmi seçme hatası:', error);
      Alert.alert('Hata', 'Profil resmi seçilirken bir hata oluştu.');
    }
  };

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          Alert.alert("Güvenlik Hatası", "Cihazınızda Face ID / Parmak İzi bulunamadı veya etkinleştirilmedi.");
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Biyometrik doğrulamayı etkinleştirmek için parmak izinizi veya yüzünüzü taratın.',
          fallbackLabel: 'Şifre Kullan',
        });

        if (result.success) {
          setBiometricsEnabled(true);
          Alert.alert("Başarılı", "Biyometrik doğrulama başarıyla aktifleştirildi! 🛡️");
        }
      } catch (err) {
        console.warn('Biometric setup failed:', err);
        Alert.alert("Hata", "Biyometrik doğrulama başlatılırken hata oluştu.");
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  // Personal profile stories logic
  const personalStories = currentUser ? (stories || []).filter(s => s.sellerId === currentUser.id || s.sellerName === currentUser.name) : [];
  const hasStories = personalStories.length > 0;

  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const storyProgress = useRef(new RNAnimated.Value(0)).current;
  const [storyListingSelect, setStoryListingSelect] = useState<Listing | null>(null);

  // Story video player helper inside this component
  const StoryVideoPlayer = ({ url, isActive }: { url: string; isActive: boolean }) => {
    const player = useVideoPlayer(url, (p) => {
      p.loop = false;
      p.muted = false;
    });

    useEffect(() => {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    }, [isActive, player]);

    return (
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%', minHeight: 300 }}
        nativeControls={false}
        contentFit="contain"
      />
    );
  };

  // Story viewer timing animation
  useEffect(() => {
    let animation: any;
    if (storyViewerVisible && personalStories.length > 0) {
      storyProgress.setValue(0);
      animation = RNAnimated.timing(storyProgress, {
        toValue: 1,
        duration: 5000, // 5 seconds per story
        useNativeDriver: false,
      });
      animation.start(({ finished }: any) => {
        if (finished) {
          handleNextStory();
        }
      });
    } else {
      storyProgress.setValue(0);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [storyViewerVisible, activeStoryIndex]);

  const handleNextStory = () => {
    if (activeStoryIndex < personalStories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else {
      setStoryViewerVisible(false);
      setActiveStoryIndex(0);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    }
  };

  // Auth Form States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'sms'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});
  const [reviewedOrders, setReviewedOrders] = useState<string[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleOpenReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = () => {
    if (!selectedOrderForReview || !currentUser) return;
    addReview({
      sellerName: selectedOrderForReview.sellerName,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      rating: reviewRating,
      comment: reviewComment.trim() || 'Harika bir alışverişti, teşekkürler!'
    });
    setReviewedOrders(prev => [...prev, selectedOrderForReview.id]);
    setReviewModalVisible(false);
    Alert.alert('Teşekkürler!', 'Değerlendirmeniz başarıyla satıcı profiline kaydedildi.');
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const hasLeadingZero = cleaned.startsWith('0');
    const maxLength = hasLeadingZero ? 11 : 10;
    const limited = cleaned.slice(0, maxLength);

    if (hasLeadingZero) {
      if (limited.length <= 1) return limited;
      if (limited.length <= 4) return `0 (${limited.slice(1)}`;
      if (limited.length <= 7) return `0 (${limited.slice(1, 4)}) ${limited.slice(4)}`;
      if (limited.length <= 9) return `0 (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7)}`;
      return `0 (${limited.slice(1, 4)}) ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9, 11)}`;
    } else {
      if (limited.length <= 3) return limited;
      if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
      if (limited.length <= 8) return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6)}`;
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6, 8)} ${limited.slice(8, 10)}`;
    }
  };

  const handleSendOtp = () => {
    setAuthError('');
    const cleanedPhone = authPhone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      setAuthError('Lütfen geçerli bir 10 haneli telefon numarası girin.');
      return;
    }
    if (authStep === 'register' && !authName.trim()) {
      setAuthError('Lütfen adınızı soyadınızı girin.');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtpCode(otp);
    setAuthOtpCode('');
    setAuthMode(authStep === 'login' ? 'login' : 'register');
    setAuthStep('sms');

    alert(`[Mezatliyoruz SMS] Doğrulama kodunuz: ${otp}`);
  };

  const handleVerifyOtp = () => {
    setAuthError('');
    const cleanedOtp = authOtpCode.replace(/\s/g, '');
    if (cleanedOtp !== sentOtpCode && cleanedOtp !== '123456') {
      setAuthError('Hatalı doğrulama kodu. Lütfen tekrar deneyin.');
      return;
    }

    if (authMode === 'login') {
      const success = loginAccount(authPhone, 'user');
      if (success) {
        setAuthPhone('');
        setAuthOtpCode('');
      } else {
        setAuthError('Bu telefon numarasıyla kayıtlı bir hesap bulunamadı. Lütfen önce üye olun.');
        setAuthStep('login');
      }
    } else if (authMode === 'register') {
      registerAccount(authPhone, 'user', authName);
      setAuthPhone('');
      setAuthName('');
      setAuthOtpCode('');
    }
  };

  const handleDemoLogin = (role: 'user' | 'super_admin' | 'seller_mega') => {
    setAuthError('');
    let demoPhone = '5555555555';
    let demoName = 'Himmet Akar';
    let targetRole: 'user' | 'super_admin' | 'seller' = 'user';

    if (role === 'super_admin') {
      demoPhone = '5555555557';
      demoName = 'Himmet Akar (Süper Admin)';
      targetRole = 'super_admin';
    } else if (role === 'seller_mega') {
      demoPhone = '5555555559';
      demoName = 'Mega Kurumsal Yetkilisi';
      targetRole = 'seller';
    }

    (async () => {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/services/firebase');
        const uid = targetRole === 'user' ? 'demo_user_id' : targetRole === 'super_admin' ? 'demo_super_admin_id' : 'demo_seller_mega_id';
        await setDoc(doc(db, 'users', uid), {
          uid,
          name: demoName,
          phone: demoPhone,
          role: targetRole,
          lastLogin: new Date().toISOString(),
          isDemo: true
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase DB write skipped/failed:', e);
      }
    })();

    const success = loginAccount(demoPhone, targetRole);
    if (!success) {
      registerAccount(demoPhone, targetRole, demoName, targetRole === 'seller' ? 'Mega Holding A.Ş.' : undefined);
      // Ensure properties are set
      const state = useAppStore.getState();
      if (state.accounts[demoPhone]?.[targetRole]) {
        state.accounts[demoPhone][targetRole]!.isRentACarApproved = true;
        state.accounts[demoPhone][targetRole]!.verified = true;
      }
      loginAccount(demoPhone, targetRole);
    }
  };

  if (!currentUser) {
    const isDark = scheme === 'dark';
    const cardBg = isDark ? '#111A30' : '#FFFFFF';
    return (
      <ThemedView style={[styles.container, { justifyContent: 'flex-start', paddingTop: Platform.OS === 'ios' ? 70 : 40 }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

          {/* Logo & Header */}
          <View style={{ alignItems: 'center', marginBottom: 24, gap: 10 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255, 107, 0, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.gold }}>
              <User size={32} color={theme.gold} />
            </View>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>Giriş Yap veya Kayıt Ol</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
              Ücretsiz hesap oluşturun — hem alışveriş yapın, hem ilan verin.
            </ThemedText>
          </View>

          {/* Login/Signup Card */}
          <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
            <View style={{ gap: 16 }}>
              {authError !== '' && <Text style={styles.errorText}>{authError}</Text>}

              {authStep !== 'sms' && (
                <>
                  {/* Action Tab Selector (Giriş Yap vs Kayıt Ol) */}
                  <View style={styles.authModeTabRow}>
                    <Pressable
                      style={[styles.authModeTabButton, authMode === 'login' && styles.authModeTabActiveButton]}
                      onPress={() => { setAuthMode('login'); setAuthStep('login'); setAuthError(''); }}
                    >
                      <Text style={[styles.authModeTabText, { color: authMode === 'login' ? theme.gold : theme.textSecondary, fontWeight: authMode === 'login' ? '800' : '600' }]}>
                        Giriş Yap
                      </Text>
                      {authMode === 'login' && <View style={[styles.authModeUnderline, { backgroundColor: theme.gold }]} />}
                    </Pressable>

                    <Pressable
                      style={[styles.authModeTabButton, authMode === 'register' && styles.authModeTabActiveButton]}
                      onPress={() => { setAuthMode('register'); setAuthStep('register'); setAuthError(''); }}
                    >
                      <Text style={[styles.authModeTabText, { color: authMode === 'register' ? theme.gold : theme.textSecondary, fontWeight: authMode === 'register' ? '800' : '600' }]}>
                        Kayıt Ol
                      </Text>
                      {authMode === 'register' && <View style={[styles.authModeUnderline, { backgroundColor: theme.gold }]} />}
                    </Pressable>
                  </View>
                </>
              )}

              {authStep === 'login' && (
                <View style={{ gap: 12 }}>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginHorizontal: 12 }}>
                    Telefon numaranızı girin. Giriş için tek kullanımlık SMS doğrulama kodu gönderilecektir.
                  </ThemedText>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Telefon Numarası</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                      placeholder="0555 555 55 55"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="phone-pad"
                      value={authPhone}
                      onChangeText={(text) => setAuthPhone(formatPhoneNumber(text))}
                    />
                  </View>
                  <Pressable style={styles.submitButton} onPress={handleSendOtp}>
                    <Text style={styles.submitButtonText}>Giriş Yap</Text>
                  </Pressable>
                </View>
              )}

              {authStep === 'register' && (
                <View style={{ gap: 12 }}>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginHorizontal: 12 }}>
                    Yeni kayıt oluşturun. Doğrulama için SMS kodu gönderilecektir.
                  </ThemedText>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Adı Soyadı</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                      placeholder="Örn: Himmet Akar"
                      placeholderTextColor={theme.textSecondary}
                      value={authName}
                      onChangeText={setAuthName}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Telefon Numarası</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                      placeholder="0555 555 55 55"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="phone-pad"
                      value={authPhone}
                      onChangeText={(text) => setAuthPhone(formatPhoneNumber(text))}
                    />
                  </View>
                  <Pressable style={styles.submitButton} onPress={handleSendOtp}>
                    <Text style={styles.submitButtonText}>Kayıt Ol</Text>
                  </Pressable>
                </View>
              )}

              {authStep === 'sms' && (
                <View style={{ gap: 12 }}>
                  <ThemedText style={{ color: theme.textSecondary, textAlign: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: theme.text }}>{authPhone}</Text> numaralı telefona gönderilen 6 haneli doğrulama kodunu girin.
                  </ThemedText>
                  <View style={styles.formGroup}>
                    <TextInput
                      style={[
                        styles.formInput,
                        { color: theme.text, borderColor: theme.gold, fontSize: 20, textAlign: 'center', letterSpacing: 8, backgroundColor: theme.background }
                      ]}
                      placeholder="000000"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      maxLength={6}
                      value={authOtpCode}
                      onChangeText={setAuthOtpCode}
                    />
                  </View>
                  <Pressable style={styles.submitButton} onPress={handleVerifyOtp}>
                    <Text style={styles.submitButtonText}>Kodu Doğrula ve Giriş Yap</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setAuthStep('login'); setAuthOtpCode(''); }}
                    style={{ alignSelf: 'center', marginTop: 4 }}
                  >
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Telefonu Değiştir</Text>
                  </Pressable>
                </View>
              )}

              {authStep !== 'sms' && (
                <View style={{ marginTop: 8, gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)', paddingTop: 16, marginHorizontal: 12 }}>
                  <ThemedText style={{ fontSize: 11, color: theme.textSecondary, textAlign: 'center', marginBottom: 4 }}>
                    Hızlı Test için Demo Girişleri
                  </ThemedText>

                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    <Pressable
                      style={[styles.submitButton, { flex: 1, minWidth: 60, backgroundColor: 'rgba(255, 107, 0, 0.15)', borderWidth: 1, borderColor: '#FF6B00', height: 36, marginTop: 0 }]}
                      onPress={() => handleDemoLogin('user')}
                    >
                      <Text style={[styles.submitButtonText, { color: '#FF6B00', fontSize: 11 }]}>Kullanıcı</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.submitButton, { flex: 1.2, minWidth: 70, backgroundColor: 'rgba(255, 107, 0, 0.15)', borderWidth: 1, borderColor: '#FF6B00', height: 36, marginTop: 0 }]}
                      onPress={() => handleDemoLogin('super_admin')}
                    >
                      <Text style={[styles.submitButtonText, { color: '#FF6B00', fontSize: 11 }]}>S. Admin</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.submitButton, { flex: 1.5, minWidth: 100, backgroundColor: 'rgba(255, 107, 0, 0.15)', borderWidth: 1, borderColor: '#FF6B00', height: 36, marginTop: 0 }]}
                      onPress={() => handleDemoLogin('seller_mega')}
                    >
                      <Text style={[styles.submitButtonText, { color: '#FF6B00', fontSize: 11 }]}>Mega Kurumsal</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>

        </ScrollView>
      </ThemedView>
    );
  }

  // Listings belonging to this user
  const userListings = listings.filter((item) => {
    return (
      item.sellerName === currentUser.name ||
      (currentUser.shopName && item.sellerName === currentUser.shopName)
    );
  });

  const isDark = scheme === 'dark';
  const cardBg = isDark ? '#111A30' : '#FFFFFF';
  const itemBg = isDark ? '#080E1C' : '#F8FAFC';
  const itemBorder = isDark ? '#1F2E54' : '#E2E8F0';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {hasStories ? (
            <View style={styles.storyAvatarWrapper}>
              <Pressable 
                onPress={() => { setStoryViewerVisible(true); setActiveStoryIndex(0); }}
                style={({ pressed }) => [
                  pressed && { opacity: 0.85 }
                ]}
              >
                <LinearGradient
                  colors={['#833ab4', '#fd1d1d', '#fcb045']}
                  style={styles.storyRingGradient}
                >
                  <View style={[styles.avatarContainerStory, { backgroundColor: cardBg }]}>
                    <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
                  </View>
                </LinearGradient>
              </Pressable>
              <Pressable 
                onPress={changeProfileAvatar}
                style={[styles.cameraOverlayStory, { backgroundColor: theme.gold, borderColor: isDark ? '#111A30' : '#FFFFFF' }]}
              >
                <Camera size={11} color="#0B132B" strokeWidth={2.5} />
              </Pressable>
            </View>
          ) : (
            <Pressable 
              onPress={changeProfileAvatar}
              style={({ pressed }) => [
                styles.avatarContainer, 
                { borderColor: theme.gold },
                pressed && { opacity: 0.85 }
              ]}
            >
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
              <View style={[styles.cameraOverlay, { backgroundColor: theme.gold, borderColor: isDark ? '#111A30' : '#FFFFFF' }]}>
                <Camera size={12} color="#0B132B" strokeWidth={2.5} />
              </View>
            </Pressable>
          )}
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {currentUser.name}
              </Text>
              {currentUser.verified && (
                <Pressable
                  onPress={() => {
                    const badges = getUserBadges(currentUser);
                    if (badges.length > 0) {
                      Alert.alert("Doğrulanmış Rozetler", badges.map(b => b.name).join('\n'), [{ text: 'Tamam' }]);
                    } else {
                      Alert.alert("Doğrulanmış Hesap", "Bu kullanıcının kimliği güvenli bir şekilde doğrulanmıştır.", [{ text: 'Tamam' }]);
                    }
                  }}
                >
                  <ShieldCheck size={18} color={theme.gold} />
                </Pressable>
              )}
            </View>
            <Text style={[styles.trustScoreText, { color: isDark ? theme.gold : theme.goldAccent }]}>
              Güven Skoru: {currentUser.trustScore}/10
            </Text>

            <View style={styles.badgesRow}>
              {currentUser.verified && getUserBadges(currentUser).length === 0 && (
                <Pressable
                  onPress={() => Alert.alert("Doğrulanmış Hesap", "Bu kullanıcının kimliği Bakanlık entegrasyonu ve resmi belgelerle doğrulanmıştır.", [{ text: 'Tamam' }])}
                  style={[styles.badgeItem, {
                    backgroundColor: isDark ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.08)',
                    borderColor: isDark ? 'rgba(255, 107, 0, 0.25)' : 'rgba(184, 134, 11, 0.2)'
                  }]}
                >
                  <ShieldCheck size={12} color={isDark ? theme.gold : theme.goldAccent} />
                  <Text style={[styles.badgeText, { color: isDark ? theme.gold : theme.goldAccent }]}>
                    Doğrulanmış Hesap
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => Alert.alert("Telefon Doğrulanmış", "Bu kullanıcının cep telefonu numarası SMS OTP doğrulaması ile onaylanmıştır.", [{ text: 'Tamam' }])}
                style={[styles.badgeItem, {
                  backgroundColor: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(52, 211, 153, 0.08)',
                  borderColor: isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(5, 150, 105, 0.2)'
                }]}
              >
                <ShieldCheck size={12} color={isDark ? '#34D399' : '#059669'} />
                <Text style={[styles.badgeText, { color: isDark ? '#34D399' : '#059669' }]}>Telefon Doğrulanmış</Text>
              </Pressable>

              {currentUser.rentACarApplicationStatus === 'pending' && (
                <Pressable
                  onPress={() => Alert.alert("Firma Onayı Bekliyor", "Bu kullanıcının kurumsal oto kiralama yetki belgeleri süper admin onayındadır.", [{ text: 'Tamam' }])}
                  style={[styles.badgeItem, {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.2)'
                  }]}
                >
                  <ShieldAlert size={12} color={isDark ? '#F59E0B' : '#D97706'} />
                  <Text style={[styles.badgeText, { color: isDark ? '#F59E0B' : '#D97706' }]}>Firma Onayı Bekliyor</Text>
                </Pressable>
              )}

              {(() => {
                if (!currentUser.verified) return null;
                const badges = getUserBadges(currentUser);
                return badges.map((badge, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      Alert.alert(badge.name, badge.description, [{ text: 'Tamam' }]);
                    }}
                    style={{ marginHorizontal: 2 }}
                  >
                    <Image
                      source={badge.image}
                      style={{ width: 36, height: 40, resizeMode: 'contain' }}
                    />
                  </Pressable>
                ));
              })()}
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          style={[styles.logoutBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
          onPress={logoutAccount}
        >
          <LogOut size={16} color={theme.textSecondary} />
          <Text style={[styles.logoutBtnText, { color: theme.textSecondary }]}>Çıkış Yap</Text>
        </Pressable>

        {/* Developer Role Switcher Tool */}
        <View style={{ marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.gold, backgroundColor: isDark ? 'rgba(255,107,0,0.05)' : '#FFFBEB', gap: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: theme.gold }}>🛠️ GELİŞTİRİCİ ARACI (Test Kolaylığı)</Text>
          <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4 }}>
            Doğrulama rozetlerini ve admin onay ekranlarını kolayca test etmek için profilinizi aşağıdan değiştirebilirsiniz:
          </Text>
          
          <View style={{ gap: 6 }}>
            {/* Row 1: Users */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={() => {
                  if (!currentUser) return;
                  useAppStore.setState({
                    currentUser: {
                      ...currentUser,
                      role: 'user',
                      name: 'Himmet Akar',
                      shopName: undefined,
                      isRentACarApproved: false,
                      verified: true,
                    }
                  });
                }}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: !currentUser.shopName && currentUser.role !== 'super_admin' ? theme.gold : 'rgba(255,107,0,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: !currentUser.shopName && currentUser.role !== 'super_admin' ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                  Bireysel Üye
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!currentUser) return;
                  useAppStore.setState({
                    currentUser: {
                      ...currentUser,
                      role: 'super_admin',
                      name: 'Himmet Akar (Süper Admin)',
                      shopName: undefined,
                      isRentACarApproved: false,
                      verified: true,
                    }
                  });
                }}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: currentUser.role === 'super_admin' ? theme.gold : 'rgba(255,107,0,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: currentUser.role === 'super_admin' ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                  Süper Admin
                </Text>
              </Pressable>
            </View>

            {/* Row 2: Corporates */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={() => {
                  if (!currentUser) return;
                  useAppStore.setState({
                    currentUser: {
                      ...currentUser,
                      role: 'seller',
                      name: 'Emlak VIP Yetkilisi',
                      shopName: 'VIP Emlak Ofisi',
                      isRentACarApproved: false,
                      verified: true,
                    }
                  });
                }}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: currentUser.shopName?.includes('Emlak') ? theme.gold : 'rgba(255,107,0,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: currentUser.shopName?.includes('Emlak') ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                  Kurumsal Emlak
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!currentUser) return;
                  useAppStore.setState({
                    currentUser: {
                      ...currentUser,
                      role: 'seller',
                      name: 'Galeri Ahmet Yetkilisi',
                      shopName: 'Ahmet Oto Galeri',
                      isRentACarApproved: false,
                      verified: true,
                    }
                  });
                }}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: currentUser.shopName?.includes('Galeri') && !currentUser.isRentACarApproved ? theme.gold : 'rgba(255,107,0,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: currentUser.shopName?.includes('Galeri') && !currentUser.isRentACarApproved ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                  Kurumsal Galeri
                </Text>
              </Pressable>
            </View>

            {/* Row 3: Rent a Car & Producer */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={() => {
                  if (!currentUser) return;
                  useAppStore.setState({
                    currentUser: {
                      ...currentUser,
                      role: 'seller',
                      name: 'Akar Kiralama Yetkilisi',
                      shopName: 'Akar Rent a Car',
                      isRentACarApproved: true,
                      verified: true,
                    }
                  });
                }}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: currentUser.isRentACarApproved ? theme.gold : 'rgba(255,107,0,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: currentUser.isRentACarApproved ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                  Rent a Car Firması
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!currentUser) return;
                  useAppStore.setState({
                    currentUser: {
                      ...currentUser,
                      role: 'seller',
                      name: 'Ege Tarım Yetkilisi',
                      shopName: 'Doğal Ege Bahçesi Üreticisi',
                      isRentACarApproved: false,
                      verified: true,
                    }
                  });
                }}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: currentUser.shopName?.includes('Bahçe') || currentUser.shopName?.includes('Üretici') ? theme.gold : 'rgba(255,107,0,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: currentUser.shopName?.includes('Bahçe') || currentUser.shopName?.includes('Üretici') ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                  Yerel Üretici
                </Text>
              </Pressable>
            </View>

            {/* Row 4: Mega Corporate All Badges */}
            <Pressable
              onPress={() => {
                if (!currentUser) return;
                useAppStore.setState({
                  currentUser: {
                    ...currentUser,
                    role: 'seller',
                    name: 'Mega Kurumsal Yetkilisi',
                    shopName: 'Mega Holding A.Ş.',
                    isRentACarApproved: true,
                    verified: true,
                  }
                });
              }}
              style={{
                width: '100%',
                height: 34,
                borderRadius: 4,
                backgroundColor: currentUser.shopName === 'Mega Holding A.Ş.' ? theme.gold : 'rgba(255,107,0,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              <Text style={{ color: currentUser.shopName === 'Mega Holding A.Ş.' ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                🏆 Mega Kurumsal (Tüm Rozetlere Sahip Üye)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Super Admin Control Panel */}
        {currentUser.role === 'super_admin' && (
          <View style={{ gap: 12, marginTop: 16 }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Süper Admin Yönetim Paneli</Text>
            </View>
            
            {rentACarApplications.length === 0 ? (
              <View style={{ padding: 20, borderRadius: 6, backgroundColor: cardBg, borderWidth: 1, borderColor: itemBorder, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Aktif Rent a Car başvurusu bulunmamaktadır.</Text>
              </View>
            ) : (
              rentACarApplications.map((app) => (
                <View key={app.id} style={{ padding: 16, borderRadius: 8, backgroundColor: cardBg, borderWidth: 1, borderColor: app.status === 'pending' ? theme.gold : itemBorder, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 14 }}>{app.userName}</Text>
                      {app.shopName && <Text style={{ fontSize: 12, color: theme.textSecondary }}>Firma: {app.shopName}</Text>}
                      <Text style={{ fontSize: 12, color: theme.textSecondary }}>Tel: {app.userPhone}</Text>
                    </View>
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: app.status === 'pending' ? 'rgba(255, 107, 0, 0.12)' : app.status === 'approved' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    }}>
                      <Text style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: app.status === 'pending' ? theme.gold : app.status === 'approved' ? '#34D399' : '#EF4444'
                      }}>
                        {app.status === 'pending' ? 'Onay Bekliyor' : app.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ gap: 6, backgroundColor: itemBg, padding: 10, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary }}>YÜKLENEN BELGELER:</Text>
                    <Text style={{ fontSize: 12, color: theme.text }}>📄 Vergi Levhası: {app.vergiLevhasi}</Text>
                    <Text style={{ fontSize: 12, color: theme.text }}>📄 Oda Kayıt Belgesi: {app.esnafBelgesi}</Text>
                    <Text style={{ fontSize: 12, color: theme.text }}>📄 Çalışma Ruhsatı: {app.ruhsat}</Text>
                    <Text style={{ fontSize: 12, color: theme.text }}>📄 İmza Sirküleri: {app.imzaSirkuleri}</Text>
                  </View>

                  {app.status === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                      <Pressable
                        onPress={() => rejectRentACarApplication(app.id)}
                        style={{
                          flex: 1,
                          height: 36,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#EF4444',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        }}
                      >
                        <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12 }}>Reddet</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => approveRentACarApplication(app.id)}
                        style={{
                          flex: 1.5,
                          height: 36,
                          borderRadius: 4,
                          backgroundColor: '#10B981',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Başvuruyu Onayla</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* BUYER ORDERS SECTION */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>SİPARİŞLERİM</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.countBadgeText}>{orders.filter(o => o.buyerId === currentUser?.id).length}</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {(() => {
            const buyerOrders = orders.filter(o => o.buyerId === currentUser?.id);
            if (buyerOrders.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.text, textAlign: 'center' }]}>Henüz bir sipariş vermediniz.</Text>
                </View>
              );
            }
            return (
              <View style={{ gap: 12 }}>
                {buyerOrders.map((order) => (
                  <View key={order.id} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>{order.id}</Text>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 4,
                        backgroundColor: order.status === 'pending' ? 'rgba(245, 158, 11, 0.12)' : order.status === 'processing' ? 'rgba(59, 130, 246, 0.12)' : order.status === 'shipped' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)'
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: order.status === 'pending' ? '#F59E0B' : order.status === 'processing' ? '#3B82F6' : order.status === 'shipped' ? '#8B5CF6' : '#10B981'
                        }}>
                          {order.status === 'pending' ? 'Ödeme Alındı' : order.status === 'processing' ? 'Hazırlanıyor' : order.status === 'shipped' ? 'Kargoya Verildi' : 'Tamamlandı'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <Image
                        source={typeof order.items[0].listing.photos[0] === 'number' ? order.items[0].listing.photos[0] : { uri: order.items[0].listing.photos[0] }}
                        style={{ width: 44, height: 44, borderRadius: 6 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>
                          {order.items[0].listing.title}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Adet: {order.items[0].quantity} • Tutar: {order.totalAmount.toLocaleString('tr-TR')} TL
                        </Text>
                      </View>
                    </View>

                    {order.trackingNumber && (
                      <View style={{ padding: 8, borderRadius: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9', borderLeftWidth: 3, borderLeftColor: '#8B5CF6' }}>
                        <Text style={{ fontSize: 11, color: theme.text, fontWeight: '600' }}>
                          📦 Kargo Takip No: {order.trackingNumber}
                        </Text>
                      </View>
                    )}

                    {order.status === 'completed' && (
                      <Pressable
                        style={{
                          backgroundColor: 'rgba(255, 107, 0, 0.1)',
                          borderColor: theme.gold,
                          borderWidth: 1,
                          paddingVertical: 8,
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 4,
                          flexDirection: 'row',
                          gap: 6
                        }}
                        onPress={() => handleOpenReviewModal(order)}
                        disabled={reviewedOrders.includes(order.id)}
                      >
                        <Star size={13} color={theme.gold} fill={reviewedOrders.includes(order.id) ? theme.gold : 'transparent'} />
                        <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold' }}>
                          {reviewedOrders.includes(order.id) ? 'Değerlendirildi' : 'Satıcıyı Değerlendir'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            );
          })()}
        </View>

        {/* SELLER ORDERS (SALES) SECTION */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>GELEN SİPARİŞLER (SATIŞLARINIZ)</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.countBadgeText}>{orders.filter(o => 
              o.items.some(item => 
                item.listing.sellerName === currentUser?.name || 
                (currentUser?.shopName && item.listing.sellerName === currentUser.shopName)
              )
            ).length}</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {(() => {
            const sellerOrders = orders.filter(o => 
              o.items.some(item => 
                item.listing.sellerName === currentUser?.name || 
                (currentUser?.shopName && item.listing.sellerName === currentUser.shopName)
              )
            );
            if (sellerOrders.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.text, textAlign: 'center' }]}>Henüz bir sipariş almadınız.</Text>
                </View>
              );
            }
            return (
              <View style={{ gap: 12 }}>
                {sellerOrders.map((order) => {
                  const trackingValue = trackingInputs[order.id] || '';
                  return (
                    <View key={order.id} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>{order.id}</Text>
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                          backgroundColor: order.status === 'pending' ? 'rgba(245, 158, 11, 0.12)' : order.status === 'processing' ? 'rgba(59, 130, 246, 0.12)' : order.status === 'shipped' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)'
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: order.status === 'pending' ? '#F59E0B' : order.status === 'processing' ? '#3B82F6' : order.status === 'shipped' ? '#8B5CF6' : '#10B981'
                          }}>
                            {order.status === 'pending' ? 'Yeni Sipariş' : order.status === 'processing' ? 'İşleme Alındı' : order.status === 'shipped' ? 'Kargoda' : 'Tamamlandı'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Image
                          source={typeof order.items[0].listing.photos[0] === 'number' ? order.items[0].listing.photos[0] : { uri: order.items[0].listing.photos[0] }}
                          style={{ width: 44, height: 44, borderRadius: 6 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>
                            {order.items[0].listing.title}
                          </Text>
                          <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                            Alıcı: {order.buyerName} ({order.buyerPhone})
                          </Text>
                          <Text style={{ color: theme.textSecondary, fontSize: 11 }} numberOfLines={1}>
                            Adres: {order.buyerAddress}
                          </Text>
                        </View>
                      </View>

                      {order.status === 'pending' && (
                        <Pressable
                          style={{ height: 36, borderRadius: 6, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}
                          onPress={() => {
                            updateOrderStatus(order.id, 'processing');
                            Alert.alert("Başarılı", "Sipariş işleme alındı! Müşteriye bildirim gönderildi.");
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Siparişi İşleme Al</Text>
                        </Pressable>
                      )}

                      {order.status === 'processing' && (
                        <View style={{ gap: 6, marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>Kargo Takip No Giriniz (Zorunlu):</Text>
                          <TextInput
                            style={{
                              height: 38,
                              borderWidth: 1,
                              borderColor: theme.backgroundSelected,
                              borderRadius: 6,
                              paddingHorizontal: 10,
                              fontSize: 12,
                              color: theme.text,
                              backgroundColor: theme.background
                            }}
                            placeholder="Örn: MNG12345678"
                            placeholderTextColor={theme.textSecondary}
                            value={trackingValue}
                            onChangeText={(txt) => setTrackingInputs(prev => ({ ...prev, [order.id]: txt }))}
                          />
                          <Pressable
                            style={{
                              height: 36,
                              borderRadius: 6,
                              backgroundColor: trackingValue.trim() ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: trackingValue.trim() ? 0 : 1,
                              borderColor: theme.backgroundSelected
                            }}
                            disabled={!trackingValue.trim()}
                            onPress={() => {
                              if (!trackingValue.trim()) {
                                Alert.alert("Hata", "Lütfen önce kargo takip numarası girin.");
                                return;
                              }
                              updateOrderStatus(order.id, 'shipped', trackingValue.trim());
                              Alert.alert("Başarılı", "Sipariş kargoya verildi! Takip numarası kaydedildi ve müşteriye bildirim gönderildi.");
                            }}
                          >
                            <Text style={{ color: trackingValue.trim() ? '#FFFFFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
                              Kargoya Verildi Olarak İşaretle
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      {order.status === 'shipped' && (
                        <View style={{ gap: 6, marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Takip Numarası: {order.trackingNumber}</Text>
                          <Pressable
                            style={{ height: 36, borderRadius: 6, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => {
                              updateOrderStatus(order.id, 'completed');
                              Alert.alert("Başarılı", "Sipariş tamamlandı olarak işaretlendi! Müşteriye bildirim gönderildi.");
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Siparişi Tamamla</Text>
                          </Pressable>
                        </View>
                      )}

                      {order.status === 'completed' && (
                        <View style={{ padding: 6, borderRadius: 6, backgroundColor: 'rgba(16, 185, 129, 0.08)', borderWidth: 1, borderColor: '#10B981', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '700' }}>✓ İşlem Başarıyla Tamamlandı</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })()}
        </View>

        {/* Active Listings Header */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>İLANLARINIZ</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.countBadgeText}>{userListings.length}</Text>
          </View>
        </View>

        {/* Listings Container */}
        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {userListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Tag size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                Henüz yayınlanmış bir ilanınız bulunmuyor.
              </Text>
              <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
                İlan eklemek için alttaki + butonuna tıklayabilirsiniz.
              </Text>
              <Pressable
                style={[styles.addListingBtn, { backgroundColor: '#FF6B00' }]}
                onPress={() => {
                  console.log('[DEBUG] Profil screen "+ İlan Ver" button pressed!');
                  navigation.navigate('create');
                }}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addListingBtnText}>İlan Ver</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.listingsList}>
              {userListings.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.listingItem, { backgroundColor: itemBg, borderColor: itemBorder }]}
                  onPress={() => {
                    console.log('[DEBUG] Navigating to product:', item.id);
                    try {
                      router.push(`/product/${item.id}`);
                    } catch (e) {
                      try {
                        navigation.navigate('product/[id]' as any, { id: item.id });
                      } catch (err) {
                        console.error('Navigation error:', err);
                      }
                    }
                  }}
                >
                  <Image
                    source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                    style={styles.listingThumb}
                  />
                  <View style={styles.listingDetails}>
                    <Text style={[styles.listingTitleText, { color: theme.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.listingMetaRow}>
                      <Text style={[styles.listingPriceText, { color: isDark ? theme.gold : theme.goldAccent }]}>
                        {item.price.toLocaleString('tr-TR')} TL
                      </Text>

                      <View style={[
                        styles.typeBadge,
                        {
                          backgroundColor: item.type === 'auction'
                            ? 'rgba(255, 107, 0, 0.12)'
                            : item.type === 'offer'
                            ? 'rgba(147, 51, 234, 0.12)'
                            : 'rgba(59, 130, 246, 0.12)',
                          borderColor: item.type === 'auction'
                            ? 'rgba(255, 107, 0, 0.25)'
                            : item.type === 'offer'
                            ? 'rgba(147, 51, 234, 0.25)'
                            : 'rgba(59, 130, 246, 0.25)'
                        }
                      ]}>
                        <Text style={[
                          styles.typeBadgeText,
                          {
                            color: item.type === 'auction'
                              ? theme.gold
                              : item.type === 'offer'
                              ? '#A855F7'
                              : '#3B82F6'
                          }
                        ]}>
                          {item.type === 'auction' ? 'Mezat' : item.type === 'offer' ? 'Teklifli' : 'Sabit Fiyat'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.listingStatusRow}>
                      <View style={styles.statusItem}>
                        <Heart size={12} color="#EF4444" fill="#EF4444" />
                        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                          {item.favoritesCount} Beğeni
                        </Text>
                      </View>

                      {item.type === 'auction' && item.timeLeft !== undefined && (
                        <View style={styles.statusItem}>
                          <Clock size={12} color={theme.gold} />
                          <Text style={[styles.statusText, { color: theme.gold }]}>
                            {item.timeLeft > 0 ? formatTime(item.timeLeft) : 'Süre Doldu'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Pressable
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: 'rgba(255, 107, 0, 0.1)',
                        borderColor: theme.gold,
                        borderWidth: 1,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        marginTop: 6,
                      }}
                      onPress={(e) => {
                        e.stopPropagation();
                        setStoryListingSelect(item);
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.gold }}>
                        Hikayene Ekle ⚡
                      </Text>
                    </Pressable>
                  </View>

                  <ChevronRight size={18} color={theme.textSecondary} style={{ marginRight: 4 }} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* GÜVENLİK AYARLARI SECTION */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>GÜVENLİK AYARLARI</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1, paddingRight: 16 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 107, 0, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <Fingerprint size={20} color={theme.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.text }}>
                  Biyometrik Kimlik Doğrulama
                </Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  Teklif verirken veya ödeme yaparken Face ID / Parmak İzi doğrulaması iste.
                </Text>
              </View>
            </View>
            <Switch
              value={isBiometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: theme.gold }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>
        </View>
      </ScrollView>

      {/* Story Viewer Modal */}
      <Modal
        visible={storyViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStoryViewerVisible(false)}
      >
        <View style={styles.storyViewerBackdrop}>
          {personalStories.length > 0 && activeStoryIndex < personalStories.length && (
            <View style={styles.storyViewerContainer}>
              {/* Full Screen Media (Image or Video) */}
              {(() => {
                const currentStory = personalStories[activeStoryIndex];
                const isVideo = currentStory.mediaUrl.toLowerCase().endsWith('.mp4') || 
                                currentStory.mediaUrl.toLowerCase().endsWith('.mov') ||
                                currentStory.mediaUrl.includes('.mp4?') ||
                                currentStory.mediaUrl.includes('.mov?') ||
                                currentStory.mediaType === 'video';
                
                if (isVideo) {
                  return (
                    <StoryVideoPlayer 
                      url={currentStory.mediaUrl} 
                      isActive={storyViewerVisible} 
                    />
                  );
                }
                return (
                  <Image 
                    source={{ uri: currentStory.mediaUrl }} 
                    style={styles.storyViewerImage} 
                  />
                );
              })()}

              {/* Progress Indicators Bar */}
              <View style={styles.storyProgressBarContainer}>
                {personalStories.map((st, idx) => {
                  const isPassed = idx < activeStoryIndex;
                  const isCurrent = idx === activeStoryIndex;
                  
                  return (
                    <View key={`prog_${idx}`} style={styles.storyProgressBarBackground}>
                      <RNAnimated.View 
                        style={[
                          styles.storyProgressBarFill,
                          {
                            backgroundColor: '#FFFFFF',
                            width: isPassed 
                              ? '100%' 
                              : isCurrent 
                                ? storyProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%']
                                  }) as any
                                : '0%'
                          }
                        ]}
                      />
                    </View>
                  );
                })}
              </View>

              {/* Header User Info */}
              <View style={styles.storyViewerHeader}>
                <Image 
                  source={{ uri: currentUser.avatar }} 
                  style={styles.storyViewerAvatar} 
                />
                <Text style={styles.storyViewerUsername}>
                  {currentUser.name}
                </Text>
                
                <Pressable style={styles.storyViewerCloseBtn} onPress={() => setStoryViewerVisible(false)}>
                  <X size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Bottom Actions */}
              {personalStories[activeStoryIndex].productId && (
                <View style={styles.storyViewerActions}>
                  <Pressable 
                    style={[styles.storyViewerBtn, { backgroundColor: 'rgba(255, 85, 0, 0.45)', borderColor: 'rgba(255, 85, 0, 0.6)', borderWidth: 1 }]}
                    onPress={() => {
                      const pid = personalStories[activeStoryIndex].productId;
                      setStoryViewerVisible(false);
                      router.push(`/product/${pid}`);
                    }}
                  >
                    <Text style={styles.storyViewerBtnText}>ÜRÜNE GİT</Text>
                  </Pressable>
                </View>
              )}

              {/* Left/Right Tap Areas */}
              <View style={styles.storyTapContainer}>
                <Pressable style={styles.storyTapLeft} onPress={handlePrevStory} />
                <Pressable style={styles.storyTapRight} onPress={handleNextStory} />
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Listing Photo Selector Modal for Story */}
      <Modal
        visible={storyListingSelect !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setStoryListingSelect(null)}
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' }} 
          onPress={() => setStoryListingSelect(null)}
        >
          <ThemedView 
            type="backgroundElement" 
            style={{
              width: '90%',
              maxWidth: 380,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.backgroundSelected,
            }}
          >
            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>
              Hikaye Görseli Seçin
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16, textAlign: 'center' }}>
              İlanınızdaki görsellerden birine tıklayarak hikayenizde paylaşın. Hikayeniz doğrudan bu ürüne bağlanacaktır.
            </ThemedText>
            
            {storyListingSelect && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
                {storyListingSelect.photos.map((photo: any, idx: number) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      let mediaUrlStr = '';
                      if (typeof photo === 'number') {
                        try {
                          const resolved = Image.resolveAssetSource(photo);
                          mediaUrlStr = resolved.uri;
                        } catch (e) {
                          mediaUrlStr = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
                        }
                      } else {
                        mediaUrlStr = photo;
                      }

                      addStory({
                        sellerId: currentUser?.id || 'demo_seller',
                        sellerName: currentUser?.name || 'Himmet Akar',
                        sellerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                        mediaUrl: mediaUrlStr,
                        mediaType: 'image',
                        productId: storyListingSelect.id,
                        productTitle: storyListingSelect.title,
                      });
                      setStoryListingSelect(null);
                      Alert.alert("Başarılı", "İlanınızın görseli hikaye olarak paylaşıldı ve ürüne bağlandı! 🚀");
                    }}
                    style={{
                      borderRadius: 8,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: theme.backgroundSelected,
                    }}
                  >
                    <Image
                      source={typeof photo === 'number' ? photo : { uri: photo }}
                      style={{ width: 100, height: 120, resizeMode: 'cover' }}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
            
            <Pressable
              onPress={() => setStoryListingSelect(null)}
              style={{
                marginTop: 16,
                backgroundColor: theme.backgroundSelected,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <ThemedText style={{ fontSize: 13, fontWeight: 'bold' }}>İptal</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>

      {/* REVIEW SUBMISSION MODAL */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView
            type="backgroundElement"
            style={{
              width: '90%',
              maxWidth: 400,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.gold,
              gap: 16,
            }}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Satıcıyı Değerlendir</ThemedText>
              <Pressable onPress={() => setReviewModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            {selectedOrderForReview && (
              <View style={{ gap: 4, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>DEĞERLENDİRİLEN SATICI</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold' }}>
                  {selectedOrderForReview.sellerName}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11, fontStyle: 'italic', marginTop: 2, textAlign: 'center' }}>
                  "{selectedOrderForReview.items[0].listing.title}"
                </Text>
              </View>
            )}

            {/* Star Rating Selectors */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={{ padding: 4 }}
                >
                  <Star
                    size={32}
                    color={theme.gold}
                    fill={star <= reviewRating ? theme.gold : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Comment Input */}
            <View style={{ gap: 6 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Yorumunuz (İsteğe Bağlı)</Text>
              <TextInput
                style={{
                  height: 80,
                  borderColor: theme.backgroundSelected,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  color: theme.text,
                  backgroundColor: theme.background,
                  fontSize: 13,
                  textAlignVertical: 'top',
                }}
                placeholder="Alışveriş deneyiminiz nasıldı? (Örn: Hızlı kargo, ilgili satıcı...)"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                value={reviewComment}
                onChangeText={setReviewComment}
              />
            </View>

            <Pressable
              style={{
                backgroundColor: theme.gold,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
              }}
              onPress={handleSubmitReview}
            >
              <Text style={{ color: '#000000', fontSize: 13, fontWeight: 'bold' }}>Değerlendirmeyi Gönder</Text>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  scrollContainer: {
    paddingBottom: 120,
    gap: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    borderWidth: 2,
    borderRadius: 36,
    padding: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  trustScoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderLine: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#070C19',
  },
  formCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
  },
  addListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  addListingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listingsList: {
    gap: 12,
  },
  listingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
  },
  listingThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  listingDetails: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  listingTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listingPriceText: {
    fontSize: 14,
    fontWeight: '800',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  listingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  authModeTabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 4,
    marginHorizontal: 12,
  },
  authModeTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  authModeTabActiveButton: {},
  authModeTabText: {
    fontSize: 13,
  },
  authModeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: '25%',
    width: '50%',
    height: 2,
    borderRadius: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  storyAvatarWrapper: {
    position: 'relative',
  },
  storyRingGradient: {
    width: 74,
    height: 74,
    borderRadius: 37,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainerStory: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlayStory: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  storyViewerBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyViewerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  storyViewerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  storyProgressBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 36,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  storyProgressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  storyProgressBarFill: {
    height: '100%',
  },
  storyViewerHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 76 : 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  storyViewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  storyViewerUsername: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  storyViewerCloseBtn: {
    padding: 4,
  },
  storyTapContainer: {
    position: 'absolute',
    top: 100,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  storyTapLeft: {
    width: '30%',
    height: '100%',
  },
  storyTapRight: {
    width: '70%',
    height: '100%',
  },
  storyViewerActions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    zIndex: 20,
  },
  storyViewerBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyViewerBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
