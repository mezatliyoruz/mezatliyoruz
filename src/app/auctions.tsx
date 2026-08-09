import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  Platform,
  Modal,
  Text,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore, Listing } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import VideoPlayer from '@/features/feed/components/VideoPlayer';
import {
  Search,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Tag,
  Landmark,
  Heart,
  MessageSquare,
  Send,
  ShoppingCart,
  Star,
  ChevronRight,
  Play,
  MapPin,
  X,
  ArrowLeft,
  ChevronDown,
  Check,
  GitCompare,
} from 'lucide-react-native';
import { formatTime } from '@/utils/time';
import { FLEA_MARKET_CATEGORIES, PRODUCER_CATEGORIES, RENTAL_SUB_CATEGORIES } from './create';
import CategoryBadge from '@/components/category-badge';

const USER_LATITUDE = 41.0082;
const USER_LONGITUDE = 28.9784;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type FilterType = 'all' | 'auction' | 'offer' | 'fixed' | 'rent';

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
    return itemCat === 'Genel' || itemCat === 'Diğer' || itemCat === '🔍 Diğer';
  }
  
  return itemCat === subCat;
};

const isSatKiralaCategory = (item: Listing) => {
  if (item.isRealEstate || item.isVehicle) return true;
  const itemCat = item.category.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s,().]/g, '').trim().toLowerCase();
  return RENTAL_SUB_CATEGORIES.some((rc) => {
    const cleanRc = rc.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s,().]/g, '').trim().toLowerCase();
    return itemCat.includes(cleanRc) || cleanRc.includes(itemCat);
  });
};

export default function AuctionsScreen() {
  const router = useRouter();
  const { type, category } = useLocalSearchParams<{ type?: string; category?: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth > 768;
  const pathname = usePathname();
  const isFocused = pathname.includes('auctions');
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  // Display height calculation for each Reel slide
  const displayHeight = windowHeight - 64 - 60 - insets.top;

  const { listings, decrementTimers, toggleLike, addToCart, setCartModalVisible, setCheckoutStep, compareList, removeFromCompareList, clearCompareList } = useAppStore();
  const [compareModalVisible, setCompareModalVisible] = useState(false);


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
      });
    }
    if (isVehicle || isMega) {
      badges.push({
        label: 'GALERİ',
        name: '🚗 Kurumsal Oto Galeri Üyesi',
        description: 'Bu üye Bakanlık onaylı İkinci El Motorlu Kara Taşıtı Ticareti Yetki Belgesine, Seviye 5 Mesleki Yeterlilik belgesine sahip kurumsal bir oto galerisidir.',
        image: require('@/assets/images/badge_galeri.png'),
      });
    }
    if (isRent || isMega) {
      badges.push({
        label: 'RENT A CAR',
        name: '🔑 Kurumsal Oto Kiralama (Rent a Car)',
        description: 'Bu üye resmi oto kiralama ruhsatına, NACE kodu onaylı vergi levhasına ve e-Devlet entegrasyonuna sahip kurumsal araç kiralama firmasıdır.',
        image: require('@/assets/images/badge_rentacar.png'),
      });
    }
    if (isProducer || isMega) {
      badges.push({
        label: 'ÜRETİCİ',
        name: '🍯 Onaylı Yerel Üretici',
        description: 'Bu üye yerel, el yapımı veya doğal tarım ürünleri üreten, doğrulanmış üretim/gıda uygunluk raporuna sahip yerel üreticidir.',
        image: require('@/assets/images/badge_dogrulanmis.png'),
      });
    }
    
    if (badges.length === 0 && item.sellerVerified) {
      badges.push({
        label: 'KURUMSAL',
        name: '🏢 Kurumsal Üye',
        description: 'Bu üye resmi belgelerini sunmuş ve doğrulanmış kurumsal bir firmadır.',
        image: require('@/assets/images/badge_kurumsal.png'),
      });
    }

    return badges;
  };

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');

  // Vasıta (Vehicle) Specific Filter States
  const [filterMinKm, setFilterMinKm] = useState('');
  const [filterMaxKm, setFilterMaxKm] = useState('');
  const [filterMinYear, setFilterMinYear] = useState('');
  const [filterMaxYear, setFilterMaxYear] = useState('');
  const [filterTransmission, setFilterTransmission] = useState<'all' | 'Manuel' | 'Otomatik'>('all');

  // Emlak (Real Estate) Specific Filter States
  const [filterMinSqm, setFilterMinSqm] = useState('');
  const [filterMaxSqm, setFilterMaxSqm] = useState('');
  const [filterRooms, setFilterRooms] = useState<string[]>([]);

  // View Mode: 'grid' (list of products) or 'reels' (fullscreen player)
  const [viewMode, setViewMode] = useState<'grid' | 'reels'>('grid');

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const reelsFlatListRef = useRef<FlatList>(null);
  const [reelsSearchQuery, setReelsSearchQuery] = useState('');
  const [reelsSearchDividerIndex, setReelsSearchDividerIndex] = useState<number | null>(null);

  // Sync timers
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTimers();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync route params with internal state
  useEffect(() => {
    if (type) {
      setSelectedFilter(type as FilterType);
    } else {
      setSelectedFilter('all');
    }
    setViewMode('grid');
  }, [type]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
    setViewMode('grid');
  }, [category]);

  // Filter and Sort Products
  const filteredReels = listings
    .filter((item) => {
      // If we are in category mode (i.e. category or type exists), show all matching items, not just video ones!
      // Otherwise (General Reels Feed), only show items that have a videoUrl.
      if (!category && !type && !item.videoUrl) return false;
      return true;
    })
    .filter((item) => {
      const matchesSearch = searchQuery
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;

      let matchesCategory = true;
      if (category === 'Bit Pazarı') {
        // Bit Pazarı: exclude auctions, rentals, real estate, and vehicle listings
        if (item.type === 'auction' || item.type === 'rent') matchesCategory = false;
        else if (item.isRealEstate || item.isVehicle) matchesCategory = false;
        else if (isSatKiralaCategory(item)) matchesCategory = false;
        else {
          // Must be a flea market compatible category
          const isFleaItem = FLEA_MARKET_CATEGORIES.some(fc => matchesSubCategory(item, fc)) ||
            ['Giyim & Aksesuar', 'Elektronik', 'Ev & Yaşam', 'Antika & Koleksiyon', 'Koleksiyon & Antika', 'Kitap & Hobi', 'Diğer', 'Genel'].includes(item.category);
          matchesCategory = isFleaItem;
        }
        if (matchesCategory && selectedCategory && selectedCategory !== 'Bit Pazarı') {
          matchesCategory = item.category === selectedCategory || matchesSubCategory(item, selectedCategory);
        }
      } else if (category === 'Üreticiden Tüketiciye') {
        // Üreticiden Tüketiciye: exclude auctions, rentals, real estate, and vehicle listings
        if (item.type === 'auction' || item.type === 'rent') matchesCategory = false;
        else if (item.isRealEstate || item.isVehicle) matchesCategory = false;
        else if (isSatKiralaCategory(item)) matchesCategory = false;
        else {
          const isProducerProduct =
            item.verifiedProduct === true ||
            ['El Yapımı', 'Mutfak', 'Doğal Gıda', 'El Emeği & Sanat', 'Doğal Kozmetik', 'Tasarım Giyim', 'Bahçe & Tarım'].includes(item.category) ||
            PRODUCER_CATEGORIES.includes(item.category) ||
            item.category === '🔍 Diğer';
          matchesCategory = isProducerProduct;
        }
        if (matchesCategory && selectedCategory && selectedCategory !== 'Üreticiden Tüketiciye') {
          matchesCategory = item.category === selectedCategory || matchesSubCategory(item, selectedCategory);
        }
      } else if (category === 'Sat / Kirala') {
        matchesCategory = isSatKiralaCategory(item);
        if (selectedCategory && selectedCategory !== 'Sat / Kirala') {
          matchesCategory = matchesCategory && (item.category === selectedCategory || matchesSubCategory(item, selectedCategory));
        }
      } else {
        if (selectedCategory === 'Bit Pazarı') {
          if (item.type === 'auction' || item.type === 'rent') matchesCategory = false;
          else if (item.isRealEstate || item.isVehicle) matchesCategory = false;
          else if (isSatKiralaCategory(item)) matchesCategory = false;
          else {
            const isFleaItem = FLEA_MARKET_CATEGORIES.some(fc => matchesSubCategory(item, fc)) ||
              ['Giyim & Aksesuar', 'Elektronik', 'Ev & Yaşam', 'Antika & Koleksiyon', 'Koleksiyon & Antika', 'Kitap & Hobi', 'Diğer', 'Genel'].includes(item.category);
            matchesCategory = isFleaItem;
          }
        } else if (selectedCategory === 'Üreticiden Tüketiciye') {
          if (item.type === 'auction' || item.type === 'rent') matchesCategory = false;
          else if (item.isRealEstate || item.isVehicle) matchesCategory = false;
          else if (isSatKiralaCategory(item)) matchesCategory = false;
          else {
            const isProducerProduct =
              item.verifiedProduct === true ||
              ['El Yapımı', 'Mutfak', 'Doğal Gıda', 'El Emeği & Sanat', 'Doğal Kozmetik', 'Tasarım Giyim', 'Bahçe & Tarım'].includes(item.category) ||
              PRODUCER_CATEGORIES.includes(item.category) ||
              item.category === '🔍 Diğer';
            matchesCategory = isProducerProduct;
          }
        } else if (selectedCategory === 'Sat / Kirala') {
          matchesCategory = isSatKiralaCategory(item);
        } else if (selectedCategory) {
          matchesCategory = item.category === selectedCategory || matchesSubCategory(item, selectedCategory);
        }
      }

      const matchesCity = selectedCity ? item.city === selectedCity : true;

      const matchesMinPrice = minPrice ? item.price >= parseFloat(minPrice) : true;
      const matchesMaxPrice = maxPrice ? item.price <= parseFloat(maxPrice) : true;

      // Category Specific filters: Vasıta (Otomobil)
      let matchesVehicle = true;
      if (item.isVehicle || (item.category && item.category.includes('Otomobil'))) {
        const itemKm = item.km || 0;
        const itemYear = item.year || 0;
        
        if (filterMinKm && itemKm < parseInt(filterMinKm)) matchesVehicle = false;
        if (filterMaxKm && itemKm > parseInt(filterMaxKm)) matchesVehicle = false;
        if (filterMinYear && itemYear < parseInt(filterMinYear)) matchesVehicle = false;
        if (filterMaxYear && itemYear > parseInt(filterMaxYear)) matchesVehicle = false;
        if (filterTransmission !== 'all' && item.transmission !== filterTransmission) matchesVehicle = false;
      }

      // Category Specific filters: Emlak
      let matchesRealEstate = true;
      if (item.isRealEstate || (item.category && item.category.includes('Emlak'))) {
        const itemSqm = item.sqm || 0;
        const itemRooms = item.rooms || '';
        
        if (filterMinSqm && itemSqm < parseInt(filterMinSqm)) matchesRealEstate = false;
        if (filterMaxSqm && itemSqm > parseInt(filterMaxSqm)) matchesRealEstate = false;
        if (filterRooms.length > 0 && !filterRooms.includes(itemRooms)) matchesRealEstate = false;
      }

      return matchesSearch && matchesFilter && matchesCategory && matchesCity && matchesMinPrice && matchesMaxPrice && matchesVehicle && matchesRealEstate;
    });

  // Apply sorting
  if (sortBy === 'price_asc') {
    filteredReels.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    filteredReels.sort((a, b) => b.price - a.price);
  } else {
    // Default: Sort by newest first
    filteredReels.sort((a, b) => b.id.localeCompare(a.id));
  }

  // Smart Reels search: separate exact matches from similar items
  const reelsVideoItems = filteredReels.filter(item => !!item.videoUrl);
  let smartReelsItems: Listing[] = reelsVideoItems;
  let computedDividerIndex: number | null = null;

  if (reelsSearchQuery.trim()) {
    const query = reelsSearchQuery.trim().toLowerCase();
    const exactMatches: Listing[] = [];
    const similarItems: Listing[] = [];

    reelsVideoItems.forEach(item => {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesDesc = item.description.toLowerCase().includes(query);
      const matchesCat = item.category.toLowerCase().includes(query);
      if (matchesTitle || matchesDesc || matchesCat) {
        exactMatches.push(item);
      }
    });

    // Get the parent category of exact match items, then find similar items
    const matchedCategories = new Set(exactMatches.map(item => item.category));
    reelsVideoItems.forEach(item => {
      if (!exactMatches.includes(item)) {
        if (matchedCategories.has(item.category)) {
          similarItems.push(item);
        }
      }
    });

    // Remaining items that are neither exact matches nor similar
    const remaining = reelsVideoItems.filter(item => !exactMatches.includes(item) && !similarItems.includes(item));

    if (exactMatches.length > 0) {
      smartReelsItems = [...exactMatches, ...similarItems, ...remaining];
      computedDividerIndex = exactMatches.length;
    } else {
      smartReelsItems = reelsVideoItems;
    }
  }

  // Staggered heights for masonry grid cards
  const getCardHeight = (idx: number) => {
    const heights = [160, 230, 190, 210, 150];
    return heights[idx % heights.length];
  };

  // Divide filtered reels products into 3 columns for Masonry Grid
  const col1: { item: Listing; globalIndex: number }[] = [];
  const col2: { item: Listing; globalIndex: number }[] = [];
  const col3: { item: Listing; globalIndex: number }[] = [];

  filteredReels.forEach((item, index) => {
    const packet = { item, globalIndex: index };
    if (index % 3 === 0) col1.push(packet);
    else if (index % 3 === 1) col2.push(packet);
    else col3.push(packet);
  });

  const handleApplyFilters = () => {
    setFiltersVisible(false);
    setActiveItemIndex(0);
    setTimeout(() => {
      if (reelsFlatListRef.current && filteredReels.length > 0) {
        try {
          reelsFlatListRef.current.scrollToIndex({ index: 0, animated: false });
        } catch (err) {
          console.warn('Reels scroll to index 0 failed:', err);
        }
      }
    }, 100);
  };

  const handleResetFilters = () => {
    setSelectedCity(null);
    setSelectedFilter('all');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    setSearchQuery('');
    setFilterMinKm('');
    setFilterMaxKm('');
    setFilterMinYear('');
    setFilterMaxYear('');
    setFilterTransmission('all');
    setFilterMinSqm('');
    setFilterMaxSqm('');
    setFilterRooms([]);
    setFiltersVisible(false);
    setActiveItemIndex(0);
    setTimeout(() => {
      if (reelsFlatListRef.current && filteredReels.length > 0) {
        try {
          reelsFlatListRef.current.scrollToIndex({ index: 0, animated: false });
        } catch (err) {
          console.warn('Reels scroll to index 0 failed on reset:', err);
        }
      }
    }, 100);
  };

  const handleStartChat = (productId: string) => {
    alert(`Sohbet başlatılıyor... Ürün ID: ${productId}`);
  };

  const handleShareProduct = async (item: Listing) => {
    try {
      await Share.share({
        message: `Harika bir videolu ürün buldum! ${item.title} - ${item.price} TL. Hemen incele!`,
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  const handleAddToCart = (item: Listing) => {
    addToCart(item.id);
    alert(`${item.title} sepete eklendi.`);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveItemIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderFeedItem = ({ item, index }: { item: Listing; index: number }) => {
    const isActive = index === activeItemIndex;
    const mediaItems = [
      { type: 'video', url: item.videoUrl },
      ...item.photos.map((p: any) => ({ type: 'image', url: p })),
    ];

    return (
      <View style={[styles.cardContainer, { height: displayHeight, width: windowWidth }]}>
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
                <View style={{ width: windowWidth, height: displayHeight }}>
                  {shouldRenderVideo ? (
                    <VideoPlayer url={media.url} isActive={isActive && isFocused} posterUrl={item.photos[0]} />
                  ) : (
                    <Image
                      source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                      style={{ width: windowWidth, height: displayHeight, resizeMode: 'cover' }}
                    />
                  )}
                </View>
              );
            } else {
              return (
                <Image
                  source={typeof media.url === 'number' ? media.url : { uri: media.url }}
                  style={{ width: windowWidth, height: displayHeight, resizeMode: 'cover' }}
                />
              );
            }
          }}
        />

        {/* Media Dot Indicators */}
        <View style={styles.indicatorContainer}>
          {mediaItems.map((_, dotIdx) => (
            <View key={dotIdx} style={[styles.dot, dotIdx === 0 && { backgroundColor: theme.gold }]} />
          ))}
        </View>

        {/* Real-time Auction Time Left Overlay */}
        {item.type === 'auction' && item.timeLeft !== undefined && (
          <View style={styles.timerBadge}>
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
            onPress={() => {
              if (item.type === 'fixed') {
                addToCart(item.id);
              }
              setCheckoutStep('cart');
              setCartModalVisible(true);
            }}
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
        <View style={[styles.bottomOverlay, { paddingBottom: Math.max(28, insets.bottom + 16) }]}>
          <View style={styles.sellerRow}>
            <Image source={{ uri: item.sellerAvatar }} style={styles.sellerAvatar} />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
                        style={{ width: 16, height: 18, resizeMode: 'contain' }}
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

            {item.verifiedProduct && (
              <View style={styles.reelsCertifiedBadge}>
                <ShieldCheck size={12} color="#0B132B" />
                <Text style={styles.reelsCertifiedText}>Belgeli</Text>
              </View>
            )}
          </View>

          <CategoryBadge item={item} style={{ marginBottom: 6, alignSelf: 'flex-start' }} />
          <ThemedText style={styles.listingTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.listingDesc} numberOfLines={2}>
            {item.description}
          </ThemedText>

          <View style={styles.priceAndCtaRow}>
            <View>
              <ThemedText style={styles.reelsPriceLabel}>
                {item.type === 'auction'
                  ? 'En Yüksek Teklif'
                  : item.type === 'rent'
                  ? 'Kiralama Ücreti'
                  : 'Fiyat'}
              </ThemedText>
              <ThemedText style={styles.reelsPriceValue}>
                {item.price.toLocaleString('tr-TR')} TL
                {item.type === 'rent' && ` / ${item.rentPeriod || 'Günlük'}`}
              </ThemedText>
            </View>

            {item.type === 'fixed' ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={[styles.reelsAddToCartBtn, { backgroundColor: '#FF5500' }]}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.reelsAddToCartBtnText}>Sepete Ekle</Text>
                </Pressable>
                <Pressable
                  style={[styles.ctaButton, { backgroundColor: theme.gold }]}
                  onPress={() => {
                    addToCart(item.id);
                    setCheckoutStep('cart');
                    setCartModalVisible(true);
                  }}
                >
                  <Text style={styles.ctaButtonText}>Hemen Al</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.ctaButton}
                onPress={() => {
                  router.push(`/product/${item.id}`);
                }}
              >
                <ThemedText style={styles.ctaButtonText}>
                  {item.type === 'auction' ? 'Teklif Ver' : 'Detayları Gör'}
                </ThemedText>
                <ChevronRight size={16} color="#0B132B" />
              </Pressable>
            )}
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
        style={[styles.collageCard, { height: cardHeight, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
        onPress={() => {
          setActiveItemIndex(globalIndex);
          setViewMode('reels');
        }}
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
                  : item.type === 'rent'
                  ? 'rgba(139, 92, 246, 0.85)'
                  : 'rgba(37, 99, 235, 0.85)',
            },
          ]}
        >
          <Text style={styles.collageTypeBadgeText}>
            {item.type === 'auction' ? 'MEZAT' : item.type === 'offer' ? 'TEKLİF' : item.type === 'rent' ? 'KİRALIK' : 'SABİT'}
          </Text>
        </View>

        {/* Bottom Glassmorphic Label */}
        <View style={[styles.collageCardFooter, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}>
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

  const renderListItem = (item: Listing) => {
    const isDark = scheme === 'dark';
    return (
      <Pressable
        key={`list_item_${item.id}`}
        style={[
          styles.listItemContainer,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          }
        ]}
        onPress={() => {
          router.push(`/product/${item.id}`);
        }}
      >
        <Image
          source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
          style={styles.listItemImage}
        />
        
        <View style={styles.listItemInfo}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
            <Text style={[styles.listItemTitle, { color: theme.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.verifiedProduct && (
              <View style={[styles.verifiedBadgeTiny, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.08)' }]}>
                <ShieldCheck size={11} color={isDark ? '#34D399' : '#059669'} />
                <Text style={[styles.verifiedBadgeTextTiny, { color: isDark ? '#34D399' : '#059669' }]}>Onaylı</Text>
              </View>
            )}
          </View>
          
          <CategoryBadge item={item} style={{ marginVertical: 3 }} />

          <Text style={[styles.listItemPrice, { color: isDark ? theme.gold : theme.goldAccent }]}>
            {item.price.toLocaleString('tr-TR')} TL
            {item.type === 'rent' && ` / ${item.rentPeriod || 'Günlük'}`}
          </Text>

          <View style={styles.listItemFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '500' }}>
                {item.city}
              </Text>
            </View>
            
            <View style={[
              styles.typeBadge,
              {
                backgroundColor: item.type === 'auction'
                  ? 'rgba(255, 107, 0, 0.12)'
                  : item.type === 'offer'
                  ? 'rgba(147, 51, 234, 0.12)'
                  : item.type === 'rent'
                  ? 'rgba(139, 92, 246, 0.12)'
                  : 'rgba(59, 130, 246, 0.12)',
                borderColor: item.type === 'auction'
                  ? 'rgba(255, 107, 0, 0.25)'
                  : item.type === 'offer'
                  ? 'rgba(147, 51, 234, 0.25)'
                  : item.type === 'rent'
                  ? 'rgba(139, 92, 246, 0.25)'
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
                    ? '#8B5CF6'
                    : '#3B82F6'
                }
              ]}>
                {item.type === 'auction' ? 'Mezat' : item.type === 'offer' ? 'Teklifli' : item.type === 'rent' ? 'Kiralık' : 'Sabit'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // Fullscreen swiping Reels Mode Layout
  if (viewMode === 'reels') {
    return (
      <ThemedView style={[styles.container, { backgroundColor: '#000000', paddingTop: 0 }]}>
        {smartReelsItems.length === 0 ? (
          <View style={styles.reelsEmptyContainer}>
            <SlidersHorizontal size={48} color="#FF6B00" style={{ marginBottom: 16 }} />
            <Text style={styles.reelsEmptyText}>Uyumlu Reels bulunamadı.</Text>
            <Pressable style={styles.reelsResetButton} onPress={handleResetFilters}>
              <Text style={styles.reelsResetButtonText}>Filtreleri Sıfırla</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ height: displayHeight, width: windowWidth }}>
            <FlatList
              ref={reelsFlatListRef}
              data={smartReelsItems}
              renderItem={renderFeedItem}
              keyExtractor={(item) => `reel_feed_${item.id}`}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              initialScrollIndex={activeItemIndex < smartReelsItems.length ? activeItemIndex : 0}
              getItemLayout={(data, index) => ({
                length: displayHeight,
                offset: displayHeight * index,
                index,
              })}
              windowSize={3}
              maxToRenderPerBatch={1}
              initialNumToRender={1}
              removeClippedSubviews={Platform.OS === 'android'}
            />
          </View>
        )}

        {/* Zarif Arama Uyarısı */}
        {reelsSearchQuery.trim() !== '' && computedDividerIndex !== null && activeItemIndex >= computedDividerIndex && (
          <View style={[styles.reelsWarningBanner, { top: Math.max(12, insets.top) + 60 }]}>
            <Text style={styles.reelsWarningText}>🔍 Aramanızla eşleşen ürünler bitti, benzer ürünler gösterilmektedir.</Text>
          </View>
        )}

        {/* Transparent Header Overlay with Back Button, Search, and Filter */}
        <View style={[styles.reelsHeaderContainer, { top: Math.max(12, insets.top), zIndex: 9999 }]}>
          <Pressable style={styles.reelsHeaderIconBtn} onPress={() => setViewMode('grid')}>
            <ArrowLeft size={22} color="#F8FAFC" />
          </Pressable>
          
          <View style={styles.reelsSearchInputWrapper}>
            <Search size={16} color="rgba(248, 250, 252, 0.6)" style={styles.reelsSearchIcon} />
            <TextInput
              style={styles.reelsSearchInput}
              placeholder="Reels'da ara..."
              placeholderTextColor="rgba(248, 250, 252, 0.5)"
              value={reelsSearchQuery}
              onChangeText={(text) => {
                setReelsSearchQuery(text);
                setActiveItemIndex(0);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {reelsSearchQuery ? (
              <Pressable onPress={() => { setReelsSearchQuery(''); setActiveItemIndex(0); }}>
                <X size={16} color="#F8FAFC" />
              </Pressable>
            ) : null}
          </View>

          <Pressable style={styles.reelsHeaderIconBtn} onPress={() => setFiltersVisible(true)}>
            <SlidersHorizontal size={20} color="#F8FAFC" />
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  // Grid/List Browse Mode Layout (Default)
  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background, paddingTop: Math.max(12, insets.top) }]}>
      {/* Search & Filter Header Bar */}
      <View style={styles.gridHeaderBar}>
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Search size={16} color={theme.textSecondary} />
          <TextInput
            placeholder="Koleksiyon, araç, giyim ara..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
        
        <Pressable 
          style={[
            styles.filterButton, 
            { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
            !!(selectedCity || selectedFilter !== 'all' || selectedCategory || minPrice || maxPrice || sortBy !== 'default') && {
              borderColor: theme.gold,
              backgroundColor: 'rgba(255, 107, 0, 0.15)'
            }
          ]}
          onPress={() => setFiltersVisible(true)}
        >
          <SlidersHorizontal size={16} color={!!(selectedCity || selectedFilter !== 'all' || selectedCategory || minPrice || maxPrice || sortBy !== 'default') ? theme.gold : theme.text} />
        </Pressable>
      </View>

      {/* Dynamic Filter Badges */}
      <View style={styles.filterBadgesContainer}>
        {category ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
            {[
              { id: 'all', label: 'Tümü', value: null },
              ...(category === 'Bit Pazarı'
                ? FLEA_MARKET_CATEGORIES.map(cat => ({ id: cat, label: cat, value: cat }))
                : category === 'Üreticiden Tüketiciye'
                ? PRODUCER_CATEGORIES.map(cat => ({ id: cat, label: cat, value: cat }))
                : RENTAL_SUB_CATEGORIES.map(cat => ({ id: cat, label: cat, value: cat })))
            ].map((t) => {
              const isSelected = selectedCategory === t.value || (t.value === null && (selectedCategory === null || selectedCategory === category));
              return (
                <Pressable
                  key={t.id}
                  style={[
                    styles.filterChip,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, flex: 0, paddingHorizontal: 16 },
                    isSelected && styles.activeFilterChip
                  ]}
                  onPress={() => setSelectedCategory(t.value)}
                >
                  <ThemedText style={[styles.filterChipText, isSelected && styles.activeFilterChipText]}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          [
            { id: 'all', label: 'Tümü' },
            { id: 'auction', label: 'Mezat' },
            { id: 'offer', label: 'Teklifliler' },
            { id: 'fixed', label: 'Sabit' },
            { id: 'rent', label: 'Kiralık' }
          ].map((t) => (
            <Pressable
              key={t.id}
              style={[
                styles.filterChip,
                { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                selectedFilter === t.id && styles.activeFilterChip
              ]}
              onPress={() => setSelectedFilter(t.id as FilterType)}
            >
              <ThemedText style={[styles.filterChipText, selectedFilter === t.id && styles.activeFilterChipText]}>
                {t.label}
              </ThemedText>
            </Pressable>
          ))
        )}
      </View>

      {/* Products Grid List */}
      {filteredReels.length === 0 ? (
        <View style={styles.reelsEmptyContainer}>
          <SlidersHorizontal size={48} color="#FF6B00" style={{ marginBottom: 16 }} />
          <Text style={[styles.reelsEmptyText, { color: theme.textSecondary }]}>Seçilen kriterlere uygun ilan bulunamadı.</Text>
          <Pressable style={styles.reelsResetButton} onPress={handleResetFilters}>
            <Text style={styles.reelsResetButtonText}>Temizle</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.gridListContent, { paddingBottom: 100 }]}
        >
          {category || type ? (
            <View style={{ gap: 12, paddingHorizontal: 4 }}>
              {filteredReels.map(renderListItem)}
            </View>
          ) : (
            <View style={styles.masonryGrid}>
              <View style={styles.masonryCol}>{col1.map(renderCollageCard)}</View>
              <View style={styles.masonryCol}>{col2.map(renderCollageCard)}</View>
              <View style={styles.masonryCol}>{col3.map(renderCollageCard)}</View>
            </View>
          )}
        </ScrollView>
      )}

      {/* FILTER MODAL */}
      <Modal
        visible={filtersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Ürün Filtreleri</ThemedText>
              <Pressable onPress={() => setFiltersVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 30 }}>
              {/* Satış Modeli */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Satış Modeli</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'auction', label: 'Mezat' },
                    { id: 'offer', label: 'Teklifliler' },
                    { id: 'fixed', label: 'Sabit Fiyat' },
                    { id: 'rent', label: 'Kiralık' }
                  ].map((t) => (
                    <Pressable
                      key={t.id}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        selectedFilter === t.id && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setSelectedFilter(t.id as FilterType)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, selectedFilter === t.id && { color: theme.gold, fontWeight: '700' }]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Hızlı Kategori Seçimi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Kategori</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(() => {
                    const baseCategories: { id: string | null; label: string }[] = [
                      { id: null, label: 'Tümü' }
                    ];
                    
                    if (category === 'Bit Pazarı' || selectedCategory === 'Bit Pazarı') {
                      return baseCategories.concat(FLEA_MARKET_CATEGORIES.map(cat => ({ id: cat, label: cat })));
                    } else if (category === 'Üreticiden Tüketiciye' || selectedCategory === 'Üreticiden Tüketiciye') {
                      return baseCategories.concat(PRODUCER_CATEGORIES.map(cat => ({ id: cat, label: cat })));
                    } else if (category === 'Sat / Kirala' || selectedCategory === 'Sat / Kirala' || selectedFilter === 'rent') {
                      return baseCategories.concat(RENTAL_SUB_CATEGORIES.map(cat => ({ id: cat, label: cat })));
                    } else {
                      return [
                        { id: null, label: 'Tümü' },
                        { id: 'Bit Pazarı', label: 'Bit Pazarı' },
                        { id: 'Üreticiden Tüketiciye', label: 'Üreticiden' },
                        { id: 'Antika & Koleksiyon', label: 'Antika' },
                        { id: 'Giyim & Aksesuar', label: 'Giyim' },
                        { id: 'Ev & Yaşam', label: 'Ev & Yaşam' },
                        { id: 'Kitap & Hobi', label: 'Kitap & Hobi' }
                      ];
                    }
                  })().map((c) => (
                    <Pressable
                      key={c.id || 'all'}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        selectedCategory === c.id && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setSelectedCategory(c.id)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, selectedCategory === c.id && { color: theme.gold, fontWeight: '700' }]}>
                        {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Kategoriye Özel Filtreler: Vasıta */}
              {(category === 'Sat / Kirala' || selectedCategory === '🚗 Otomobil' || selectedCategory === 'Araçlar (Otomobil)') && (
                <View style={{ gap: 16 }}>
                  <View style={styles.filterSection}>
                    <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Kilometre Aralığı</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <TextInput
                        placeholder="Min KM"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={filterMinKm}
                        onChangeText={setFilterMinKm}
                        style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      />
                      <Text style={{ color: theme.textSecondary }}>-</Text>
                      <TextInput
                        placeholder="Maks KM"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={filterMaxKm}
                        onChangeText={setFilterMaxKm}
                        style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      />
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Model Yılı Aralığı</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <TextInput
                        placeholder="Min Yıl"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={filterMinYear}
                        onChangeText={setFilterMinYear}
                        style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      />
                      <Text style={{ color: theme.textSecondary }}>-</Text>
                      <TextInput
                        placeholder="Maks Yıl"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={filterMaxYear}
                        onChangeText={setFilterMaxYear}
                        style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      />
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Vites Tipi</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'Manuel', label: 'Manuel' },
                        { id: 'Otomatik', label: 'Otomatik' }
                      ].map((v) => (
                        <Pressable
                          key={v.id}
                          style={[
                            styles.filterBadge,
                            { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                            filterTransmission === v.id && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                          ]}
                          onPress={() => setFilterTransmission(v.id as any)}
                        >
                          <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, filterTransmission === v.id && { color: theme.gold, fontWeight: '700' }]}>
                            {v.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Kategoriye Özel Filtreler: Emlak */}
              {(category === 'Sat / Kirala' || selectedCategory === '🏠 Emlak') && (
                <View style={{ gap: 16 }}>
                  <View style={styles.filterSection}>
                    <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Metrekare (m²)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <TextInput
                        placeholder="Min m²"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={filterMinSqm}
                        onChangeText={setFilterMinSqm}
                        style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      />
                      <Text style={{ color: theme.textSecondary }}>-</Text>
                      <TextInput
                        placeholder="Maks m²"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={filterMaxSqm}
                        onChangeText={setFilterMaxSqm}
                        style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      />
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Oda Sayısı</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {['1+1', '2+1', '3+1', '4+1+'].map((r) => {
                        const isSelected = filterRooms.includes(r);
                        return (
                          <Pressable
                            key={r}
                            style={[
                              styles.filterBadge,
                              { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                              isSelected && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                            ]}
                            onPress={() => {
                              if (isSelected) {
                                setFilterRooms(prev => prev.filter(x => x !== r));
                              } else {
                                setFilterRooms(prev => [...prev, r]);
                              }
                            }}
                          >
                            <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, isSelected && { color: theme.gold, fontWeight: '700' }]}>
                              {r}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* Şehir Seçimi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Şehir</Text>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                    borderWidth: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 4,
                  }}
                  onPress={() => setCityPickerVisible(true)}
                >
                  <Text style={{ color: theme.text, fontSize: 14 }}>
                    {selectedCity || 'Tüm Türkiye'}
                  </Text>
                  <ChevronDown size={18} color={theme.textSecondary} />
                </Pressable>
              </View>

              {/* Fiyat Aralığı */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Fiyat Aralığı (TL)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TextInput
                    placeholder="Min"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                  <Text style={{ color: theme.textSecondary }}>-</Text>
                  <TextInput
                    placeholder="Maks"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    style={[styles.filterPriceInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  />
                </View>
              </View>

              {/* Sıralama */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.text }]}>Sıralama Kriteri</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'default', label: 'Yeniye Göre' },
                    { id: 'price_asc', label: 'Artan Fiyat' },
                    { id: 'price_desc', label: 'Azalan Fiyat' }
                  ].map((s) => (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.filterBadge,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                        sortBy === s.id && { backgroundColor: 'rgba(255, 107, 0, 0.15)', borderColor: theme.gold }
                      ]}
                      onPress={() => setSortBy(s.id as any)}
                    >
                      <Text style={[styles.filterBadgeText, { color: theme.textSecondary }, sortBy === s.id && { color: theme.gold, fontWeight: '700' }]}>
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
                onPress={handleResetFilters}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Temizle</Text>
              </Pressable>
              <Pressable 
                style={[styles.filterApplyBtn, { backgroundColor: theme.gold }]}
                onPress={handleApplyFilters}
              >
                <Text style={{ color: '#070C19', fontWeight: '800' }}>Filtreleri Uygula</Text>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* City Picker Modal */}
      <Modal
        visible={cityPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCityPickerVisible(false)}
      >
        <Pressable 
          style={styles.modalBackdrop} 
          onPress={() => setCityPickerVisible(false)}
        >
          <ThemedView 
            type="backgroundElement" 
            style={{
              width: '90%',
              maxWidth: 360,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.backgroundSelected,
            }}
          >
            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
              Şehir Seçin
            </ThemedText>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {['Tüm Türkiye', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Muğla', 'Adana', 'Trabzon', 'Eskişehir', 'Gaziantep', 'Konya', 'Samsun'].map((c) => {
                const isSelected = (c === 'Tüm Türkiye' && selectedCity === null) || selectedCity === c;
                return (
                  <Pressable
                    key={c}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.12)' : 'transparent',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setSelectedCity(c === 'Tüm Türkiye' ? null : c);
                      setCityPickerVisible(false);
                    }}
                  >
                    <Text style={{ 
                      color: isSelected ? theme.gold : theme.text,
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: 14,
                    }}>
                      {c}
                    </Text>
                    {isSelected && <Check size={16} color={theme.gold} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </ThemedView>
        </Pressable>
      </Modal>

      {/* FLOATING COMPARE BUTTON */}
      {compareList.length > 0 && (
        <Pressable
          style={{
            position: 'absolute',
            bottom: 30, 
            right: 16,
            backgroundColor: '#FF5500',
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 8,
            zIndex: 9999,
          }}
          onPress={() => setCompareModalVisible(true)}
        >
          <GitCompare size={16} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
            Karşılaştır ({compareList.length})
          </Text>
        </Pressable>
      )}

      {/* GORGEOUS LISTING COMPARISON MODAL */}
      <Modal
        visible={compareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCompareModalVisible(false)}
      >
        <View style={[styles.modalBackdrop, { justifyContent: 'center' }]}>
          <ThemedView type="backgroundElement" style={{ width: '95%', height: '85%', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.gold }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.backgroundSelected }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <GitCompare size={20} color={theme.gold} />
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold' }}>İlan Karşılaştırma</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => { clearCompareList(); setCompareModalVisible(false); }}>
                  <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold' }}>Temizle</Text>
                </Pressable>
                <Pressable style={{ padding: 4 }} onPress={() => setCompareModalVisible(false)}>
                  <X size={20} color={theme.text} />
                </Pressable>
              </View>
            </View>

            {compareList.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <GitCompare size={48} color={theme.textSecondary} style={{ marginBottom: 16, opacity: 0.5 }} />
                <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
                  Karşılaştırılacak ilan bulunamadı. Lütfen ürün detay sayfalarından karşılaştırma listesine ilan ekleyin.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Horizontal scroll containing the columns */}
                <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexDirection: 'row' }}>
                  {/* Features Column Label */}
                  <View style={{ width: 100, borderRightWidth: 1, borderRightColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }}>
                    <View style={{ height: 130, padding: 8, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary }}>Ürün Bilgisi</Text>
                    </View>
                    {[
                      'Fiyat',
                      'Kategori',
                      'Konum / Mesafe',
                      'Güven Skoru',
                      'Kilometre (KM)',
                      'Model Yılı',
                      'Vites Tipi',
                      'Metrekare (m²)',
                      'Oda Sayısı',
                      'Durum / Kondisyon',
                      'İşlem'
                    ].map((label, idx) => (
                      <View
                        key={idx}
                        style={{
                          height: 50,
                          paddingHorizontal: 8,
                          justifyContent: 'center',
                          borderTopWidth: 1,
                          borderTopColor: theme.backgroundSelected,
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: theme.textSecondary }} numberOfLines={2}>
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Columns for Compared Listings */}
                  {compareList.map((item) => {
                    const distance = item.latitude !== undefined && item.longitude !== undefined 
                      ? getDistance(USER_LATITUDE, USER_LONGITUDE, item.latitude, item.longitude).toFixed(0) + ' km'
                      : '-';

                    return (
                      <View
                        key={item.id}
                        style={{
                          width: 140,
                          borderRightWidth: 1,
                          borderRightColor: theme.backgroundSelected,
                          alignItems: 'center',
                        }}
                      >
                        {/* Thumbnail & Title header */}
                        <View style={{ height: 130, padding: 8, alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
                          <Pressable
                            style={{ position: 'absolute', top: 4, right: 4, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => removeFromCompareList(item.id)}
                          >
                            <X size={12} color="#FFF" />
                          </Pressable>
                          <Image
                            source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                            style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#000', marginBottom: 6 }}
                          />
                          <Text style={{ color: theme.text, fontSize: 10, fontWeight: 'bold', textAlign: 'center' }} numberOfLines={2}>
                            {item.title}
                          </Text>
                        </View>

                        {/* Price */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>
                            {item.price.toLocaleString('tr-TR')} TL
                          </Text>
                        </View>

                        {/* Category */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.text, fontSize: 10, textAlign: 'center' }} numberOfLines={2}>
                            {item.category}
                          </Text>
                        </View>

                        {/* Location / Distance */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.text, fontSize: 10, fontWeight: '500', textAlign: 'center' }} numberOfLines={2}>
                            {item.city} ({distance})
                          </Text>
                        </View>

                        {/* Trust Score */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: isDark ? theme.gold : theme.goldAccent, fontSize: 10, fontWeight: 'bold' }}>
                            {item.sellerTrustScore}/10
                          </Text>
                          {item.sellerVerified && (
                            <Text style={{ color: '#10B981', fontSize: 8, fontWeight: 'bold', marginTop: 1 }}>✓ Doğrulanmış</Text>
                          )}
                        </View>

                        {/* KM */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.text, fontSize: 10, textAlign: 'center' }}>
                            {item.km !== undefined ? item.km.toLocaleString('tr-TR') + ' km' : '-'}
                          </Text>
                        </View>

                        {/* Model Yılı */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.text, fontSize: 10, textAlign: 'center' }}>
                            {item.year !== undefined ? item.year : '-'}
                          </Text>
                        </View>

                        {/* Vites */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.text, fontSize: 10, textAlign: 'center' }}>
                            {item.transmission !== undefined ? item.transmission : '-'}
                          </Text>
                        </View>

                        {/* Sqm */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.text, fontSize: 10, textAlign: 'center' }}>
                            {item.sqm !== undefined ? item.sqm + ' m²' : '-'}
                          </Text>
                        </View>

                        {/* Rooms */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.text, fontSize: 10, textAlign: 'center' }}>
                            {item.rooms !== undefined ? item.rooms : '-'}
                          </Text>
                        </View>

                        {/* Condition */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Text style={{ color: theme.textSecondary, fontSize: 10, textAlign: 'center' }}>
                            {item.condition}
                          </Text>
                        </View>

                        {/* CTA button to visit product */}
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: theme.backgroundSelected }}>
                          <Pressable
                            style={{ backgroundColor: theme.gold, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 }}
                            onPress={() => {
                              setCompareModalVisible(false);
                              router.push(`/product/${item.id}`);
                            }}
                          >
                            <Text style={{ color: '#000', fontSize: 9, fontWeight: 'bold' }}>İncele</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </ScrollView>
            )}
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  gridHeaderBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
    padding: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterBadgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: '#FF5500',
    borderColor: '#FF5500',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  gridListContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
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
  reelsHeaderContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
    gap: 10,
  },
  reelsHeaderIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(7, 12, 25, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelsSearchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 12, 25, 0.75)',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
  },
  reelsSearchIcon: {
    marginRight: 6,
  },
  reelsSearchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    padding: 0,
    height: '100%',
  },
  reelsWarningBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 107, 0, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5,
  },
  reelsWarningText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000000',
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
    bottom: 220,
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
  reelsCertifiedBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF5500',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  reelsCertifiedText: {
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
  reelsPriceLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 2,
  },
  reelsPriceValue: {
    color: '#FF5500',
    fontSize: 18,
    fontWeight: '900',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  ctaButtonText: {
    color: '#070C19',
    fontSize: 13,
    fontWeight: 'bold',
  },
  reelsEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
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
  listItemContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 4,
  },
  listItemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  listItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  listItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    lineHeight: 18,
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedBadgeTiny: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeTextTiny: {
    fontSize: 9,
    fontWeight: '700',
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
  reelsAddToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 6,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#FF5500',
  },
  reelsAddToCartBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
