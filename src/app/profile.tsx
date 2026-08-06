import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useAppStore } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { User, ShieldCheck, Heart, Clock, ChevronRight, Tag, Plus, LogOut, Car, ShieldAlert, Home, Key, Store, Briefcase } from 'lucide-react-native';
import { useRouter, useNavigation } from 'expo-router';
import { formatTime } from '@/utils/time';

const getUserBadges = (user: any) => {
  const state = useAppStore.getState();
  const accountPair = state.accounts[user.phone] || {};
  const sellerAccount = accountPair.seller || {};

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

  const { currentUser, listings, loginAccount, registerAccount, logoutAccount, rentACarApplications, approveRentACarApplication, rejectRentACarApplication } = useAppStore();

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

  // Auth Form States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'sms'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [authError, setAuthError] = useState('');

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
          <View style={[styles.avatarContainer, { borderColor: theme.gold }]}>
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          </View>
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

              {currentUser.isRentACarApproved && (
                <Pressable
                  onPress={() => Alert.alert("🔑 Kurumsal Oto Kiralama", "Bu üye resmi oto kiralama ruhsatına, NACE kodu onaylı vergi levhasına ve e-Devlet entegrasyonuna sahip kurumsal bir araç kiralama şirketidir.", [{ text: 'Tamam' }])}
                  style={[styles.badgeItem, {
                    backgroundColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
                    borderColor: isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(109, 40, 217, 0.2)'
                  }]}
                >
                  <Car size={12} color={isDark ? '#A78BFA' : '#6D28D9'} />
                  <Text style={[styles.badgeText, { color: isDark ? '#A78BFA' : '#6D28D9' }]}>Onaylı Rent a Car</Text>
                </Pressable>
              )}

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
                      style={{ width: 14, height: 15, resizeMode: 'contain' }}
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
                  </View>

                  <ChevronRight size={18} color={theme.textSecondary} style={{ marginRight: 4 }} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
});
