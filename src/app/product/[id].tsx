import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  Platform,
  Alert,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Clock,
  MessageSquare,
  Gavel,
  Tag,
  BookOpen,
  ArrowRight,
  Home,
  Volume2,
  VolumeX,
  Car,
  MapPin,
  Store,
  Briefcase,
} from 'lucide-react-native';
import { formatTime } from '@/utils/time';
import { useVideoPlayer, VideoView } from 'expo-video';

function DetailVideoPlayer({ url, width }: { url: string; width: number }) {
  const [isMuted, setIsMuted] = useState(false);
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = false; // let the user hear the sound
  });

  const toggleMute = () => {
    const nextMuted = !player.muted;
    player.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <View style={{ width, height: 300, backgroundColor: '#000', position: 'relative' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        nativeControls={true}
        contentFit="contain"
      />
      {/* Sound Overlay Button */}
      <Pressable 
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(7, 12, 25, 0.6)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }} 
        onPress={toggleMute}
      >
        {isMuted ? (
          <VolumeX size={18} color="#F8FAFC" />
        ) : (
          <Volume2 size={18} color="#F8FAFC" />
        )}
      </Pressable>
    </View>
  );
}

const getSellerBadges = (item: Listing) => {
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
      description: 'Bu üye resmi belgelerini sunmuş and doğrulanmış kurumsal bir firmadır.',
      image: require('@/assets/images/badge_kurumsal.png'),
      color: '#EC4899',
    });
  }

  return badges;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { listings, toggleLike, placeBid, createChat, decrementTimers } = useAppStore();
  const listing = listings.find((l) => l.id === id);

  const [bidValue, setBidValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync timers
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTimers();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!listing) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={{ marginBottom: 12 }}>Ürün bulunamadı.</ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={16} color={theme.text} />
          <ThemedText>Geri Dön</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const handleAction = () => {
    if (listing.type === 'fixed' || listing.type === 'rent') {
      setSuccessMessage(listing.type === 'rent' ? 'Kiralama talebiniz satıcıya iletildi!' : 'Satın alma talebi satıcıya iletildi!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      const amount = parseFloat(bidValue);
      if (isNaN(amount) || amount <= 0) {
        setErrorMessage('Lütfen geçerli bir teklif girin.');
        return;
      }

      // Teklifli modelde en fazla %15 düşük teklif verilebilir kontrolü
      if (listing.type === 'offer') {
        const minOffer = listing.price * 0.85;
        if (amount < minOffer) {
          setErrorMessage(`Teklifiniz ürün fiyatından en fazla %15 düşük olabilir. (Minimum teklif: ${minOffer} TL)`);
          return;
        }
        setSuccessMessage('Fiyat teklifiniz satıcıya iletildi!');
        setBidValue('');
        setErrorMessage('');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      const result = placeBid(listing.id, amount);
      if (result.success) {
        setSuccessMessage('Teklifiniz başarıyla yerleştirildi!');
        setBidValue('');
        setErrorMessage('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'İşlem başarısız oldu.');
      }
    }
  };

  const handleStartChat = () => {
    const chatId = createChat(listing.id);
    if (chatId) {
      router.push(`/chat/${chatId}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { borderBottomColor: theme.backgroundSelected }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable style={[styles.navBarIcon, { backgroundColor: theme.backgroundElement }]} onPress={() => router.back()}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Pressable style={[styles.navBarIcon, { backgroundColor: theme.backgroundElement }]} onPress={() => router.replace('/')}>
            <Home size={20} color={theme.text} />
          </Pressable>
        </View>
        <Text style={[styles.navBarTitle, { color: theme.text }]}>Ürün Detayı</Text>
        <Pressable style={[styles.navBarIcon, { backgroundColor: theme.backgroundElement }]} onPress={() => toggleLike(listing.id)}>
          <Heart size={20} color={listing.liked ? '#EF4444' : theme.text} fill={listing.liked ? '#EF4444' : 'transparent'} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>
          {/* Left: Images Carousel */}
          <View style={isDesktop ? styles.desktopLeftCol : styles.mobileImageContainer}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
              {listing.videoUrl && (
                <DetailVideoPlayer url={listing.videoUrl} width={isDesktop ? 500 : width} />
              )}
              {listing.photos.map((url, idx) => (
                <Image key={idx} source={typeof url === 'number' ? url : { uri: url }} style={[styles.galleryImage, { width: isDesktop ? 500 : width }]} />
              ))}
            </ScrollView>
          </View>

          {/* Right: Info and Interactive Panel */}
          <View style={isDesktop ? styles.desktopRightCol : styles.infoSection}>
            {/* Header info */}
            <View style={styles.infoHead}>
              <View style={styles.categoryRow}>
                <ThemedText style={styles.categoryLabel}>{listing.category}</ThemedText>
                <ThemedText style={{ color: theme.textSecondary }}>•</ThemedText>
                <ThemedText style={{ color: theme.gold, fontWeight: 'bold' }}>{listing.condition}</ThemedText>
              </View>

              <ThemedText style={styles.productTitle}>{listing.title}</ThemedText>
              
              <View style={styles.priceContainer}>
                <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>
                  {listing.type === 'auction'
                    ? 'Mevcut Teklif'
                    : listing.type === 'rent'
                    ? 'Kiralama Ücreti'
                    : 'Satış Fiyatı'}
                </ThemedText>
                <ThemedText style={styles.priceText}>
                  {listing.price.toLocaleString('tr-TR')} TL
                  {listing.type === 'rent' && ` / ${listing.rentPeriod || 'Günlük'}`}
                </ThemedText>
              </View>
            </View>

            {/* Auction Timer Box */}
            {listing.type === 'auction' && listing.timeLeft !== undefined && (
              <ThemedView type="backgroundElement" style={[styles.alertBox, { borderColor: theme.gold }]}>
                <Clock size={18} color={theme.gold} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.alertBoxTitle}>Açık Artırma Devam Ediyor</ThemedText>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                    Anti-sniping aktif: Son 2 dakikada yapılan teklifler süreyi +2 dakika uzatır.
                  </ThemedText>
                </View>
                <ThemedText style={styles.alertBoxTime}>
                  {listing.timeLeft > 0 ? formatTime(listing.timeLeft) : 'Süre Doldu'}
                </ThemedText>
              </ThemedView>
            )}

            {/* Seller profile box */}
            <ThemedView type="backgroundElement" style={[styles.sellerCard, { borderColor: theme.backgroundSelected }]}>
              <Pressable
                onPress={() => router.push(`/seller/${encodeURIComponent(listing.sellerName)}`)}
                delayPressIn={0}
                hitSlop={15}
                style={({ pressed }) => [
                  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
                  pressed && { opacity: 0.5 }
                ]}
              >
                <Image source={{ uri: listing.sellerAvatar }} style={styles.sellerAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <ThemedText style={styles.sellerName}>{listing.sellerName}</ThemedText>
                    {(() => {
                      if (!listing.sellerVerified) return null;
                      const badges = getSellerBadges(listing);
                      return badges.map((badge, idx) => (
                        <Pressable
                          key={idx}
                          onPress={() => {
                            Alert.alert(badge.name, badge.description, [{ text: 'Tamam' }]);
                          }}
                          style={{ marginLeft: 2 }}
                        >
                          <Image
                            source={badge.image}
                            style={{ width: 14, height: 15, resizeMode: 'contain' }}
                          />
                        </Pressable>
                      ));
                    })()}
                  </View>
                  <ThemedText style={styles.sellerScore}>Güven Skoru: {listing.sellerTrustScore}/10</ThemedText>
                </View>
              </Pressable>

              <Pressable style={[styles.chatBtn, { borderColor: theme.gold }]} onPress={handleStartChat}>
                <MessageSquare size={16} color={theme.gold} />
                <ThemedText style={{ color: theme.gold, fontSize: 13, fontWeight: 'bold' }}>Mesaj Gönder</ThemedText>
              </Pressable>
            </ThemedView>

            {/* Description */}
            <View style={styles.descSection}>
              <ThemedText style={styles.sectionTitle}>Ürün Açıklaması</ThemedText>
              <ThemedText style={styles.descText} themeColor="textSecondary">{listing.description}</ThemedText>
            </View>

            {/* Vehicle Technical Specs */}
            {listing.isVehicle && (listing.brand || listing.model || listing.year) && (
              <ThemedView type="backgroundElement" style={[styles.specsBox, { borderColor: theme.backgroundSelected }]}>
                <View style={styles.specsHead}>
                  <Car size={16} color={theme.gold} />
                  <ThemedText style={styles.specsTitle}>Araç Özellikleri</ThemedText>
                </View>
                <View style={styles.specsGrid}>
                  {listing.brand && (
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Marka:</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{listing.brand}</Text>
                    </View>
                  )}
                  {listing.model && (
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Model:</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{listing.model}</Text>
                    </View>
                  )}
                  {listing.year && (
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Model Yılı:</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{listing.year}</Text>
                    </View>
                  )}
                </View>
              </ThemedView>
            )}

            {/* Location Info (Universal) */}
            {(listing.city || listing.district || listing.neighborhood) && (
              <ThemedView type="backgroundElement" style={[styles.specsBox, { borderColor: theme.backgroundSelected }]}>
                <View style={styles.specsHead}>
                  <MapPin size={16} color={theme.gold} />
                  <ThemedText style={styles.specsTitle}>Konum Bilgileri</ThemedText>
                </View>
                <View style={styles.specsGrid}>
                  {listing.city && (
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Şehir (İl):</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{listing.city}</Text>
                    </View>
                  )}
                  {listing.district && (
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>İlçe:</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{listing.district}</Text>
                    </View>
                  )}
                  {listing.neighborhood && (
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Mahalle / Köy:</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>{listing.neighborhood}</Text>
                    </View>
                  )}
                </View>
              </ThemedView>
            )}

            {/* Certified Product document info */}
            {listing.verifiedProduct && (
              <ThemedView type="backgroundElement" style={styles.documentBox}>
                <View style={styles.documentHead}>
                  <BookOpen size={18} color={theme.gold} />
                  <ThemedText style={styles.documentTitle}>Belgeli Ürün (Orijinallik Onaylı)</ThemedText>
                </View>
                <ThemedText style={styles.documentDesc}>
                  Bu ürünün sertifika, ekspertiz raporu veya faturası satıcı tarafından yüklenmiştir.
                </ThemedText>
                <View style={styles.documentLinkRow}>
                  <ThemedText style={styles.documentFileName} numberOfLines={1}>
                    📄 {listing.documentUrl || 'sertifika.pdf'}
                  </ThemedText>
                  <Pressable style={styles.previewBtn} onPress={() => alert('Sertifika belgesi güvenli şekilde doğrulandı (Mock Raporu).')}>
                    <ThemedText style={styles.previewBtnText}>Görüntüle</ThemedText>
                    <ArrowRight size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              </ThemedView>
            )}

            {/* Interactive Bid/Offer Panel */}
            <ThemedView type="backgroundElement" style={styles.actionPanel}>
              <ThemedText style={styles.panelTitle}>
                {listing.type === 'auction'
                  ? 'Teklif Ver'
                  : listing.type === 'offer'
                  ? 'Teklif İlet'
                  : listing.type === 'rent'
                  ? 'Ürünü Kirala'
                  : 'Hemen Satın Al'}
              </ThemedText>

              {successMessage !== '' && <ThemedText style={styles.successText}>{successMessage}</ThemedText>}
              {errorMessage !== '' && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}

              {listing.type === 'fixed' || listing.type === 'rent' ? (
                <Pressable style={styles.submitBtn} onPress={handleAction}>
                  <ThemedText style={styles.submitBtnText}>
                    {listing.type === 'rent'
                      ? `Hemen Kirala (${listing.price} TL / ${listing.rentPeriod || 'Günlük'})`
                      : `Satın Al (${listing.price} TL)`}
                  </ThemedText>
                </Pressable>
              ) : (
                <View style={styles.bidInputRow}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholder={listing.type === 'auction' ? `${listing.price + 100} TL veya üzeri` : 'Teklif miktarınız'}
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={bidValue}
                      onChangeText={setBidValue}
                      style={[styles.textInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                    />
                    <Text style={styles.currencyText}>TL</Text>
                  </View>

                  <Pressable style={styles.submitBtn} onPress={handleAction}>
                    <Gavel size={16} color="#FFFFFF" />
                    <ThemedText style={styles.submitBtnText}>Gönder</ThemedText>
                  </Pressable>
                </View>
              )}
            </ThemedView>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    paddingBottom: 100,
  },
  desktopLayout: {
    flexDirection: 'row',
    padding: 24,
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  mobileLayout: {
    flexDirection: 'column',
  },
  desktopLeftCol: {
    width: 500,
    alignItems: 'center',
  },
  desktopRightCol: {
    flex: 1,
    gap: 16,
  },
  mobileImageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  imageGallery: {
    flex: 1,
  },
  galleryImage: {
    height: 300,
    resizeMode: 'cover',
  },
  infoSection: {
    padding: 20,
    gap: 16,
  },
  infoHead: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  priceContainer: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF5500',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
    marginVertical: 4,
  },
  alertBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertBoxTime: {
    color: '#FF5500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    gap: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FF5500',
  },
  sellerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sellerScore: {
    fontSize: 11,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  descSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
  },
  documentBox: {
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.2)',
    gap: 8,
  },
  documentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5500',
  },
  documentDesc: {
    fontSize: 12,
  },
  documentLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  documentFileName: {
    fontSize: 11,
    flex: 1,
  },
  previewBtn: {
    backgroundColor: '#FF5500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  previewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionPanel: {
    padding: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  bidInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  currencyText: {
    position: 'absolute',
    right: 12,
    color: '#FF5500',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#FF5500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 6,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  specsBox: {
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  specsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  specsGrid: {
    gap: 6,
    marginTop: 4,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 13,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
