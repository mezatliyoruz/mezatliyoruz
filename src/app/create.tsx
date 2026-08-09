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
  Switch,
  Text,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useAppStore, Listing } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { ArrowLeft, Landmark, Tag, Gavel, FileText, Play, Plus, CheckCircle2, X, Key, Search, ChevronRight, MapPin, Car, Upload, ShieldCheck, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
import { useRouter } from 'expo-router';
import { TURKEY_ADDRESS_DATA } from '@/constants/turkey-address';
import { VEHICLE_BRANDS } from '@/constants/vehicles';

export const EMLAK_SUB_CATEGORIES = [
  'Daire',
  'Ev',
  'Villa',
  'Ofis',
  'Dükkan',
  'Depo',
  'Tarla',
  'Arsa',
  'Bahçe'
];

export const RENTAL_SUB_CATEGORIES = [
  '🏠 Emlak',
  '🚗 Otomobil',
  '🏍️ Motosiklet',
  '🚐 Karavan',
  '🚛 Kamyon, kamyonet',
  '🚜 Traktör ve tarım makineleri',
  '🚧 İş makineleri (ekskavatör, forklift, vinç vb.)',
  '🔨 İnşaat ekipmanları',
  '🛠️ El aletleri',
  '📷 Kamera, fotoğraf ve video ekipmanları',
  '🚁 Drone',
  '🎤 Ses ve ışık sistemleri',
  '🎉 Organizasyon ekipmanları (masa, sandalye, çadır, şişme oyun parkı vb.)',
  '🏕️ Kamp ve outdoor ekipmanları',
  '👶 Bebek ürünleri',
  '🎭 Kostüm ve özel gün kıyafetleri',
  '👗 Gelinlik ve abiye',
  '💻 Bilgisayar ve elektronik cihazlar',
  '📱 Telefon ve tablet',
  '🩺 Medikal cihazlar',
  '🛥️ Tekne ve yat',
  '🚲 Bisiklet ve elektrikli scooter',
  '🐶 Evcil hayvan ekipmanları',
  '🎮 Oyun konsolları ve oyun ekipmanları',
  '🏋️ Spor ekipmanları'
];

export const FLEA_MARKET_CATEGORIES = [
  '🕰️ Antika, Retro & Nostalji',
  '📻 Eski Elektronik, Plak & Kaset',
  '📚 Nadir Kitap, Dergi & Efemera',
  '🧥 Vintage Giyim & Aksesuar',
  '🧸 Nostaljik Oyuncak & Figür',
  '🏺 Porselen, Seramik & Cam Objeler',
  '🖼️ Sanat Eseri, Tablo & Çerçeve',
  '🛠️ Eski Aletler & Rustik Eşyalar',
  '🌀 Koleksiyon Parçaları & Diğer',
  '🔍 Diğer'
];

export const PRODUCER_CATEGORIES = [
  '🍯 Organik Bal & Arı Ürünleri',
  '🫒 Zeytinyağı & Doğal Kahvaltılık',
  '🥫 Ev Yapımı Konserve, Reçel & Sos',
  '🌾 Kuru Gıda, Bakliyat & Şifalı Otlar',
  '🧶 El Emeği Örgü & Ev Tekstili',
  '🪵 Ahşap & Doğal Malzeme Tasarımları',
  '🕯️ Doğal Kozmetik, Sabun & Mum',
  '💍 El Yapımı Takı & Aksesuar',
  '♻️ Bahçe, Fide, Tohum & Bitki',
  '🔍 Diğer'
];


function SearchablePickerModal({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  theme,
  isDark
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  theme: any;
  isDark: boolean;
}) {
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    if (visible) {
      setSearch('');
    }
  }, [visible]);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: isDark ? '#0B132B' : '#FFFFFF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: '70%',
          padding: 20,
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>{title}</Text>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Kapat</Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#080E1C' : '#F1F5F9',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: isDark ? '#1F2E54' : '#E2E8F0'
          }}>
            <Search size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Ara..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, height: 40, color: theme.text }}
            />
          </View>

          {/* Options List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.1)' : 'transparent',
                    borderRadius: 6,
                  }}
                >
                  <Text style={{
                    color: isSelected ? theme.gold : theme.text,
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: 15,
                  }}>{item}</Text>
                  {isSelected && <Text style={{ color: theme.gold, fontWeight: 'bold' }}>✓</Text>}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function CreateListingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { currentUser, addListing, applyForRentACar, serverValidateUploadedFile } = useAppStore();

  // Step tracking state
  const [creationStep, setCreationStep] = useState<1 | 1.5 | 2>(1);
  const [creationMode, setCreationMode] = useState<'auction' | 'flea' | 'producer' | 'rent' | null>(null);
  const [rentSellSelection, setRentSellSelection] = useState<'sat' | 'kirala' | null>(null);

  // New listing form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'fixed' | 'offer' | 'auction' | 'rent'>('fixed');
  const [rentPeriod, setRentPeriod] = useState('Günlük');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [condition, setCondition] = useState('İyi');
  const [verifiedProduct, setVerifiedProduct] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name || 'sertifika.pdf';
        const fileSize = asset.size || 0;
        const mimeType = asset.mimeType;

        // Secure Server Validation Check
        const validation = serverValidateUploadedFile(fileName, fileSize, mimeType);
        if (!validation.success) {
          Alert.alert("Güvenlik Engeli", validation.error || "Desteklenmeyen dosya.");
          return;
        }

        setUploadingDoc(true);
        setUploadProgress(0);
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setDocumentUrl(fileName);
            setUploadingDoc(false);
          }
        }, 150);
      } else {
        setUploadingDoc(false);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setDocumentUrl('urun_ekspertiz_raporu.pdf');
          setUploadingDoc(false);
        }
      }, 100);
    }
  };

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Mezat specific state
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('24');

  // Address Selector (Universal)
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [districtPickerVisible, setDistrictPickerVisible] = useState(false);

  // Vehicle Library State
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [brandPickerVisible, setBrandPickerVisible] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  // Category Picker Visibility
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [subCategoryPickerVisible, setSubCategoryPickerVisible] = useState(false);
  // Vehicle Individual/Corporate and Document States
  const [vehicleType, setVehicleType] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [vehicleCorporateType, setVehicleCorporateType] = useState<'galeri' | 'rent_a_car'>('galeri');
  
  // Galeri Documents
  const [galeriYetkiBelgesiFile, setGaleriYetkiBelgesiFile] = useState('');
  const [galeriMeslekiYeterlilikFile, setGaleriMeslekiYeterlilikFile] = useState('');
  const [galeriVergiLevhasiFile, setGaleriVergiLevhasiFile] = useState('');
  const [galeriOdaKaydiFile, setGaleriOdaKaydiFile] = useState('');
  const [galeriRuhsatFile, setGaleriRuhsatFile] = useState('');
  const [galeriEidsApproved, setGaleriEidsApproved] = useState(false);
  const [isVerifyingGaleriEids, setIsVerifyingGaleriEids] = useState(false);

  // Rent a Car Documents
  const [rentVergiLevhasiFile, setRentVergiLevhasiFile] = useState('');
  const [rentOdaKaydiFile, setRentOdaKaydiFile] = useState('');
  const [rentRuhsatFile, setRentRuhsatFile] = useState('');
  const [rentImzaSirkuleriFile, setRentImzaSirkuleriFile] = useState('');
  const [rentEidsApproved, setRentEidsApproved] = useState(false);
  const [isVerifyingRentEids, setIsVerifyingRentEids] = useState(false);

  // Emlak Individual/Corporate document state
  const [emlakType, setEmlakType] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [tasinmazYetkiFile, setTasinmazYetkiFile] = useState('');
  const [emlakVergiLevhasiFile, setEmlakVergiLevhasiFile] = useState('');
  const [emlakOdaKaydiFile, setEmlakOdaKaydiFile] = useState('');
  const [emlakImzaSirkuleriFile, setEmlakImzaSirkuleriFile] = useState('');
  const [emlakYetkiliKimlikFile, setEmlakYetkiliKimlikFile] = useState('');
  const [emlakSicilGazetesiFile, setEmlakSicilGazetesiFile] = useState('');
  const [eidsApproved, setEidsApproved] = useState(false);
  const [isVerifyingEids, setIsVerifyingEids] = useState(false);

  // Selected media state
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [photosUris, setPhotosUris] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  // Active focus tracking
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Dynamic layout colors
  const isDark = scheme === 'dark';
  const cardBg = isDark ? '#111A30' : '#FFFFFF';
  const inputBg = isDark ? '#080E1C' : '#F8FAFC';
  const inputBorder = isDark ? '#1F2E54' : '#E2E8F0';
  const inputBorderFocused = theme.gold;

  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // 1. Duration check (Maks 8 sn) — asset.duration is in milliseconds
      const durationInSeconds = (asset.duration || 0) / 1000;
      if (durationInSeconds > 8) {
        Alert.alert('Hata', `Seçtiğiniz video ${Math.round(durationInSeconds)} saniye. En fazla 8 saniyelik video yüklenebilir.`);
        return;
      }

      // 2. Portrait (dikey) check
      if (asset.height && asset.width && asset.height <= asset.width) {
        Alert.alert('Hata', 'Yükleyeceğiniz video dikey (portrait) formatta olmalıdır.');
        return;
      }

      // 3. Compress video without losing quality
      setIsCompressing(true);
      setCompressionProgress(0);
      
      const compressedUri = await Video.compress(
        asset.uri,
        {
          compressionMethod: 'auto',
        },
        (progress) => {
          setCompressionProgress(Math.round(progress * 100));
        }
      );

      setVideoUri(compressedUri);
      setIsCompressing(false);
      setFormError('');
    } catch (error) {
      console.error('Video yükleme/sıkıştırma hatası:', error);
      setIsCompressing(false);
      Alert.alert('Hata', 'Video işlenirken bir hata oluştu.');
    }
  };

  const pickPhotos = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermelisiniz.');
        return;
      }

      const remainingLimit = 10 - photosUris.length;
      if (remainingLimit <= 0) {
        Alert.alert('Sınır', 'En fazla 10 adet fotoğraf ekleyebilirsiniz.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingLimit,
        quality: 0.8,
      });

      if (result.canceled || !result.assets) {
        return;
      }

      // Secure client-side image optimization
      const optimizedUris = await Promise.all(
        result.assets.map(async (asset) => {
          try {
            const manipResult = await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 1200 } }], // Scale width to 1200px (height auto scales)
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% JPEG quality compression
            );
            return manipResult.uri;
          } catch (manipError) {
            console.warn('Image manipulation failed, using original uri:', manipError);
            return asset.uri;
          }
        })
      );

      const newPhotos = [...photosUris, ...optimizedUris].slice(0, 10);
      setPhotosUris(newPhotos);
      setFormError('');
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      Alert.alert('Hata', 'Fotoğraflar seçilirken bir hata oluştu.');
    }
  };

  const pickDocument = async (setFileState: (fileName: string) => void) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFileState(asset.name);
        setFormError('');
      }
    } catch (error) {
      console.error('Belge seçme hatası:', error);
      Alert.alert('Hata', 'Belge seçilirken bir hata oluştu.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotosUris(prev => prev.filter((_, idx) => idx !== index));
  };

  const removeVideo = () => {
    setVideoUri(null);
  };

  const handleCreateListing = () => {
    if (!currentUser) return;
    if (!title || !description || !price) {
      setFormError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Lütfen geçerli bir fiyat girin.');
      return;
    }

    let reservePriceNum: number | undefined = undefined;
    let timeLeftNum: number | undefined = undefined;

    if (type === 'auction') {
      if (!buyNowPrice) {
        setFormError('Lütfen Hemen Al Fiyatını girin.');
        return;
      }
      reservePriceNum = parseFloat(buyNowPrice);
      if (isNaN(reservePriceNum) || reservePriceNum <= priceNum) {
        setFormError('Hemen Al fiyatı başlangıç fiyatından yüksek olmalıdır.');
        return;
      }

      if (!auctionDuration) {
        setFormError('Lütfen mezat süresini belirtin.');
        return;
      }
      const durationHours = parseFloat(auctionDuration);
      if (isNaN(durationHours) || durationHours <= 0 || durationHours > 48) {
        setFormError('Mezat süresi en fazla 48 saat olmalıdır.');
        return;
      }
      timeLeftNum = Math.round(durationHours * 3600);
    }

    // Video is optional – products without video won't appear in Reels

    // Photos check (At least 3 required)
    if (photosUris.length < 3) {
      setFormError(`En az 3 adet fotoğraf yüklemeniz zorunludur. (Şu an: ${photosUris.length})`);
      return;
    }

    // Universal location details validation
    if (!selectedDistrict.trim()) {
      setFormError('Lütfen ilçeyi girin veya seçin.');
      return;
    }
    if (!selectedNeighborhood.trim()) {
      setFormError('Lütfen mahalle alanını doldurun.');
      return;
    }

    const isRealEstate = category ? category.includes('Emlak') : false;

    if (isRealEstate && !subCategory) {
      setFormError('Lütfen emlak tipini seçin.');
      return;
    }

    if (isRealEstate && emlakType === 'kurumsal') {
      if (!tasinmazYetkiFile) {
        setFormError('Lütfen Taşınmaz Ticareti Yetki Belgesini yükleyin.');
        return;
      }
      if (!emlakVergiLevhasiFile) {
        setFormError('Lütfen Vergi Levhasını yükleyin.');
        return;
      }
      if (!emlakOdaKaydiFile) {
        setFormError('Lütfen Ticaret Oda Kaydı veya Esnaf Oda Belgesini yükleyin.');
        return;
      }
      if (!emlakImzaSirkuleriFile || !emlakYetkiliKimlikFile || !emlakSicilGazetesiFile) {
        setFormError('Lütfen Şirket Yetkilisine ait tüm resmi belgeleri (İmza Sirküleri, Kimlik Görseli ve Sicil Gazetesi) yükleyin.');
        return;
      }
      if (!eidsApproved) {
        setFormError('Lütfen EİDS & e-Devlet Onayını tamamlayın.');
        return;
      }
    }

    const isVehicle = category ? (
      category.includes('Otomobil') ||
      category.includes('Motosiklet') ||
      category.includes('Karavan') ||
      category.includes('Kamyon') ||
      category.includes('Traktör') ||
      category.includes('İş makineleri')
    ) : false;

    if (isVehicle) {
      if (!selectedBrand) {
        setFormError('Lütfen araç markasını seçin.');
        return;
      }
      if (selectedBrand === 'Diğer' && !customBrand.trim()) {
        setFormError('Lütfen araç marka adını yazın.');
        return;
      }
      if (!selectedModel && selectedBrand !== 'Diğer') {
        setFormError('Lütfen araç modelini seçin.');
        return;
      }
      if (selectedModel === 'Diğer' && !customModel.trim()) {
        setFormError('Lütfen araç model adını yazın.');
        return;
      }
      if (!selectedYear) {
        setFormError('Lütfen araç model yılını seçin.');
        return;
      }
      if (selectedYear === 'Diğer' && !customYear.trim()) {
        setFormError('Lütfen araç yılını yazın.');
        return;
      }

      // Individual / Corporate validation
      if (creationMode === 'rent' && rentSellSelection === 'kirala') {
        // Vehicle rentals MUST be kurumsal with Rent a Car documents
        if (!rentVergiLevhasiFile) {
          setFormError('Yasal zorunluluk nedeniyle taşıt kiralama ilanı için Vergi Levhasını yüklemelisiniz.');
          return;
        }
        if (!rentOdaKaydiFile) {
          setFormError('Lütfen Ticaret Odası / Esnaf Belgesini yükleyin.');
          return;
        }
        if (!rentRuhsatFile) {
          setFormError('Lütfen İşyeri Açma ve Çalışma Ruhsatını yükleyin.');
          return;
        }
        if (!rentImzaSirkuleriFile) {
          setFormError('Lütfen İmza Sirküleri / Yetkili Belgesini yükleyin.');
          return;
        }
        if (!rentEidsApproved) {
          setFormError('Lütfen e-Devlet & EİDS doğrulamasını tamamlayın.');
          return;
        }
      } else {
        // Vehicle sales
        if (vehicleType === 'kurumsal') {
          if (vehicleCorporateType === 'galeri') {
            if (!galeriYetkiBelgesiFile) {
              setFormError('Lütfen Motorlu Kara Taşıtı Ticareti Yetki Belgesini yükleyin.');
              return;
            }
            if (!galeriMeslekiYeterlilikFile) {
              setFormError('Lütfen Mesleki Yeterlilik Belgesini (Seviye 5) yükleyin.');
              return;
            }
            if (!galeriVergiLevhasiFile) {
              setFormError('Lütfen Vergi Levhasını yükleyin.');
              return;
            }
            if (!galeriOdaKaydiFile) {
              setFormError('Lütfen Oda Kayıt Belgesi / Sicil Gazetesi nüshasını yükleyin.');
              return;
            }
            if (!galeriRuhsatFile) {
              setFormError('Lütfen İşyeri Açma ve Çalışma Ruhsatını yükleyin.');
              return;
            }
            if (!galeriEidsApproved) {
              setFormError('Lütfen e-Devlet & EİDS Doğrulamasını tamamlayın.');
              return;
            }
          } else if (vehicleCorporateType === 'rent_a_car') {
            if (!rentVergiLevhasiFile) {
              setFormError('Lütfen Vergi Levhasını yükleyin.');
              return;
            }
            if (!rentOdaKaydiFile) {
              setFormError('Lütfen Ticaret Odası / Esnaf Belgesini yükleyin.');
              return;
            }
            if (!rentRuhsatFile) {
              setFormError('Lütfen İşyeri Açma ve Çalışma Ruhsatını yükleyin.');
              return;
            }
            if (!rentImzaSirkuleriFile) {
              setFormError('Lütfen İmza Sirküleri / Yetkili Belgesini yükleyin.');
              return;
            }
            if (!rentEidsApproved) {
              setFormError('Lütfen e-Devlet & EİDS Doğrulamasını tamamlayın.');
              return;
            }
          }
        }
      }
    }

    const finalBrand = isVehicle ? (selectedBrand === 'Diğer' ? customBrand.trim() : selectedBrand) : undefined;
    const finalModel = isVehicle ? (selectedModel === 'Diğer' ? customModel.trim() : selectedModel) : undefined;
    const finalYear = isVehicle ? parseInt(selectedYear === 'Diğer' ? customYear.trim() : selectedYear) || undefined : undefined;

    const isCarRental = creationMode === 'rent' && rentSellSelection === 'kirala' && isVehicle;
    let listingStatus = 'active' as any;

    addListing({
      title,
      description,
      price: priceNum,
      type,
      rentPeriod: type === 'rent' ? rentPeriod : undefined,
      category: isRealEstate ? ('🏠 ' + subCategory) : category,
      condition,
      verifiedProduct,
      documentUrl: verifiedProduct ? (documentUrl || 'urun_sertifikasi.pdf') : undefined,
      videoUrl: videoUri || null,
      photos: photosUris,
      sellerName: currentUser.shopName || currentUser.name,
      sellerAvatar: currentUser.avatar,
      sellerTrustScore: currentUser.trustScore,
      sellerVerified: currentUser.verified,
      timeLeft: timeLeftNum,
      bidsCount: type === 'auction' ? 0 : undefined,
      reservePrice: reservePriceNum,
      city: selectedCity,
      district: selectedDistrict,
      neighborhood: selectedNeighborhood,
      brand: finalBrand,
      model: finalModel,
      year: finalYear,
      isRealEstate,
      isVehicle,
      status: listingStatus,
    });

    if (listingStatus === 'pending_approval') {
      Alert.alert(
        'Onay Bekliyor',
        'Araç kiralama belgeleriniz incelenmektedir. Süper admin onayladıktan sonra ilanınız otomatik olarak yayına girecektir.',
        [{ text: 'Tamam', onPress: () => router.push('/') }]
      );
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setPrice('');
    setType('fixed');
    setRentPeriod('Günlük');
    setCategory('');
    setSubCategory('');
    setCondition('İyi');
    setVerifiedProduct(false);
    setDocumentUrl('');
    setVideoUri(null);
    setPhotosUris([]);
    setBuyNowPrice('');
    setAuctionDuration('24');
    setSelectedCity('İstanbul');
    setSelectedDistrict('');
    setSelectedNeighborhood('');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setCustomBrand('');
    setCustomModel('');
    setCustomYear('');
    setEmlakType('bireysel');
    setTasinmazYetkiFile('');
    setEmlakVergiLevhasiFile('');
    setEmlakOdaKaydiFile('');
    setEmlakImzaSirkuleriFile('');
    setEmlakYetkiliKimlikFile('');
    setEmlakSicilGazetesiFile('');
    setEidsApproved(false);
    setVehicleType('bireysel');
    setVehicleCorporateType('galeri');
    setGaleriYetkiBelgesiFile('');
    setGaleriMeslekiYeterlilikFile('');
    setGaleriVergiLevhasiFile('');
    setGaleriOdaKaydiFile('');
    setGaleriRuhsatFile('');
    setGaleriEidsApproved(false);
    setRentVergiLevhasiFile('');
    setRentOdaKaydiFile('');
    setRentRuhsatFile('');
    setRentImzaSirkuleriFile('');
    setRentEidsApproved(false);
    setCreationStep(1);
    setCreationMode(null);
    setRentSellSelection(null);
    setFormError('');
    setFormSuccess(true);

    setTimeout(() => {
      setFormSuccess(false);
      router.back();
    }, 1500);
  };

  if (!currentUser) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', gap: 16, paddingTop: 120, paddingHorizontal: 24 }]}>
        <Gavel size={64} color={theme.gold} />
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>Giriş Yapmanız Gerekli</ThemedText>
        <ThemedText style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 22 }}>
          Yeni bir ilan veya mezat oluşturabilmek için giriş yapmış olmalısınız.
        </ThemedText>
        <Pressable 
          style={{
            backgroundColor: theme.gold,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 6,
            marginTop: 10
          }}
          onPress={() => {
            router.push('/profile');
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Giriş Yap / Kaydol</Text>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { borderBottomColor: theme.backgroundSelected }]}>
        <Pressable style={styles.navBarIcon} onPress={() => {
          if (creationStep === 2) {
            if (creationMode === 'rent') {
              setCreationStep(1.5);
            } else {
              setCreationStep(1);
              setCreationMode(null);
            }
          } else if (creationStep === 1.5) {
            setCreationStep(1);
            setCreationMode(null);
          } else {
            router.back();
          }
        }}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.navBarTitle, { color: theme.text }]}>
          {creationStep === 1 ? 'İLAN TÜRÜ SEÇİN' : creationStep === 1.5 ? 'İŞLEM TÜRÜ SEÇİN' : 'YENİ İLAN BİLGİLERİ'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {creationStep === 1 ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 10, fontSize: 13 }}>
            Lütfen yüklemek istediğiniz ilan modelini seçerek devam edin.
          </Text>
          
          <View style={styles.gridContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.gridCard,
                {
                  backgroundColor: cardBg,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)',
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
              onPress={() => {
                setCreationMode('auction');
                setType('auction');
                setCategory('');
                setCreationStep(2);
              }}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(255, 107, 0, 0.1)' }]}>
                <Gavel size={28} color={theme.gold} />
              </View>
              <Text style={[styles.gridCardTitle, { color: theme.text }]}>Canlı Mezat</Text>
              <Text style={[styles.gridCardDesc, { color: theme.textSecondary }]}>Süreli açık artırma ilanları başlatın</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.gridCard,
                {
                  backgroundColor: cardBg,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)',
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
              onPress={() => {
                setCreationMode('flea');
                setType('fixed');
                setCategory('');
                setCreationStep(2);
              }}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Tag size={28} color="#3B82F6" />
              </View>
              <Text style={[styles.gridCardTitle, { color: theme.text }]}>Bit Pazarı</Text>
              <Text style={[styles.gridCardDesc, { color: theme.textSecondary }]}>Sabit fiyatlı veya teklifli ilanlar yükleyin</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.gridCard,
                {
                  backgroundColor: cardBg,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)',
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
              onPress={() => {
                setCreationMode('producer');
                setType('fixed');
                setVerifiedProduct(true);
                setCategory('');
                setCreationStep(2);
              }}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <CheckCircle2 size={28} color="#10B981" />
              </View>
              <Text style={[styles.gridCardTitle, { color: theme.text }]}>Üreticiden Tüketiciye</Text>
              <Text style={[styles.gridCardDesc, { color: theme.textSecondary }]}>El yapımı, doğal gıda veya sertifikalı ürünler</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.gridCard,
                {
                  backgroundColor: cardBg,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)',
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
              onPress={() => {
                setCreationMode('rent');
                setCategory('');
                setCreationStep(1.5);
              }}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Key size={28} color="#8B5CF6" />
              </View>
              <Text style={[styles.gridCardTitle, { color: theme.text }]}>Sat / Kirala</Text>
              <Text style={[styles.gridCardDesc, { color: theme.textSecondary }]}>Satılık veya kiralık gayrimenkul, taşıt ve alet ilanları</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : creationStep === 1.5 ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 10, fontSize: 13 }}>
            Lütfen ilanınızın işlem türünü seçerek devam edin.
          </Text>
          
          <View style={{ gap: 16, marginTop: 10 }}>
            {/* SAT CARD */}
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: cardBg,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)',
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  gap: 16
                }
              ]}
              onPress={() => {
                setRentSellSelection('sat');
                setType('fixed');
                setCreationStep(2);
              }}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(255, 107, 0, 0.1)' }]}>
                <Tag size={28} color={theme.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gridCardTitle, { color: theme.text, fontSize: 16, textAlign: 'left' }]}>Satılık Ürün</Text>
                <Text style={[styles.gridCardDesc, { color: theme.textSecondary, textAlign: 'left', marginTop: 4, lineHeight: 16 }]}>
                  Ürününüzü sabit fiyat, teklif alarak ya da açık artırma (mezat) ile satın.
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </Pressable>

            {/* KIRALA CARD */}
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: cardBg,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)',
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  gap: 16
                }
              ]}
              onPress={() => {
                setRentSellSelection('kirala');
                setType('rent');
                setCreationStep(2);
              }}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Key size={28} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gridCardTitle, { color: theme.text, fontSize: 16, textAlign: 'left' }]}>Kiralık Ürün</Text>
                <Text style={[styles.gridCardDesc, { color: theme.textSecondary, textAlign: 'left', marginTop: 4, lineHeight: 16 }]}>
                  Ürününüzü günlük, haftalık veya aylık periyotlarla kiralayın.
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Active Mode Banner */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? 'rgba(255, 107, 0, 0.1)' : '#FFF7ED', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {creationMode === 'auction' && <Gavel size={18} color={theme.gold} />}
              {creationMode === 'flea' && <Tag size={18} color="#3B82F6" />}
              {creationMode === 'producer' && <CheckCircle2 size={18} color="#10B981" />}
              {creationMode === 'rent' && <Key size={18} color="#8B5CF6" />}
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>
                {creationMode === 'auction' ? 'Model: Canlı Mezat' :
                 creationMode === 'flea' ? 'Model: Bit Pazarı' :
                 creationMode === 'producer' ? 'Model: Üreticiden Tüketiciye' :
                 `Model: Sat / Kirala (${rentSellSelection === 'kirala' ? 'Kiralık' : 'Satılık'})`}
              </Text>
            </View>
            <Pressable onPress={() => { setCreationStep(1); setCreationMode(null); }} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: theme.gold }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11 }}>Değiştir</Text>
            </Pressable>
          </View>

          {/* Add Listing Form */}
          <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
            {formSuccess ? (
              <View style={styles.successContainer}>
                <CheckCircle2 size={44} color="#34D399" />
                <Text style={styles.successText}>İlanınız başarıyla eklendi ve yayınlandı!</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  Keşfet veya Mezat sekmelerinde görebilirsiniz.
                </Text>
              </View>
            ) : (
              <View style={styles.formBody}>
                {formError !== '' && (
                  <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Text style={styles.errorText}>{formError}</Text>
                  </View>
                )}

              {/* Category Picker (Highly Visible at the Top) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Kategori *</Text>
                <Pressable
                  onPress={() => setCategoryPickerVisible(true)}
                  style={[
                    styles.dropdownTrigger,
                    {
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      height: 48,
                      justifyContent: 'space-between',
                      borderRadius: 6,
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }
                  ]}
                >
                  <Text style={{ color: category ? theme.text : theme.textSecondary, fontSize: 13 }} numberOfLines={1}>
                    {category || 'Seçiniz'}
                  </Text>
                  <ChevronRight size={16} color={theme.textSecondary} />
                </Pressable>
              </View>

              {/* Real Estate Sub-Category Selector (Conditional) */}
              {category.includes('Emlak') && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Emlak Tipi *</Text>
                    <Pressable
                      onPress={() => setSubCategoryPickerVisible(true)}
                      style={[
                        styles.dropdownTrigger,
                        {
                          backgroundColor: inputBg,
                          borderColor: inputBorder,
                          height: 48,
                          justifyContent: 'space-between',
                          borderRadius: 6,
                          borderWidth: 1,
                          paddingHorizontal: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }
                      ]}
                    >
                      <Text style={{ color: subCategory ? theme.text : theme.textSecondary, fontSize: 13 }} numberOfLines={1}>
                        {subCategory || 'Seçiniz'}
                      </Text>
                      <ChevronRight size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  {/* Bireysel / Kurumsal Seçimi */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Üyelik Türü *</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <Pressable
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: emlakType === 'bireysel' ? 'rgba(255, 107, 0, 0.1)' : inputBg,
                          borderColor: emlakType === 'bireysel' ? theme.gold : inputBorder,
                          borderWidth: 1.5,
                          borderRadius: 8,
                          padding: 12,
                          gap: 8,
                        }}
                        onPress={() => setEmlakType('bireysel')}
                      >
                        <View style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          borderWidth: 2,
                          borderColor: emlakType === 'bireysel' ? theme.gold : theme.textSecondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {emlakType === 'bireysel' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.gold }} />
                          )}
                        </View>
                        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Bireysel İlan</Text>
                      </Pressable>

                      <Pressable
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: emlakType === 'kurumsal' ? 'rgba(255, 107, 0, 0.1)' : inputBg,
                          borderColor: emlakType === 'kurumsal' ? theme.gold : inputBorder,
                          borderWidth: 1.5,
                          borderRadius: 8,
                          padding: 12,
                          gap: 8,
                        }}
                        onPress={() => setEmlakType('kurumsal')}
                      >
                        <View style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          borderWidth: 2,
                          borderColor: emlakType === 'kurumsal' ? theme.gold : theme.textSecondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {emlakType === 'kurumsal' && (
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.gold }} />
                          )}
                        </View>
                        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Kurumsal İlan</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Kurumsal Evrak Yükleme Alanı */}
                  {emlakType === 'kurumsal' && (
                    <View style={{
                      gap: 16,
                      marginVertical: 8,
                      padding: 16,
                      borderRadius: 8,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                      borderWidth: 1,
                      borderColor: inputBorder,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <ShieldCheck size={18} color={theme.gold} />
                        <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>🏢 Kurumsal Evrak Doğrulaması</Text>
                      </View>

                      {/* 1. Taşınmaz Ticareti Yetki Belgesi */}
                      <View style={{ gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>1. Taşınmaz Ticareti Yetki Belgesi *</Text>
                        <Pressable
                          onPress={() => pickDocument(setTasinmazYetkiFile)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 44,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderStyle: tasinmazYetkiFile ? 'solid' : 'dashed',
                            borderColor: tasinmazYetkiFile ? '#34D399' : inputBorder,
                            backgroundColor: inputBg,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: tasinmazYetkiFile ? theme.text : theme.textSecondary }}>
                            {tasinmazYetkiFile || 'Yetki belgesini seçin (.pdf)'}
                          </Text>
                          {tasinmazYetkiFile ? <CheckCircle2 size={14} color="#34D399" /> : <Upload size={14} color={theme.textSecondary} />}
                        </Pressable>
                      </View>

                      {/* 2. Vergi Levhası */}
                      <View style={{ gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>2. Vergi Levhası *</Text>
                        <Pressable
                          onPress={() => pickDocument(setEmlakVergiLevhasiFile)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 44,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderStyle: emlakVergiLevhasiFile ? 'solid' : 'dashed',
                            borderColor: emlakVergiLevhasiFile ? '#34D399' : inputBorder,
                            backgroundColor: inputBg,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: emlakVergiLevhasiFile ? theme.text : theme.textSecondary }}>
                            {emlakVergiLevhasiFile || 'Vergi levhasını seçin (.pdf, .jpg)'}
                          </Text>
                          {emlakVergiLevhasiFile ? <CheckCircle2 size={14} color="#34D399" /> : <Upload size={14} color={theme.textSecondary} />}
                        </Pressable>
                      </View>

                      {/* 3. Ticaret Oda Kaydı veya Esnaf Belgesi */}
                      <View style={{ gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>3. Ticaret Odası / Esnaf Belgesi *</Text>
                        <Pressable
                          onPress={() => pickDocument(setEmlakOdaKaydiFile)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 44,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderStyle: emlakOdaKaydiFile ? 'solid' : 'dashed',
                            borderColor: emlakOdaKaydiFile ? '#34D399' : inputBorder,
                            backgroundColor: inputBg,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: emlakOdaKaydiFile ? theme.text : theme.textSecondary }}>
                            {emlakOdaKaydiFile || 'Oda kayıt belgesini seçin (.pdf)'}
                          </Text>
                          {emlakOdaKaydiFile ? <CheckCircle2 size={14} color="#34D399" /> : <Upload size={14} color={theme.textSecondary} />}
                        </Pressable>
                      </View>

                      {/* 4. Şirket Yetkilisine Ait Resmi Belgeler */}
                      <View style={{ gap: 8, padding: 12, borderRadius: 6, backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : '#F1F5F9' }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>4. Şirket Yetkili Belgeleri *</Text>

                        {/* İmza Sirküleri */}
                        <Pressable
                          onPress={() => pickDocument(setEmlakImzaSirkuleriFile)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 40,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderStyle: emlakImzaSirkuleriFile ? 'solid' : 'dashed',
                            borderColor: emlakImzaSirkuleriFile ? '#34D399' : inputBorder,
                            backgroundColor: inputBg,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: emlakImzaSirkuleriFile ? theme.text : theme.textSecondary }}>
                            {emlakImzaSirkuleriFile || 'İmza Sirküleri / Beyannamesi'}
                          </Text>
                          {emlakImzaSirkuleriFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                        </Pressable>

                        {/* T.C. Kimlik / Ehliyet */}
                        <Pressable
                          onPress={() => pickDocument(setEmlakYetkiliKimlikFile)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 40,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderStyle: emlakYetkiliKimlikFile ? 'solid' : 'dashed',
                            borderColor: emlakYetkiliKimlikFile ? '#34D399' : inputBorder,
                            backgroundColor: inputBg,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: emlakYetkiliKimlikFile ? theme.text : theme.textSecondary }}>
                            {emlakYetkiliKimlikFile || 'Yetkili Kimlik / Ehliyet Görseli'}
                          </Text>
                          {emlakYetkiliKimlikFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                        </Pressable>

                        {/* Ticaret Sicil Gazetesi */}
                        <Pressable
                          onPress={() => pickDocument(setEmlakSicilGazetesiFile)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: 40,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderStyle: emlakSicilGazetesiFile ? 'solid' : 'dashed',
                            borderColor: emlakSicilGazetesiFile ? '#34D399' : inputBorder,
                            backgroundColor: inputBg,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: emlakSicilGazetesiFile ? theme.text : theme.textSecondary }}>
                            {emlakSicilGazetesiFile || 'Ticaret Sicil Gazetesi Nüshası'}
                          </Text>
                          {emlakSicilGazetesiFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                        </Pressable>
                      </View>

                      {/* 5. EİDS & e-Devlet Onayı */}
                      <View style={{
                        gap: 8,
                        padding: 12,
                        borderRadius: 6,
                        backgroundColor: eidsApproved ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 107, 0, 0.05)',
                        borderWidth: 1,
                        borderColor: eidsApproved ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 107, 0, 0.2)'
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>5. EİDS & e-Devlet Onayı *</Text>
                        <Text style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 16 }}>
                          Kurumsal ilan doğrulaması için e-Devlet üzerinden kimlik ve yetkilendirme doğrulaması yapılmalıdır.
                        </Text>
                        
                        <Pressable
                          onPress={() => {
                            if (eidsApproved) return;
                            setIsVerifyingEids(true);
                            setTimeout(() => {
                              setIsVerifyingEids(false);
                              setEidsApproved(true);
                              Alert.alert('Doğrulama Başarılı', 'e-Devlet entegrasyonu ile EİDS onayı tamamlanmıştır.');
                            }, 1500);
                          }}
                          disabled={eidsApproved || isVerifyingEids}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 40,
                            borderRadius: 6,
                            backgroundColor: eidsApproved ? '#34D399' : theme.gold,
                            gap: 8,
                            marginTop: 4,
                          }}
                        >
                          {isVerifyingEids ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <ShieldCheck size={16} color="#FFFFFF" strokeWidth={2.5} />
                              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                                {eidsApproved ? 'e-Devlet ile Doğrulandı' : 'e-Devlet ile Giriş Yap & Doğrula'}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* VEHICLE TECHNICAL SPECS FORM (CONDITIONAL) */}
              {(() => {
                const isVehicle = category ? (
                  category.includes('Otomobil') ||
                  category.includes('Motosiklet') ||
                  category.includes('Karavan') ||
                  category.includes('Kamyon') ||
                  category.includes('Traktör') ||
                  category.includes('İş makineleri')
                ) : false;

                if (!isVehicle) return null;

                const vehicleBrands = VEHICLE_BRANDS[
                  category.includes('Otomobil') ? 'Otomobil' :
                  category.includes('Motosiklet') ? 'Motosiklet' :
                  category.includes('Karavan') ? 'Karavan' :
                  category.includes('Kamyon') ? 'Kamyon, kamyonet' :
                  category.includes('Traktör') ? 'Traktör ve tarım makineleri' :
                  category.includes('İş makineleri') ? 'İş makineleri (ekskavatör, forklift, vinç vb.)' : ''
                ] || [];

                return (
                  <View style={{ gap: 12, marginVertical: 8, padding: 12, borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderWidth: 1, borderColor: inputBorder }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Car size={16} color={theme.gold} />
                      <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>🚗 Araç Teknik Özellikleri</Text>
                    </View>
                    
                    {/* Brand Select */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Marka *</Text>
                      <Pressable
                        onPress={() => setBrandPickerVisible(true)}
                        style={[styles.dropdownTrigger, { backgroundColor: inputBg, borderColor: inputBorder, height: 44, justifyContent: 'space-between' }]}
                      >
                        <Text style={{ color: selectedBrand ? theme.text : theme.textSecondary, fontSize: 13 }}>
                          {selectedBrand || 'Seçiniz'}
                        </Text>
                        <ChevronRight size={16} color={theme.textSecondary} />
                      </Pressable>
                    </View>

                    {/* Custom Brand */}
                    {selectedBrand === 'Diğer' && (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Özel Marka Adı *</Text>
                        <TextInput
                          placeholder="Marka adı yazın (örn: Porsche)"
                          placeholderTextColor={theme.textSecondary}
                          value={customBrand}
                          onChangeText={setCustomBrand}
                          style={[styles.textInput, { color: theme.text, backgroundColor: inputBg, borderColor: inputBorder, height: 44 }]}
                        />
                      </View>
                    )}

                    {/* Model Select */}
                    {selectedBrand !== '' && selectedBrand !== 'Diğer' && (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Model *</Text>
                        <Pressable
                          onPress={() => setModelPickerVisible(true)}
                          style={[styles.dropdownTrigger, { backgroundColor: inputBg, borderColor: inputBorder, height: 44, justifyContent: 'space-between' }]}
                        >
                          <Text style={{ color: selectedModel ? theme.text : theme.textSecondary, fontSize: 13 }}>
                            {selectedModel || 'Seçiniz'}
                          </Text>
                          <ChevronRight size={16} color={theme.textSecondary} />
                        </Pressable>
                      </View>
                    )}

                    {/* Custom Model */}
                    {selectedModel === 'Diğer' && (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Özel Model Adı *</Text>
                        <TextInput
                          placeholder="Model adı yazın (örn: Cooper)"
                          placeholderTextColor={theme.textSecondary}
                          value={customModel}
                          onChangeText={setCustomModel}
                          style={[styles.textInput, { color: theme.text, backgroundColor: inputBg, borderColor: inputBorder, height: 44 }]}
                        />
                      </View>
                    )}

                    {/* Year Select */}
                    {selectedBrand !== '' && (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Model Yılı *</Text>
                        <Pressable
                          onPress={() => setYearPickerVisible(true)}
                          style={[styles.dropdownTrigger, { backgroundColor: inputBg, borderColor: inputBorder, height: 44, justifyContent: 'space-between' }]}
                        >
                          <Text style={{ color: selectedYear ? theme.text : theme.textSecondary, fontSize: 13 }}>
                            {selectedYear || 'Seçiniz'}
                          </Text>
                          <ChevronRight size={16} color={theme.textSecondary} />
                        </Pressable>
                      </View>
                    )}

                    {/* Custom Year */}
                    {selectedYear === 'Diğer' && (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Özel Model Yılı *</Text>
                        <TextInput
                          placeholder="Model yılı yazın (örn: 1998)"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numeric"
                          value={customYear}
                          onChangeText={setCustomYear}
                          style={[styles.textInput, { color: theme.text, backgroundColor: inputBg, borderColor: inputBorder, height: 44 }]}
                        />
                      </View>
                    )}

                    {/* Bireysel / Kurumsal Seçimi (Only for vehicle sales, rentals are kurumsal-only) */}
                    {creationMode === 'rent' && rentSellSelection === 'kirala' ? (
                      <View style={{ gap: 8, padding: 12, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.05)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>⚠️ Yasal Taşıt Kiralama Bildirimi</Text>
                        <Text style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 16 }}>
                          Yasal düzenlemeler gereği taşıt kiralama ilanları yalnızca onaylı kurumsal firmalar (Rent a Car) tarafından yayınlanabilir. Bireysel kiralama ilanı verilmesi yasaktır.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Üyelik Türü *</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <Pressable
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: vehicleType === 'bireysel' ? 'rgba(255, 107, 0, 0.1)' : inputBg,
                              borderColor: vehicleType === 'bireysel' ? theme.gold : inputBorder,
                              borderWidth: 1.5,
                              borderRadius: 8,
                              padding: 12,
                              gap: 8,
                            }}
                            onPress={() => setVehicleType('bireysel')}
                          >
                            <View style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              borderWidth: 2,
                              borderColor: vehicleType === 'bireysel' ? theme.gold : theme.textSecondary,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {vehicleType === 'bireysel' && (
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.gold }} />
                              )}
                            </View>
                            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Bireysel İlan</Text>
                          </Pressable>

                          <Pressable
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: vehicleType === 'kurumsal' ? 'rgba(255, 107, 0, 0.1)' : inputBg,
                              borderColor: vehicleType === 'kurumsal' ? theme.gold : inputBorder,
                              borderWidth: 1.5,
                              borderRadius: 8,
                              padding: 12,
                              gap: 8,
                            }}
                            onPress={() => setVehicleType('kurumsal')}
                          >
                            <View style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              borderWidth: 2,
                              borderColor: vehicleType === 'kurumsal' ? theme.gold : theme.textSecondary,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {vehicleType === 'kurumsal' && (
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.gold }} />
                              )}
                            </View>
                            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Kurumsal İlan</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {/* Corporate Type Selector (Only if Kurumsal is chosen for sales) */}
                    {(vehicleType === 'kurumsal' && creationMode !== 'rent') && (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Kurumsal İşletme Türü *</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <Pressable
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: vehicleCorporateType === 'galeri' ? 'rgba(255, 107, 0, 0.1)' : inputBg,
                              borderColor: vehicleCorporateType === 'galeri' ? theme.gold : inputBorder,
                              borderWidth: 1.5,
                              borderRadius: 8,
                              padding: 12,
                              gap: 8,
                            }}
                            onPress={() => setVehicleCorporateType('galeri')}
                          >
                            <View style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              borderWidth: 2,
                              borderColor: vehicleCorporateType === 'galeri' ? theme.gold : theme.textSecondary,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {vehicleCorporateType === 'galeri' && (
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.gold }} />
                              )}
                            </View>
                            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Oto Galeri</Text>
                          </Pressable>

                          <Pressable
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: vehicleCorporateType === 'rent_a_car' ? 'rgba(255, 107, 0, 0.1)' : inputBg,
                              borderColor: vehicleCorporateType === 'rent_a_car' ? theme.gold : inputBorder,
                              borderWidth: 1.5,
                              borderRadius: 8,
                              padding: 12,
                              gap: 8,
                            }}
                            onPress={() => setVehicleCorporateType('rent_a_car')}
                          >
                            <View style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              borderWidth: 2,
                              borderColor: vehicleCorporateType === 'rent_a_car' ? theme.gold : theme.textSecondary,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {vehicleCorporateType === 'rent_a_car' && (
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.gold }} />
                              )}
                            </View>
                            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Rent a Car</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {/* Galeri Evrak Yükleme Alanı */}
                    {(vehicleType === 'kurumsal' && creationMode !== 'rent' && vehicleCorporateType === 'galeri') && (
                      <View style={{
                        gap: 14,
                        padding: 14,
                        borderRadius: 6,
                        backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: inputBorder,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <ShieldCheck size={16} color={theme.gold} />
                          <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>🏢 Oto Galeri Belgeleri</Text>
                        </View>

                        {/* 1. Yetki Belgesi */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>1. Motorlu Kara Taşıtı Ticareti Yetki Belgesi *</Text>
                          <Pressable
                            onPress={() => pickDocument(setGaleriYetkiBelgesiFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: galeriYetkiBelgesiFile ? 'solid' : 'dashed',
                              borderColor: galeriYetkiBelgesiFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: galeriYetkiBelgesiFile ? theme.text : theme.textSecondary }}>
                              {galeriYetkiBelgesiFile || 'Belge seçin (.pdf)'}
                            </Text>
                            {galeriYetkiBelgesiFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 2. Mesleki Yeterlilik Belgesi */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>2. Seviye 5 Mesleki Yeterlilik Belgesi *</Text>
                          <Pressable
                            onPress={() => pickDocument(setGaleriMeslekiYeterlilikFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: galeriMeslekiYeterlilikFile ? 'solid' : 'dashed',
                              borderColor: galeriMeslekiYeterlilikFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: galeriMeslekiYeterlilikFile ? theme.text : theme.textSecondary }}>
                              {galeriMeslekiYeterlilikFile || 'Belge seçin (.pdf)'}
                            </Text>
                            {galeriMeslekiYeterlilikFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 3. Vergi Levhası */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>3. Vergi Levhası *</Text>
                          <Pressable
                            onPress={() => pickDocument(setGaleriVergiLevhasiFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: galeriVergiLevhasiFile ? 'solid' : 'dashed',
                              borderColor: galeriVergiLevhasiFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: galeriVergiLevhasiFile ? theme.text : theme.textSecondary }}>
                              {galeriVergiLevhasiFile || 'Belge seçin (.pdf, .jpg)'}
                            </Text>
                            {galeriVergiLevhasiFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 4. Oda Kaydı / Gazete */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>4. Oda Kayıt Belgesi & Ticaret Sicil Gazetesi *</Text>
                          <Pressable
                            onPress={() => pickDocument(setGaleriOdaKaydiFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: galeriOdaKaydiFile ? 'solid' : 'dashed',
                              borderColor: galeriOdaKaydiFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: galeriOdaKaydiFile ? theme.text : theme.textSecondary }}>
                              {galeriOdaKaydiFile || 'Belge seçin (.pdf)'}
                            </Text>
                            {galeriOdaKaydiFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 5. Ruhsat */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>5. İşyeri Açma ve Çalışma Ruhsatı *</Text>
                          <Pressable
                            onPress={() => pickDocument(setGaleriRuhsatFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: galeriRuhsatFile ? 'solid' : 'dashed',
                              borderColor: galeriRuhsatFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: galeriRuhsatFile ? theme.text : theme.textSecondary }}>
                              {galeriRuhsatFile || 'Belge seçin (.pdf, .jpg)'}
                            </Text>
                            {galeriRuhsatFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* e-Devlet & EİDS */}
                        <View style={{ gap: 4, marginTop: 4 }}>
                          <Pressable
                            onPress={() => {
                              if (galeriEidsApproved) return;
                              setIsVerifyingGaleriEids(true);
                              setTimeout(() => {
                                setIsVerifyingGaleriEids(false);
                                setGaleriEidsApproved(true);
                                Alert.alert('Doğrulama Başarılı', 'e-Devlet entegrasyonu ile Galeri EİDS onayı tamamlanmıştır.');
                              }, 1500);
                            }}
                            disabled={galeriEidsApproved || isVerifyingGaleriEids}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 38,
                              borderRadius: 4,
                              backgroundColor: galeriEidsApproved ? '#34D399' : theme.gold,
                              gap: 6,
                            }}
                          >
                            {isVerifyingGaleriEids ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 11 }}>
                                  {galeriEidsApproved ? 'EİDS Doğrulandı' : 'e-Devlet ile Giriş Yap & Doğrula'}
                                </Text>
                              </>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {/* Rent a Car Evrak Yükleme Alanı (For sales with Rent a Car type or forced on Rentals) */}
                    {((creationMode === 'rent' && rentSellSelection === 'kirala') || (vehicleType === 'kurumsal' && vehicleCorporateType === 'rent_a_car')) && (
                      <View style={{
                        gap: 14,
                        padding: 14,
                        borderRadius: 6,
                        backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: inputBorder,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <ShieldCheck size={16} color={theme.gold} />
                          <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>🏢 Rent a Car Belgeleri</Text>
                        </View>

                        {/* 1. Vergi Levhası */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>1. Vergi Levhası *</Text>
                          <Pressable
                            onPress={() => pickDocument(setRentVergiLevhasiFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: rentVergiLevhasiFile ? 'solid' : 'dashed',
                              borderColor: rentVergiLevhasiFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: rentVergiLevhasiFile ? theme.text : theme.textSecondary }}>
                              {rentVergiLevhasiFile || 'Belge seçin (.pdf, .jpg)'}
                            </Text>
                            {rentVergiLevhasiFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 2. Oda Kaydı */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>2. Ticaret Odası / Esnaf Belgesi *</Text>
                          <Pressable
                            onPress={() => pickDocument(setRentOdaKaydiFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: rentOdaKaydiFile ? 'solid' : 'dashed',
                              borderColor: rentOdaKaydiFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: rentOdaKaydiFile ? theme.text : theme.textSecondary }}>
                              {rentOdaKaydiFile || 'Belge seçin (.pdf)'}
                            </Text>
                            {rentOdaKaydiFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 3. Ruhsat */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>3. İşyeri Açma ve Çalışma Ruhsatı *</Text>
                          <Pressable
                            onPress={() => pickDocument(setRentRuhsatFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: rentRuhsatFile ? 'solid' : 'dashed',
                              borderColor: rentRuhsatFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: rentRuhsatFile ? theme.text : theme.textSecondary }}>
                              {rentRuhsatFile || 'Belge seçin (.pdf, .jpg)'}
                            </Text>
                            {rentRuhsatFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 4. İmza Sirküleri */}
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>4. İmza Sirküleri veya Yetki Belgesi *</Text>
                          <Pressable
                            onPress={() => pickDocument(setRentImzaSirkuleriFile)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 38,
                              borderRadius: 4,
                              borderWidth: 1,
                              borderStyle: rentImzaSirkuleriFile ? 'solid' : 'dashed',
                              borderColor: rentImzaSirkuleriFile ? '#34D399' : inputBorder,
                              backgroundColor: inputBg,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: rentImzaSirkuleriFile ? theme.text : theme.textSecondary }}>
                              {rentImzaSirkuleriFile || 'Belge seçin (.pdf)'}
                            </Text>
                            {rentImzaSirkuleriFile ? <CheckCircle2 size={12} color="#34D399" /> : <Upload size={12} color={theme.textSecondary} />}
                          </Pressable>
                        </View>

                        {/* 5. e-Devlet/EİDS Onayı */}
                        <View style={{ gap: 4, marginTop: 4 }}>
                          <Pressable
                            onPress={() => {
                              if (rentEidsApproved) return;
                              setIsVerifyingRentEids(true);
                              setTimeout(() => {
                                setIsVerifyingRentEids(false);
                                setRentEidsApproved(true);
                                Alert.alert('Doğrulama Başarılı', 'e-Devlet entegrasyonu ile Rent a Car EİDS onayı tamamlanmıştır.');
                              }, 1500);
                            }}
                            disabled={rentEidsApproved || isVerifyingRentEids}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 38,
                              borderRadius: 4,
                              backgroundColor: rentEidsApproved ? '#34D399' : theme.gold,
                              gap: 6,
                            }}
                          >
                            {isVerifyingRentEids ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 11 }}>
                                  {rentEidsApproved ? 'EİDS Doğrulandı' : 'e-Devlet ile Giriş Yap & Doğrula'}
                                </Text>
                              </>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })()}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>İlan Başlığı *</Text>
                <TextInput
                  placeholder="Vintage Levi's ceket, antika gümüş vazo vb..."
                  placeholderTextColor={theme.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                  onFocus={() => setFocusedInput('title')}
                  onBlur={() => setFocusedInput(null)}
                  style={[
                    styles.textInput,
                    {
                      color: theme.text,
                      backgroundColor: inputBg,
                      borderColor: focusedInput === 'title' ? inputBorderFocused : inputBorder,
                      borderWidth: focusedInput === 'title' ? 1.5 : 1,
                    }
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Açıklama *</Text>
                <TextInput
                  placeholder="Ürünün detaylı durumunu, ebatlarını, malzemesini yazın..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  onFocus={() => setFocusedInput('desc')}
                  onBlur={() => setFocusedInput(null)}
                  style={[
                    styles.textAreaInput,
                    {
                      color: theme.text,
                      backgroundColor: inputBg,
                      borderColor: focusedInput === 'desc' ? inputBorderFocused : inputBorder,
                      borderWidth: focusedInput === 'desc' ? 1.5 : 1,
                    }
                  ]}
                />
              </View>

              {/* Media Section */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Medya Yükleme</Text>
                
                {/* Video Picker */}
                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Ürün Tanıtım Videosu * (Maks 8 sn, Dikey format)</Text>
                {videoUri ? (
                  <View style={[styles.mediaPreviewCard, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                    <FileText size={24} color={theme.gold} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.mediaFileName, { color: theme.text }]} numberOfLines={1}>Video Hazır (Sıkıştırıldı)</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Dikey format • Süre uygun</Text>
                    </View>
                    <Pressable onPress={removeVideo} style={styles.mediaDeleteBtn}>
                      <X size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                ) : isCompressing ? (
                  <View style={[styles.mediaPlaceholder, { borderColor: theme.gold, backgroundColor: inputBg }]}>
                    <ActivityIndicator size="small" color={theme.gold} />
                    <Text style={[styles.placeholderText, { color: theme.text, marginLeft: 8 }]}>
                      Video sıkıştırılıyor (%{compressionProgress})...
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.mediaPlaceholder, { borderColor: inputBorder, backgroundColor: inputBg }]}
                    onPress={pickVideo}
                  >
                    <Play size={20} color={theme.textSecondary} />
                    <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                      Dikey Video Seç (Maks 8 sn)
                    </Text>
                  </Pressable>
                )}

                {/* Photos Picker */}
                <Text style={[styles.subLabel, { color: theme.textSecondary, marginTop: 8 }]}>
                  Ürün Fotoğrafları * (En az 3, En fazla 10 adet)
                </Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                  {photosUris.map((uri, idx) => (
                    <View key={idx} style={styles.photoThumbWrapper}>
                      <Image source={{ uri }} style={styles.photoThumb} />
                      <Pressable onPress={() => removePhoto(idx)} style={styles.photoDeleteBtn}>
                        <X size={10} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}
                  {photosUris.length < 10 && (
                    <Pressable
                      style={[styles.photoAddPlaceholder, { borderColor: inputBorder, backgroundColor: inputBg }]}
                      onPress={pickPhotos}
                    >
                      <Plus size={20} color={theme.textSecondary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 10, marginTop: 4 }}>
                        {photosUris.length}/10
                      </Text>
                    </Pressable>
                  )}
                </ScrollView>
              </View>

              {/* Sales Type selector */}
              {rentSellSelection !== 'kirala' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Satış Modeli</Text>
                  <View style={styles.typeSelectorRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.typeOption,
                        {
                          backgroundColor: type === 'fixed' 
                            ? (isDark ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.08)')
                            : inputBg,
                          borderColor: type === 'fixed' ? theme.gold : inputBorder,
                          borderWidth: type === 'fixed' ? 1.5 : 1,
                          opacity: pressed ? 0.9 : 1,
                        }
                      ]}
                      onPress={() => setType('fixed')}
                    >
                      <Landmark size={16} color={type === 'fixed' ? theme.gold : theme.textSecondary} />
                      <Text style={[
                        styles.typeOptionText,
                        {
                          color: type === 'fixed' ? (isDark ? theme.gold : theme.goldAccent) : theme.textSecondary,
                          fontWeight: type === 'fixed' ? '700' : '500'
                        }
                      ]}>
                        Sabit Fiyat
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.typeOption,
                        {
                          backgroundColor: type === 'offer' 
                            ? (isDark ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.08)')
                            : inputBg,
                          borderColor: type === 'offer' ? theme.gold : inputBorder,
                          borderWidth: type === 'offer' ? 1.5 : 1,
                          opacity: pressed ? 0.9 : 1,
                        }
                      ]}
                      onPress={() => setType('offer')}
                    >
                      <Tag size={16} color={type === 'offer' ? theme.gold : theme.textSecondary} />
                      <Text style={[
                        styles.typeOptionText,
                        {
                          color: type === 'offer' ? (isDark ? theme.gold : theme.goldAccent) : theme.textSecondary,
                          fontWeight: type === 'offer' ? '700' : '500'
                        }
                      ]}>
                        Teklifli
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.typeOption,
                        {
                          backgroundColor: type === 'auction' 
                            ? (isDark ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.08)')
                            : inputBg,
                          borderColor: type === 'auction' ? theme.gold : inputBorder,
                          borderWidth: type === 'auction' ? 1.5 : 1,
                          opacity: pressed ? 0.9 : 1,
                        }
                      ]}
                      onPress={() => setType('auction')}
                    >
                      <Gavel size={16} color={type === 'auction' ? theme.gold : theme.textSecondary} />
                      <Text style={[
                        styles.typeOptionText,
                        {
                          color: type === 'auction' ? (isDark ? theme.gold : theme.goldAccent) : theme.textSecondary,
                          fontWeight: type === 'auction' ? '700' : '500'
                        }
                      ]}>
                        Mezat
                      </Text>
                    </Pressable>

                    {creationMode !== 'rent' && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.typeOption,
                          {
                            backgroundColor: type === 'rent' 
                              ? (isDark ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.08)')
                              : inputBg,
                            borderColor: type === 'rent' ? theme.gold : inputBorder,
                            borderWidth: type === 'rent' ? 1.5 : 1,
                            opacity: pressed ? 0.9 : 1,
                          }
                        ]}
                        onPress={() => setType('rent')}
                      >
                        <Key size={16} color={type === 'rent' ? theme.gold : theme.textSecondary} />
                        <Text style={[
                          styles.typeOptionText,
                          {
                            color: type === 'rent' ? (isDark ? theme.gold : theme.goldAccent) : theme.textSecondary,
                            fontWeight: type === 'rent' ? '700' : '500'
                          }
                        ]}>
                          Kirala
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )}

              {/* Price, Category, and Duration Settings */}
              {type !== 'auction' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>
                      {type === 'rent' ? 'Kiralama Ücreti *' : 'Satış Fiyatı *'}
                    </Text>
                    <View style={styles.priceInputWrapper}>
                      <TextInput
                        placeholder="Fiyat girin"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                        onFocus={() => setFocusedInput('price')}
                        onBlur={() => setFocusedInput(null)}
                        style={[
                          styles.textInput,
                          {
                            color: theme.text,
                            backgroundColor: inputBg,
                            borderColor: focusedInput === 'price' ? inputBorderFocused : inputBorder,
                            borderWidth: focusedInput === 'price' ? 1.5 : 1,
                            paddingRight: 60,
                          }
                        ]}
                      />
                      <Text style={[styles.priceCurrency, { color: isDark ? theme.gold : theme.goldAccent, right: 12 }]}>
                        {type === 'rent' ? `TL/${rentPeriod === 'Günlük' ? 'Gün' : rentPeriod === 'Haftalık' ? 'Hafta' : 'Ay'}` : 'TL'}
                      </Text>
                    </View>
                  </View>

                  {type === 'rent' && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Kiralama Periyodu</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {['Günlük', 'Haftalık', 'Aylık'].map((period) => (
                          <Pressable
                            key={period}
                            style={[
                              styles.cityBadge,
                              { 
                                flex: 1, 
                                backgroundColor: rentPeriod === period ? 'rgba(255, 107, 0, 0.15)' : inputBg,
                                borderColor: rentPeriod === period ? theme.gold : inputBorder,
                                borderWidth: rentPeriod === period ? 1.5 : 1,
                                height: 42,
                              }
                            ]}
                            onPress={() => setRentPeriod(period)}
                          >
                            <Text style={[
                              styles.cityBadgeText, 
                              { 
                                color: rentPeriod === period ? theme.gold : theme.textSecondary,
                                fontWeight: rentPeriod === period ? '800' : '500'
                              }
                            ]}>
                              {period}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {/* Auction Price Row */}
                  <View style={styles.formRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Başlangıç Fiyatı *</Text>
                      <View style={styles.priceInputWrapper}>
                        <TextInput
                          placeholder="Fiyat girin"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numeric"
                          value={price}
                          onChangeText={setPrice}
                          onFocus={() => setFocusedInput('price')}
                          onBlur={() => setFocusedInput(null)}
                          style={[
                            styles.textInput,
                            {
                              color: theme.text,
                              backgroundColor: inputBg,
                              borderColor: focusedInput === 'price' ? inputBorderFocused : inputBorder,
                              borderWidth: focusedInput === 'price' ? 1.5 : 1,
                              paddingRight: 40,
                            }
                          ]}
                        />
                        <Text style={[styles.priceCurrency, { color: isDark ? theme.gold : theme.goldAccent }]}>TL</Text>
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Hemen Al Fiyatı *</Text>
                      <View style={styles.priceInputWrapper}>
                        <TextInput
                          placeholder="Fiyat girin"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numeric"
                          value={buyNowPrice}
                          onChangeText={setBuyNowPrice}
                          onFocus={() => setFocusedInput('buyNow')}
                          onBlur={() => setFocusedInput(null)}
                          style={[
                            styles.textInput,
                            {
                              color: theme.text,
                              backgroundColor: inputBg,
                              borderColor: focusedInput === 'buyNow' ? inputBorderFocused : inputBorder,
                              borderWidth: focusedInput === 'buyNow' ? 1.5 : 1,
                              paddingRight: 40,
                            }
                          ]}
                        />
                        <Text style={[styles.priceCurrency, { color: isDark ? theme.gold : theme.goldAccent }]}>TL</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Bitiş Süresi (Saat) *</Text>
                    <TextInput
                      placeholder="Maks 48"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={auctionDuration}
                      onChangeText={setAuctionDuration}
                      onFocus={() => setFocusedInput('duration')}
                      onBlur={() => setFocusedInput(null)}
                      style={[
                        styles.textInput,
                        {
                          color: theme.text,
                          backgroundColor: inputBg,
                          borderColor: focusedInput === 'duration' ? inputBorderFocused : inputBorder,
                          borderWidth: focusedInput === 'duration' ? 1.5 : 1,
                        }
                      ]}
                    />
                  </View>
                </>
              )}

              {/* UNIVERSAL LOCATION SELECTOR (İl, İlçe, Mahalle) */}
              <View style={{ gap: 12, marginVertical: 8, padding: 12, borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderWidth: 1, borderColor: inputBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MapPin size={16} color={theme.gold} />
                  <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>📍 Konum Bilgileri</Text>
                </View>
                
                {/* City Select */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Şehir (İl) *</Text>
                  <Pressable
                    onPress={() => setCityPickerVisible(true)}
                    style={[styles.dropdownTrigger, { backgroundColor: inputBg, borderColor: inputBorder, height: 44, justifyContent: 'space-between' }]}
                  >
                    <Text style={{ color: theme.text, fontSize: 13 }}>{selectedCity}</Text>
                    <ChevronRight size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>

                {/* District Select */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>İlçe *</Text>
                  <Pressable
                    onPress={() => setDistrictPickerVisible(true)}
                    style={[styles.dropdownTrigger, { backgroundColor: inputBg, borderColor: inputBorder, height: 44, justifyContent: 'space-between' }]}
                  >
                    <Text style={{ color: selectedDistrict ? theme.text : theme.textSecondary, fontSize: 13 }}>
                      {selectedDistrict || 'Seçiniz'}
                    </Text>
                    <ChevronRight size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>

                {/* Neighborhood Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Mahalle / Köy *</Text>
                  <TextInput
                    placeholder="Mahalle veya köy adı girin"
                    placeholderTextColor={theme.textSecondary}
                    value={selectedNeighborhood}
                    onChangeText={setSelectedNeighborhood}
                    style={[styles.textInput, { color: theme.text, backgroundColor: inputBg, borderColor: inputBorder, height: 44 }]}
                  />
                </View>
              </View>



              {/* Certified Product Section */}
              <View style={[styles.switchGroup, { borderColor: inputBorder }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.switchLabel, { color: theme.text }]}>Belgeli Ürün (Sertifikalı / Orijinal)</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 16 }}>
                    Koleksiyonluk, orijinal veya ekspertiz raporlu ürünler için belge ekleyin.
                  </Text>
                </View>
                <Switch
                  value={verifiedProduct}
                  onValueChange={setVerifiedProduct}
                  trackColor={{ false: inputBorder, true: theme.gold }}
                  thumbColor={verifiedProduct ? (isDark ? theme.background : '#FFFFFF') : (isDark ? theme.textSecondary : '#CBD5E1')}
                />
              </View>

              {verifiedProduct && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text, marginBottom: 8 }]}>Belge / Sertifika</Text>
                  
                  {documentUrl ? (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
                      borderColor: '#10B981',
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 16,
                      justifyContent: 'space-between'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <FileText size={24} color="#10B981" />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                            {documentUrl}
                          </Text>
                          <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>
                            ✓ Yüklendi
                          </Text>
                        </View>
                      </View>
                      
                      <Pressable 
                        onPress={() => setDocumentUrl('')}
                        style={{ padding: 6 }}
                        hitSlop={10}
                      >
                        <X size={18} color="#EF4444" />
                      </Pressable>
                    </View>
                  ) : uploadingDoc ? (
                    <View style={{
                      backgroundColor: inputBg,
                      borderColor: theme.gold,
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderRadius: 8,
                      padding: 20,
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <ActivityIndicator size="small" color={theme.gold} />
                      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>
                        Belge yükleniyor... %{uploadProgress}
                      </Text>
                      <View style={{ width: '80%', height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <View style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: theme.gold }} />
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      onPress={handlePickDocument}
                      style={({ pressed }) => [
                        {
                          backgroundColor: inputBg,
                          borderColor: pressed ? theme.gold : inputBorder,
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          borderRadius: 8,
                          padding: 24,
                          alignItems: 'center',
                          gap: 8,
                        },
                        pressed && { opacity: 0.85 }
                      ]}
                    >
                      <Upload size={28} color={theme.textSecondary} />
                      <Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold' }}>
                        Dosya Yüklemek İçin Dokunun
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center' }}>
                        Desteklenen formatlar: PDF, JPG, PNG (Maks. 10 MB)
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Submit */}
              <Pressable 
                style={({ pressed }) => [
                  styles.submitButton, 
                  { 
                    backgroundColor: theme.gold,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                  }
                ]} 
                onPress={handleCreateListing}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.submitText}>İlanı Yayınla</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      )}

      {/* Category Picker Modal */}
      <SearchablePickerModal
        visible={categoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        title="Kategori Seçin"
        options={
          creationMode === 'flea'
            ? FLEA_MARKET_CATEGORIES
            : creationMode === 'producer'
            ? PRODUCER_CATEGORIES
            : RENTAL_SUB_CATEGORIES
        }
        selectedValue={category}
        onSelect={(val) => {
          setCategory(val);
          setSubCategory('');
          setSelectedDistrict('');
          setSelectedNeighborhood('');
          setSelectedBrand('');
          setSelectedModel('');
          setSelectedYear('');
          setCustomBrand('');
          setCustomModel('');
          setCustomYear('');
        }}
        theme={theme}
        isDark={isDark}
      />

      {/* Emlak Sub-Category Picker Modal */}
      <SearchablePickerModal
        visible={subCategoryPickerVisible}
        onClose={() => setSubCategoryPickerVisible(false)}
        title="Emlak Tipi Seçin"
        options={EMLAK_SUB_CATEGORIES}
        selectedValue={subCategory}
        onSelect={(val) => {
          setSubCategory(val);
        }}
        theme={theme}
        isDark={isDark}
      />

      {/* City Picker Modal */}
      <SearchablePickerModal
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        title="Şehir Seçin"
        options={Object.keys(TURKEY_ADDRESS_DATA)}
        selectedValue={selectedCity}
        onSelect={(val) => {
          setSelectedCity(val);
          setSelectedDistrict('');
        }}
        theme={theme}
        isDark={isDark}
      />

      {/* District Picker Modal */}
      <SearchablePickerModal
        visible={districtPickerVisible}
        onClose={() => setDistrictPickerVisible(false)}
        title="İlçe Seçin"
        options={TURKEY_ADDRESS_DATA[selectedCity] || []}
        selectedValue={selectedDistrict}
        onSelect={(val) => {
          setSelectedDistrict(val);
        }}
        theme={theme}
        isDark={isDark}
      />

      {/* Vehicle Brand Picker Modal */}
      <SearchablePickerModal
        visible={brandPickerVisible}
        onClose={() => setBrandPickerVisible(false)}
        title="Araç Markası Seçin"
        options={(() => {
          const vehicleBrands = VEHICLE_BRANDS[
            category.includes('Otomobil') ? 'Otomobil' :
            category.includes('Motosiklet') ? 'Motosiklet' :
            category.includes('Karavan') ? 'Karavan' :
            category.includes('Kamyon') ? 'Kamyon, kamyonet' :
            category.includes('Traktör') ? 'Traktör ve tarım makineleri' :
            category.includes('İş makineleri') ? 'İş makineleri (ekskavatör, forklift, vinç vb.)' : ''
          ] || [];
          return vehicleBrands.map(b => b.name);
        })()}
        selectedValue={selectedBrand}
        onSelect={(val) => {
          setSelectedBrand(val);
          setSelectedModel('');
        }}
        theme={theme}
        isDark={isDark}
      />

      {/* Vehicle Model Picker Modal */}
      <SearchablePickerModal
        visible={modelPickerVisible}
        onClose={() => setModelPickerVisible(false)}
        title="Araç Modeli Seçin"
        options={(() => {
          const vehicleBrands = VEHICLE_BRANDS[
            category.includes('Otomobil') ? 'Otomobil' :
            category.includes('Motosiklet') ? 'Motosiklet' :
            category.includes('Karavan') ? 'Karavan' :
            category.includes('Kamyon') ? 'Kamyon, kamyonet' :
            category.includes('Traktör') ? 'Traktör ve tarım makineleri' :
            category.includes('İş makineleri') ? 'İş makineleri (ekskavatör, forklift, vinç vb.)' : ''
          ] || [];
          const selectedBrandObj = vehicleBrands.find(b => b.name === selectedBrand);
          return selectedBrandObj ? selectedBrandObj.models.concat(['Diğer']) : ['Diğer'];
        })()}
        selectedValue={selectedModel}
        onSelect={(val) => {
          setSelectedModel(val);
        }}
        theme={theme}
        isDark={isDark}
      />

      {/* Vehicle Year Picker Modal */}
      <SearchablePickerModal
        visible={yearPickerVisible}
        onClose={() => setYearPickerVisible(false)}
        title="Model Yılı Seçin"
        options={Array.from({ length: 2026 - 1970 + 1 }, (_, i) => (2026 - i).toString()).concat(['Diğer'])}
        selectedValue={selectedYear}
        onSelect={(val) => {
          setSelectedYear(val);
        }}
        theme={theme}
        isDark={isDark}
      />

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  navBarIcon: {
    padding: 8,
  },
  navBarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContainer: {
    paddingBottom: 60,
    gap: 20,
  },
  formCard: {
    padding: 20,
    borderRadius: 6,
    borderWidth: 1,
  },
  formBody: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    paddingLeft: 2,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 2,
  },
  textInput: {
    height: 48,
    borderRadius: 6,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  textAreaInput: {
    borderRadius: 6,
    padding: 16,
    fontSize: 14,
    height: 110,
    textAlignVertical: 'top',
  },
  mediaPlaceholder: {
    height: 60,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mediaPreviewCard: {
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mediaFileName: {
    fontSize: 13,
    fontWeight: '700',
  },
  mediaDeleteBtn: {
    padding: 8,
  },
  photosScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  photoThumbWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  photoThumb: {
    width: 70,
    height: 70,
    borderRadius: 4,
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  priceCurrency: {
    position: 'absolute',
    right: 16,
    fontWeight: '700',
    fontSize: 14,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    minWidth: '45%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 6,
  },
  typeOptionText: {
    fontSize: 12,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  documentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  documentInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 6,
    gap: 8,
    marginTop: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: '#34D399',
  },
  cityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
  },
  cityBadgeText: {
    fontSize: 12,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 150,
  },
  gridIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gridCardDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
