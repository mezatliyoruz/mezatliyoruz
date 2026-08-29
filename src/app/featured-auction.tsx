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
  Text,
  Animated,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Gavel,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Cpu,
  Bookmark,
  TrendingUp,
  Pencil,
  X,
  Check,
  Plus,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/services/store';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function FeaturedAuctionScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const {
    currentUser,
    liveFeaturedAuction,
    draftFeaturedAuction,
    updateDraftFeaturedAuction,
    publishFeaturedAuction,
    loadCMSData,
  } = useAppStore();

  const activeAuction = currentUser?.role === 'super_admin' ? draftFeaturedAuction : liveFeaturedAuction;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current; // overall page fade-in
  const headerSlideAnim = useRef(new Animated.Value(-50)).current; // header slide
  const pulseAnim = useRef(new Animated.Value(1)).current; // Live badge pulse animation
  const registerButtonScale = useRef(new Animated.Value(1)).current; // Registration button scale
  const timerAnim = useRef(new Animated.Value(0)).current; // timer card slide down

  // Staggered list items animations (grow dynamically)
  const listItemsAnim = useRef<Animated.Value[]>([]).current;
  if (listItemsAnim.length < activeAuction.vehicles.length) {
    const isInitial = listItemsAnim.length === 0;
    for (let i = listItemsAnim.length; i < activeAuction.vehicles.length; i++) {
      listItemsAnim.push(new Animated.Value(isInitial ? 0 : 1));
    }
  }

  // Countdown timer state (target 12:00 today)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRegistered, setIsRegistered] = useState(false);

  // Edit CMS states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<'hero' | 'title' | 'vehicle' | 'footer' | null>(null);
  const [editVehicleId, setEditVehicleId] = useState<string | null>(null);

  const [inputHeroImage, setInputHeroImage] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputSubtitle, setInputSubtitle] = useState('');
  const [inputFooterTitle, setInputFooterTitle] = useState('');
  const [inputFooterDescription, setInputFooterDescription] = useState('');

  const [inputVehicleTitle, setInputVehicleTitle] = useState('');
  const [inputVehicleImage, setInputVehicleImage] = useState('');
  const [inputVehicleStartPrice, setInputVehicleStartPrice] = useState('');
  const [inputVehicleBuyNowPrice, setInputVehicleBuyNowPrice] = useState('');
  const [inputVehicleEngine, setInputVehicleEngine] = useState('');
  const [inputVehicleKm, setInputVehicleKm] = useState('');
  const [inputVehicleCert, setInputVehicleCert] = useState('');

  // Trigger page animations on mount
  useEffect(() => {
    loadCMSData();

    // 1. Overall fade-in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 30,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(timerAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Pulse animation loop for LIVE badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // 3. Staggered list items load
    const listAnimations = listItemsAnim.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 200 + index * 200,
        useNativeDriver: true,
      });
    });
    Animated.stagger(200, listAnimations).start();

    // 4. Timer interval calculation
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(12, 0, 0, 0); // target 12:00 today

      let diff = target.getTime() - now.getTime();
      if (diff < 0) {
        // If 12:00 has passed today, target 12:00 tomorrow
        target.setDate(target.getDate() + 1);
        diff = target.getTime() - now.getTime();
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = () => {
    // Pulse scale the button on press
    Animated.sequence([
      Animated.timing(registerButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(registerButtonScale, {
        toValue: 1,
        tension: 40,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsRegistered(true);
    });
  };

  // CMS Edit handlers
  const handleStartEditHero = () => {
    setEditTarget('hero');
    setInputHeroImage(draftFeaturedAuction.heroImage);
    setEditModalVisible(true);
  };

  const handleStartEditTitle = () => {
    setEditTarget('title');
    setInputTitle(draftFeaturedAuction.title);
    setInputSubtitle(draftFeaturedAuction.subtitle);
    setEditModalVisible(true);
  };

  const handleStartEditVehicle = (vehicleId: string) => {
    const car = draftFeaturedAuction.vehicles.find(v => v.id === vehicleId);
    if (!car) return;
    setEditTarget('vehicle');
    setEditVehicleId(vehicleId);
    setInputVehicleTitle(car.title);
    setInputVehicleImage(car.image);
    setInputVehicleStartPrice(car.startPrice.toString());
    setInputVehicleBuyNowPrice(car.buyNowPrice.toString());
    setInputVehicleEngine(car.specEngine);
    setInputVehicleKm(car.specKm);
    setInputVehicleCert(car.cert);
    setEditModalVisible(true);
  };

  const handleStartAddVehicle = () => {
    setEditTarget('vehicle');
    setEditVehicleId(null);
    setInputVehicleTitle('');
    setInputVehicleImage('');
    setInputVehicleStartPrice('');
    setInputVehicleBuyNowPrice('');
    setInputVehicleEngine('');
    setInputVehicleKm('');
    setInputVehicleCert('');
    setEditModalVisible(true);
  };

  const handleStartEditFooter = () => {
    setEditTarget('footer');
    setInputFooterTitle(draftFeaturedAuction.footerTitle || 'Prestige Auction House');
    setInputFooterDescription(draftFeaturedAuction.footerDescription || 'Bu müzayedede yer alan tüm araçlar ekspertiz onaylı, orijinal lisanslı ve noter onaylı sertifikalıdır.');
    setEditModalVisible(true);
  };

  const handleSaveDraftChanges = () => {
    let updatedAuction = { ...draftFeaturedAuction };

    if (editTarget === 'hero') {
      updatedAuction.heroImage = inputHeroImage;
    } else if (editTarget === 'title') {
      updatedAuction.title = inputTitle;
      updatedAuction.subtitle = inputSubtitle;
    } else if (editTarget === 'footer') {
      updatedAuction.footerTitle = inputFooterTitle;
      updatedAuction.footerDescription = inputFooterDescription;
    } else if (editTarget === 'vehicle') {
      if (editVehicleId) {
        // Edit existing vehicle
        updatedAuction.vehicles = draftFeaturedAuction.vehicles.map(v => {
          if (v.id === editVehicleId) {
            return {
              ...v,
              title: inputVehicleTitle,
              image: inputVehicleImage,
              startPrice: parseFloat(inputVehicleStartPrice) || 0,
              buyNowPrice: parseFloat(inputVehicleBuyNowPrice) || 0,
              specEngine: inputVehicleEngine,
              specKm: inputVehicleKm,
              cert: inputVehicleCert,
            };
          }
          return v;
        });
      } else {
        // Add new vehicle
        const newId = `car_${Date.now()}`;
        const newVehicle = {
          id: newId,
          title: inputVehicleTitle || 'Yeni Eser',
          image: inputVehicleImage || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
          startPrice: parseFloat(inputVehicleStartPrice) || 0,
          buyNowPrice: parseFloat(inputVehicleBuyNowPrice) || 0,
          specEngine: inputVehicleEngine || '4.0L V8',
          specTransmission: 'Manuel 5 İleri',
          specKm: inputVehicleKm || '0 km',
          color: 'Siyah',
          cert: inputVehicleCert || 'Orijinal Sertifikalı',
        };
        updatedAuction.vehicles = [...draftFeaturedAuction.vehicles, newVehicle];
      }
    }

    updateDraftFeaturedAuction(updatedAuction);
    setEditModalVisible(false);
    alert('Müzayede Değişiklikleri Kaydedildi (Taslak)! Herkese görünür olması için alttaki "Müzayedeyi Yayınla" butonuna basın.');
  };

  const handlePublishAuction = () => {
    publishFeaturedAuction();
    alert('Tebrikler! Müzayede değişiklikleri canlıda yayınlandı.');
  };

  const cardBg = '#111A30';
  const itemBorder = 'rgba(255, 255, 255, 0.05)';
  const labelColor = '#94A3B8';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" />

      {/* Admin Floating Publish Bar */}
      {currentUser?.role === 'super_admin' && (
        <View style={styles.adminFloatingBar}>
          <Sparkles size={14} color="#0969da" style={{ marginRight: 6 }} />
          <Text style={styles.adminBarText}>Müzayede Taslak Modu</Text>
          <Pressable style={styles.adminPublishBtn} onPress={handlePublishAuction}>
            <Text style={styles.adminPublishBtnText}>Müzayedeyi Yayınla</Text>
          </Pressable>
        </View>
      )}

      {/* Hero Header with Background image & Gradients */}
      <View style={styles.heroContainer}>
        {activeAuction.heroImage && !activeAuction.heroImage.includes('1617788138017') ? (
          <Image source={{ uri: activeAuction.heroImage }} style={styles.heroImage} />
        ) : (
          <Image source={{ uri: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000' }} style={styles.heroImage} />
        )}
        
        <LinearGradient
          colors={['rgba(7, 12, 25, 0.2)', 'rgba(7, 12, 25, 0.8)', '#070C19']}
          style={styles.gradient}
        />

        {/* Hero Edit Button Overlay */}
        {currentUser?.role === 'super_admin' && (
          <Pressable style={[styles.pencilEditBtn, styles.heroEditBtn]} onPress={handleStartEditHero}>
            <Pencil size={12} color="#070C19" />
          </Pressable>
        )}

        {/* Back Button */}
        <Pressable 
          style={styles.backButton} 
          onPress={() => {
            router.back();
          }}
        >
          <ArrowLeft size={20} color="#F8FAFC" />
        </Pressable>

        {/* Hero Meta Info */}
        <Animated.View
          style={[
            styles.heroContent,
            { transform: [{ translateY: headerSlideAnim }] }
          ]}
        >
          {/* Animated LIVE Badge */}
          <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>PREMIUM EVENT</Text>
          </Animated.View>

          <View style={styles.titleEditRow}>
            <Text style={[styles.heroTitle, { flex: 1 }]}>{activeAuction.title}</Text>
            {currentUser?.role === 'super_admin' && (
              <Pressable style={styles.pencilEditBtn} onPress={handleStartEditTitle}>
                <Pencil size={12} color="#070C19" />
              </Pressable>
            )}
          </View>
          
          <Text style={styles.heroSubtitle}>{activeAuction.subtitle}</Text>

          <View style={styles.eventInfoRow}>
            <View style={styles.infoPill}>
              <Calendar size={14} color="#0969da" />
              <Text style={styles.infoPillText}>Bugün 12:00</Text>
            </View>
            <View style={styles.infoPill}>
              <Gavel size={14} color="#0969da" />
              <Text style={styles.infoPillText}>{activeAuction.vehicles.length} Eser Mevcut</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContainer, currentUser?.role === 'super_admin' && { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Countdown Timer Card */}
        <Animated.View 
          style={[
            styles.timerCard, 
            { 
              opacity: timerAnim,
              transform: [{
                translateY: timerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0]
                })
              }],
              borderColor: 'transparent',
              borderWidth: 0,
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            }
          ]}
        >
          <View style={styles.timerHeader}>
            <Clock size={16} color={theme.gold} />
            <Text style={[styles.timerTitle, { color: '#F8FAFC' }]}>MÜZAYEDE BAŞLANGIÇ GERİ SAYIMI</Text>
          </View>
 
          <View style={styles.countdownRow}>
            <View style={[styles.timerBox, { backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
              <Text style={[styles.timerValue, { color: theme.gold }]}>
                {timeLeft.hours.toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.timerLabel, { color: '#94A3B8' }]}>Saat</Text>
            </View>
            <Text style={[styles.timerSeparator, { color: theme.gold }]}>:</Text>
            <View style={[styles.timerBox, { backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
              <Text style={[styles.timerValue, { color: theme.gold }]}>
                {timeLeft.minutes.toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.timerLabel, { color: '#94A3B8' }]}>Dakika</Text>
            </View>
            <Text style={[styles.timerSeparator, { color: theme.gold }]}>:</Text>
            <View style={[styles.timerBox, { backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
              <Text style={[styles.timerValue, { color: theme.gold }]}>
                {timeLeft.seconds.toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.timerLabel, { color: '#94A3B8' }]}>Saniye</Text>
            </View>
          </View>
 
          {/* Registration Button / Status */}
          {isRegistered ? (
            <View style={[styles.registeredStatus, { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.06)' }]}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={[styles.registeredText, { color: '#10B981' }]}>Katılım Başvurunuz Onaylandı. Bildirim Gönderilecek.</Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: registerButtonScale }] }}>
              <Pressable
                style={[styles.registerButton, { backgroundColor: theme.gold }]}
                onPress={handleRegister}
              >
                <Sparkles size={16} color="#FFFFFF" />
                <Text style={[styles.registerButtonText, { color: '#FFFFFF' }]}>Katılım Başvurusu Yap</Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>

        {/* Vehicles Catalogue */}
        <View style={styles.catalogueHeader}>
          <View style={[styles.sectionLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.catalogueTitle, { color: '#F8FAFC' }]}>MÜZAYEDE KATALOĞU</Text>
        </View>

        {/* Staggered load items */}
        {activeAuction.vehicles.map((vehicle, index) => {
          const itemFade = listItemsAnim[index] || new Animated.Value(1);
          const itemSlide = itemFade.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          });

          return (
            <Animated.View
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                {
                  opacity: itemFade,
                  transform: [{ translateY: itemSlide }],
                  backgroundColor: cardBg,
                  borderColor: itemBorder,
                }
              ]}
            >
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
                {currentUser?.role === 'super_admin' && (
                  <Pressable 
                    style={[styles.pencilEditBtn, { position: 'absolute', right: 12, top: 12, zIndex: 10 }]} 
                    onPress={() => handleStartEditVehicle(vehicle.id)}
                  >
                    <Pencil size={12} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>
              
              <View style={styles.vehicleContent}>
                <View style={styles.titleRow}>
                  <Text style={[styles.vehicleTitle, { color: '#F8FAFC' }]}>{vehicle.title}</Text>
                  <Pressable style={styles.bookmarkBtn}>
                    <Bookmark size={16} color="#94A3B8" />
                  </Pressable>
                </View>
 
                {/* Tags Grid */}
                <View style={styles.specsGrid}>
                  <View style={[styles.specTag, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                    <Cpu size={12} color={theme.gold} />
                    <Text style={[styles.specTagText, { color: labelColor }]}>{vehicle.specEngine}</Text>
                  </View>
                  <View style={[styles.specTag, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                    <Gauge size={12} color={theme.gold} />
                    <Text style={[styles.specTagText, { color: labelColor }]}>{vehicle.specKm}</Text>
                  </View>
                  <View style={[styles.specTag, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                    <ShieldCheck size={12} color="#34D399" />
                    <Text style={[styles.specTagText, { color: labelColor }]}>{vehicle.cert}</Text>
                  </View>
                </View>
 
                {/* Price Summary */}
                <View style={[styles.priceBox, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={[styles.priceLabel, { color: labelColor }]}>Başlangıç Fiyatı</Text>
                      <Text style={[styles.priceValueText, { color: '#F8FAFC' }]}>
                        {vehicle.startPrice.toLocaleString('tr-TR')} TL
                      </Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View>
                      <Text style={[styles.priceLabel, { color: theme.gold }]}>Hemen Al Fiyatı</Text>
                      <Text style={[styles.priceValueText, { color: theme.gold }]}>
                        {vehicle.buyNowPrice.toLocaleString('tr-TR')} TL
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}
 
        {currentUser?.role === 'super_admin' && (
          <Pressable 
            style={styles.addVehicleBtn} 
            onPress={handleStartAddVehicle}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={[styles.addVehicleBtnText, { color: '#FFFFFF' }]}>Yeni Eser / Ürün Ekle</Text>
          </Pressable>
        )}
 
        {/* Premium footer info */}
        <View style={styles.premiumFooter}>
          <TrendingUp size={24} color={theme.gold} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Text style={[styles.footerTitle, { color: '#F8FAFC' }]}>
              {activeAuction.footerTitle || 'Prestige Auction House'}
            </Text>
            {currentUser?.role === 'super_admin' && (
              <Pressable style={[styles.pencilEditBtn, { marginLeft: 8 }]} onPress={handleStartEditFooter}>
                <Pencil size={12} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
          <Text style={[styles.footerText, { color: '#94A3B8' }]}>
            {activeAuction.footerDescription || 'Bu müzayedede yer alan tüm araçlar ekspertiz onaylı, orijinal lisanslı ve noter onaylı sertifikalıdır.'}
          </Text>
        </View>
      </ScrollView>

      {/* Editor Modal for Special Auction Content */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editTarget === 'hero' ? 'Müzayede Görseli Düzenle' : editTarget === 'title' ? 'Müzayede Detayları Düzenle' : editTarget === 'footer' ? 'Alt Bilgi Düzenle' : (editVehicleId ? 'Araç Detayları Düzenle' : 'Yeni Eser / Ürün Ekle')}
              </ThemedText>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {editTarget === 'hero' && (
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Hero Kapak Görsel Adresi</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                    placeholder="Görsel URL..."
                    placeholderTextColor={theme.textSecondary}
                    value={inputHeroImage}
                    onChangeText={setInputHeroImage}
                  />
                </View>
              )}

              {editTarget === 'title' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Müzayede Başlığı</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                      placeholder="Müzayede Başlığı..."
                      placeholderTextColor={theme.textSecondary}
                      value={inputTitle}
                      onChangeText={setInputTitle}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Müzayede Alt Başlığı</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background, height: 60 }]}
                      multiline
                      placeholder="Müzayede Açıklaması..."
                      placeholderTextColor={theme.textSecondary}
                      value={inputSubtitle}
                      onChangeText={setInputSubtitle}
                    />
                  </View>
                </>
              )}

              {editTarget === 'footer' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Alt Bilgi Başlığı</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                      placeholder="Örn: Prestige Auction House"
                      placeholderTextColor={theme.textSecondary}
                      value={inputFooterTitle}
                      onChangeText={setInputFooterTitle}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Alt Bilgi Açıklaması</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background, height: 80 }]}
                      multiline
                      placeholder="Açıklama..."
                      placeholderTextColor={theme.textSecondary}
                      value={inputFooterDescription}
                      onChangeText={setInputFooterDescription}
                    />
                  </View>
                </>
              )}

              {editTarget === 'vehicle' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>{editVehicleId ? 'Araç Modeli / Adı' : 'Ürün / Eser Adı'}</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                      placeholder="Örn: 1967 Ford Mustang Eleanor"
                      placeholderTextColor={theme.textSecondary}
                      value={inputVehicleTitle}
                      onChangeText={setInputVehicleTitle}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Görsel Adresi</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                      placeholder="Görsel URL..."
                      placeholderTextColor={theme.textSecondary}
                      value={inputVehicleImage}
                      onChangeText={setInputVehicleImage}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Motor Gücü / Özellikler</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                      placeholder="Örn: 4.7L V8 400hp"
                      placeholderTextColor={theme.textSecondary}
                      value={inputVehicleEngine}
                      onChangeText={setInputVehicleEngine}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Kilometre / Durum Bilgisi</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                      placeholder="Örn: 42,500 km veya Kusursuz"
                      placeholderTextColor={theme.textSecondary}
                      value={inputVehicleKm}
                      onChangeText={setInputVehicleKm}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Sertifika & Orijinallik</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                      placeholder="Örn: Orijinallik Sertifikalı"
                      placeholderTextColor={theme.textSecondary}
                      value={inputVehicleCert}
                      onChangeText={setInputVehicleCert}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Başlangıç Fiyatı (TL)</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                        keyboardType="numeric"
                        placeholder="2500000"
                        placeholderTextColor={theme.textSecondary}
                        value={inputVehicleStartPrice}
                        onChangeText={setInputVehicleStartPrice}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Hemen Al Fiyatı (TL)</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.gold, backgroundColor: theme.background }]}
                        keyboardType="numeric"
                        placeholder="3200000"
                        placeholderTextColor={theme.textSecondary}
                        value={inputVehicleBuyNowPrice}
                        onChangeText={setInputVehicleBuyNowPrice}
                      />
                    </View>
                  </View>
                </>
              )}

              <Pressable style={styles.submitButton} onPress={handleSaveDraftChanges}>
                <Check size={16} color="#070C19" style={{ marginRight: 6 }} />
                <Text style={styles.submitButtonText}>Taslağı Kaydet</Text>
              </Pressable>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C19',
  },
  heroContainer: {
    height: 340,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 60 : 36,
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'rgba(7, 12, 25, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#0969da',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  eventInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoPillText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 60,
    gap: 20,
  },
  timerCard: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    marginTop: -20,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timerBox: {
    width: 56,
    height: 56,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  timerLabel: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  timerSeparator: {
    fontSize: 20,
    fontWeight: '900',
  },
  registerButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  registeredStatus: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registeredText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  catalogueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  sectionLine: {
    width: 4,
    height: 16,
    borderRadius: 1,
  },
  catalogueTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  vehicleCard: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: 180,
  },
  vehicleContent: {
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  bookmarkBtn: {
    padding: 6,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  specTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priceBox: {
    borderRadius: 6,
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  priceValueText: {
    fontSize: 14,
    fontWeight: '800',
  },
  priceDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  premiumFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  adminFloatingBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#0969da',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'space-between',
    zIndex: 100,
  },
  adminBarText: {
    fontSize: 12,
    color: '#0969da',
    fontWeight: 'bold',
    flex: 1,
  },
  adminPublishBtn: {
    backgroundColor: '#0969da',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
  },
  adminPublishBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pencilEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#0969da',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  heroEditBtn: {
    position: 'absolute',
    right: 16,
    top: 60,
    zIndex: 10,
  },
  titleEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 24,
    borderTopWidth: 1.5,
    borderTopColor: '#0969da',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    gap: 14,
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
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#0969da',
    height: 44,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addVehicleBtn: {
    backgroundColor: '#0969da',
    flexDirection: 'row',
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  addVehicleBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
