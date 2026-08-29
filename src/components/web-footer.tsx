import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { X, ShieldCheck } from 'lucide-react-native';
import { ABOUT_US_TEXT, DELIVERY_RETURN_TEXT, PRIVACY_POLICY_TEXT, DISTANCE_SELLING_TEXT } from '@/constants/legal';

// Inline SVGs for Visa, MasterCard, and iyzico logos
const VisaLogoSVG = () => (
  <View style={styles.logoBadge}>
    <svg width="48" height="24" viewBox="0 0 48 24" style={{ display: 'block' }}>
      <rect width="48" height="24" rx="4" fill="#1A1F71" />
      <text x="7" y="17" fontFamily="sans-serif" fontWeight="bold" fontStyle="italic" fill="#FFFFFF" fontSize="13">
        Vi<tspan fill="#F7B600">sa</tspan>
      </text>
    </svg>
  </View>
);

const MasterCardLogoSVG = () => (
  <View style={styles.logoBadge}>
    <svg width="48" height="24" viewBox="0 0 48 24" style={{ display: 'block' }}>
      <rect width="48" height="24" rx="4" fill="#1E293B" />
      <circle cx="19" cy="12" r="7" fill="#EB001B" />
      <circle cx="29" cy="12" r="7" fill="#F79E1B" opacity="0.85" />
    </svg>
  </View>
);

const IyzicoLogoSVG = () => (
  <View style={styles.logoBadgeLong}>
    <svg width="105" height="24" viewBox="0 0 105 24" style={{ display: 'block' }}>
      <rect width="105" height="24" rx="4" fill="#0969da" />
      <text x="8" y="16" fontFamily="sans-serif" fontWeight="bold" fill="#FFFFFF" fontSize="11">iyzico</text>
      <text x="46" y="16" fontFamily="sans-serif" fill="#FFFFFF" fontSize="10" opacity="0.9">ile öde</text>
    </svg>
  </View>
);

export default function WebFooter() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const openLegalModal = (title: string, text: string) => {
    setModalTitle(title);
    setModalContent(text);
    setModalVisible(true);
  };

  return (
    <View style={[styles.footerContainer, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9', borderTopColor: theme.backgroundSelected }]}>
      <View style={styles.footerContent}>
        {/* Left Section: Branding and SSL Info */}
        <View style={styles.footerSection}>
          <View style={styles.logoRow}>
            <Text style={styles.logoTextMain}>MEZAT</Text>
            <Text style={[styles.logoTextSub, { color: theme.text }]}>LIYORUZ</Text>
          </View>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            Türkiye'nin yeni nesil video ve Reels tabanlı açık artırma platformu. Güvenli ödeme ve hızlı teslimat altyapısıyla keyifli alışverişler dileriz.
          </Text>
          <View style={styles.sslBadge}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={styles.sslText}>SSL Secure Connection Enabled</Text>
          </View>
        </View>

        {/* Center Section: Quick Links */}
        <View style={styles.linksSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sözleşmeler ve Bilgi</Text>
          <View style={styles.linksGrid}>
            <Pressable onPress={() => openLegalModal('Hakkımızda', ABOUT_US_TEXT)} style={styles.linkItem}>
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>Hakkımızda</Text>
            </Pressable>
            <Pressable onPress={() => openLegalModal('Teslimat ve İade Şartları', DELIVERY_RETURN_TEXT)} style={styles.linkItem}>
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>Teslimat ve İade Şartları</Text>
            </Pressable>
            <Pressable onPress={() => openLegalModal('Gizlilik Sözleşmesi', PRIVACY_POLICY_TEXT)} style={styles.linkItem}>
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>Gizlilik Sözleşmesi (KVKK)</Text>
            </Pressable>
            <Pressable onPress={() => openLegalModal('Mesafeli Satış Sözleşmesi', DISTANCE_SELLING_TEXT)} style={styles.linkItem}>
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>Mesafeli Satış Sözleşmesi</Text>
            </Pressable>
          </View>
        </View>

        {/* Right Section: Payments */}
        <View style={styles.paymentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Güvenli Ödeme Altyapısı</Text>
          <Text style={[styles.paymentDesc, { color: theme.textSecondary }]}>
            Tüm ödemeleriniz BDDK lisanslı ödeme kuruluşu iyzico güvencesiyle 256-bit SSL koruması altında tahsil edilmektedir.
          </Text>
          <View style={styles.logosRow}>
            <VisaLogoSVG />
            <MasterCardLogoSVG />
            <IyzicoLogoSVG />
          </View>
        </View>
      </View>

      {/* Copyright Line */}
      <View style={[styles.copyrightRow, { borderTopColor: theme.backgroundSelected }]}>
        <Text style={[styles.copyrightText, { color: theme.textSecondary }]}>
          © {new Date().getFullYear()} Mezatliyoruz.com.tr. Tüm hakları saklıdır.
        </Text>
      </View>

      {/* Shared Legal Document View Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.backgroundSelected }]}>
              <Text style={[styles.modalTitleText, { color: theme.text }]}>{modalTitle}</Text>
              <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollBody}>
              <Text style={[styles.modalBodyText, { color: theme.text, lineHeight: 22 }]}>
                {modalContent}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    paddingTop: 32,
    borderTopWidth: 1,
    marginTop: 40,
  },
  footerContent: {
    maxWidth: 1200,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 32,
    paddingBottom: 24,
  },
  footerSection: {
    flex: 2,
    minWidth: 260,
    gap: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextMain: {
    color: '#0969da',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  logoTextSub: {
    fontWeight: '300',
    fontSize: 18,
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  aboutText: {
    fontSize: 12,
    lineHeight: 18,
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sslText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  linksSection: {
    flex: 2,
    minWidth: 240,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linksGrid: {
    gap: 12,
  },
  linkItem: {
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  linkText: {
    fontSize: 12,
    textDecorationLine: 'none',
  },
  paymentSection: {
    flex: 2,
    minWidth: 260,
    gap: 12,
  },
  paymentDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  logoBadge: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  logoBadgeLong: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  copyrightRow: {
    width: '100%',
    borderTopWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    height: '75%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  modalScrollBody: {
    padding: 20,
  },
  modalBodyText: {
    fontSize: 13,
  },
});
