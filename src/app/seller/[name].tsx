import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  useWindowDimensions,
  Platform,
  Alert,
  Text,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, Listing } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import {
  ArrowLeft,
  MessageSquare,
  MapPin,
  ChevronRight,
  Home,
  Key,
  Car,
  Store,
  Briefcase,
  Share2,
  ShieldCheck,
} from 'lucide-react-native';

const getSellerBadges = (item: { sellerName: string; sellerVerified: boolean; category: string; isRealEstate?: boolean; isVehicle?: boolean; type?: string }) => {
  const nameLower = item.sellerName.toLowerCase();
  const badges = [];

  const isRealEstate = item.isRealEstate || item.category.includes('Emlak') || nameLower.includes('emlak');
  const isVehicle = item.isVehicle || nameLower.includes('galeri') || (
    item.category.includes('Otomobil') ||
    item.category.includes('Motosiklet') ||
    item.category.includes('Karavan') ||
    item.category.includes('Kamyon') ||
    item.category.includes('Traktör') ||
    item.category.includes('İş makineleri')
  );
  const isRent = item.type === 'rent';
  const isProducer = ['Doğal Gıda', 'El Emeği & Sanat', '🍯 Organik Bal & Arı Ürünleri', '🫒 Zeytinyağı & Doğal Kahvaltılık', '🥫 Ev Yapımı Konserve, Reçel & Sos', '🌾 Kuru Gıda, Bakliyat & Şifalı Otlar', '🧶 El Emeği Örgü & Ev Tekstili', '🪵 Ahşap & Doğal Malzeme Tasarımları', '🕯️ Doğal Kozmetik, Sabun & Mum', '💍 El Yapımı Takı & Aksesuar', '♻️ Bahçe, Fide, Tohum & Bitki'].includes(item.category) || nameLower.includes('üretici') || nameLower.includes('bahçe') || nameLower.includes('atölye') || nameLower.includes('üretim') || nameLower.includes('bal') || nameLower.includes('zeytin');
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
  
  if (badges.length === 0 && item.sellerVerified) {
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

export default function SellerProfileScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const sellerName = typeof name === 'string' ? decodeURIComponent(name) : '';
  
  const { listings, createChat } = useAppStore();
  const sellerListings = listings.filter((l) => l.sellerName === sellerName);

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Find info from any listing of this seller
  const firstListing = sellerListings[0];
  const sellerAvatar = firstListing?.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const sellerVerified = firstListing?.sellerVerified ?? false;
  const sellerTrustScore = firstListing?.sellerTrustScore ?? 9.5;
  const sellerCity = firstListing?.city || 'İstanbul';

  const handleStartChat = () => {
    if (!firstListing) {
      Alert.alert('Hata', 'Bu satıcıya ait aktif ilan bulunamadı.');
      return;
    }
    const chatId = createChat(firstListing.id);
    if (chatId) {
      router.push(`/chat/${chatId}`);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `${sellerName} Mezatliyoruz Satıcı Profili. Birbirinden harika ilanları inceleyin!`,
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  const cardBg = isDark ? '#111A30' : '#FFFFFF';
  const itemBg = isDark ? '#080E1C' : '#F8FAFC';
  const itemBorder = isDark ? '#1F2E54' : '#E2E8F0';

  return (
    <ThemedView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { borderBottomColor: theme.backgroundSelected }]}>
        <Pressable style={[styles.navBarIcon, { backgroundColor: theme.backgroundElement }]} onPress={() => router.back()}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.navBarTitle, { color: theme.text }]}>Satıcı Profili</Text>
        <Pressable style={[styles.navBarIcon, { backgroundColor: theme.backgroundElement }]} onPress={handleShareProfile}>
          <Share2 size={20} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {/* Main Info Card */}
          <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
            <View style={[styles.avatarContainer, { borderColor: theme.gold }]}>
              <Image source={{ uri: sellerAvatar }} style={styles.avatar} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {sellerName}
                </Text>
                {sellerVerified && (
                  <Pressable
                    onPress={() => {
                      const badges = getSellerBadges({ sellerName, sellerVerified, category: firstListing?.category || '' });
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
                Güven Skoru: {sellerTrustScore}/10
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={12} color={theme.textSecondary} />
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>{sellerCity}</Text>
              </View>

              {/* Badges Row */}
              <View style={styles.badgesRow}>
                {sellerVerified && getSellerBadges({
                  sellerName,
                  sellerVerified,
                  category: firstListing?.category || '',
                  isRealEstate: firstListing?.isRealEstate,
                  isVehicle: firstListing?.isVehicle,
                  type: firstListing?.type
                }).map((badge, idx) => (
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
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <Pressable style={styles.messageBtn} onPress={handleStartChat}>
            <MessageSquare size={18} color="#FFFFFF" />
            <Text style={styles.messageBtnText}>Satıcıya Mesaj Gönder</Text>
          </Pressable>

          {/* Listings List */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>AKTİF İLANLARI</Text>
            <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
              <Text style={styles.countBadgeText}>{sellerListings.length}</Text>
            </View>
          </View>

          {sellerListings.length === 0 ? (
            <View style={{ padding: 30, alignItems: 'center', backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: itemBorder }}>
              <Text style={{ color: theme.textSecondary }}>Bu satıcının aktif ilanı bulunmamaktadır.</Text>
            </View>
          ) : (
            <View style={styles.listingsGrid}>
              {sellerListings.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.listingItem,
                    { backgroundColor: itemBg, borderColor: itemBorder },
                    pressed && { opacity: 0.6 }
                  ]}
                  onPress={() => router.push(`/product/${item.id}`)}
                  delayPressIn={0}
                  hitSlop={10}
                >
                  <Image
                    source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                    style={styles.listingThumb}
                  />
                  <View style={styles.listingDetails}>
                    <Text style={[styles.listingTitleText, { color: theme.text }]} numberOfLines={2}>
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
                            : item.type === 'rent'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(59, 130, 246, 0.12)',
                          borderColor: item.type === 'auction'
                            ? 'rgba(255, 107, 0, 0.25)'
                            : item.type === 'offer'
                            ? 'rgba(147, 51, 234, 0.25)'
                            : item.type === 'rent'
                            ? 'rgba(16, 185, 129, 0.25)'
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
                              : item.type === 'rent'
                              ? '#10B981'
                              : '#3B82F6'
                          }
                        ]}>
                          {item.type === 'auction' ? 'Mezat' : item.type === 'offer' ? 'Teklifli' : item.type === 'rent' ? 'Kiralık' : 'Sabit Fiyat'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
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
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    marginTop: Platform.OS === 'ios' ? 44 : 20,
    borderBottomWidth: 1,
  },
  navBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  profileSection: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
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
    gap: 3,
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
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  messageBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  messageBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
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
  listingsGrid: {
    gap: 12,
  },
  listingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listingThumb: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  listingDetails: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  listingTitleText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  listingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingPriceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
});
