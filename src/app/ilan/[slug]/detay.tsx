import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, Listing } from '@/services/store';
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
  GitCompare,
  X,
  Phone,
  Play,
  ShoppingCart,
  FileText,
  Copy,
} from 'lucide-react-native';
import { formatTime } from '@/utils/time';
import { useVideoPlayer, VideoView } from 'expo-video';
import CategoryBadge from '@/components/category-badge';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Clipboard from 'expo-clipboard';


function DetailVideoPlayer({ url, width, height, posterUrl }: { url: string; width: number; height: number; posterUrl?: string }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = false; // let the user hear the sound
    p.play();
  });

  const toggleMute = () => {
    const nextMuted = !player.muted;
    player.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlay = () => {
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <Pressable 
      onPress={togglePlay}
      style={{ width, height, backgroundColor: 'transparent', position: 'relative', overflow: 'hidden' }}
    >
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        nativeControls={false}
        contentFit="contain"
      />

      {/* Play/Pause indicator overlay */}
      {!isPlaying && (
        <View style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: 'rgba(7, 12, 25, 0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateX: -25 }, { translateY: -25 }],
          zIndex: 10,
        }}>
          <Play size={24} color="#F8FAFC" fill="#F8FAFC" />
        </View>
      )}

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
        onPress={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
      >
        {isMuted ? (
          <VolumeX size={18} color="#F8FAFC" />
        ) : (
          <Volume2 size={18} color="#F8FAFC" />
        )}
      </Pressable>
    </Pressable>
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
  const { slug, id } = useLocalSearchParams<{ slug?: string; id?: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { listings, deleteListing, toggleLike, placeBid, setAutoBidLimit, cancelAutoBidLimit, currentUser, createChat, decrementTimers, addToCart, setCartModalVisible, setCheckoutStep, isBiometricsEnabled, compareList, addToCompareList, removeFromCompareList } = useAppStore();
  const targetId = id || (slug ? (Array.isArray(slug) ? slug[0] : slug).split('-').pop() : undefined);
  const listing = listings.find((l) => l.id === targetId || l.listingNumber === targetId);

  const categoryLower = ((listing && listing.category) || '').toLowerCase();
  const isRealEstate = !!(listing && (listing.isRealEstate || categoryLower.includes('emlak')));
  const isVehicle = !!(listing && (
    listing.isVehicle ||
    categoryLower.includes('otomobil') ||
    categoryLower.includes('motosiklet') ||
    categoryLower.includes('karavan') ||
    categoryLower.includes('kamyon') ||
    categoryLower.includes('traktör') ||
    categoryLower.includes('iş makineleri') ||
    categoryLower.includes('vasıta') ||
    categoryLower.includes('araç') ||
    categoryLower.includes('araba')
  ));
  const showCartActions = !!(listing && listing.type === 'fixed' && !isRealEstate && !isVehicle);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isOwner = !!(currentUser && listing && (
    listing.sellerName === currentUser.name ||
    listing.sellerName === (currentUser.shopName || '') ||
    currentUser.role === 'super_admin'
  ));


  const [bidValue, setBidValue] = useState('');
  const [autoBidLimitValue, setAutoBidLimitValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getSellerPhone = () => {
    if (!listing) return '';
    if (listing.sellerPhone) return listing.sellerPhone;
    let hash = 0;
    const name = listing.sellerName || 'Satıcı';
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lastFour = Math.abs(hash % 9000) + 1000;
    return `0532 555 ${lastFour}`;
  };

  const handleCallSeller = () => {
    const phone = getSellerPhone().replace(/\s/g, '');
    Linking.openURL(`tel:${phone}`).catch((err) => {
      console.warn('Phone call failed:', err);
      Alert.alert('Hata', 'Arama başlatılamadı. Cihazınız telefon aramalarını desteklemiyor olabilir.');
    });
  };

  const handleDeleteListing = () => {
    if (!listing) return;
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
      if (confirmed) {
        deleteListing(listing.id);
        alert('İlanınız başarıyla silindi.');
        router.replace('/');
      }
    } else {
      Alert.alert(
        'İlanı Sil',
        'Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { 
            text: 'Evet, Sil', 
            style: 'destructive', 
            onPress: () => {
              deleteListing(listing.id);
              Alert.alert('Başarılı', 'İlanınız başarıyla silindi.', [
                { text: 'Tamam', onPress: () => router.replace('/') }
              ]);
            }
          }
        ]
      );
    }
  };

  // Sync timers
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTimers();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // SEO Redirection: Redirect legacy /product/[id] requests to /ilan/[slug]/detay
  useEffect(() => {
    if (listing) {
      const { getListingSeoUrl } = require('@/services/store');
      router.replace(getListingSeoUrl(listing));
    }
  }, [listing]);

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

  const userAutoBidLimit = listing.autoBids?.find((ab: any) => ab.bidderId === currentUser?.id);
  const hasActiveAutoBid = !!userAutoBidLimit;

  const maskName = (name: string | undefined): string => {
    if (!name) return '***';
    // Sadece ilan sahibi veya kazananın kendisi tam ismi görür
    const isWinner = currentUser && listing && currentUser.id === listing.lastBidderId;
    if (isOwner || isWinner) return name;
    return name.split(' ').map(part => {
      if (part.length <= 1) return part;
      return part[0] + '**';
    }).join(' ');
  };

  const handleStartAutoBid = async () => {
    const limit = parseFloat(autoBidLimitValue);
    if (isNaN(limit) || limit <= 0) {
      setErrorMessage('Lütfen geçerli bir limit girin.');
      return;
    }

    const minIncrement = listing.minIncrement !== undefined ? listing.minIncrement : 10;
    const minRequired = listing.price + minIncrement;
    if (limit < minRequired) {
      setErrorMessage(`Maksimum limit en az ${minRequired} TL olmalıdır.`);
      return;
    }
    
    if (isBiometricsEnabled) {
      try {
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Maksimum teklif otomasyonunu başlatmak için kimliğinizi doğrulayın.',
          fallbackLabel: 'Şifre Kullan',
        });
        if (!authResult.success) {
          setErrorMessage('Biyometrik doğrulama başarısız oldu. Otomasyon başlatılmadı.');
          return;
        }
      } catch (err) {
        console.warn('Biometrics auth failed:', err);
        setErrorMessage('Güvenlik doğrulamasında bir hata oluştu.');
        return;
      }
    }

    const result = setAutoBidLimit(listing.id, limit);
    if (result.success) {
      setSuccessMessage('Maksimum teklif otomasyonu başarıyla başlatıldı!');
      setAutoBidLimitValue('');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(result.error || 'Otomasyon başlatılamadı.');
    }
  };

  const handleCancelAutoBid = () => {
    const result = cancelAutoBidLimit(listing.id);
    if (result.success) {
      setSuccessMessage('Otomasyon başarıyla iptal edildi.');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(result.error || 'Otomasyon iptal edilemedi.');
    }
  };

  const handleAction = async () => {
    if (listing.type === 'fixed' || listing.type === 'rent') {
      setSuccessMessage(listing.type === 'rent' ? 'Kiralama talebiniz satıcıya iletildi!' : 'Satın alma talebi satıcıya iletildi!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      const amount = parseFloat(bidValue);
      if (isNaN(amount) || amount <= 0) {
        setErrorMessage('Lütfen geçerli bir teklif girin.');
        return;
      }

      if (isBiometricsEnabled) {
        try {
          const authResult = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Teklifinizi onaylamak için kimliğinizi doğrulayın.',
            fallbackLabel: 'Şifre Kullan',
          });
          if (!authResult.success) {
            setErrorMessage('Biyometrik doğrulama başarısız oldu. Teklif gönderilmedi.');
            return;
          }
        } catch (err) {
          console.warn('Biometrics auth failed:', err);
          setErrorMessage('Güvenlik doğrulamasında bir hata oluştu.');
          return;
        }
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable 
            style={[
              styles.navBarIcon, 
              { backgroundColor: theme.backgroundElement },
              compareList.some(c => c.id === listing.id) && { borderColor: theme.gold, borderWidth: 1 }
            ]} 
            onPress={() => {
              if (compareList.some(c => c.id === listing.id)) {
                removeFromCompareList(listing.id);
                Alert.alert('Çıkarıldı', 'İlan karşılaştırma listesinden çıkarıldı.');
              } else {
                addToCompareList(listing);
                Alert.alert('Eklendi', 'İlan karşılaştırma listesine eklendi. (Toplam: ' + (compareList.length + 1) + ')');
              }
            }}
          >
            <GitCompare size={20} color={compareList.some(c => c.id === listing.id) ? theme.gold : theme.text} />
          </Pressable>
          
          <Pressable style={[styles.navBarIcon, { backgroundColor: theme.backgroundElement }]} onPress={() => toggleLike(listing.id)}>
            <Heart size={20} color={listing.liked ? '#EF4444' : theme.text} fill={listing.liked ? '#EF4444' : 'transparent'} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>
          {/* Left: Images Carousel */}
          <View style={isDesktop ? styles.desktopLeftCol : styles.mobileImageContainer}>
            <ScrollView 
              ref={scrollRef}
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false} 
              style={styles.imageGallery}
              onScroll={(event) => {
                const contentOffset = event.nativeEvent.contentOffset.x;
                const viewWidth = isDesktop ? 600 : width;
                const index = Math.round(contentOffset / viewWidth);
                if (index !== activeImageIndex) {
                  setActiveImageIndex(index);
                }
              }}
              scrollEventThrottle={16}
            >
              {listing.videoUrl && (
                <DetailVideoPlayer 
                  url={listing.videoUrl} 
                  width={isDesktop ? 600 : width} 
                  height={isDesktop ? 500 : 350} 
                  posterUrl={listing.photos[0]} 
                />
              )}
              {listing.photos.map((url, idx) => (
                <View key={idx} style={{ width: isDesktop ? 600 : width, height: isDesktop ? 500 : 350, justifyContent: 'center', alignItems: 'center' }}>
                  <Image 
                    source={typeof url === 'number' ? url : { uri: url }} 
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
                  />
                </View>
              ))}
            </ScrollView>

            {/* Thumbnail Gallery (Video + Photos) */}
            {((listing.videoUrl ? 1 : 0) + listing.photos.length) > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {listing.videoUrl && (
                  <Pressable
                    onPress={() => {
                      setActiveImageIndex(0);
                      scrollRef.current?.scrollTo({ x: 0, animated: true });
                    }}
                    style={{
                      borderWidth: 2,
                      borderColor: activeImageIndex === 0 ? theme.gold : 'transparent',
                      borderRadius: 6,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <View style={{ width: 50, height: 50, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                      <Play size={20} color="#FFF" />
                    </View>
                  </Pressable>
                )}
                {listing.photos.map((url, idx) => {
                  const itemIndex = idx + (listing.videoUrl ? 1 : 0);
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setActiveImageIndex(itemIndex);
                        scrollRef.current?.scrollTo({ x: itemIndex * (isDesktop ? 600 : width), animated: true });
                      }}
                      style={{
                        borderWidth: 2,
                        borderColor: activeImageIndex === itemIndex ? theme.gold : 'transparent',
                        borderRadius: 6,
                        overflow: 'hidden'
                      }}
                    >
                      <Image
                        source={typeof url === 'number' ? url : { uri: url }}
                        style={{ width: 50, height: 50, resizeMode: 'cover' }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Right: Info and Interactive Panel */}
          <View style={isDesktop ? styles.desktopRightCol : styles.infoSection}>
            {/* Header info */}
            <View style={styles.infoHead}>
              <View style={styles.categoryRow}>
                <CategoryBadge item={listing} />
                <ThemedText style={{ color: theme.textSecondary }}>•</ThemedText>
                <ThemedText style={{ color: theme.gold, fontWeight: 'bold' }}>{listing.condition}</ThemedText>
                {listing.listingNumber && (
                  <>
                    <ThemedText style={{ color: theme.textSecondary }}>•</ThemedText>
                    <Pressable
                      onPress={async () => {
                        await Clipboard.setStringAsync(listing.listingNumber || '');
                        if (Platform.OS === 'web') {
                          alert('İlan numarası kopyalandı!');
                        } else {
                          Alert.alert('Başarılı', 'İlan numarası panoya kopyalandı.');
                        }
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <ThemedText style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                        İlan No: {listing.listingNumber}
                      </ThemedText>
                      <Copy size={12} color={theme.textSecondary} />
                    </Pressable>
                  </>
                )}
              </View>

              <ThemedText style={styles.productTitle}>{listing.title}</ThemedText>
              
              <View style={styles.priceContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                  <View>
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
                  {listing.type === 'auction' && listing.reservePrice !== undefined && listing.reservePrice > 0 && (
                    <View style={{ alignItems: 'flex-end', backgroundColor: 'rgba(9, 105, 218, 0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(9, 105, 218, 0.2)' }}>
                      <ThemedText style={{ fontSize: 11, color: theme.gold, fontWeight: 'bold' }}>⚡ HEMEN AL FİYATI</ThemedText>
                      <ThemedText style={{ fontSize: 16, color: theme.gold, fontWeight: '900', marginTop: 2 }}>
                        {listing.reservePrice.toLocaleString('tr-TR')} TL
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Auction Winner Highlight Box (Prominent at top) */}
            {listing.type === 'auction' && listing.timeLeft !== undefined && listing.timeLeft <= 0 && listing.lastBidderId && (
              <View style={{
                backgroundColor: 'rgba(184, 134, 11, 0.15)',
                borderColor: theme.gold,
                borderWidth: 1.5,
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12
              }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(184, 134, 11, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20 }}>🏆</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.gold }}>Mezat Kazananı En Üstte</Text>
                  <Text style={{ fontSize: 13, color: theme.text }}>
                    Kullanıcı: <Text style={{ fontWeight: 'bold' }}>{maskName(listing.lastBidderName)}</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                    Kapanış Fiyatı: {listing.price.toLocaleString('tr-TR')} TL
                  </Text>
                </View>
              </View>
            )}

            {/* Auction Timer Box */}
            {listing.type === 'auction' && listing.timeLeft !== undefined && (
              <ThemedView type="backgroundElement" style={[
                styles.alertBox, 
                { borderColor: theme.gold },
                listing.timeLeft <= 0 && listing.lastBidderId && { backgroundColor: 'rgba(184, 134, 11, 0.05)' }
              ]}>
                <Clock size={18} color={theme.gold} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.alertBoxTitle, { fontWeight: 'bold' }]}>
                    {listing.timeLeft > 0 ? 'Açık Artırma Devam Ediyor' : 'Açık Artırma Sona Erdi'}
                  </ThemedText>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {listing.timeLeft > 0 
                      ? 'Anti-sniping aktif: Son 2 dakikada yapılan teklifler süreyi +2 dakika uzatır.'
                      : listing.lastBidderName 
                        ? `Kazanan: ${maskName(listing.lastBidderName)} (${listing.price.toLocaleString('tr-TR')} TL)`
                        : 'Teklif veren olmadığı için mezat sona erdi.'}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.alertBoxTime, { color: theme.gold }]}>
                  {listing.timeLeft > 0 ? formatTime(listing.timeLeft) : 'Süre Doldu'}
                </ThemedText>
              </ThemedView>
            )}

            {/* Seller profile box */}
            <ThemedView type="backgroundElement" style={[styles.sellerCard, { borderColor: theme.backgroundSelected }]}>
              <Pressable
                onPress={() => router.push(`/seller/${encodeURIComponent(listing.sellerName)}`)}
                hitSlop={15}
                style={({ pressed }) => [
                  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
                  pressed && { opacity: 0.5 }
                ]}
              >
                <Image source={{ uri: listing.sellerAvatar }} style={styles.sellerAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                            style={{ width: 18, height: 20, resizeMode: 'contain' }}
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

            {/* Listing Info Specs Box */}
            <ThemedView type="backgroundElement" style={[styles.specsBox, { borderColor: theme.backgroundSelected, marginBottom: 12 }]}>
              <View style={styles.specsHead}>
                <FileText size={16} color={theme.gold} />
                <ThemedText style={styles.specsTitle}>İlan Bilgileri</ThemedText>
              </View>
              <View style={styles.specsGrid}>
                {listing.listingNumber && (
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.textSecondary }]}>İlan Numarası:</Text>
                    <Pressable
                      onPress={async () => {
                        await Clipboard.setStringAsync(listing.listingNumber || '');
                        if (Platform.OS === 'web') {
                          alert('İlan numarası kopyalandı!');
                        } else {
                          Alert.alert('Başarılı', 'İlan numarası panoya kopyalandı.');
                        }
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <Text style={[styles.specValue, { color: theme.gold, fontWeight: 'bold' }]}>
                        {listing.listingNumber}
                      </Text>
                      <Copy size={13} color={theme.gold} />
                    </Pressable>
                  </View>
                )}
                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Yayın Tarihi:</Text>
                  <Text style={[styles.specValue, { color: theme.text }]}>Bugün</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: theme.textSecondary }]}>İlan Türü:</Text>
                  <Text style={[styles.specValue, { color: theme.text }]}>
                    {listing.type === 'auction' ? 'Açık Artırma (Mezat)' : listing.type === 'offer' ? 'Teklifli Satış' : listing.type === 'rent' ? 'Kiralık' : 'Sabit Fiyatlı Satış'}
                  </Text>
                </View>
                {listing.stock !== undefined && (
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Stok Adedi:</Text>
                    <Text style={[styles.specValue, { color: theme.text, fontWeight: 'bold' }]}>{listing.stock} Adet</Text>
                  </View>
                )}
              </View>
            </ThemedView>

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
                  <ThemedText style={styles.documentTitle}>Belgeli Ürün</ThemedText>
                </View>
                <ThemedText style={styles.documentDesc}>
                  Bu ürünün sertifika, ekspertiz raporu veya faturası satıcı tarafından yüklenmiştir. Belgelerin kontrolü ve doğruluğu tamamen alıcının sorumluluğundadır.
                </ThemedText>
                <View style={styles.documentLinkRow}>
                  <ThemedText style={styles.documentFileName} numberOfLines={1}>
                    📄 {listing.documentUrl || 'sertifika.pdf'}
                  </ThemedText>
                  <Pressable 
                    style={styles.previewBtn} 
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        alert('Belge açılıyor. Belgelerin kontrolü ve doğruluğu tamamen alıcının sorumluluğundadır.');
                      } else {
                        Alert.alert('Bilgi', 'Belge açılıyor. Belgelerin kontrolü ve doğruluğu tamamen alıcının sorumluluğundadır.');
                      }
                    }}
                  >
                    <ThemedText style={styles.previewBtnText}>Görüntüle</ThemedText>
                    <ArrowRight size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              </ThemedView>
            )}

            {/* Interactive Bid/Offer Panel */}
            <ThemedView type="backgroundElement" style={styles.actionPanel}>
              {isOwner ? (
                <View style={{ gap: 12, width: '100%' }}>
                  <ThemedText style={[styles.panelTitle, { color: theme.gold }]}>⚙️ İlan Yönetimi</ThemedText>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 4 }}>
                    Bu ilan size aittir. İlan detaylarını güncelleyebilir veya ilanı tamamen yayından kaldırabilirsiniz.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                    <Pressable 
                      style={[styles.submitBtn, { flex: 1, minWidth: 140, backgroundColor: theme.gold }]} 
                      onPress={() => router.push(`/create?editId=${listing.id}`)}
                    >
                      <Text style={styles.submitBtnText}>✏️ İlanı Düzenle</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.submitBtn, { flex: 1, minWidth: 140, backgroundColor: '#EF4444' }]} 
                      onPress={handleDeleteListing}
                    >
                      <Text style={styles.submitBtnText}>🗑️ İlanı Sil</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <ThemedText style={styles.panelTitle}>
                    {listing.type === 'auction'
                      ? 'Teklif Ver'
                      : listing.type === 'offer'
                      ? 'Teklif İlet'
                      : 'İletişime Geçin'}
                  </ThemedText>

                  {successMessage !== '' && <ThemedText style={styles.successText}>{successMessage}</ThemedText>}
                  {errorMessage !== '' && <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>}

                  {showCartActions ? (
                    <View style={{ gap: 12, width: '100%' }}>
                      <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 4 }}>
                        Güvenli Ödeme Sistemi ile ürünü hemen satın alabilir veya sepetinize ekleyebilirsiniz.
                      </Text>
                      
                      {/* Sepete Ekle & Hemen Al Buttons */}
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Pressable 
                          style={[styles.submitBtn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.gold }]} 
                          onPress={() => {
                            addToCart(listing.id);
                            if (Platform.OS === 'web') {
                              alert('Ürün başarıyla sepete eklendi.');
                            } else {
                              Alert.alert('Başarılı', 'Ürün başarıyla sepete eklendi.');
                            }
                          }}
                        >
                          <ShoppingCart size={16} color={theme.gold} />
                          <Text style={[styles.submitBtnText, { color: theme.gold }]}>Sepete Ekle</Text>
                        </Pressable>
                        
                        <Pressable 
                          style={[styles.submitBtn, { flex: 1, backgroundColor: theme.gold }]} 
                          onPress={() => {
                            addToCart(listing.id);
                            setCheckoutStep('shipping');
                            setCartModalVisible(true);
                          }}
                        >
                          <ShieldCheck size={16} color="#000000" />
                          <Text style={[styles.submitBtnText, { color: '#000000' }]}>Hemen Al</Text>
                        </Pressable>
                      </View>

                      {/* Contact Buttons as secondary options */}
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                        <Pressable 
                          style={[styles.submitBtn, { flex: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: theme.backgroundSelected }]} 
                          onPress={handleCallSeller}
                        >
                          <Phone size={14} color={theme.text} />
                          <Text style={[styles.submitBtnText, { fontSize: 12, color: theme.text }]}>Ara</Text>
                        </Pressable>
                        <Pressable 
                          style={[styles.submitBtn, { flex: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: theme.backgroundSelected }]} 
                          onPress={handleStartChat}
                        >
                          <MessageSquare size={14} color={theme.text} />
                          <Text style={[styles.submitBtnText, { fontSize: 12, color: theme.text }]}>Mesaj Gönder</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (listing.type === 'fixed' || listing.type === 'rent') ? (
                    <View style={{ gap: 12, width: '100%' }}>
                      <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 4 }}>
                        Bu ilan modelinde satın alma veya kiralama işlemleri doğrudan kullanıcılar arasında (arama veya mesajlaşma yoluyla) gerçekleştirilmektedir.
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Pressable 
                          style={[styles.submitBtn, { flex: 1, backgroundColor: theme.gold }]} 
                          onPress={handleCallSeller}
                        >
                          <Phone size={16} color="#FFFFFF" />
                          <Text style={styles.submitBtnText}>Satıcıyı Ara ({getSellerPhone()})</Text>
                        </Pressable>
                        <Pressable 
                          style={[styles.submitBtn, { flex: 1, backgroundColor: 'rgba(9, 105, 218, 0.12)', borderWidth: 1.5, borderColor: '#0969da' }]} 
                          onPress={handleStartChat}
                        >
                          <MessageSquare size={16} color="#0969da" />
                          <Text style={[styles.submitBtnText, { color: '#0969da' }]}>Mesaj Gönder</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={{ gap: 12 }}>
                      {listing.type === 'auction' && listing.timeLeft !== undefined && listing.timeLeft <= 0 ? (
                        <View style={{
                          padding: 16,
                          borderRadius: 12,
                          backgroundColor: theme.background,
                          borderWidth: 1,
                          borderColor: theme.backgroundSelected,
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.gold }}>🏆 Açık Artırma Sonlandı</Text>
                          {listing.lastBidderId ? (
                            <>
                              <Text style={{ color: theme.text, fontSize: 13, textAlign: 'center' }}>
                                Kazanan Teklif: <Text style={{ fontWeight: 'bold' }}>{maskName(listing.lastBidderName)}</Text> ({listing.price.toLocaleString('tr-TR')} TL)
                              </Text>
                              {listing.lastBidderId === currentUser?.id ? (
                                <View style={{ gap: 10, marginTop: 8, width: '100%' }}>
                                  <Text style={{ color: '#10B981', fontWeight: '800', textAlign: 'center', fontSize: 12 }}>
                                    Tebrikler! Bu mezatı siz kazandınız.
                                  </Text>
                                  <Pressable 
                                    style={[styles.submitBtn, { backgroundColor: '#10B981', width: '100%', alignSelf: 'center' }]}
                                    onPress={() => {
                                      setCheckoutStep('cart');
                                      setCartModalVisible(true);
                                    }}
                                  >
                                    <ShoppingCart size={16} color="#FFFFFF" />
                                    <Text style={styles.submitBtnText}>Sepete Git & Satın Al</Text>
                                  </Pressable>
                                </View>
                              ) : (
                                <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center' }}>
                                  Bu mezat sona ermiştir. Yeni teklif verilemez.
                                </Text>
                              )}
                            </>
                          ) : (
                            <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
                              Teklif veren olmadığı için mezat kapatıldı.
                            </Text>
                          )}
                        </View>
                      ) : (
                        <>
                          <View style={styles.bidInputRow}>
                            <View style={styles.inputContainer}>
                              <TextInput
                                placeholder={listing.type === 'auction' ? `${listing.price + (listing.minIncrement || 10)} TL veya üzeri` : 'Teklif miktarınız'}
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
                              <ThemedText style={styles.submitBtnText}>Teklif Ver</ThemedText>
                            </Pressable>
                          </View>

                          {listing.type === 'auction' && (
                            <View style={styles.autoBidContainer}>
                              <View style={styles.autoBidDivider} />
                              <ThemedText style={styles.autoBidTitle}>🤖 Maksimum Teklif Otomasyonu</ThemedText>
                              <ThemedText style={styles.autoBidDesc}>
                                Maksimum limitinizi belirleyerek sistemi başlatın. Sistem, rakipleriniz teklif verdikçe sizin adınıza en düşük artış tutarı ({listing.minIncrement || 10} TL) kadar artışla otomatik teklif verir.
                              </ThemedText>
                              
                              {hasActiveAutoBid ? (
                                <View style={styles.activeAutoBidRow}>
                                  <ThemedText style={styles.activeAutoBidText}>
                                    Aktif Otomasyon Limitiniz: <Text style={{ color: theme.gold, fontWeight: 'bold' }}>{userAutoBidLimit?.maxAmount.toLocaleString('tr-TR')} TL</Text>
                                  </ThemedText>
                                  <Pressable style={styles.cancelAutoBidBtn} onPress={handleCancelAutoBid}>
                                    <X size={14} color="#EF4444" />
                                    <Text style={styles.cancelAutoBidBtnText}>İptal Et</Text>
                                  </Pressable>
                                </View>
                              ) : (
                                <View style={styles.autoBidInputRow}>
                                  <View style={styles.inputContainer}>
                                    <TextInput
                                      placeholder={`Limit girin (örn: ${listing.price + (listing.minIncrement || 10) * 5})`}
                                      placeholderTextColor={theme.textSecondary}
                                      keyboardType="numeric"
                                      value={autoBidLimitValue}
                                      onChangeText={setAutoBidLimitValue}
                                      style={[styles.textInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                                    />
                                    <Text style={styles.currencyText}>TL</Text>
                                  </View>

                                  <Pressable style={styles.startAutoBidBtn} onPress={handleStartAutoBid}>
                                    <Text style={styles.startAutoBidBtnText}>Başlat</Text>
                                  </Pressable>
                                </View>
                              )}
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </>
              )}
            </ThemedView>

            {/* Last Bids List (Son Teklifler) */}
            {listing.type === 'auction' && (
              <ThemedView type="backgroundElement" style={styles.bidsSection}>
                <View style={styles.bidsHeader}>
                  <Gavel size={16} color={theme.gold} />
                  <ThemedText style={styles.bidsTitle}>Son Teklifler ({listing.bidsCount || 0})</ThemedText>
                </View>
                
                {(!listing.bids || listing.bids.length === 0) ? (
                  <ThemedText style={styles.noBidsText} themeColor="textSecondary">
                    Henüz teklif verilmedi. İlk teklifi siz verin!
                  </ThemedText>
                ) : (
                  <View style={{ height: 180 }}>
                    <ScrollView 
                      nestedScrollEnabled={true} 
                      style={styles.bidsList}
                      contentContainerStyle={{ paddingVertical: 4 }}
                    >
                      {listing.bids.map((bid: any, idx: number) => (
                        <View 
                          key={bid.id || idx} 
                          style={[
                            styles.bidRow, 
                            { borderBottomColor: theme.backgroundSelected },
                            idx === 0 && { backgroundColor: 'rgba(9, 105, 218, 0.05)' } // highlight latest
                          ]}
                        >
                          <Image source={{ uri: bid.bidderAvatar }} style={styles.bidderAvatar} />
                          <View style={{ flex: 1 }}>
                            <ThemedText style={styles.bidderName}>
                              {maskName(bid.bidderName)}
                              {bid.bidderId === currentUser?.id && ' (Siz)'}
                            </ThemedText>
                            <Text style={[styles.bidTime, { color: theme.textSecondary }]}>
                              {new Date(bid.timestamp).toLocaleTimeString('tr-TR')}
                            </Text>
                          </View>
                          <Text style={[styles.bidAmount, { color: theme.gold }]}>
                            {bid.amount.toLocaleString('tr-TR')} TL
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </ThemedView>
            )}
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
    gap: 32,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  mobileLayout: {
    flexDirection: 'column',
  },
  desktopLeftCol: {
    width: 600,
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  desktopRightCol: {
    flex: 1,
    gap: 20,
  },
  mobileImageContainer: {
    height: 350,
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  imageGallery: {
    width: '100%',
    height: '100%',
  },
  galleryImage: {
    height: '100%',
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
    color: '#0969da',
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
    color: '#0969da',
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
    borderColor: '#0969da',
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
    borderColor: 'rgba(9, 105, 218, 0.2)',
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
    color: '#0969da',
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
    backgroundColor: '#0969da',
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
    color: '#0969da',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#0969da',
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
  autoBidContainer: {
    marginTop: 8,
    gap: 8,
  },
  autoBidDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
  autoBidTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  autoBidDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  activeAutoBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
  },
  activeAutoBidText: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  cancelAutoBidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelAutoBidBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  autoBidInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  startAutoBidBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startAutoBidBtnText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bidsSection: {
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
    marginTop: 8,
  },
  bidsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bidsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  noBidsText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  bidsList: {
    flex: 1,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 4,
    gap: 12,
  },
  bidderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bidderName: {
    fontSize: 13,
    fontWeight: '600',
  },
  bidTime: {
    fontSize: 11,
    marginTop: 2,
  },
  bidAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
