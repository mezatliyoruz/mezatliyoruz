import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, Listing, Story } from '@/services/store';
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
  X,
  Star,
  Check,
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
  
  const { listings, createChat, stories, currentUser, addStory, reviews } = useAppStore();
  const sellerListings = listings.filter((l) => l.sellerName === sellerName);
  const sellerStories = (stories || []).filter(s => s.sellerName === sellerName);
  const hasStories = sellerStories.length > 0;

  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const storyProgress = useRef(new RNAnimated.Value(0)).current;
  const [storyListingSelect, setStoryListingSelect] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

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
    if (storyViewerVisible && sellerStories.length > 0) {
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
    if (activeStoryIndex < sellerStories.length - 1) {
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
    const chatId = createChat(firstListing.id, true);
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
            {hasStories ? (
              <Pressable onPress={() => { setStoryViewerVisible(true); setActiveStoryIndex(0); }}>
                <LinearGradient
                  colors={['#833ab4', '#fd1d1d', '#fcb045']}
                  style={styles.storyRing}
                >
                  <View style={[styles.avatarContainerStory, { backgroundColor: cardBg }]}>
                    <Image source={{ uri: sellerAvatar }} style={styles.avatar} />
                  </View>
                </LinearGradient>
              </Pressable>
            ) : (
              <View style={[styles.avatarContainer, { borderColor: theme.gold }]}>
                <Image source={{ uri: sellerAvatar }} style={styles.avatar} />
              </View>
            )}
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

               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 }}>
                <Text style={[styles.trustScoreText, { color: isDark ? theme.gold : theme.goldAccent, marginBottom: 0 }]}>
                  Güven Skoru: {sellerTrustScore}/10
                </Text>
                {(() => {
                  const sellerReviews = reviews.filter((r) => r.sellerName === sellerName);
                  if (sellerReviews.length === 0) return null;
                  const avg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Star size={11} color={theme.gold} fill={theme.gold} />
                      <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: 'bold' }}>
                        {avg.toFixed(1)} ({sellerReviews.length})
                      </Text>
                    </View>
                  );
                })()}
              </View>

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
                      style={{ width: 36, height: 40, resizeMode: 'contain' }}
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

          {/* Tab Selector Segment */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected, marginTop: 10 }}>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 14,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: activeTab === 'listings' ? theme.gold : 'transparent',
              }}
              onPress={() => setActiveTab('listings')}
            >
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: activeTab === 'listings' ? theme.gold : theme.textSecondary }}>
                İLANLAR ({sellerListings.length})
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                paddingVertical: 14,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: activeTab === 'reviews' ? theme.gold : 'transparent',
              }}
              onPress={() => setActiveTab('reviews')}
            >
              {(() => {
                const sellerReviews = reviews.filter((r) => r.sellerName === sellerName);
                return (
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: activeTab === 'reviews' ? theme.gold : theme.textSecondary }}>
                    DEĞERLENDİRMELER ({sellerReviews.length})
                  </Text>
                );
              })()}
            </Pressable>
          </View>

          {/* Conditional rendering based on activeTab */}
          {activeTab === 'listings' ? (
            <View>
              {sellerListings.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center', backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: itemBorder, marginTop: 12 }}>
                  <Text style={{ color: theme.textSecondary }}>Bu satıcının aktif ilanı bulunmamaktadır.</Text>
                </View>
              ) : (
                <View style={[styles.listingsGrid, { marginTop: 12 }]}>
                  {sellerListings.map((item) => (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.listingItem,
                        { backgroundColor: itemBg, borderColor: itemBorder },
                        pressed && { opacity: 0.6 }
                      ]}
                      onPress={() => router.push(`/product/${item.id}`)}
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
                        {currentUser && (sellerName === currentUser.name || sellerName === currentUser.shopName) && (
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
                        )}
                      </View>
                      <ChevronRight size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={{ gap: 12, marginTop: 12 }}>
              {(() => {
                const sellerReviews = reviews.filter((r) => r.sellerName === sellerName);
                if (sellerReviews.length === 0) {
                  return (
                    <View style={{ padding: 40, alignItems: 'center', backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: itemBorder }}>
                      <Text style={{ color: theme.textSecondary }}>Bu satıcı için henüz değerlendirme yapılmamış.</Text>
                    </View>
                  );
                }

                // Show reviews list
                return (
                  <View style={{ gap: 10 }}>
                    {sellerReviews.map((rev) => (
                      <View
                        key={rev.id}
                        style={{
                          backgroundColor: itemBg,
                          borderColor: itemBorder,
                          borderWidth: 1,
                          borderRadius: 10,
                          padding: 14,
                          gap: 8,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Image source={{ uri: rev.authorAvatar }} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#000' }} />
                            <View>
                              <Text style={{ color: theme.text, fontSize: 13, fontWeight: 'bold' }}>{rev.authorName}</Text>
                              <Text style={{ color: theme.textSecondary, fontSize: 10, marginTop: 1 }}>{rev.createdAt}</Text>
                            </View>
                          </View>
                          {/* Stars */}
                          <View style={{ flexDirection: 'row', gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                size={12}
                                color={theme.gold}
                                fill={idx < rev.rating ? theme.gold : 'transparent'}
                              />
                            ))}
                          </View>
                        </View>
                        <Text style={{ color: theme.text, fontSize: 12, lineHeight: 17, fontStyle: 'italic' }}>
                          "{rev.comment}"
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
            </View>
          )}
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
          {sellerStories.length > 0 && activeStoryIndex < sellerStories.length && (
            <View style={styles.storyViewerContainer}>
              {/* Full Screen Media (Image or Video) */}
              {(() => {
                const currentStory = sellerStories[activeStoryIndex];
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
                {sellerStories.map((st, idx) => {
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
                  source={{ uri: sellerAvatar }} 
                  style={styles.storyViewerAvatar} 
                />
                <Text style={styles.storyViewerUsername}>
                  {sellerName}
                </Text>
                
                <Pressable style={styles.storyViewerCloseBtn} onPress={() => setStoryViewerVisible(false)}>
                  <X size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Bottom Actions */}
              {sellerStories[activeStoryIndex].productId && (
                <View style={styles.storyViewerActions}>
                  <Pressable 
                    style={[styles.storyViewerBtn, { backgroundColor: 'rgba(255, 85, 0, 0.45)', borderColor: 'rgba(255, 85, 0, 0.6)', borderWidth: 1 }]}
                    onPress={() => {
                      const pid = sellerStories[activeStoryIndex].productId;
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
  storyRing: {
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
});
