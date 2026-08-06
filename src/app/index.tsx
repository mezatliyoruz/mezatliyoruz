import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  Image,
  useColorScheme,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Text,
  ScrollView,
  Share,
  Animated as RNAnimated,
  LogBox,
  Alert,
} from 'react-native';

LogBox.ignoreAllLogs(); // Hide warning notifications on the emulator screen
import { useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, Listing, defaultCollage, Story } from '@/services/store';
import VideoPlayer from '@/features/feed/components/VideoPlayer';
import { RENTAL_SUB_CATEGORIES } from './create';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import {
  Heart,
  MessageSquare,
  Send,
  Gavel,
  List,
  Grid,
  Star,
  ShieldCheck,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Bell,
  User as UserIcon,
  Play,
  MapPin,
  Eye,
  Home,
  Sparkles,
  Car,
  Gem,
  Package,
  Handshake,
  ShoppingCart,
  Key,
  Trash2,
  Plus,
  Pencil,
  Edit,
  Minus,
  CreditCard,
  Check,
  SlidersHorizontal,
  Store,
  Briefcase,
} from 'lucide-react-native';
import { formatTime } from '@/utils/time';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const bitPazariSubCategories = [
  'Hepsi',
  '🕰️ Antika, Retro & Nostalji',
  '📻 Eski Elektronik, Plak & Kaset',
  '📚 Nadir Kitap, Dergi & Efemera',
  '🧥 Vintage Giyim & Aksesuar',
  '🧸 Nostaljik Oyuncak & Figür',
  '🏺 Porselen, Seramik & Cam Objeler',
  '🖼️ Sanat Eseri, Tablo & Çerçeve',
  '🛠️ Eski Aletler & Rustik Eşyalar',
  '🌀 Koleksiyon Parçaları & Diğer',
  'Diğer'
];

const ureticidenSubCategories = [
  'Hepsi',
  '🍯 Organik Bal & Arı Ürünleri',
  '🫒 Zeytinyağı & Doğal Kahvaltılık',
  '🥫 Ev Yapımı Konserve, Reçel & Sos',
  '🌾 Kuru Gıda, Bakliyat & Şifalı Otlar',
  '🧶 El Emeği Örgü & Ev Tekstili',
  '🪵 Ahşap & Doğal Malzeme Tasarımları',
  '🕯️ Doğal Kozmetik, Sabun & Mum',
  '💍 El Yapımı Takı & Aksesuar',
  '♻️ Bahçe, Fide, Tohum & Bitki',
  'Diğer'
];

const matchesSubCategory = (item: Listing, subCat: string) => {
  const itemCat = item.category;
  
  if (subCat === 'Giyim & Aksesuar' || subCat === '🧥 Vintage Giyim & Aksesuar') {
    return itemCat === 'Giyim' || itemCat === 'Giyim & Aksesuar' || itemCat === '🧥 Vintage Giyim & Aksesuar';
  }
  if (subCat === 'Elektronik' || subCat === '📻 Eski Elektronik, Plak & Kaset') {
    return itemCat === 'Elektronik' || itemCat === 'Elektronik & Ev Aletleri' || itemCat === '📻 Eski Elektronik, Plak & Kaset';
  }
  if (subCat === 'Ev & Yaşam' || subCat === '🏺 Porselen, Seramik & Cam Objeler' || subCat === '🛠️ Eski Aletler & Rustik Eşyalar') {
    return itemCat === 'Ev & Yaşam' || itemCat === 'Ev Tekstili' || itemCat === 'Mobilya' || itemCat === '🏺 Porselen, Seramik & Cam Objeler' || itemCat === '🛠️ Eski Aletler & Rustik Eşyalar';
  }
  if (subCat === 'Antika & Koleksiyon' || subCat === '🕰️ Antika, Retro & Nostalji' || subCat === '🌀 Koleksiyon Parçaları & Diğer') {
    return itemCat === 'Koleksiyon & Antika' || itemCat === 'Antika & Koleksiyon' || itemCat === 'Araç' || itemCat === 'Emlak' || itemCat === '🕰️ Antika, Retro & Nostalji' || itemCat === '🌀 Koleksiyon Parçaları & Diğer';
  }
  if (subCat === 'Kitap & Hobi' || subCat === '📚 Nadir Kitap, Dergi & Efemera') {
    return itemCat === 'Spor Aletleri' || itemCat === 'Kitap & Hobi' || itemCat === 'Hobi' || itemCat === '📚 Nadir Kitap, Dergi & Efemera';
  }
  
  // Producer sub-categories
  if (subCat === 'Doğal Gıda' || subCat === '🍯 Organik Bal & Arı Ürünleri' || subCat === '🫒 Zeytinyağı & Doğal Kahvaltılık' || subCat === '🥫 Ev Yapımı Konserve, Reçel & Sos' || subCat === '🌾 Kuru Gıda, Bakliyat & Şifalı Otlar') {
    return itemCat === 'Doğal Gıda' || itemCat === 'Mutfak' || itemCat === '🍯 Organik Bal & Arı Ürünleri' || itemCat === '🫒 Zeytinyağı & Doğal Kahvaltılık' || itemCat === '🥫 Ev Yapımı Konserve, Reçel & Sos' || itemCat === '🌾 Kuru Gıda, Bakliyat & Şifalı Otlar';
  }
  if (subCat === 'El Emeği & Sanat' || subCat === '🧶 El Emeği Örgü & Ev Tekstili' || subCat === '🪵 Ahşap & Doğal Malzeme Tasarımları' || subCat === '💍 El Yapımı Takı & Aksesuar') {
    return itemCat === 'El Emeği & Sanat' || itemCat === 'El Yapımı' || itemCat === '🧶 El Emeği Örgü & Ev Tekstili' || itemCat === '🪵 Ahşap & Doğal Malzeme Tasarımları' || itemCat === '💍 El Yapımı Takı & Aksesuar';
  }
  if (subCat === 'Doğal Kozmetik' || subCat === '🕯️ Doğal Kozmetik, Sabun & Mum') {
    return itemCat === 'Doğal Kozmetik' || itemCat === '🕯️ Doğal Kozmetik, Sabun & Mum';
  }
  if (subCat === 'Tasarım Giyim') {
    return itemCat === 'Tasarım Giyim';
  }
  if (subCat === 'Bahçe & Tarım' || subCat === '♻️ Bahçe, Fide, Tohum & Bitki') {
    return itemCat === 'Bahçe & Tarım' || itemCat === '♻️ Bahçe, Fide, Tohum & Bitki';
  }

  // Diğer (Other)
  if (subCat === 'Diğer') {
    return itemCat === 'Genel' || itemCat === 'Diğer' || itemCat === 'Diğer' || itemCat === '🔍 Diğer';
  }
  
  return itemCat === subCat;
};

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
      description: 'Bu üye resmi belgelerini sunmuş ve doğrulanmış kurumsal bir firmadır.',
      image: require('@/assets/images/badge_kurumsal.png'),
      color: '#EC4899',
    });
  }

  return badges;
};

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth > 768;
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { 
    listings, 
    toggleLike, 
    toggleFavorite, 
    placeBid, 
    createChat, 
    decrementTimers,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    currentUser,
    registerAccount,
    loginAccount,
    logoutAccount,
    liveCollage,
    draftCollage,
    updateDraftCollage,
    publishCollage,
    loadCMSData,
    stories,
    addStory,
  } = useAppStore();

  // Home states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [activeReelsIndex, setActiveReelsIndex] = useState<number | null>(null);
  const [visibleReelsLimit, setVisibleReelsLimit] = useState(15);

  useEffect(() => {
    setVisibleReelsLimit(15);
  }, [searchQuery, selectedCategory, selectedSubCategory]);

  const loadMoreReels = () => {
    if (visibleReelsLimit < filteredReelsProducts.length) {
      setVisibleReelsLimit((prev) => prev + 15);
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
    const paddingToBottom = 150;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };
  
  // Slideshow ref
  const sliderRef = useRef<FlatList>(null);
  
  // Reels specific filters state
  const reelsFlatListRef = useRef<FlatList>(null);
  const [reelsFiltersVisible, setReelsFiltersVisible] = useState(false);
  const [reelsSelectedCity, setReelsSelectedCity] = useState<string | null>(null);
  const [reelsSelectedType, setReelsSelectedType] = useState<string | null>(null);
  const [reelsSelectedCategory, setReelsSelectedCategory] = useState<string | null>(null);
  const [reelsMinPrice, setReelsMinPrice] = useState<string>('');
  const [reelsMaxPrice, setReelsMaxPrice] = useState<string>('');
  const [reelsSortBy, setReelsSortBy] = useState<string>('default');
 
  // Feed specific filters state
  const [feedFiltersVisible, setFeedFiltersVisible] = useState(false);
  const [feedSelectedCity, setFeedSelectedCity] = useState<string | null>(null);
  const [feedMinPrice, setFeedMinPrice] = useState<string>('');
  const [feedMaxPrice, setFeedMaxPrice] = useState<string>('');
  const [feedSortBy, setFeedSortBy] = useState<string>('default');

 
  // Stories State
  const [shareStoryModalVisible, setShareStoryModalVisible] = useState(false);
  const [newStoryImageUrl, setNewStoryImageUrl] = useState('');
  const [newStoryProductId, setNewStoryProductId] = useState('');
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [activeStoryList, setActiveStoryList] = useState<Story[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const storyProgress = useRef(new RNAnimated.Value(0)).current;
  const [readSellers, setReadSellers] = useState<string[]>([]);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
 
  // Group active stories bubbles
  const groupedStories: { [sellerId: string]: Story[] } = {};
  (stories || []).forEach((story) => {
    if (!groupedStories[story.sellerId]) {
      groupedStories[story.sellerId] = [];
    }
    groupedStories[story.sellerId].push(story);
  });
 
  const [heroActiveIndex, setHeroActiveIndex] = useState(0);

  // Active auction offer states
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');

  // Reels feed active index
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  // Cart & Checkout states
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [toastMessage, setToastMessage] = useState('');
  const [cartAnimationItem, setCartAnimationItem] = useState<Listing | null>(null);
  
  // Shipping Form
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');

  // Payment Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [orderId, setOrderId] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Auth Modal States
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'sms'>('login');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [authError, setAuthError] = useState('');

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, ''); // keep only numbers
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
    }
  };

  const handleDemoLogin = (role: 'user' | 'super_admin') => {
    setAuthError('');
    const demoPhone = role === 'super_admin' ? '5555555557' : '5555555555';
    const demoName = role === 'user' ? 'Himmet Akar' : 'Himmet Akar (Süper Admin)';

    (async () => {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/services/firebase');
        const uid = role === 'user' ? 'demo_user_id' : 'demo_super_admin_id';
        await setDoc(doc(db, 'users', uid), {
          uid,
          name: demoName,
          phone: demoPhone,
          role,
          lastLogin: new Date().toISOString(),
          isDemo: true
        }, { merge: true });
      } catch (e) {
        console.warn('Firebase DB write skipped/failed:', e);
      }
    })();

    const success = loginAccount(demoPhone, role);
    if (!success) {
      registerAccount(demoPhone, role, demoName);
      loginAccount(demoPhone, role);
    }
    setAuthModalVisible(false);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.listing.price * item.quantity, 0);
  const cargoFee = 0; // Free shipping
  const cartTotal = cartSubtotal + cargoFee;

  const handleAddToCart = (item: Listing) => {
    addToCart(item.id);
    setCartAnimationItem(item);
    setTimeout(() => setCartAnimationItem(null), 1500);
    setToastMessage(`"${item.title}" sepete eklendi!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ') : cleaned;
  };

  const formatCardExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCheckoutSubmit = () => {
    const errors: { [key: string]: string } = {};
    if (checkoutStep === 'shipping') {
      if (!shippingName.trim()) errors.shippingName = 'Ad Soyad zorunludur.';
      if (!shippingPhone.trim()) errors.shippingPhone = 'Telefon numarası zorunludur.';
      if (!shippingAddress.trim()) errors.shippingAddress = 'Teslimat adresi zorunludur.';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      if (!cardHolder.trim()) errors.cardHolder = 'Kart sahibi adı zorunludur.';
      if (cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = 'Geçersiz kart numarası.';
      if (cardExpiry.length < 5) errors.cardExpiry = 'Geçersiz son kullanma tarihi.';
      if (cardCvv.length < 3) errors.cardCvv = 'Geçersiz CVV.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      // Generate random order id
      const randomId = 'MZ-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(randomId);
      clearCart();
      setCheckoutStep('success');
    }
  };

  // Sync timers
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTimers();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset search and filters when switching tab menus
  useEffect(() => {
    const unsubscribe = (navigation as any).addListener('tabPress', () => {
      setSearchQuery('');
      setSelectedCategory(null);
      setSelectedSubCategory(null);
    });
    return unsubscribe;
  }, [navigation]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveItemIndex(viewableItems[0].index);
    }
  }).current;

  // Handles bidding
  const handlePlaceBid = () => {
    if (!selectedListing) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Lütfen geçerli bir teklif girin.');
      return;
    }
    const result = placeBid(selectedListing.id, amount);
    if (result.success) {
      setBidModalVisible(false);
      setBidAmount('');
      setBidError('');
    } else {
      setBidError(result.error || 'Teklif verilemedi.');
    }
  };

  const handleStartChat = (listingId: string) => {
    const chatId = createChat(listingId);
    if (chatId) {
      setActiveReelsIndex(null);
      setTimeout(() => {
        router.push(`/chat/${chatId}`);
      }, 150);
    }
  };

  const handleShareProduct = async (item: Listing) => {
    try {
      await Share.share({
        message: `Mezatliyoruz'da harika bir ürün buldum!\n\nÜrün: ${item.title}\nFiyat: ${item.price.toLocaleString('tr-TR')} TL\n\nDetaylar için uygulamaya göz atın!`,
      });
    } catch (error: any) {
      console.log('Paylaşım hatası:', error.message);
    }
  };

  // Filter listings based on search, section (Level 1), and sub-category (Level 2)
  // Filter listings based on search, section (Level 1), sub-category (Level 2), and feed filters (City, Price, Sort)
  let filteredListings = listings.filter((item) => {
    if (item.status === 'pending_approval' || item.status === 'rejected') {
      return false;
    }

    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    // City Filter
    if (feedSelectedCity && item.city !== feedSelectedCity) {
      return false;
    }

    // Price Limit Filters
    const itemPrice = item.price;
    if (feedMinPrice && itemPrice < parseFloat(feedMinPrice)) {
      return false;
    }
    if (feedMaxPrice && itemPrice > parseFloat(feedMaxPrice)) {
      return false;
    }

    // Level 1 Section Filter
    if (selectedCategory === 'Canlı Mezat') {
      return item.type === 'auction';
    }
    
    if (selectedCategory === 'Bit Pazarı') {
      // Must not be an auction
      if (item.type === 'auction') return false;
      
      // Level 2 Sub-category Filter
      if (selectedSubCategory) {
        return matchesSubCategory(item, selectedSubCategory);
      }
      return true;
    }
    
    if (selectedCategory === 'Üreticiden Tüketiciye') {
      // Must not be an auction, and must be a producer product
      if (item.type === 'auction') return false;
      
      const isProducerProduct = 
        item.verifiedProduct === true || 
        ['El Yapımı', 'Mutfak', 'Doğal Gıda', 'El Emeği & Sanat', 'Doğal Kozmetik', 'Tasarım Giyim', 'Bahçe & Tarım'].includes(item.category) ||
        ureticidenSubCategories.includes(item.category) ||
        item.category === '🔍 Diğer';
        
      if (!isProducerProduct) return false;
      
      // Level 2 Sub-category Filter
      if (selectedSubCategory) {
        return matchesSubCategory(item, selectedSubCategory);
      }
      return true;
    }

    // Default: 'Hepsi' (selectedCategory === null) - show all items mixed
    return true;
  });

  // Sort filtered listings
  if (feedSortBy === 'newest') {
    filteredListings = [...filteredListings].sort((a, b) => b.id.localeCompare(a.id));
  } else if (feedSortBy === 'price_asc') {
    filteredListings = [...filteredListings].sort((a, b) => {
      const pA = a.price;
      const pB = b.price;
      return pA - pB;
    });
  } else if (feedSortBy === 'price_desc') {
    filteredListings = [...filteredListings].sort((a, b) => {
      const pA = a.price;
      const pB = b.price;
      return pB - pA;
    });
  }

  // Sync Reels filters with homepage context upon open, reset upon close
  useEffect(() => {
    if (activeReelsIndex !== null) {
      setReelsSelectedCategory(selectedCategory);
    } else {
      setReelsSelectedCity(null);
      setReelsSelectedType(null);
      setReelsSelectedCategory(null);
      setReelsMinPrice('');
      setReelsMaxPrice('');
      setReelsSortBy('default');
    }
  }, [activeReelsIndex]);

  // Reels specific filtered listings (only video products)
  const reelsFilteredListings = [...listings].filter((item) => {
    if (item.status === 'pending_approval' || item.status === 'rejected') {
      return false;
    }
    if (!item.videoUrl) return false;

    // 1. City Filter
    if (reelsSelectedCity && item.city !== reelsSelectedCity) {
      return false;
    }

    // 2. Type Filter
    if (reelsSelectedType) {
      if (item.type !== reelsSelectedType) return false;
    }

    // 3. Category Filter
    if (reelsSelectedCategory) {
      let matchesCat = false;
      if (reelsSelectedCategory === 'Bit Pazarı') {
        matchesCat = item.type !== 'auction';
      } else if (reelsSelectedCategory === 'Üreticiden Tüketiciye') {
        matchesCat = item.type !== 'auction' && (
          item.verifiedProduct === true ||
          ['El Yapımı', 'Mutfak', 'Doğal Gıda', 'El Emeği & Sanat', 'Doğal Kozmetik', 'Tasarım Giyim', 'Bahçe & Tarım'].includes(item.category) ||
          ureticidenSubCategories.includes(item.category)
        );
      } else if (reelsSelectedCategory === 'Sat / Kirala') {
        matchesCat = item.isRealEstate || item.isVehicle || [
          '🏠 Emlak', '🚗 Otomobil', '🔑 Kurumsal Oto Kiralama (Rent a Car)', 'Onaylı Rent a Car',
          'Araçlar (Otomobil)', 'İs- Otomobil', 'Otomobil'
        ].some(c => item.category.includes(c)) || RENTAL_SUB_CATEGORIES.some((rc) => {
          const cleanRc = rc.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s,().]/g, '').trim().toLowerCase();
          const itemCat = item.category.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s,().]/g, '').trim().toLowerCase();
          return itemCat.includes(cleanRc) || cleanRc.includes(itemCat);
        });
      } else {
        matchesCat = item.category === reelsSelectedCategory || matchesSubCategory(item, reelsSelectedCategory);
      }
      if (!matchesCat) return false;
    }

    // 4. Price range Filter
    const minPrice = parseFloat(reelsMinPrice);
    if (!isNaN(minPrice) && item.price < minPrice) {
      return false;
    }
    const maxPrice = parseFloat(reelsMaxPrice);
    if (!isNaN(maxPrice) && item.price > maxPrice) {
      return false;
    }

    return true;
  });

  // Apply sorting
  if (reelsSortBy === 'price_asc') {
    reelsFilteredListings.sort((a, b) => a.price - b.price);
  } else if (reelsSortBy === 'price_desc') {
    reelsFilteredListings.sort((a, b) => b.price - a.price);
  }

  // Home Screen Video Products (sorted by ID desc - newest first)
  const reelsProducts = listings
    .filter((item) => !!item.videoUrl)
    .sort((a, b) => b.id.localeCompare(a.id));

  const filteredReelsProducts = reelsProducts.filter((item) => {
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSearch;
  });

  // Featured Hero slides matching the web concepts
  const featuredAuctions = listings.filter(item => ['11', '12', '13'].includes(item.id));

  // Staggered heights for masonry grid cards
  const getCardHeight = (idx: number) => {
    const heights = [160, 230, 190, 210, 150];
    return heights[idx % heights.length];
  };

  const displayedReelsProducts = filteredReelsProducts.slice(0, visibleReelsLimit);

  // Divide filtered reels products into 3 columns for Masonry Grid
  const col1: { item: Listing; globalIndex: number }[] = [];
  const col2: { item: Listing; globalIndex: number }[] = [];
  const col3: { item: Listing; globalIndex: number }[] = [];

  displayedReelsProducts.forEach((item, index) => {
    const packet = { item, globalIndex: index };
    if (index % 3 === 0) col1.push(packet);
    else if (index % 3 === 1) col2.push(packet);
    else col3.push(packet);
  });

  const handleApplyReelsFilters = () => {
    setReelsFiltersVisible(false);
    setActiveItemIndex(0);
    setTimeout(() => {
      if (reelsFlatListRef.current && reelsFilteredListings.length > 0) {
        try {
          reelsFlatListRef.current.scrollToIndex({ index: 0, animated: false });
        } catch (err) {
          console.warn('FlatList scroll to index 0 failed:', err);
        }
      }
    }, 100);
  };

  const handleResetReelsFilters = () => {
    setReelsSelectedCity(null);
    setReelsSelectedType(null);
    setReelsSelectedCategory(null);
    setReelsMinPrice('');
    setReelsMaxPrice('');
    setReelsSortBy('default');
    setReelsFiltersVisible(false);
    setActiveItemIndex(0);
    setTimeout(() => {
      if (reelsFlatListRef.current && listings.length > 0) {
        try {
          reelsFlatListRef.current.scrollToIndex({ index: 0, animated: false });
        } catch (err) {
          console.warn('FlatList scroll to index 0 failed on reset:', err);
        }
      }
    }, 100);
  };

  const handleOpenReels = (globalIndex: number) => {
    const clickedItem = displayedReelsProducts[globalIndex];
    if (clickedItem) {
      const reelsIndex = reelsFilteredListings.findIndex(l => l.id === clickedItem.id);
      setActiveItemIndex(reelsIndex >= 0 ? reelsIndex : 0);
    } else {
      setActiveItemIndex(0);
    }
    setActiveReelsIndex(globalIndex);
  };

  const renderFeedItem = ({ item, index }: { item: Listing; index: number }) => {
    const isActive = index === activeItemIndex;
    const mediaItems = [
      { type: 'video', url: item.videoUrl },
      ...item.photos.map((p) => ({ type: 'image', url: p })),
    ];

    const displayHeight = isDesktop ? windowHeight - 40 : windowHeight;

    return (
      <View style={[styles.cardContainer, { height: displayHeight, width: isDesktop ? 480 : windowWidth }]}>
        {/* Horizontal Swiper for Media */}
        <FlatList
          data={mediaItems}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(m, idx) => `${item.id}_media_${idx}`}
          style={styles.horizontalSwiper}
          renderItem={({ item: media }) => {
            if (media.type === 'video') {
              const isPreload = index === activeItemIndex + 1 || index === activeItemIndex - 1;
              const shouldRenderVideo = isActive || isPreload;
              return (
                <View style={{ width: isDesktop ? 480 : windowWidth, height: displayHeight }}>
                  {shouldRenderVideo ? (
                    <VideoPlayer url={media.url} isActive={isActive} posterUrl={item.photos[0]} />
                  ) : (
                    <Image
                      source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                      style={{ width: isDesktop ? 480 : windowWidth, height: displayHeight, resizeMode: 'cover' }}
                    />
                  )}
                </View>
              );
            } else {
              return (
                <Image
                  source={typeof media.url === 'number' ? media.url : { uri: media.url }}
                  style={{ width: isDesktop ? 480 : windowWidth, height: displayHeight, resizeMode: 'cover' }}
                />
              );
            }
          }}
        />

        {/* Media Dot Indicators */}
        <View style={[styles.indicatorContainer, { top: insets.top + 32 }]}>
          {mediaItems.map((_, dotIdx) => (
            <View key={dotIdx} style={styles.dot} />
          ))}
        </View>

        {/* Real-time Auction Time Left Overlay */}
        {item.type === 'auction' && item.timeLeft !== undefined && (
          <View style={[styles.timerBadge, { top: insets.top + 28 }]}>
            <Clock size={14} color="#FF6B00" />
            <ThemedText style={styles.timerText}>
              {item.timeLeft > 0 ? formatTime(item.timeLeft) : 'Süre Doldu'}
            </ThemedText>
          </View>
        )}

        {/* Overlay Interactive Buttons (Right Side) */}
        <View style={styles.rightOverlay}>
          <Pressable style={styles.iconButton} onPress={() => toggleLike(item.id)}>
            <Heart size={26} color={item.liked ? '#EF4444' : '#F8FAFC'} fill={item.liked ? '#EF4444' : 'transparent'} />
            <ThemedText type="code" style={styles.iconLabel}>{item.favoritesCount}</ThemedText>
          </Pressable>

          <Pressable style={styles.iconButton} onPress={() => handleStartChat(item.id)}>
            <MessageSquare size={26} color="#F8FAFC" />
          </Pressable>

          <Pressable style={styles.iconButton} onPress={() => handleShareProduct(item)}>
            <Send size={26} color="#F8FAFC" />
          </Pressable>

          <Pressable
            style={[styles.iconButton, styles.gavelButton]}
            onPress={() => handleAddToCart(item)}
          >
            <ShoppingCart size={26} color="#FF6B00" />
          </Pressable>

          <Pressable 
            style={styles.iconButton} 
            onPress={() => {
              const ratingVal = item.rating || 4.8;
              alert(`${item.title} için değerlendirme puanı: ${ratingVal} / 5.0`);
            }}
          >
            <Star size={26} color="#FF6B00" fill="#FF6B00" />
            <ThemedText type="code" style={[styles.iconLabel, { color: '#FF6B00', fontWeight: 'bold' }]}>
              {item.rating || 4.8}
            </ThemedText>
          </Pressable>
        </View>

        {/* Bottom Details Overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.sellerRow}>
            <Pressable
              onPress={() => {
                setActiveReelsIndex(null);
                setTimeout(() => {
                  router.push(`/seller/${encodeURIComponent(item.sellerName)}`);
                }, 150);
              }}
              delayPressIn={0}
              hitSlop={15}
              style={({ pressed }) => [
                { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
                pressed && { opacity: 0.5 }
              ]}
            >
              <Image source={{ uri: item.sellerAvatar }} style={styles.sellerAvatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <ThemedText style={styles.sellerName}>{item.sellerName}</ThemedText>
                  {(() => {
                    if (!item.sellerVerified) return null;
                    const badges = getSellerBadges(item);
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
                          style={{ width: 11, height: 12, resizeMode: 'contain' }}
                        />
                      </Pressable>
                    ));
                  })()}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ThemedText style={styles.sellerScore}>Güven Skoru: {item.sellerTrustScore}/10</ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <MapPin size={11} color="#94A3B8" />
                    <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '600' }}>{item.city || 'İstanbul'}</Text>
                  </View>
                </View>
              </View>
            </Pressable>

            {item.verifiedProduct && (
              <View style={styles.certifiedBadge}>
                <ShieldCheck size={12} color="#0B132B" />
                <Text style={styles.certifiedText}>Belgeli</Text>
              </View>
            )}
          </View>

          <ThemedText style={styles.listingTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.listingDesc} numberOfLines={2}>
            {item.description}
          </ThemedText>

          <View style={styles.priceAndCtaRow}>
            <View>
              <ThemedText style={styles.priceLabel}>
                {item.type === 'auction' ? 'En Yüksek Teklif' : 'Fiyat'}
              </ThemedText>
              <ThemedText style={styles.priceValue}>{item.price.toLocaleString('tr-TR')} TL</ThemedText>
            </View>

            <Pressable
              style={styles.ctaButton}
              onPress={() => {
                setActiveReelsIndex(null);
                setTimeout(() => {
                  router.push(`/product/${item.id}`);
                }, 150);
              }}
            >
              <ThemedText style={styles.ctaButtonText}>Detayları Gör</ThemedText>
              <ChevronRight size={16} color="#0B132B" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderCollageCard = (packet: { item: Listing; globalIndex: number }) => {
    const { item, globalIndex } = packet;
    const cardHeight = getCardHeight(globalIndex);

    return (
      <Pressable
        key={item.id}
        style={[styles.collageCard, { height: cardHeight }]}
        onPress={() => handleOpenReels(globalIndex)}
      >
        <Image
          source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
          style={styles.collageCardImage}
        />

        {/* Reels play icon overlay */}
        <View style={styles.reelsBadge}>
          <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
        </View>

        {/* Type Badge */}
        <View
          style={[
            styles.collageTypeBadge,
            {
              backgroundColor:
                item.type === 'auction'
                  ? 'rgba(255, 107, 0, 0.85)'
                  : item.type === 'offer'
                  ? 'rgba(147, 51, 234, 0.85)'
                  : 'rgba(37, 99, 235, 0.85)',
            },
          ]}
        >
          <Text style={styles.collageTypeBadgeText}>
            {item.type === 'auction' ? 'MEZAT' : item.type === 'offer' ? 'TEKLİF' : 'SABİT'}
          </Text>
        </View>

        {/* Bottom Glassmorphic Label */}
        <View style={styles.collageCardFooter}>
          <Text style={styles.collageCardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.collageCardPrice}>
            {item.price.toLocaleString('tr-TR')} TL
          </Text>
        </View>
      </Pressable>
    );
  };

  const activeCollage = (currentUser?.role === 'super_admin' ? draftCollage : liveCollage) || defaultCollage;
  const leftVertical = activeCollage?.leftVertical?.images ? activeCollage.leftVertical : defaultCollage.leftVertical;
  const rightTop = activeCollage?.rightTop?.images ? activeCollage.rightTop : defaultCollage.rightTop;
  const rightBottom = activeCollage?.rightBottom?.images ? activeCollage.rightBottom : defaultCollage.rightBottom;
 
  const [collageIndices, setCollageIndices] = useState({
    leftVertical: 0,
    rightTop: 0,
    rightBottom: 0,
  });
 
  const [editCollageModalVisible, setEditCollageModalVisible] = useState(false);
  const [editingBoxKey, setEditingBoxKey] = useState<'leftVertical' | 'rightTop' | 'rightBottom' | null>(null);
  const [editImages, setEditImages] = useState<string[]>(Array(10).fill(''));
  const [editTitles, setEditTitles] = useState<string[]>(Array(10).fill(''));
  const [editLinks, setEditLinks] = useState<string[]>(Array(10).fill(''));
  const [editLabels, setEditLabels] = useState<string[]>(Array(10).fill(''));
  const [editLink, setEditLink] = useState('');
 
  // Load CMS data on start
  useEffect(() => {
    loadCMSData();
  }, []);
 
  // Slideshow timer
  useEffect(() => {
    const totalSlides = leftVertical?.images?.length || 1;
    if (totalSlides <= 1) return;
    
    const timer = setInterval(() => {
      setCollageIndices((prev) => {
        const nextIndex = (prev.leftVertical + 1) % totalSlides;
        return {
          ...prev,
          leftVertical: nextIndex,
        };
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [leftVertical?.images?.length]);
 
  // Stories Animation and Auto-Next effect
  useEffect(() => {
    if (storyViewerVisible && activeStoryList.length > 0) {
      storyProgress.setValue(0);
      const animation = RNAnimated.timing(storyProgress, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: false,
      });
      animation.start((result: any) => {
        if (result && result.finished) {
          handleNextStory();
        }
      });
      return () => animation.stop();
    } else {
      storyProgress.setValue(0);
    }
  }, [storyViewerVisible, activeStoryIndex, activeStoryList]);

  const markSellerStoriesAsRead = (sellerId: string) => {
    if (!readSellers.includes(sellerId)) {
      setReadSellers((prev) => [...prev, sellerId]);
    }
  };

  const onTouchStart = (e: any) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
  };

  const onTouchEnd = (e: any) => {
    const deltaX = e.nativeEvent.pageX - touchStartX.current;
    const deltaY = e.nativeEvent.pageY - touchStartY.current;
    
    if (Math.abs(deltaY) < 60) {
      if (deltaX < -50) {
        // Swipe Left -> Go to next seller
        const sellerIds = Object.keys(groupedStories);
        const currentSellerId = activeStoryList[0]?.sellerId;
        const currentSellerIndex = sellerIds.indexOf(currentSellerId);
        
        if (currentSellerId) {
          markSellerStoriesAsRead(currentSellerId);
        }

        if (currentSellerIndex < sellerIds.length - 1) {
          const nextSellerId = sellerIds[currentSellerIndex + 1];
          setActiveStoryList(groupedStories[nextSellerId]);
          setActiveStoryIndex(0);
          storyProgress.setValue(0);
        } else {
          setStoryViewerVisible(false);
        }
      } else if (deltaX > 50) {
        // Swipe Right -> Go to previous seller
        const sellerIds = Object.keys(groupedStories);
        const currentSellerId = activeStoryList[0]?.sellerId;
        const currentSellerIndex = sellerIds.indexOf(currentSellerId);
        
        if (currentSellerIndex > 0) {
          const prevSellerId = sellerIds[currentSellerIndex - 1];
          const prevStories = groupedStories[prevSellerId];
          setActiveStoryList(prevStories);
          setActiveStoryIndex(0);
          storyProgress.setValue(0);
        }
      }
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex < activeStoryList.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
    } else {
      const sellerIds = Object.keys(groupedStories);
      const currentSellerId = activeStoryList[0]?.sellerId;
      const currentSellerIndex = sellerIds.indexOf(currentSellerId);
      
      if (currentSellerId) {
        markSellerStoriesAsRead(currentSellerId);
      }

      if (currentSellerIndex < sellerIds.length - 1) {
        const nextSellerId = sellerIds[currentSellerIndex + 1];
        setActiveStoryList(groupedStories[nextSellerId]);
        setActiveStoryIndex(0);
        storyProgress.setValue(0);
      } else {
        setStoryViewerVisible(false);
      }
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
    } else {
      const sellerIds = Object.keys(groupedStories);
      const currentSellerId = activeStoryList[0]?.sellerId;
      const currentSellerIndex = sellerIds.indexOf(currentSellerId);
      
      if (currentSellerIndex > 0) {
        const prevSellerId = sellerIds[currentSellerIndex - 1];
        const prevStories = groupedStories[prevSellerId];
        setActiveStoryList(prevStories);
        setActiveStoryIndex(prevStories.length - 1);
        storyProgress.setValue(0);
      }
    }
  };

  const handleShareStory = () => {
    if (!newStoryImageUrl || newStoryImageUrl.trim() === '') {
      alert('Lütfen geçerli bir görsel adresi girin.');
      return;
    }
    if (!currentUser) return;
    
    addStory({
      sellerId: currentUser.id,
      sellerName: currentUser.shopName || currentUser.name,
      sellerAvatar: currentUser.avatar,
      mediaUrl: newStoryImageUrl.trim(),
      productId: newStoryProductId.trim() !== '' ? newStoryProductId.trim() : undefined,
    });
    
    setNewStoryImageUrl('');
    setNewStoryProductId('');
    setShareStoryModalVisible(false);
    alert('Hikayeniz başarıyla paylaşıldı! 24 saat sonra yayından kalkacaktır.');
  };
 
  const handleStartEditCollage = (boxKey: 'leftVertical' | 'rightTop' | 'rightBottom') => {
    const targetBox = draftCollage[boxKey];
    setEditingBoxKey(boxKey);
    
    const imgArr = Array(10).fill('');
    const titleArr = Array(10).fill('');
    const linkArr = Array(10).fill('');
    const labelArr = Array(10).fill('');
    
    for (let i = 0; i < 10; i++) {
      imgArr[i] = targetBox.images?.[i] || '';
      titleArr[i] = targetBox.titles?.[i] || '';
      linkArr[i] = targetBox.links?.[i] || targetBox.link || '';
      labelArr[i] = targetBox.labels?.[i] || '';
    }
    
    setEditImages(imgArr);
    setEditTitles(titleArr);
    setEditLinks(linkArr);
    setEditLabels(labelArr);
    setEditCollageModalVisible(true);
  };
 
  const handleSaveCollageDraft = () => {
    if (!editingBoxKey) return;
    
    const finalImages: string[] = [];
    const finalTitles: string[] = [];
    const finalLinks: string[] = [];
    const finalLabels: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      if (editImages[i] && editImages[i].trim() !== '') {
        finalImages.push(editImages[i].trim());
        finalTitles.push((editTitles[i] || '').trim());
        finalLinks.push((editLinks[i] || '').trim());
        finalLabels.push((editLabels[i] || '').trim());
      }
    }
    
    const updatedCollage = {
      ...draftCollage,
      [editingBoxKey]: {
        images: finalImages,
        titles: finalTitles,
        link: finalLinks[0] || '',
        links: finalLinks,
        labels: finalLabels,
      }
    };
    updateDraftCollage(updatedCollage);
    setEditCollageModalVisible(false);
    alert('Slayt Değişiklikleri Kaydedildi (Taslak)! Canlıya almak için "Slaytları Yayınla" butonuna basın.');
  };
 
  const handlePublishCollage = () => {
    publishCollage();
    alert('Slaytlar canlıda başarıyla güncellendi!');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* 1. ANNOUNCEMENT BAR */}
      <Pressable 
        style={[styles.announcementBar, { backgroundColor: theme.gold }]}
        onPress={() => router.push('/featured-auction')}
      >
        <Sparkles size={14} color="#FFFFFF" />
        <Text style={[styles.announcementText, { color: '#FFFFFF' }]} numberOfLines={1}>
          Bugün 12:00'da koleksiyon araç mezatı başlıyor! Detayları Gör
        </Text>
        <ChevronRight size={14} color="#FFFFFF" />
      </Pressable>

      {/* STORIES FEATURE ROW (Moved below logo header) */}
      {!searchQuery && (
        <View style={[styles.storiesContainer, { borderBottomWidth: 0, paddingVertical: 8 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
            {/* If user is seller, show "+" Add Story circle first */}
            {currentUser?.role === 'seller' && (
              <Pressable style={styles.storyBubbleWrapper} onPress={() => setShareStoryModalVisible(true)}>
                <View style={[styles.storyCircle, { borderColor: theme.backgroundSelected }]}>
                  <Image source={{ uri: currentUser.avatar }} style={styles.storyAvatar} />
                  <View style={[styles.storyAddBadge, { backgroundColor: theme.gold }]}>
                    <Plus size={12} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={[styles.storyBubbleText, { color: theme.textSecondary }]} numberOfLines={1}>
                  Hikaye Ekle
                </Text>
              </Pressable>
            )}

            {/* Grouped active stories bubbles (Unread first, read last) */}
            {(() => {
              const sortedSellerIds = Object.keys(groupedStories).sort((a, b) => {
                const aRead = readSellers.includes(a) ? 1 : 0;
                const bRead = readSellers.includes(b) ? 1 : 0;
                return aRead - bRead; // unread (0) before read (1)
              });
              
              return sortedSellerIds.map((sellerId) => {
                const sellerStories = groupedStories[sellerId];
                if (sellerStories.length === 0) return null;
                const latestStory = sellerStories[sellerStories.length - 1];
                const isRead = readSellers.includes(sellerId);
                
                return (
                  <Pressable 
                    key={`story_bubble_${sellerId}`}
                    style={styles.storyBubbleWrapper} 
                    onPress={() => {
                      setActiveStoryList(sellerStories);
                      setActiveStoryIndex(0);
                      setStoryViewerVisible(true);
                    }}
                  >
                    <View style={[styles.storyCircle, { borderColor: isRead ? theme.backgroundSelected : theme.gold }]}>
                      <Image source={{ uri: latestStory.sellerAvatar }} style={styles.storyAvatar} />
                    </View>
                    <Text style={[styles.storyBubbleText, { color: isRead ? theme.textSecondary : theme.text }]} numberOfLines={1}>
                      {latestStory.sellerName}
                    </Text>
                  </Pressable>
                );
              });
            })()}
          </ScrollView>
        </View>
      )}
 
      {/* 3. SEARCH BAR */}
      <View style={[styles.searchBarContainer, { borderBottomColor: theme.backgroundSelected }]}>
        <View style={[styles.searchWrapper, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Search size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Mezat, ürün veya satıcı ara... (örn: Kalem)"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setSelectedCategory(null); // clear category when searching text
            }}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* MAIN CONTENT SCROLL */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMoreReels();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Admin CMS Bar */}
        {currentUser?.role === 'super_admin' && (
          <View style={styles.adminBar}>
            <Sparkles size={14} color="#FF6B00" />
            <Text style={styles.adminBarText}>Süper Admin Paneli (Canlı Taslak Modu)</Text>
            <Pressable style={styles.adminPublishBtn} onPress={handlePublishCollage}>
              <Text style={styles.adminPublishBtnText}>Slaytları Yayınla</Text>
            </Pressable>
          </View>
        )}

        {/* ORIGINAL 3-BANNER COLLAGE ROW */}
        {!searchQuery && (
          <View style={styles.collageSection}>
            {/* LEFT VERTICAL BOX (Slideshow) */}
            <Pressable 
              style={styles.collageLeftCard}
              onPress={() => {
                const index = collageIndices.leftVertical % Math.max(1, leftVertical.images.length);
                const targetLink = leftVertical.links?.[index] || leftVertical.link || '/auctions';
                if (targetLink === 'bit_pazari' || targetLink === 'bit-pazari') {
                  setSelectedCategory('Bit Pazarı');
                } else if (targetLink && !targetLink.startsWith('/') && !targetLink.startsWith('http')) {
                  setSelectedCategory(targetLink);
                } else if (targetLink) {
                  router.push(targetLink as any);
                } else {
                  router.push('/auctions' as any);
                }
              }}
            >
              <Image 
                source={
                  (typeof leftVertical.images[collageIndices.leftVertical % Math.max(1, leftVertical.images.length)] === 'number'
                    ? leftVertical.images[collageIndices.leftVertical % Math.max(1, leftVertical.images.length)]
                    : { uri: leftVertical.images[collageIndices.leftVertical % Math.max(1, leftVertical.images.length)] }) as any
                }
                style={styles.collageImage}
              />
              <View style={styles.collageOverlay} />
              
              {leftVertical.titles?.[collageIndices.leftVertical % Math.max(1, leftVertical.images.length)] ? (
                <View style={styles.collageTextContainer}>
                  <Text style={styles.collageText}>
                    {leftVertical.titles[collageIndices.leftVertical % Math.max(1, leftVertical.images.length)]}
                  </Text>
                </View>
              ) : null}

              {currentUser?.role === 'super_admin' && (
                <Pressable 
                  style={[styles.collageEditBadge, { backgroundColor: theme.gold }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleStartEditCollage('leftVertical');
                  }}
                >
                  <Pencil size={12} color="#FFFFFF" />
                </Pressable>
              )}
            </Pressable>

            {/* RIGHT COLUMN */}
            <View style={styles.collageRightColumn}>
              {/* RIGHT TOP CARD */}
              <Pressable 
                style={styles.collageRightCard}
                onPress={() => {
                  const targetLink = rightTop.links?.[0] || rightTop.link || '/auctions';
                  if (targetLink === 'bit_pazari' || targetLink === 'bit-pazari') {
                    setSelectedCategory('Bit Pazarı');
                  } else if (targetLink && !targetLink.startsWith('/') && !targetLink.startsWith('http')) {
                    setSelectedCategory(targetLink);
                  } else if (targetLink) {
                    router.push(targetLink as any);
                  } else {
                    router.push('/auctions' as any);
                  }
                }}
              >
                <Image 
                  source={
                    typeof rightTop.images[0] === 'number'
                      ? rightTop.images[0]
                      : { uri: rightTop.images[0] }
                  }
                  style={styles.collageImage}
                />
                <View style={styles.collageOverlay} />
                {rightTop.titles?.[0] ? (
                  <View style={styles.collageTextContainer}>
                    <Text style={styles.collageText}>{rightTop.titles[0]}</Text>
                  </View>
                ) : null}

                {currentUser?.role === 'super_admin' && (
                  <Pressable 
                    style={[styles.collageEditBadge, { backgroundColor: theme.gold }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStartEditCollage('rightTop');
                    }}
                  >
                    <Pencil size={12} color="#FFFFFF" />
                  </Pressable>
                )}
              </Pressable>

              {/* RIGHT BOTTOM CARD */}
              <Pressable 
                style={styles.collageRightCard}
                onPress={() => {
                  const targetLink = rightBottom.links?.[0] || rightBottom.link || '/auctions';
                  if (targetLink === 'bit_pazari' || targetLink === 'bit-pazari') {
                    setSelectedCategory('Bit Pazarı');
                  } else if (targetLink && !targetLink.startsWith('/') && !targetLink.startsWith('http')) {
                    setSelectedCategory(targetLink);
                  } else if (targetLink) {
                    router.push(targetLink as any);
                  } else {
                    router.push('/auctions' as any);
                  }
                }}
              >
                <Image 
                  source={
                    typeof rightBottom.images[0] === 'number'
                      ? rightBottom.images[0]
                      : { uri: rightBottom.images[0] }
                  }
                  style={styles.collageImage}
                />
                <View style={styles.collageOverlay} />
                {rightBottom.titles?.[0] ? (
                  <View style={styles.collageTextContainer}>
                    <Text style={styles.collageText}>{rightBottom.titles[0]}</Text>
                  </View>
                ) : null}

                {currentUser?.role === 'super_admin' && (
                  <Pressable 
                    style={[styles.collageEditBadge, { backgroundColor: theme.gold }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStartEditCollage('rightBottom');
                    }}
                  >
                    <Pencil size={12} color="#FFFFFF" />
                  </Pressable>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* 5. SECTIONS ROW (Level 1) */}
        {/* 5 DIFFERENT DESIGNS SHOWCASE */}
        {/* CATEGORIES ROW */}
        {!searchQuery && (
          <View style={styles.categoriesSectionSingle}>
            <View style={styles.categoriesRowSingle}>
              {[
                { name: 'Canlı Mezat', IconComponent: Gavel },
                { name: 'Bit Pazarı', IconComponent: Package },
                { name: 'Üreticiden Tüketiciye', IconComponent: Handshake },
                { name: 'Sat / Kirala', IconComponent: Key }
              ].map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const Icon = cat.IconComponent;
                return (
                  <Pressable
                    key={`cat_single_${cat.name}`}
                    style={styles.categoryItemSingle}
                    onPress={() => {
                      if (cat.name === 'Canlı Mezat') {
                        router.push({ pathname: '/auctions', params: { type: 'auction' } });
                      } else if (cat.name === 'Bit Pazarı') {
                        router.push({ pathname: '/auctions', params: { category: 'Bit Pazarı' } });
                      } else if (cat.name === 'Üreticiden Tüketiciye') {
                        router.push({ pathname: '/auctions', params: { category: 'Üreticiden Tüketiciye' } });
                      } else if (cat.name === 'Sat / Kirala') {
                        router.push({ pathname: '/auctions', params: { category: 'Sat / Kirala' } });
                      }
                    }}
                  >
                    <View style={styles.categoryIconContainerSingle}>
                      <Icon size={26} color={isSelected ? theme.gold : theme.textSecondary} strokeWidth={1.5} />
                    </View>
                    <Text style={[styles.categoryTextSingle, { color: isSelected ? theme.gold : theme.textSecondary }]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* 6. INSTAGRAM EXPLORE REELS COLLAGE */}
        <View style={styles.gridSection}>
          <View style={[styles.gridHeaderRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.gridTitle} numberOfLines={1}>
                {searchQuery ? `"${searchQuery}"` : 'Reels'}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.gridCountText}>
                {filteredReelsProducts.length} Video
              </Text>
              
              <View style={{ width: 1, height: 16, backgroundColor: theme.backgroundSelected }} />
              
              <Pressable 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 6, 
                  backgroundColor: !!(feedSelectedCity || feedMinPrice || feedMaxPrice || feedSortBy !== 'default') ? 'rgba(255, 85, 0, 0.12)' : theme.backgroundElement,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: !!(feedSelectedCity || feedMinPrice || feedMaxPrice || feedSortBy !== 'default') ? theme.gold : theme.backgroundSelected
                }}
                onPress={() => setFeedFiltersVisible(true)}
              >
                <SlidersHorizontal size={13} color={!!(feedSelectedCity || feedMinPrice || feedMaxPrice || feedSortBy !== 'default') ? theme.gold : theme.text} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: !!(feedSelectedCity || feedMinPrice || feedMaxPrice || feedSortBy !== 'default') ? theme.gold : theme.text }}>
                  Filtrele {!!(feedSelectedCity || feedMinPrice || feedMaxPrice || feedSortBy !== 'default') ? `(${[!!feedSelectedCity, !!feedMinPrice, !!feedMaxPrice, feedSortBy !== 'default'].filter(Boolean).length})` : ''}
                </Text>
              </Pressable>
            </View>
          </View>
 
          {filteredReelsProducts.length === 0 ? (
            <View style={styles.noResultsBox}>
              <Text style={styles.noResultsText}>Aradığınız kriterlere uygun videolu ürün bulunamadı.</Text>
              <Pressable
                style={styles.clearSearchBtn}
                onPress={() => {
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearSearchBtnText}>Aramayı Temizle</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.masonryGrid}>
              <View style={styles.masonryCol}>{col1.map(renderCollageCard)}</View>
              <View style={styles.masonryCol}>{col2.map(renderCollageCard)}</View>
              <View style={styles.masonryCol}>{col3.map(renderCollageCard)}</View>
            </View>
          )}
        </View>
      </ScrollView>
 
      {/* FULL-SCREEN REELS SWIPEABLE MODAL OVERLAY */}
      <Modal
        visible={activeReelsIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveReelsIndex(null)}
      >
        <View style={styles.reelsModalContainer}>
          {/* Transparent Header Overlay with Close Button */}
          <View style={[styles.reelsModalHeader, { top: insets.top || (Platform.OS === 'ios' ? 44 : 20) }]}>
            <Pressable style={styles.closeReelsButton} onPress={() => setActiveReelsIndex(null)}>
              <X size={22} color="#F8FAFC" />
            </Pressable>
            <Text style={styles.reelsModalTitle}>Canlı Reels Akışı</Text>
            
            {/* Letgo style filter button */}
            <Pressable 
              style={[
                styles.closeReelsButton, 
                !!(reelsSelectedCity || reelsSelectedType || reelsSelectedCategory || reelsMinPrice || reelsMaxPrice || reelsSortBy !== 'default') && { 
                  borderColor: '#FF6B00', 
                  backgroundColor: 'rgba(255, 107, 0, 0.15)' 
                }
              ]} 
              onPress={() => setReelsFiltersVisible(true)}
            >
              <SlidersHorizontal 
                size={18} 
                color={!!(reelsSelectedCity || reelsSelectedType || reelsSelectedCategory || reelsMinPrice || reelsMaxPrice || reelsSortBy !== 'default') ? '#FF6B00' : '#F8FAFC'} 
              />
            </Pressable>
          </View>
 
          {reelsFilteredListings.length === 0 ? (
            <View style={styles.reelsEmptyContainer}>
              <SlidersHorizontal size={48} color="#FF6B00" style={{ marginBottom: 16 }} />
              <Text style={styles.reelsEmptyText}>Seçilen kriterlere uygun Reels bulunamadı.</Text>
              <Pressable
                style={styles.reelsResetButton}
                onPress={handleResetReelsFilters}
              >
                <Text style={styles.reelsResetButtonText}>Filtreleri Sıfırla</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              ref={reelsFlatListRef}
              data={reelsFilteredListings}
              renderItem={renderFeedItem}
              keyExtractor={(item) => `reel_${item.id}`}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              initialScrollIndex={
                (activeReelsIndex !== null && displayedReelsProducts[activeReelsIndex]) 
                  ? Math.max(0, reelsFilteredListings.findIndex(l => l.id === displayedReelsProducts[activeReelsIndex].id))
                  : 0
              }
              getItemLayout={(data, index) => ({
                length: isDesktop ? windowHeight - 40 : windowHeight,
                offset: (isDesktop ? windowHeight - 40 : windowHeight) * index,
                index,
              })}
              windowSize={3}
              maxToRenderPerBatch={1}
              initialNumToRender={1}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          )}
        </View>
      </Modal>

      {/* REELS FILTERS MODAL (Letgo Style) */}
      <Modal
        visible={reelsFiltersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReelsFiltersVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={[styles.modalContent, { maxHeight: '85%' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Detaylı Reels Filtreleri</ThemedText>
              <Pressable onPress={() => setReelsFiltersVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 30 }}>
              {/* Şehir Seçimi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Şehir Seçin (Letgo Tarzı)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  <Pressable
                    style={[
                      styles.filterBadge,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                      reelsSelectedCity === null && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                    ]}
                    onPress={() => setReelsSelectedCity(null)}
                  >
                    <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, reelsSelectedCity === null && { color: theme.gold, fontWeight: '700' }]}>
                      Tüm Türkiye
                    </Text>
                  </Pressable>
                  {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Muğla', 'Adana', 'Trabzon', 'Eskişehir', 'Gaziantep', 'Konya', 'Samsun'].map((c) => (
                    <Pressable
                      key={c}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        reelsSelectedCity === c && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setReelsSelectedCity(c)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, reelsSelectedCity === c && { color: theme.gold, fontWeight: '700' }]}>
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Ürün Türü */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Satış Modeli</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: null, label: 'Hepsi' },
                    { id: 'auction', label: 'Mezat' },
                    { id: 'offer', label: 'Teklifli' },
                    { id: 'fixed', label: 'Sabit Fiyat' }
                  ].map((t) => (
                    <Pressable
                      key={t.id || 'all'}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        reelsSelectedType === t.id && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setReelsSelectedType(t.id)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, reelsSelectedType === t.id && { color: theme.gold, fontWeight: '700' }]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Kategori */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Kategori</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: null, label: 'Tümü' },
                    { id: 'Giyim & Aksesuar', label: 'Giyim & Aksesuar' },
                    { id: 'Ev & Yaşam', label: 'Ev & Yaşam' },
                    { id: 'El Emeği & Sanat', label: 'El Emeği & Sanat' },
                    { id: 'Kitap & Hobi', label: 'Kitap & Hobi' },
                    { id: 'Doğal Gıda', label: 'Doğal Gıda' },
                    { id: 'Antika & Koleksiyon', label: 'Antika & Koleksiyon' },
                    { id: 'Diğer', label: 'Diğer' }
                  ].map((cat) => (
                    <Pressable
                      key={cat.id || 'all'}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        reelsSelectedCategory === cat.id && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setReelsSelectedCategory(cat.id)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, reelsSelectedCategory === cat.id && { color: theme.gold, fontWeight: '700' }]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Fiyat Aralığı */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Fiyat Aralığı (TL)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TextInput
                    placeholder="Min"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={reelsMinPrice}
                    onChangeText={setReelsMinPrice}
                    style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                  <Text style={{ color: theme.textSecondary }}>-</Text>
                  <TextInput
                    placeholder="Maks"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={reelsMaxPrice}
                    onChangeText={setReelsMaxPrice}
                    style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                </View>
              </View>

              {/* Sıralama */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Sıralama Kriteri</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'default', label: 'Önerilen' },
                    { id: 'price_asc', label: 'Artan Fiyat' },
                    { id: 'price_desc', label: 'Azalan Fiyat' }
                  ].map((s) => (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        reelsSortBy === s.id && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setReelsSortBy(s.id)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, reelsSortBy === s.id && { color: theme.gold, fontWeight: '700' }]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable 
                style={[styles.filterResetBtn, { borderColor: theme.textSecondary }]}
                onPress={handleResetReelsFilters}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Sıfırla</Text>
              </Pressable>
              <Pressable 
                style={[styles.filterApplyBtn, { backgroundColor: theme.gold }]}
                onPress={handleApplyReelsFilters}
              >
                <Text style={{ color: '#070C19', fontWeight: '800' }}>Filtreleri Uygula</Text>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
 
      {/* FEED FILTERS MODAL (Letgo Style) */}
      <Modal
        visible={feedFiltersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFeedFiltersVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={[styles.modalContent, { maxHeight: '85%' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Arama & Ürün Filtreleri</ThemedText>
              <Pressable onPress={() => setFeedFiltersVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
 
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 30 }}>
              {/* Şehir Seçimi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Şehir Seçin</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  <Pressable
                    style={[
                      styles.filterBadge,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                      feedSelectedCity === null && { backgroundColor: 'rgba(255, 85, 0, 0.15)', borderColor: theme.gold }
                    ]}
                    onPress={() => setFeedSelectedCity(null)}
                  >
                    <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, feedSelectedCity === null && { color: theme.gold, fontWeight: '700' }]}>
                      Tüm Türkiye
                    </Text>
                  </Pressable>
                  {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Muğla', 'Adana', 'Trabzon', 'Eskişehir', 'Gaziantep', 'Konya', 'Samsun'].map((c) => (
                    <Pressable
                      key={c}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        feedSelectedCity === c && { backgroundColor: 'rgba(255, 85, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setFeedSelectedCity(c)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, feedSelectedCity === c && { color: theme.gold, fontWeight: '700' }]}>
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
 
              {/* Fiyat Aralığı */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Fiyat Aralığı (TL)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TextInput
                    placeholder="Min"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={feedMinPrice}
                    onChangeText={setFeedMinPrice}
                    style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                  <Text style={{ color: theme.textSecondary }}>-</Text>
                  <TextInput
                    placeholder="Maks"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={feedMaxPrice}
                    onChangeText={setFeedMaxPrice}
                    style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                </View>
              </View>
 
              {/* Sıralama */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Sıralama Kriteri</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'default', label: 'Önerilen' },
                    { id: 'newest', label: 'En Yeni İlanlar' },
                    { id: 'price_asc', label: 'Artan Fiyat' },
                    { id: 'price_desc', label: 'Azalan Fiyat' }
                  ].map((s) => (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        feedSortBy === s.id && { backgroundColor: 'rgba(255, 85, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setFeedSortBy(s.id)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, feedSortBy === s.id && { color: theme.gold, fontWeight: '700' }]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
 
            {/* Footer Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable 
                style={[styles.filterResetBtn, { borderColor: theme.textSecondary }]}
                onPress={() => {
                  setFeedSelectedCity(null);
                  setFeedMinPrice('');
                  setFeedMaxPrice('');
                  setFeedSortBy('default');
                }}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Sıfırla</Text>
              </Pressable>
              <Pressable 
                style={[styles.filterApplyBtn, { backgroundColor: theme.gold }]}
                onPress={() => setFeedFiltersVisible(false)}
              >
                <Text style={{ color: '#070C19', fontWeight: '800' }}>Filtreleri Uygula</Text>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

        {/* Bid / Offer Modal */}
        <Modal
          visible={bidModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setBidModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <ThemedView type="backgroundElement" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  {selectedListing?.type === 'auction'
                    ? 'Açık Artırma Teklifi'
                    : selectedListing?.type === 'offer'
                    ? 'Fiyat Teklifi İlet'
                    : 'Hemen Satın Al'}
                </ThemedText>
                <Pressable onPress={() => setBidModalVisible(false)}>
                  <X size={20} color={theme.text} />
                </Pressable>
              </View>

              {selectedListing && (
                <View style={styles.modalBody}>
                  <ThemedText style={{ color: theme.textSecondary, marginBottom: 12 }}>
                    {selectedListing.title}
                  </ThemedText>
                  <View style={styles.modalPriceInfo}>
                    <ThemedText type="small">Mevcut Fiyat:</ThemedText>
                    <ThemedText style={{ color: theme.gold, fontSize: 18, fontWeight: 'bold' }}>
                      {selectedListing.price.toLocaleString('tr-TR')} TL
                    </ThemedText>
                  </View>

                  {selectedListing.type === 'fixed' ? (
                     <View style={{ gap: 16, marginTop: 12 }}>
                       <ThemedText type="small">
                         Bu ürün sabit fiyatlıdır. Hemen satın alma talebi gönderebilirsiniz.
                       </ThemedText>
                       <Pressable
                         style={styles.submitButton}
                         onPress={() => {
                           setBidModalVisible(false);
                           alert('Satın alma talebiniz satıcıya iletildi!');
                         }}
                       >
                         <ThemedText style={styles.submitButtonText}>Satın Al ({selectedListing.price} TL)</ThemedText>
                       </Pressable>
                     </View>
                  ) : (
                    <View style={{ gap: 16, marginTop: 12 }}>
                      <View style={styles.inputContainer}>
                        <TextInput
                          placeholder={
                            selectedListing.type === 'auction'
                              ? `Minimum teklif: ${selectedListing.price + 100} TL`
                              : 'Teklifinizi buraya yazın...'
                          }
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numeric"
                          value={bidAmount}
                          onChangeText={setBidAmount}
                          style={[styles.textInput, { color: theme.text, borderColor: theme.gold }]}
                        />
                        <Text style={styles.currencySuffix}>TL</Text>
                      </View>

                      {bidError !== '' && (
                        <Text style={styles.errorText}>{bidError}</Text>
                      )}

                      <Pressable style={styles.submitButton} onPress={handlePlaceBid}>
                        <ThemedText style={styles.submitButtonText}>Teklifi Gönder</ThemedText>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </ThemedView>
          </View>
        </Modal>

        {/* FLOAT TOAST FEEDBACK FOR CART ADD */}
        {toastMessage !== '' && (
          <View style={[styles.toastContainer, { top: insets.top + 70 }]}>
            <ShoppingCart size={14} color="#FF6B00" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}



        {/* Collage Edit Modal */}
        <Modal
          visible={editCollageModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditCollageModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <ThemedView type="backgroundElement" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Ana Slayt Karuseli Düzenle
                </ThemedText>
                <Pressable onPress={() => setEditCollageModalVisible(false)}>
                  <X size={20} color={theme.text} />
                </Pressable>
              </View>
 
              <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                <ThemedText style={{ color: theme.textSecondary, marginBottom: 8 }}>
                  Karusel slaytları için en fazla 10 adet görsel, başlık, etiket ve yönlendirme bağlantısı (link) tanımlayın. Boş bırakılan alanlar listeden otomatik elenir.
                </ThemedText>
 
                {Array(10).fill(0).map((_, i) => (
                  <View key={`edit_slide_${i}`} style={{ borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected, paddingBottom: 16, marginBottom: 16, gap: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.gold }}>Slayt {i + 1}</Text>
                    
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Görsel Adresi {i + 1}</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.02)' }]}
                        placeholder="https://images.unsplash.com/..."
                        placeholderTextColor={theme.textSecondary}
                        value={editImages[i]}
                        onChangeText={(val) => {
                          const copy = [...editImages];
                          copy[i] = val;
                          setEditImages(copy);
                        }}
                      />
                    </View>
 
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Slayt Başlığı {i + 1}</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.02)' }]}
                        placeholder="Örn: Özel Koleksiyon Mezatı - Keşfet"
                        placeholderTextColor={theme.textSecondary}
                        value={editTitles[i]}
                        onChangeText={(val) => {
                          const copy = [...editTitles];
                          copy[i] = val;
                          setEditTitles(copy);
                        }}
                      />
                    </View>
 
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Etiket {i + 1} (Örn: ÖNE ÇIKAN)</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.02)' }]}
                        placeholder="Örn: KAMPANYA"
                        placeholderTextColor={theme.textSecondary}
                        value={editLabels[i]}
                        onChangeText={(val) => {
                          const copy = [...editLabels];
                          copy[i] = val;
                          setEditLabels(copy);
                        }}
                      />
                    </View>
 
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Yönlendirme Bağlantısı {i + 1}</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.02)' }]}
                        placeholder="Örn: /featured-auction, /auctions, bit_pazari"
                        placeholderTextColor={theme.textSecondary}
                        value={editLinks[i]}
                        onChangeText={(val) => {
                          const copy = [...editLinks];
                          copy[i] = val;
                          setEditLinks(copy);
                        }}
                      />
                    </View>
                  </View>
                ))}
 
                <Pressable style={styles.submitButton} onPress={handleSaveCollageDraft}>
                  <Text style={styles.submitButtonText}>Taslak Olarak Kaydet</Text>
                </Pressable>
              </ScrollView>
            </ThemedView>
          </View>
        </Modal>
 
        {/* Share Story Modal */}
        <Modal
          visible={shareStoryModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setShareStoryModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <ThemedView type="backgroundElement" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hikaye Paylaş</Text>
                <Pressable onPress={() => setShareStoryModalVisible(false)}>
                  <X size={20} color={theme.text} />
                </Pressable>
              </View>
 
              <View style={styles.modalBody}>
                <ThemedText style={{ color: theme.textSecondary, marginBottom: 12 }}>
                  Paylaşmak istediğiniz hikaye görselinin adresini (URL) girin. Hikayeniz 24 saat boyunca tüm kullanıcılara gösterilecek ve ardından otomatik olarak silinecektir.
                </ThemedText>
 
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Hikaye Görsel Adresi (URL)</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.02)' }]}
                    placeholder="https://images.unsplash.com/photo-..."
                    placeholderTextColor={theme.textSecondary}
                    value={newStoryImageUrl}
                    onChangeText={setNewStoryImageUrl}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Bağlı Ürün ID (Opsiyonel)</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.02)' }]}
                    placeholder="Örn: 1 veya 2"
                    placeholderTextColor={theme.textSecondary}
                    value={newStoryProductId}
                    onChangeText={setNewStoryProductId}
                  />
                </View>
 
                <Pressable style={styles.submitButton} onPress={handleShareStory}>
                  <Text style={styles.submitButtonText}>Şimdi Paylaş (8 Saniye)</Text>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </Modal>
 
        {/* Story Viewer Modal */}
        <Modal
          visible={storyViewerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setStoryViewerVisible(false)}
        >
          <View style={styles.storyViewerBackdrop}>
            {activeStoryList.length > 0 && activeStoryIndex < activeStoryList.length && (
              <View 
                style={styles.storyViewerContainer}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {/* Full Screen Image */}
                <Image 
                  source={{ uri: activeStoryList[activeStoryIndex].mediaUrl }} 
                  style={styles.storyViewerImage} 
                />
 
                {/* Progress Indicators Bar */}
                <View style={styles.storyProgressBarContainer}>
                  {activeStoryList.map((st, idx) => {
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
                    source={{ uri: activeStoryList[activeStoryIndex].sellerAvatar }} 
                    style={styles.storyViewerAvatar} 
                  />
                  <Text style={styles.storyViewerUsername}>
                    {activeStoryList[activeStoryIndex].sellerName}
                  </Text>
                  
                  <Pressable style={styles.storyViewerCloseBtn} onPress={() => setStoryViewerVisible(false)}>
                    <X size={22} color="#FFFFFF" />
                  </Pressable>
                </View>
 
                {/* Minimalist Bottom Actions (Mağazaya Git / Ürüne Git) */}
                <View style={styles.storyViewerActions}>
                  <Pressable 
                    style={styles.storyViewerBtn}
                    onPress={() => {
                      setSearchQuery(activeStoryList[activeStoryIndex].sellerName);
                      setStoryViewerVisible(false);
                      alert(`${activeStoryList[activeStoryIndex].sellerName} mağazasının ilanları filtrelendi!`);
                    }}
                  >
                    <Text style={styles.storyViewerBtnText}>MAĞAZAYA GİT</Text>
                  </Pressable>
 
                  {activeStoryList[activeStoryIndex].productId && (
                    <Pressable 
                      style={[styles.storyViewerBtn, { backgroundColor: 'rgba(255, 85, 0, 0.25)', borderColor: 'rgba(255, 85, 0, 0.4)' }]}
                      onPress={() => {
                        const pid = activeStoryList[activeStoryIndex].productId;
                        setStoryViewerVisible(false);
                        router.push(`/product/${pid}`);
                      }}
                    >
                      <Text style={styles.storyViewerBtnText}>ÜRÜNE GİT</Text>
                    </Pressable>
                  )}
                </View>
 
                {/* Left/Right Tap Areas */}
                <View style={styles.storyTapContainer}>
                  <Pressable style={styles.storyTapLeft} onPress={handlePrevStory} />
                  <Pressable style={styles.storyTapRight} onPress={handleNextStory} />
                </View>
              </View>
            )}
          </View>
        </Modal>
 
        {/* ADDED TO CART ANIMATION OVERLAY */}
        {cartAnimationItem && (
          <Animated.View 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(200)}
            style={styles.cartAnimBackdrop}
          >
            <Animated.View 
              entering={ZoomIn.duration(400).springify().damping(12)} 
              exiting={ZoomOut.duration(200)}
              style={styles.cartAnimCard}
            >
              {/* Pulsing rings and success circle */}
              <View style={styles.cartAnimCircleContainer}>
                <AnimatedRing delay={0} />
                <AnimatedRing delay={300} />
                
                <View style={styles.cartAnimSuccessCircle}>
                  <ShoppingCart size={32} color="#070C19" />
                  <View style={styles.cartAnimCheckBadge}>
                    <Check size={10} color="#FFFFFF" strokeWidth={3} />
                  </View>
                </View>
              </View>

              <Text style={styles.cartAnimTitle}>Sepete Eklendi!</Text>
              <Text style={styles.cartAnimSubtitle} numberOfLines={1}>
                {cartAnimationItem.title}
              </Text>
            </Animated.View>
          </Animated.View>
        )}

      </ThemedView>
    );
  }

function AnimatedRing({ delay }: { delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.6, { duration: 1200 }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 1200 }),
        -1,
        false
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return <Animated.View style={[styles.cartAnimRing, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  authTabRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
  },
  authTabButton: {
    flex: 1,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTabActiveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  authTabInactiveButton: {},
  authTabButtonText: {
    fontSize: 13,
    fontWeight: '700',
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
  announcementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 16,
    width: '100%',
  },
  announcementText: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoTextMain: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoTextSub: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginTop: -4,
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5500',
    zIndex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  collageSection: {
    height: 240,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 12,
  },
  collageLeftCard: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 6,
  },
  collageRightColumn: {
    flex: 1.2,
    gap: 6,
  },
  collageRightCard: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 6,
  },
  collageTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 5,
  },
  collageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  collageImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  collageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 12, 25, 0.1)',
  },
  collageEditBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FF5500',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  collagePlaceholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1C2541',
  },
  adminBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 85, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
    justifyContent: 'space-between',
  },
  adminBarText: {
    fontSize: 12,
    color: '#FF5500',
    fontWeight: 'bold',
    flex: 1,
  },
  adminPublishBtn: {
    backgroundColor: '#FF5500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  adminPublishBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoriesSectionSingle: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesTitleSingle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  categoriesRowSingle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryItemSingle: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryIconContainerSingle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextSingle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  subCategoriesSection: {
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  subCategoryScroll: {
    gap: 8,
    paddingRight: 16,
  },
  subCategoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
  },
  subCategoryBadgeSelected: {
    backgroundColor: 'rgba(255, 85, 0, 0.12)',
    borderColor: '#FF5500',
  },
  subCategoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subCategoryBadgeTextSelected: {
    color: '#FF5500',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginRight: 24,
    alignItems: 'center',
    position: 'relative',
  },
  categoryTabText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  categoryTabIndicator: {
    position: 'absolute',
    bottom: -2,
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  gridSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5500',
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  gridCountText: {
    fontSize: 11,
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noResultsText: {
    fontSize: 13,
    textAlign: 'center',
  },
  clearSearchBtn: {
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF5500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  clearSearchBtnText: {
    color: '#FF5500',
    fontWeight: 'bold',
    fontSize: 12,
  },
  masonryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  masonryCol: {
    flex: 1,
    gap: 8,
  },
  collageCard: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  collageCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reelsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(7, 12, 25, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  collageTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
  },
  collageTypeBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  collageCardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7, 12, 25, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
  },
  collageCardTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  collageCardPrice: {
    color: '#FF5500',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 1,
  },
  reelsModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reelsModalHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
  },
  closeReelsButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(7, 12, 25, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reelsModalTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardContainer: {
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  horizontalSwiper: {
    flex: 1,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  timerBadge: {
    position: 'absolute',
    top: 72,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(7, 12, 25, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.3)',
    zIndex: 10,
  },
  timerText: {
    color: '#FF5500',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rightOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 240,
    gap: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(7, 12, 25, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gavelButton: {
    borderColor: 'rgba(255, 85, 0, 0.4)',
    backgroundColor: 'rgba(7, 12, 25, 0.8)',
  },
  iconLabel: {
    color: '#F8FAFC',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 30,
    backgroundColor: 'rgba(7, 12, 25, 0.85)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 85, 0, 0.1)',
    zIndex: 9,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FF5500',
  },
  sellerName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sellerScore: {
    color: '#94A3B8',
    fontSize: 11,
  },
  certifiedBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF5500',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  certifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listingTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listingDesc: {
    color: '#CBD5E1',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  priceAndCtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  priceValue: {
    color: '#FF5500',
    fontSize: 18,
    fontWeight: '900',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 24,
    borderTopWidth: 1,
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
  modalBody: {
    gap: 12,
  },
  modalPriceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  currencySuffix: {
    position: 'absolute',
    right: 16,
    color: '#FF5500',
    fontWeight: 'bold',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#FF5500',
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 12, 25, 0.95)',
    borderWidth: 1,
    borderColor: '#FF5500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    zIndex: 9999,
  },
  toastText: {
    color: '#FF5500',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 6,
    gap: 12,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    resizeMode: 'cover',
  },
  cartItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  cartQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 4,
    padding: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cartQtyBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQtyText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  cartTrashBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
  summaryContainer: {
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    padding: 12,
    borderRadius: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5500',
    height: 48,
    borderRadius: 6,
    gap: 6,
    marginTop: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
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
  formErrorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 2,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formNavigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  formBackBtn: {
    flex: 1,
    height: 46,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  formBackBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  formNextBtn: {
    flex: 2,
    height: 46,
    backgroundColor: '#FF5500',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formNextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  creditCardVisual: {
    height: 150,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.25)',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-between',
  },
  creditCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditCardLogo: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'black',
    letterSpacing: 1,
  },
  creditCardNumber: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 10,
  },
  creditCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  creditCardLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: 'bold',
  },
  creditCardText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  successStepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 85, 0, 0.08)',
    borderWidth: 2,
    borderColor: '#FF5500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  successOrderBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  successContinueBtn: {
    backgroundColor: '#FF5500',
    height: 46,
    width: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  successContinueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sellerHeaderBtn: {
    borderColor: '#FF5500',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 85, 0, 0.08)',
  },
  sellerHeaderBtnText: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sellerHeaderBadge: {
    backgroundColor: '#FF5500',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  sellerHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerLoginBtn: {
    borderColor: '#94A3B8',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  headerLoginBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cartAnimBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 12, 25, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  cartAnimCard: {
    width: 220,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 85, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartAnimCircleContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  cartAnimRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF5500',
  },
  cartAnimSuccessCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF5500',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartAnimCheckBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartAnimTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  cartAnimSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  reelsEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  reelsEmptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  reelsResetButton: {
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
    borderWidth: 1.5,
    borderColor: '#FF5500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  reelsResetButtonText: {
    color: '#FF5500',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterPriceInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  filterResetBtn: {
    flex: 1,
    height: 46,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterApplyBtn: {
    flex: 2,
    height: 46,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorialListContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 16,
  },
  editorialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  editorialItemReverse: {
    flexDirection: 'row-reverse',
  },
  editorialTextCol: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'center',
  },
  editorialLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  editorialTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  editorialEditBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editorialImageCol: {
    width: 90,
    height: 90,
  },
  editorialImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    resizeMode: 'cover',
  },
  editorialImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  singleSliderContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 8,
  },
  sliderDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  sliderDot: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  storiesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  storiesScroll: {
    paddingHorizontal: 16,
  },
  storyBubbleWrapper: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  storyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0D0D0E',
  },
  storyBubbleText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyViewerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  slidePageIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  slidePageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
