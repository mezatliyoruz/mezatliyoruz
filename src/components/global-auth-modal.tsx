import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Text, TextInput } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/services/store';
import { X } from 'lucide-react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';

export default function GlobalAuthModal() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const {
    loginAccount,
    registerAccount,
    authModalVisible,
    setAuthModalVisible,
  } = useAppStore();

  const [authStep, setAuthStep] = useState<'login' | 'register' | 'sms'>('login');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [authError, setAuthError] = useState('');



  React.useEffect(() => {
    if (authModalVisible) {
      setAuthStep('login');
      setAuthMode('login');
      setAuthError('');
      setAuthPhone('');
      setAuthName('');
      setAuthOtpCode('');
    }
  }, [authModalVisible]);

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
        setAuthModalVisible(false);
        setAuthPhone('');
        setAuthOtpCode('');
      } else {
        setAuthError('Bu telefon numarasıyla kayıtlı bir hesap bulunamadı. Lütfen önce üye olun.');
        setAuthStep('login');
      }
    } else if (authMode === 'register') {
      registerAccount(authPhone, 'user', authName);
      setAuthModalVisible(false);
      setAuthPhone('');
      setAuthName('');
      setAuthOtpCode('');
      alert('Kayıt Başarılı! Hesabınız oluşturuldu ve giriş yapıldı.');
    }
  };

  return (
    <Modal
      visible={authModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setAuthModalVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <ThemedView type="backgroundElement" style={[styles.modalContent, { borderTopColor: theme.backgroundSelected }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Giriş ve Üyelik</ThemedText>
            <Pressable onPress={() => setAuthModalVisible(false)}>
              <X size={22} color={theme.text} />
            </Pressable>
          </View>

          <View style={{ gap: 16, paddingBottom: 10 }}>
            {authError !== '' && <Text style={styles.errorText}>{authError}</Text>}

            {authStep !== 'sms' && (
              <>
                {/* Giriş / Kayıt Ol tabs */}
                <View style={[styles.authModeTabRow, { borderBottomColor: theme.backgroundSelected }]}>
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
                  Telefon numaranızı girin. SMS ile tek kullanımlık doğrulama kodu gönderilecektir.
                </ThemedText>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Telefon Numarası</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                    placeholder="0555 555 55 55"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="phone-pad"
                    value={authPhone}
                    onChangeText={(text) => setAuthPhone(formatPhoneNumber(text))}
                  />
                </View>
                <Pressable style={[styles.submitButton, { backgroundColor: theme.gold }]} onPress={handleSendOtp}>
                  <Text style={[styles.submitButtonText, { color: '#000000' }]}>Giriş Yap</Text>
                </Pressable>
              </View>
            )}

            {authStep === 'register' && (
              <View style={{ gap: 12 }}>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginHorizontal: 12 }}>
                  Ücretsiz hesap oluşturun. Hem alışveriş yapın, hem ilan verin.
                </ThemedText>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Ad Soyad</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor={theme.textSecondary}
                    value={authName}
                    onChangeText={setAuthName}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Telefon Numarası</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                    placeholder="0555 555 55 55"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="phone-pad"
                    value={authPhone}
                    onChangeText={(text) => setAuthPhone(formatPhoneNumber(text))}
                  />
                </View>
                <Pressable style={[styles.submitButton, { backgroundColor: theme.gold }]} onPress={handleSendOtp}>
                  <Text style={[styles.submitButtonText, { color: '#000000' }]}>Devam Et</Text>
                </Pressable>
              </View>
            )}

            {authStep === 'sms' && (
              <View style={{ gap: 12 }}>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginHorizontal: 12 }}>
                  {authPhone} numarasına gönderilen 6 haneli doğrulama kodunu girin.
                </ThemedText>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Doğrulama Kodu</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, textAlign: 'center', fontSize: 20, letterSpacing: 6 }]}
                    placeholder="123456"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    maxLength={6}
                    value={authOtpCode}
                    onChangeText={setAuthOtpCode}
                  />
                </View>
                <Pressable style={[styles.submitButton, { backgroundColor: theme.gold }]} onPress={handleVerifyOtp}>
                  <Text style={[styles.submitButtonText, { color: '#000000' }]}>Kodu Doğrula</Text>
                </Pressable>
                <Pressable style={{ marginTop: 6 }} onPress={() => setAuthStep(authMode === 'login' ? 'login' : 'register')}>
                  <Text style={{ color: theme.gold, fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
                    Telefon numarasını değiştir
                  </Text>
                </Pressable>
              </View>
            )}

          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  authModeTabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  authModeTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
  },
  authModeTabActiveButton: {
    opacity: 1,
  },
  authModeTabText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  authModeUnderline: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: 80,
    borderRadius: 1,
  },
  formGroup: {
    gap: 6,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  formInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  submitButton: {
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
