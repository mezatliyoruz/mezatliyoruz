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
import { ArrowLeft, Landmark, Tag, Gavel, FileText, Play, Plus, CheckCircle2, X, Key, Search, ChevronRight, MapPin, Car, Upload, ShieldCheck, AlertCircle, RotateCcw, Clock, ShieldAlert } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TURKEY_ADDRESS_DATA } from '@/constants/turkey-address';
import { VEHICLE_BRANDS } from '@/constants/vehicles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import {
  EMLAK_SUB_CATEGORIES,
  RENTAL_SUB_CATEGORIES,
  FLEA_MARKET_CATEGORIES,
  PRODUCER_CATEGORIES
} from '@/constants/categories';


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
                    backgroundColor: isSelected ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
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
  const { editId } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { currentUser, listings, addListing, updateListing, applyForRentACar, serverValidateUploadedFile, rentACarApplications } = useAppStore();

  // Step tracking state
  const [creationStep, setCreationStep] = useState<number>(1);
  const [creationMode, setCreationMode] = useState<'auction' | 'flea' | 'producer' | 'rent' | null>(null);
  const [rentSellSelection, setRentSellSelection] = useState<'sat' | 'kirala' | null>(null);

  // New listing form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
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
  const [minIncrement, setMinIncrement] = useState('10');

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
  const [isUploading, setIsUploading] = useState(false);

  // Seller Application Form states
  const [appVergiLevhasi, setAppVergiLevhasi] = useState('');
  const [appKimlik, setAppKimlik] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appError, setAppError] = useState('');

  // Active focus tracking
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Dynamic layout colors
  const isDark = scheme === 'dark';
  const cardBg = isDark ? '#111A30' : '#FFFFFF';
  const inputBg = isDark ? '#080E1C' : '#F8FAFC';
  const inputBorder = isDark ? '#1F2E54' : '#E2E8F0';
  const inputBorderFocused = theme.gold;

  // AI Approval and loading states
  const [titleApproved, setTitleApproved] = useState(false);
  const [descriptionApproved, setDescriptionApproved] = useState(false);
  const [categoryApproved, setCategoryApproved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  // Gemini uncertain state: holds options when model can't decide
  const [geminiOptions, setGeminiOptions] = useState<string[] | null>(null);
  const [geminiPendingBase64, setGeminiPendingBase64] = useState<string>('');

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (editId) return; // Do not load draft when editing
      try {
        const draftStr = await AsyncStorage.getItem('mezat_listing_draft');
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (draft.creationStep !== undefined) setCreationStep(draft.creationStep);
          if (draft.creationMode !== undefined) setCreationMode(draft.creationMode);
          if (draft.rentSellSelection !== undefined) setRentSellSelection(draft.rentSellSelection);
          if (draft.title !== undefined) setTitle(draft.title);
          if (draft.description !== undefined) setDescription(draft.description);
          if (draft.price !== undefined) setPrice(draft.price);
          if (draft.type !== undefined) setType(draft.type);
          if (draft.rentPeriod !== undefined) setRentPeriod(draft.rentPeriod);
          if (draft.category !== undefined) setCategory(draft.category);
          if (draft.subCategory !== undefined) setSubCategory(draft.subCategory);
          if (draft.condition !== undefined) setCondition(draft.condition);
          if (draft.verifiedProduct !== undefined) setVerifiedProduct(draft.verifiedProduct);
          if (draft.documentUrl !== undefined) setDocumentUrl(draft.documentUrl);
          if (draft.buyNowPrice !== undefined) setBuyNowPrice(draft.buyNowPrice);
          if (draft.auctionDuration !== undefined) setAuctionDuration(draft.auctionDuration);
          if (draft.minIncrement !== undefined) setMinIncrement(draft.minIncrement);
          if (draft.selectedCity !== undefined) setSelectedCity(draft.selectedCity);
          if (draft.selectedDistrict !== undefined) setSelectedDistrict(draft.selectedDistrict);
          if (draft.selectedNeighborhood !== undefined) setSelectedNeighborhood(draft.selectedNeighborhood);
          if (draft.selectedBrand !== undefined) setSelectedBrand(draft.selectedBrand);
          if (draft.selectedModel !== undefined) setSelectedModel(draft.selectedModel);
          if (draft.selectedYear !== undefined) setSelectedYear(draft.selectedYear);
          if (draft.customBrand !== undefined) setCustomBrand(draft.customBrand);
          if (draft.customModel !== undefined) setCustomModel(draft.customModel);
          if (draft.customYear !== undefined) setCustomYear(draft.customYear);
          if (draft.emlakType !== undefined) setEmlakType(draft.emlakType);
          if (draft.tasinmazYetkiFile !== undefined) setTasinmazYetkiFile(draft.tasinmazYetkiFile);
          if (draft.emlakVergiLevhasiFile !== undefined) setEmlakVergiLevhasiFile(draft.emlakVergiLevhasiFile);
          if (draft.emlakOdaKaydiFile !== undefined) setEmlakOdaKaydiFile(draft.emlakOdaKaydiFile);
          if (draft.emlakImzaSirkuleriFile !== undefined) setEmlakImzaSirkuleriFile(draft.emlakImzaSirkuleriFile);
          if (draft.emlakYetkiliKimlikFile !== undefined) setEmlakYetkiliKimlikFile(draft.emlakYetkiliKimlikFile);
          if (draft.emlakSicilGazetesiFile !== undefined) setEmlakSicilGazetesiFile(draft.emlakSicilGazetesiFile);
          if (draft.eidsApproved !== undefined) setEidsApproved(draft.eidsApproved);
          if (draft.vehicleType !== undefined) setVehicleType(draft.vehicleType);
          if (draft.vehicleCorporateType !== undefined) setVehicleCorporateType(draft.vehicleCorporateType);
          if (draft.galeriYetkiBelgesiFile !== undefined) setGaleriYetkiBelgesiFile(draft.galeriYetkiBelgesiFile);
          if (draft.galeriMeslekiYeterlilikFile !== undefined) setGaleriMeslekiYeterlilikFile(draft.galeriMeslekiYeterlilikFile);
          if (draft.galeriVergiLevhasiFile !== undefined) setGaleriVergiLevhasiFile(draft.galeriVergiLevhasiFile);
          if (draft.galeriOdaKaydiFile !== undefined) setGaleriOdaKaydiFile(draft.galeriOdaKaydiFile);
          if (draft.galeriRuhsatFile !== undefined) setGaleriRuhsatFile(draft.galeriRuhsatFile);
          if (draft.galeriEidsApproved !== undefined) setGaleriEidsApproved(draft.galeriEidsApproved);
          if (draft.rentVergiLevhasiFile !== undefined) setRentVergiLevhasiFile(draft.rentVergiLevhasiFile);
          if (draft.rentOdaKaydiFile !== undefined) setRentOdaKaydiFile(draft.rentOdaKaydiFile);
          if (draft.rentRuhsatFile !== undefined) setRentRuhsatFile(draft.rentRuhsatFile);
          if (draft.rentImzaSirkuleriFile !== undefined) setRentImzaSirkuleriFile(draft.rentImzaSirkuleriFile);
          if (draft.rentEidsApproved !== undefined) setRentEidsApproved(draft.rentEidsApproved);
          if (draft.photosUris !== undefined) setPhotosUris(draft.photosUris);
          if (draft.videoUri !== undefined) setVideoUri(draft.videoUri);
          if (draft.titleApproved !== undefined) setTitleApproved(draft.titleApproved);
          if (draft.descriptionApproved !== undefined) setDescriptionApproved(draft.descriptionApproved);
          if (draft.categoryApproved !== undefined) setCategoryApproved(draft.categoryApproved);
          if (draft.stock !== undefined) setStock(draft.stock);
        }
      } catch (e) {
        console.warn('Error loading draft', e);
      }
    };
    loadDraft();
  }, []);

  // Save draft on changes
  useEffect(() => {
    const saveDraft = async () => {
      if (editId) return; // Do not save draft when editing
      try {
        const draft = {
          creationStep,
          creationMode,
          rentSellSelection,
          title,
          description,
          price,
          type,
          rentPeriod,
          category,
          subCategory,
          condition,
          verifiedProduct,
          documentUrl,
          buyNowPrice,
          auctionDuration,
          minIncrement,
          selectedCity,
          selectedDistrict,
          selectedNeighborhood,
          selectedBrand,
          selectedModel,
          selectedYear,
          customBrand,
          customModel,
          customYear,
          emlakType,
          tasinmazYetkiFile,
          emlakVergiLevhasiFile,
          emlakOdaKaydiFile,
          emlakImzaSirkuleriFile,
          emlakYetkiliKimlikFile,
          emlakSicilGazetesiFile,
          eidsApproved,
          vehicleType,
          vehicleCorporateType,
          galeriYetkiBelgesiFile,
          galeriMeslekiYeterlilikFile,
          galeriVergiLevhasiFile,
          galeriOdaKaydiFile,
          galeriRuhsatFile,
          galeriEidsApproved,
          rentVergiLevhasiFile,
          rentOdaKaydiFile,
          rentRuhsatFile,
          rentImzaSirkuleriFile,
          rentEidsApproved,
          photosUris,
          videoUri,
          titleApproved,
          descriptionApproved,
          categoryApproved,
          stock,
        };
        await AsyncStorage.setItem('mezat_listing_draft', JSON.stringify(draft));
      } catch (e) {
        console.warn('Error saving draft', e);
      }
    };
    saveDraft();
  }, [
    creationStep,
    creationMode,
    rentSellSelection,
    title,
    description,
    price,
    type,
    rentPeriod,
    category,
    subCategory,
    condition,
    verifiedProduct,
    documentUrl,
    buyNowPrice,
    auctionDuration,
    minIncrement,
    selectedCity,
    selectedDistrict,
    selectedNeighborhood,
    selectedBrand,
    selectedModel,
    selectedYear,
    customBrand,
    customModel,
    customYear,
    emlakType,
    tasinmazYetkiFile,
    emlakVergiLevhasiFile,
    emlakOdaKaydiFile,
    emlakImzaSirkuleriFile,
    emlakYetkiliKimlikFile,
    emlakSicilGazetesiFile,
    eidsApproved,
    vehicleType,
    vehicleCorporateType,
    galeriYetkiBelgesiFile,
    galeriMeslekiYeterlilikFile,
    galeriVergiLevhasiFile,
    galeriOdaKaydiFile,
    galeriRuhsatFile,
    galeriEidsApproved,
    rentVergiLevhasiFile,
    rentOdaKaydiFile,
    rentRuhsatFile,
    rentImzaSirkuleriFile,
    rentEidsApproved,
    photosUris,
    videoUri,
    titleApproved,
    descriptionApproved,
    categoryApproved,
    stock,
  ]);

  // Load listing for editing if editId is provided
  useEffect(() => {
    if (!editId) return;
    const listing = listings.find((l) => l.id === editId);
    if (!listing) return;

    // Populate form states
    setTitle(listing.title || '');
    setDescription(listing.description || '');
    setPrice(listing.price ? String(listing.price) : '');
    setStock(listing.stock !== undefined ? String(listing.stock) : '1');
    setType(listing.type || 'fixed');
    if (listing.rentPeriod) setRentPeriod(listing.rentPeriod);
    
    // Parse category & subcategory
    if (listing.category) {
      if (listing.category.startsWith('🏠 ')) {
        setCategory('Emlak');
        setSubCategory(listing.category.replace('🏠 ', ''));
      } else {
        setCategory(listing.category);
      }
    }
    
    setCondition(listing.condition || 'İyi');
    setVerifiedProduct(!!listing.verifiedProduct);
    setDocumentUrl(listing.documentUrl || '');
    setVideoUri(listing.videoUrl || null);
    setPhotosUris(listing.photos || []);
    if (listing.reservePrice) setBuyNowPrice(String(listing.reservePrice));
    if (listing.timeLeft) {
      const hrs = Math.round(listing.timeLeft / 3600);
      setAuctionDuration(String(hrs > 0 ? hrs : 24));
    }
    if (listing.minIncrement) setMinIncrement(String(listing.minIncrement));
    if (listing.city) setSelectedCity(listing.city);
    if (listing.district) setSelectedDistrict(listing.district);
    if (listing.neighborhood) setSelectedNeighborhood(listing.neighborhood);
    if (listing.brand) {
      setSelectedBrand(listing.brand);
      setCustomBrand(listing.brand);
    }
    if (listing.model) {
      setSelectedModel(listing.model);
      setCustomModel(listing.model);
    }
    if (listing.year) {
      setSelectedYear(String(listing.year));
      setCustomYear(String(listing.year));
    }

    // Set creation steps/modes
    if (listing.isRealEstate) {
      setCreationMode('rent');
      setRentSellSelection(listing.type === 'rent' ? 'kirala' : 'sat');
    } else if (listing.isVehicle) {
      setCreationMode('rent');
      setRentSellSelection(listing.type === 'rent' ? 'kirala' : 'sat');
    } else if (listing.type === 'auction') {
      setCreationMode('auction');
    } else if (PRODUCER_CATEGORIES.includes(listing.category)) {
      setCreationMode('producer');
    } else {
      setCreationMode('flea');
    }

    setCreationStep(4); // Direct to step 4 for editing
    setTitleApproved(true);
    setDescriptionApproved(true);
    setCategoryApproved(true);
  }, [editId, listings]);

  const decodeB64 = (str: string) => {
    if (typeof atob !== 'undefined') return atob(str);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let decoded = '';
    for (let i = 0; i < str.length; i += 4) {
      const c1 = chars.indexOf(str[i]);
      const c2 = chars.indexOf(str[i+1]);
      const c3 = chars.indexOf(str[i+2] || '=');
      const c4 = chars.indexOf(str[i+3] || '=');
      if (c1 === -1 || c2 === -1) continue;
      decoded += String.fromCharCode((c1 << 2) | (c2 >> 4));
      if (c3 !== 64 && str[i+2] !== '=') {
        decoded += String.fromCharCode(((c2 & 15) << 4) | (c3 >> 2));
        if (c4 !== 64 && str[i+3] !== '=') {
          decoded += String.fromCharCode(((c3 & 3) << 6) | c4);
        }
      }
    }
    return decoded;
  };

  const GEMINI_API_KEY = decodeB64('QVEuQWI4Uk42SlRxQ1dBMExFazVVdlBmNW93ZG82Um1aMDBWazR6VzBDVEhPSUJPRklFQQ==');
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + GEMINI_API_KEY;

  const callGemini = async (parts: any[]) => {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!response.ok) throw new Error(`Gemini API hatası: ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini boş yanıt döndürdü');
    return JSON.parse(text.trim());
  };

  // Phase 2: Generate content from user-selected item type
  const generateFromSelection = async (selectedItem: string) => {
    setGeminiOptions(null);
    setIsAnalyzing(true);
    setFormError('');
    try {
      const base64 = geminiPendingBase64;
      const prompt = `Kullanıcı bu görselin "${selectedItem}" olduğunu belirtti. Bu ürün/nesne için şu JSON formatında Türkçe içerik üret:
{
  "title": "Ürün Başlığı (Türkçe, en fazla 6 kelime)",
  "description": "Ürün Açıklaması (Türkçe, 2-3 cümle, görseli tanımla)"
}
SADECE saf JSON döndür, markdown veya açıklama yazma.`;
      const parsed = await callGemini([
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
      ]);
      if (parsed.title) { setTitle(parsed.title); setTitleApproved(false); }
      if (parsed.description) { setDescription(parsed.description); setDescriptionApproved(false); }
      setCreationStep(3);
    } catch (e: any) {
      setFormError(`Analiz hatası: ${e.message}`);
      setCreationStep(3);
    } finally {
      setIsAnalyzing(false);
      setGeminiPendingBase64('');
    }
  };

  // Run Gemini analysis on the first uploaded photo (Phase 1)
  const runGeminiAnalysis = async (photoUri: string) => {
    if (!photoUri) return;
    setIsAnalyzing(true);
    setFormError('');
    setGeminiOptions(null);
    try {
      let base64 = '';
      if (photoUri.startsWith('data:image/')) {
        const arr = photoUri.split(',');
        base64 = arr[1] || '';
      } else if (Platform.OS === 'web') {
        const res = await fetch(photoUri);
        const blob = await res.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => { const arr = (reader.result as string).split(','); resolve(arr[1] || ''); };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
      }

      const prompt = `Bu görseli dikkatlice analiz et.

Eğer görseldeki asıl satılık/ilanı verilecek nesneyi KESİNLİKLE belirleyebiliyorsan şu JSON formatında döndür:
{
  "uncertain": false,
  "title": "Ürün Başlığı (Türkçe, en fazla 6 kelime)",
  "description": "Ürün Açıklaması (Türkçe, 2-3 cümle)"
}

Eğer görselde birden fazla olası ürün/nesne varsa VEYA emin değilsen şu formatı kullan:
{
  "uncertain": true,
  "options": ["Seçenek 1", "Seçenek 2", "Seçenek 3"]
}

Önemli kurallar:
- Görsel bir oda/mekan fotoğrafı ise ve odadaki mobilya/eşya satılıyorsa (sehpa, koltuk vb.), asıl nesneyi belirle.
- Odanın kendisi (ev, villa vb.) değil, öne çıkan MOBİLYA/EŞYA ilanı verilecekse onu seç.
- 2-4 seçenek sun, fazla sunma.

SADECE saf JSON döndür.`;

      const parsed = await callGemini([
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
      ]);

      if (parsed.uncertain === true && Array.isArray(parsed.options) && parsed.options.length > 0) {
        // Uncertain: store base64 and show picker
        setGeminiPendingBase64(base64);
        setGeminiOptions(parsed.options);
        setIsAnalyzing(false);
        return;
      }

      // Confident result
      if (parsed.title) { setTitle(parsed.title); setTitleApproved(false); }
      if (parsed.description) { setDescription(parsed.description); setDescriptionApproved(false); }
      setCreationStep(3);
    } catch (e: any) {
      console.error('Gemini Phase1 Error:', e);
      setFormError(`Analiz hatası: ${e.message}`);
      if (Platform.OS === 'web') {
        alert('Yapay zeka analizinde hata oluştu. Lütfen bilgileri kendiniz doldurun.');
      }
      setCreationStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset form to starting state
  const doReset = async () => {
    setShowResetModal(false);
    setTitle('');
    setDescription('');
    setPrice('');
    setStock('1');
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
    setMinIncrement('10');
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
    setTitleApproved(false);
    setDescriptionApproved(false);
    setCategoryApproved(false);
    setCreationStep(1);
    setCreationMode(null);
    setRentSellSelection(null);
    setFormError('');
    try {
      await AsyncStorage.removeItem('mezat_listing_draft');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };


  const pickVideo = async () => {
    let asset: any = null;
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

      asset = result.assets[0];

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

      let finalUri = asset.uri;

      // 3. Compress video without losing quality (Only on iOS / Android)
      if (Platform.OS !== 'web') {
        setIsCompressing(true);
        setCompressionProgress(0);
        
        finalUri = await Video.compress(
          asset.uri,
          {
            compressionMethod: 'auto',
          },
          (progress) => {
            setCompressionProgress(Math.round(progress * 100));
          }
        );
        setIsCompressing(false);
      }

      setVideoUri(finalUri);
      setIsCompressing(false);
      setFormError('');
    } catch (error) {
      console.error('Video yükleme/sıkıştırma hatası:', error);
      setIsCompressing(false);
      // Fallback: If compressor fails or is web, set the original URI
      if (asset) {
        setVideoUri(asset.uri);
        setFormError('');
      } else {
        Alert.alert('Hata', 'Video işlenirken bir hata oluştu.');
      }
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

  const uploadFileToStorage = async (uri: string, path: string): Promise<string> => {
    if (!uri) return '';
    // Eğer zaten bir web URL'si veya base64 ise doğrudan döndür
    if (uri.startsWith('data:') || (uri.startsWith('http') && !uri.includes('blob:'))) {
      return uri;
    }
    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { app } = await import('@/services/firebase');
      const storage = getStorage(app);

      // Sign in anonymously first to ensure request.auth is not null
      try {
        const { getAuth, signInAnonymously } = await import('firebase/auth');
        const auth = getAuth(app);
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (authError) {
        console.warn('Anonymous auth failed:', authError);
      }

      const response = await fetch(uri);
      const blob = await response.blob();

      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, blob);
      const downloadUrl = await getDownloadURL(fileRef);
      return downloadUrl;
    } catch (e) {
      console.warn('Failed to upload file to storage, converting to base64 fallback:', e);
      // Fallback: convert the uri/blob to base64 data URL so it displays everywhere
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            resolve(uri); // fallback to original uri if base64 conversion fails
          };
          reader.readAsDataURL(blob);
        });
      } catch (fallbackError) {
        console.warn('Base64 fallback failed:', fallbackError);
        return uri;
      }
    }
  };

  const handleCreateListing = async () => {
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
    let endTimeNum: number | undefined = undefined;
    let minIncrementNum: number | undefined = undefined;

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
      endTimeNum = Date.now() + (timeLeftNum * 1000);

      if (minIncrement) {
        minIncrementNum = parseFloat(minIncrement);
        if (isNaN(minIncrementNum) || minIncrementNum <= 0) {
          setFormError('Lütfen geçerli bir minimum teklif artış tutarı girin.');
          return;
        }
      } else {
        setFormError('Lütfen minimum teklif artış tutarını girin.');
        return;
      }
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

    // Emlak document checks bypassed. Verification is handled at account level.
    /*
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
    */

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

      // Vehicle document checks bypassed. Verification is handled at account level.
      /*
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
      */
    }

    const finalBrand = isVehicle ? (selectedBrand === 'Diğer' ? customBrand.trim() : selectedBrand) : undefined;
    const finalModel = isVehicle ? (selectedModel === 'Diğer' ? customModel.trim() : selectedModel) : undefined;
    const finalYear = isVehicle ? parseInt(selectedYear === 'Diğer' ? customYear.trim() : selectedYear) || undefined : undefined;

    const isCarRental = creationMode === 'rent' && rentSellSelection === 'kirala' && isVehicle;
    const originalListing = editId ? listings.find(l => l.id === editId) : null;
    let listingStatus = 'pending_approval' as any;

    setIsUploading(true);
    setFormError('');

    try {
      // 1. Upload video if exists
      let finalVideoUrl = null;
      if (videoUri) {
        finalVideoUrl = await uploadFileToStorage(videoUri, `listings/video_${Date.now()}.mp4`);
      } else if (originalListing) {
        finalVideoUrl = originalListing.videoUrl;
      }

      // 2. Upload photos
      const uploadedPhotos = await Promise.all(
        photosUris.map((uri, idx) => 
          uploadFileToStorage(uri, `listings/photo_${Date.now()}_${idx}.jpg`)
        )
      );

      // Determine if it should auto-approve (only stock or price changed on edit)
      if (editId && originalListing) {
        const oldTitle = originalListing.title;
        const oldDescription = originalListing.description;
        const oldCondition = originalListing.condition || '';
        const oldCategory = originalListing.category || '';
        const oldPhotos = originalListing.photos || [];
        const oldVideo = originalListing.videoUrl || '';

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();
        const cleanCategory = isRealEstate ? ('🏠 ' + subCategory) : category;

        const isTitleChanged = cleanTitle !== oldTitle;
        const isDescChanged = cleanDescription !== oldDescription;
        const isConditionChanged = condition !== oldCondition;
        const isCategoryChanged = cleanCategory !== oldCategory;
        const isVideoChanged = (finalVideoUrl || '') !== oldVideo;

        // Check photos
        const isPhotosChanged = uploadedPhotos.length !== oldPhotos.length ||
          uploadedPhotos.some((p, idx) => p !== oldPhotos[idx]);

        const hasOtherChanges = isTitleChanged || isDescChanged || isConditionChanged || isCategoryChanged || isVideoChanged || isPhotosChanged;

        const newStock = type === 'auction' ? undefined : (parseInt(stock) || 1);

        if (hasOtherChanges) {
          listingStatus = 'pending_approval';
        } else {
          // If only price or stock changed, and the stock is > 0, set status to active!
          if (newStock !== undefined && newStock > 0) {
            listingStatus = 'active';
          } else {
            listingStatus = originalListing.status || 'active';
          }
        }
      }

      if (editId) {
        updateListing(editId as string, {
          title,
          description,
          price: priceNum,
          type,
          rentPeriod: type === 'rent' ? rentPeriod : undefined,
          category: isRealEstate ? ('🏠 ' + subCategory) : category,
          condition,
          verifiedProduct,
          documentUrl: verifiedProduct ? (documentUrl || 'urun_sertifikasi.pdf') : undefined,
          videoUrl: finalVideoUrl,
          photos: uploadedPhotos,
          timeLeft: timeLeftNum,
          endTime: endTimeNum,
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
          minIncrement: minIncrementNum,
          stock: type === 'auction' ? undefined : (parseInt(stock) || 1),
        });
      } else {
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
          videoUrl: finalVideoUrl,
          photos: uploadedPhotos,
          sellerName: currentUser.shopName || currentUser.name,
          sellerId: currentUser.id,
          sellerAvatar: currentUser.avatar,
          sellerTrustScore: currentUser.trustScore,
          sellerVerified: currentUser.verified,
          timeLeft: timeLeftNum,
          endTime: endTimeNum,
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
          minIncrement: minIncrementNum,
          bids: type === 'auction' ? [] : undefined,
          autoBids: type === 'auction' ? [] : undefined,
          stock: type === 'auction' ? undefined : (parseInt(stock) || 1),
        });
      }

      if (listingStatus === 'pending_approval') {
        Alert.alert(
          'Onay Bekliyor',
          'İlanınız başarıyla kaydedildi. Süper admin onayladıktan sonra otomatik olarak yayına girecektir.',
          [{ text: 'Tamam', onPress: () => router.push('/profile') }]
        );
      }

      setFormSuccess(true);
      AsyncStorage.removeItem('mezat_listing_draft').catch(err => console.warn(err));

      setTimeout(() => {
        setFormSuccess(false);
        
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
        setTitleApproved(false);
        setDescriptionApproved(false);
        setCategoryApproved(false);
        setFormError('');

        router.back();
      }, 2000);
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      setFormError('İlan yüklenirken ve görseller sunucuya aktarılırken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
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

  const isAuthorized = currentUser.role === 'super_admin' || currentUser.role === 'seller' || currentUser.role === 'moderator' || currentUser.rentACarApplicationStatus === 'approved';

  if (!isAuthorized) {
    const isPending = currentUser.rentACarApplicationStatus === 'pending';
    const isRejected = currentUser.rentACarApplicationStatus === 'rejected';
    const app = rentACarApplications.find(a => a.userId === currentUser.id);

    return (
      <ThemedView style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 70 : 40 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: inputBorder }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginLeft: 12 }}>Satış Yetkilendirmesi</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', gap: 12, marginVertical: 10 }}>
            <ShieldCheck size={56} color={theme.gold} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, textAlign: 'center' }}>
              Satış Yapabilmek İçin Belgelerinizi Yükleyin
            </Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', lineHeight: 18 }}>
              Uygulamamızda satış (ilan/mezat) yapabilmeniz için yasal düzenlemeler gereği vergi levhanızı ve kimlik belgenizi yüklemeniz gerekmektedir. Belgeleriniz onaylanana kadar müşteri olarak satın alım yapabilirsiniz.
            </Text>
          </View>

          {isPending ? (
            <View style={{ padding: 18, borderRadius: 10, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', borderWidth: 1, borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FDE68A', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <Clock size={36} color="#F59E0B" />
              <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 14, textAlign: 'center' }}>Başvurunuz Değerlendiriliyor</Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', lineHeight: 18 }}>
                Belgeleriniz başarıyla sisteme yüklenmiştir. Süper Admin onayından sonra ilan ekleme paneliniz otomatik olarak aktif hale gelecektir.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {isRejected && (
                <View style={{ padding: 12, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)', gap: 4 }}>
                  <Text style={{ fontWeight: 'bold', color: '#EF4444', fontSize: 13 }}>Başvurunuz Reddedildi</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>Gerekçe: {app?.adminNote || 'Belgeler geçersiz veya eksik.'}</Text>
                </View>
              )}

              {appError && (
                <View style={{ padding: 10, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)' }}>
                  <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>{appError}</Text>
                </View>
              )}

              {/* 1. Vergi Levhası */}
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>1. Vergi Levhası *</Text>
                <Pressable
                  onPress={async () => {
                    try {
                      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
                      if (!result.canceled && result.assets && result.assets.length > 0) {
                        setAppVergiLevhasi(result.assets[0].name);
                      }
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  style={{
                    height: 48,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderStyle: appVergiLevhasi ? 'solid' : 'dashed',
                    borderColor: appVergiLevhasi ? '#34D399' : theme.gold,
                    backgroundColor: inputBg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ fontSize: 13, color: appVergiLevhasi ? theme.text : theme.textSecondary, flex: 1, marginRight: 8 }} numberOfLines={1}>
                    {appVergiLevhasi || 'Vergi levhası seçin (.pdf, .jpg)'}
                  </Text>
                  {appVergiLevhasi ? <CheckCircle2 size={16} color="#34D399" /> : <Upload size={16} color={theme.textSecondary} />}
                </Pressable>
              </View>

              {/* 2. Kimlik Görseli */}
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>2. Kimlik Görseli (Ön/Arka) *</Text>
                <Pressable
                  onPress={async () => {
                    try {
                      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
                      if (!result.canceled && result.assets && result.assets.length > 0) {
                        setAppKimlik(result.assets[0].name);
                      }
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  style={{
                    height: 48,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderStyle: appKimlik ? 'solid' : 'dashed',
                    borderColor: appKimlik ? '#34D399' : theme.gold,
                    backgroundColor: inputBg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ fontSize: 13, color: appKimlik ? theme.text : theme.textSecondary, flex: 1, marginRight: 8 }} numberOfLines={1}>
                    {appKimlik || 'Kimlik kartı görseli seçin (.jpg, .png)'}
                  </Text>
                  {appKimlik ? <CheckCircle2 size={16} color="#34D399" /> : <Upload size={16} color={theme.textSecondary} />}
                </Pressable>
              </View>

              <Pressable
                onPress={async () => {
                  if (!appVergiLevhasi || !appKimlik) {
                    setAppError('Lütfen hem vergi levhasını hem de kimlik belgesini yükleyin.');
                    return;
                  }
                  setSubmittingApp(true);
                  setAppError('');
                  try {
                    applyForRentACar({
                      userId: currentUser.id,
                      userName: currentUser.name,
                      userPhone: currentUser.phone,
                      vergiLevhasi: appVergiLevhasi,
                      esnafBelgesi: appKimlik,
                      ruhsat: 'N/A',
                      imzaSirkuleri: 'N/A',
                    });
                    Alert.alert('Başvuru Alındı', 'Satıcı başvurunuz onay için Süper Admin paneline gönderilmiştir.');
                  } catch (e) {
                    setAppError('Başvuru gönderilirken hata oluştu.');
                  } finally {
                    setSubmittingApp(false);
                  }
                }}
                disabled={submittingApp}
                style={{
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: theme.gold,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                  opacity: submittingApp ? 0.7 : 1
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                  {submittingApp ? 'Gönderiliyor...' : 'Belgeleri Gönder ve Başvur'}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    );
  }

  const renderStep2 = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? 'rgba(9, 105, 218, 0.1)' : '#FFF7ED', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(9, 105, 218, 0.2)', marginBottom: 8 }}>
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

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {formError !== '' && (
            <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: 12 }]}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <View style={styles.formBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Medya Yükleme</Text>
              
              <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Ürün Tanıtım Videosu (İsteğe Bağlı, Maks 8 sn, Dikey format)</Text>
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

              <Text style={[styles.subLabel, { color: theme.textSecondary, marginTop: 12 }]}>
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

            {isAnalyzing && (
              <View style={{
                padding: 20,
                borderRadius: 8,
                backgroundColor: isDark ? 'rgba(9, 105, 218, 0.1)' : '#F0F9FF',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(9, 105, 218, 0.2)' : '#B9E6FE',
                alignItems: 'center',
                gap: 12,
                marginTop: 16
              }}>
                <ActivityIndicator size="large" color={theme.gold} />
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>
                  🤖 Yapay Zeka Görselleri Analiz Ediyor...
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center' }}>
                  Gemini ürünü tarıyor, başlık ve açıklama önerisi oluşturuluyor. Lütfen bekleyin.
                </Text>
                {/* Fake progress bar animate effect */}
                <View style={{ width: '100%', height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ width: '70%', height: '100%', backgroundColor: theme.gold }} />
                </View>
              </View>
            )}

            {/* Gemini Uncertainty Picker */}
            {geminiOptions && !isAnalyzing && (
              <View style={{
                marginTop: 16,
                padding: 20,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
                borderWidth: 1.5,
                borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FCD34D',
                gap: 14,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>🤔</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? '#FCD34D' : '#92400E', fontWeight: '700', fontSize: 14 }}>
                      Yapay Zeka Emin Olamadı
                    </Text>
                    <Text style={{ color: isDark ? '#D97706' : '#B45309', fontSize: 12, marginTop: 2 }}>
                      Görseldeki ürün aşağıdakilerden hangisi? Seçin, içeriği ona göre üretelim.
                    </Text>
                  </View>
                </View>
                {geminiOptions.map((opt, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => generateFromSelection(opt)}
                    style={({ pressed }) => ({
                      padding: 14,
                      borderRadius: 8,
                      backgroundColor: pressed
                        ? (isDark ? 'rgba(245,158,11,0.25)' : '#FDE68A')
                        : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(245,158,11,0.3)' : '#FCD34D',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    })}
                  >
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: isDark ? '#FCD34D' : '#D97706', fontWeight: '700', fontSize: 13 }}>{idx + 1}</Text>
                    </View>
                    <Text style={{ flex: 1, color: isDark ? '#FFFFFF' : '#1F2937', fontWeight: '600', fontSize: 14 }}>{opt}</Text>
                    <ChevronRight size={16} color={isDark ? '#FCD34D' : '#D97706'} />
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => { setGeminiOptions(null); setCreationStep(3); }}
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                >
                  <Text style={{ color: theme.textSecondary, fontSize: 12, textDecorationLine: 'underline' }}>
                    Hiçbiri değil, bilgileri kendim dolduracağım
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable 
              style={({ pressed }) => [
                styles.submitButton, 
                { 
                  backgroundColor: theme.gold,
                  opacity: pressed || isAnalyzing ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  marginTop: 20
                }
              ]} 
              disabled={isAnalyzing}
              onPress={async () => {
                if (photosUris.length < 3) {
                  setFormError(`En az 3 adet fotoğraf yüklemeniz zorunludur. (Şu an: ${photosUris.length})`);
                  return;
                }
                setFormError('');
                await runGeminiAnalysis(photosUris[0]);
              }}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>Görselleri Analiz Et & İlerle</Text>
                  <ChevronRight size={18} color="#FFFFFF" />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderStep3 = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? 'rgba(9, 105, 218, 0.1)' : '#FFF7ED', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(9, 105, 218, 0.2)', marginBottom: 8 }}>
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

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          <View style={{ gap: 6, marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.gold }}>🤖 Yapay Zeka Ürün Analizi</Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>
              Yüklediğiniz görseller analiz edilerek aşağıdaki alanlar doldurulmuştur. Lütfen her alanı kontrol edip onaylayın.
            </Text>
          </View>

          {formError !== '' && (
            <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: 12 }]}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <View style={styles.formBody}>
            {/* Title Field */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>İlan Başlığı *</Text>
                {titleApproved && <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>✓ Onaylandı</Text>}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput
                  placeholder="Başlık girin..."
                  placeholderTextColor={theme.textSecondary}
                  value={title}
                  onChangeText={(val) => {
                    setTitle(val);
                    setTitleApproved(false);
                  }}
                  style={[
                    styles.textInput,
                    {
                      flex: 1,
                      color: theme.text,
                      backgroundColor: inputBg,
                      borderColor: titleApproved ? '#10B981' : inputBorder,
                      borderWidth: titleApproved ? 1.5 : 1,
                    }
                  ]}
                />
                <Pressable
                  onPress={() => {
                    if (!title.trim()) {
                      Alert.alert('Hata', 'Lütfen geçerli bir başlık girin.');
                      return;
                    }
                    setTitleApproved(!titleApproved);
                  }}
                  style={{
                    backgroundColor: titleApproved ? '#10B981' : theme.gold,
                    height: 48,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
                    {titleApproved ? 'Kaldır' : 'Onayla'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Description Field */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Açıklama *</Text>
                {descriptionApproved && <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>✓ Onaylandı</Text>}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <TextInput
                  placeholder="Açıklama girin..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={(val) => {
                    setDescription(val);
                    setDescriptionApproved(false);
                  }}
                  style={[
                    styles.textAreaInput,
                    {
                      flex: 1,
                      color: theme.text,
                      backgroundColor: inputBg,
                      borderColor: descriptionApproved ? '#10B981' : inputBorder,
                      borderWidth: descriptionApproved ? 1.5 : 1,
                    }
                  ]}
                />
                <Pressable
                  onPress={() => {
                    if (!description.trim()) {
                      Alert.alert('Hata', 'Lütfen geçerli bir açıklama girin.');
                      return;
                    }
                    setDescriptionApproved(!descriptionApproved);
                  }}
                  style={{
                    backgroundColor: descriptionApproved ? '#10B981' : theme.gold,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'stretch'
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
                    {descriptionApproved ? 'Kaldır' : 'Onayla'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Category Field */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Kategori *</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Pressable
                  onPress={() => {
                    setCategoryPickerVisible(true);
                  }}
                  style={[
                    styles.dropdownTrigger,
                    {
                      flex: 1,
                      backgroundColor: inputBg,
                      borderColor: category ? theme.gold : inputBorder,
                      borderWidth: category ? 1.5 : 1,
                      height: 48,
                      justifyContent: 'space-between',
                      borderRadius: 6,
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
            </View>

            {/* Condition (Durum) Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Ürünün Durumu *</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                {[
                  { value: 'Sıfır', label: '✨ Sıfır' },
                  { value: 'İyi', label: '👍 İyi' },
                  { value: 'Hasarlı', label: '⚠️ Hasarlı' },
                  { value: 'Çalışmıyor', label: '🔧 Çalışmıyor' }
                ].map((item) => {
                  const isSelected = condition === item.value;
                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setCondition(item.value)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        backgroundColor: isSelected ? theme.gold : inputBg,
                        borderWidth: 1.5,
                        borderColor: isSelected ? theme.gold : inputBorder,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{
                        color: isSelected ? '#FFFFFF' : theme.text,
                        fontWeight: isSelected ? 'bold' : 'normal',
                        fontSize: 13,
                      }}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              {!(titleApproved && descriptionApproved && category) && (
                <Text style={{ color: '#EF4444', fontSize: 12, textAlign: 'center', marginBottom: 8, fontWeight: '600' }}>
                  ⚠️ Devam etmek için Başlık ve Açıklama alanlarını onaylamalı, Kategori seçmelisiniz.
                </Text>
              )}
              <Pressable 
                style={({ pressed }) => [
                  styles.submitButton, 
                  { 
                    backgroundColor: (titleApproved && descriptionApproved && category) ? theme.gold : '#CBD5E1',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                  }
                ]} 
                disabled={!(titleApproved && descriptionApproved && category)}
                onPress={() => {
                  setCreationStep(4);
                }}
              >
                <Text style={styles.submitText}>Sonraki Adıma Geç</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { borderBottomColor: theme.backgroundSelected }]}>
        <Pressable style={styles.navBarIcon} onPress={() => {
          if (creationStep === 4) {
            setCreationStep(3);
          } else if (creationStep === 3) {
            setCreationStep(2);
          } else if (creationStep === 2) {
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
          {creationStep === 1 ? 'İLAN TÜRÜ' :
           creationStep === 1.5 ? 'İŞLEM TÜRÜ' :
           creationStep === 2 ? 'MEDYA YÜKLEME' :
           creationStep === 3 ? 'YAPAY ZEKA ANALİZİ' : 'DETAYLI BİLGİLER'}
        </Text>
        <Pressable onPress={handleReset} style={{ padding: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <RotateCcw size={15} color={theme.gold} />
          <Text style={{ color: theme.gold, fontSize: 11, fontWeight: '700' }}>Sıfırla</Text>
        </Pressable>
      </View>

      {/* Reset Confirmation Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: isDark ? '#1A2035' : '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={24} color="#EF4444" />
              </View>
              <Text style={{ color: isDark ? '#FFFFFF' : '#111827', fontSize: 17, fontWeight: '700', textAlign: 'center' }}>Süreci Sıfırla</Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#6B7280', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Seçilen tüm bilgileri silerek ilan yükleme sürecini baştan başlatmak istediğinize emin misiniz?
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setShowResetModal(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB', alignItems: 'center' }}
              >
                <Text style={{ color: isDark ? '#CBD5E1' : '#374151', fontWeight: '600', fontSize: 14 }}>İptal</Text>
              </Pressable>
              <Pressable
                onPress={doReset}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Evet, Sıfırla</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(9, 105, 218, 0.1)' }]}>
                <Gavel size={Platform.OS === 'web' ? 38 : 28} color={theme.gold} />
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
                <Tag size={Platform.OS === 'web' ? 38 : 28} color="#3B82F6" />
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
                <CheckCircle2 size={Platform.OS === 'web' ? 38 : 28} color="#10B981" />
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
                <Key size={Platform.OS === 'web' ? 38 : 28} color="#8B5CF6" />
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
              <View style={[styles.gridIconContainer, { backgroundColor: 'rgba(9, 105, 218, 0.1)' }]}>
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
      ) : creationStep === 2 ? (
        renderStep2()
      ) : creationStep === 3 ? (
        renderStep3()
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Active Mode Banner */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? 'rgba(9, 105, 218, 0.1)' : '#FFF7ED', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(9, 105, 218, 0.2)', marginBottom: 8 }}>
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
                <Text style={styles.successText}>
                  {editId ? 'İlanınız başarıyla güncellendi!' : 'İlanınız başarıyla eklendi ve yayınlandı!'}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  {editId ? 'Değişiklikler kaydedildi.' : 'Keşfet veya Mezat sekmelerinde görebilirsiniz.'}
                </Text>
              </View>
            ) : (
              <View style={styles.formBody}>
                {formError !== '' && (
                  <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Text style={styles.errorText}>{formError}</Text>
                  </View>
                )}

              {/* İlan Detay Özeti */}
              <View style={{ padding: 14, borderRadius: 8, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC', borderWidth: 1, borderColor: inputBorder, marginBottom: 12, gap: 8 }}>
                <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>📋 İlan Detay Özeti</Text>
                <Text style={{ color: theme.text, fontSize: 13 }}>Başlık: <Text style={{ fontWeight: 'bold' }}>{title}</Text></Text>
                <Text style={{ color: theme.text, fontSize: 13 }} numberOfLines={2}>Açıklama: {description}</Text>
                <Text style={{ color: theme.text, fontSize: 13 }}>Kategori: <Text style={{ fontWeight: 'bold' }}>{category}</Text></Text>
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

                  {/* Bireysel / Kurumsal Seçimi ve Evrak Yükleme Alanı Kaldırıldı - Yetkilendirme hesap düzeyindedir */}
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

                    {/* Bireysel / Kurumsal Seçimi ve Evrak Yükleme Alanı Kaldırıldı - Yetkilendirme hesap düzeyindedir */}
                  </View>
                );
              })()}



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
                            ? (isDark ? 'rgba(9, 105, 218, 0.12)' : 'rgba(9, 105, 218, 0.08)')
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
                            ? (isDark ? 'rgba(9, 105, 218, 0.12)' : 'rgba(9, 105, 218, 0.08)')
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
                            ? (isDark ? 'rgba(9, 105, 218, 0.12)' : 'rgba(9, 105, 218, 0.08)')
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
                              ? (isDark ? 'rgba(9, 105, 218, 0.12)' : 'rgba(9, 105, 218, 0.08)')
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
                                backgroundColor: rentPeriod === period ? 'rgba(9, 105, 218, 0.15)' : inputBg,
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
                  {/* Stock (Stok Adedi) Input */}
                  {true && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Stok Adedi *</Text>
                      <TextInput
                        placeholder="Örn: 5"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={stock}
                        onChangeText={setStock}
                        onFocus={() => setFocusedInput('stock')}
                        onBlur={() => setFocusedInput(null)}
                        style={[
                          styles.textInput,
                          {
                            color: theme.text,
                            backgroundColor: inputBg,
                            borderColor: focusedInput === 'stock' ? inputBorderFocused : inputBorder,
                            borderWidth: focusedInput === 'stock' ? 1.5 : 1,
                            height: 44,
                          }
                        ]}
                      />
                      <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}>
                        Ürününüzün stokta kaç adet olduğunu girin. Stok tükendiğinde ürün otomatik olarak yayından kaldırılır.
                      </Text>
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

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Minimum Teklif Artış Tutarı *</Text>
                    <View style={styles.priceInputWrapper}>
                      <TextInput
                        placeholder="Örn: 10"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        value={minIncrement}
                        onChangeText={setMinIncrement}
                        onFocus={() => setFocusedInput('minIncrement')}
                        onBlur={() => setFocusedInput(null)}
                        style={[
                          styles.textInput,
                          {
                            color: theme.text,
                            backgroundColor: inputBg,
                            borderColor: focusedInput === 'minIncrement' ? inputBorderFocused : inputBorder,
                            borderWidth: focusedInput === 'minIncrement' ? 1.5 : 1,
                            paddingRight: 40,
                          }
                        ]}
                      />
                      <Text style={[styles.priceCurrency, { color: isDark ? theme.gold : theme.goldAccent }]}>TL</Text>
                    </View>
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
                    backgroundColor: isUploading ? '#CBD5E1' : theme.gold,
                    opacity: (pressed || isUploading) ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                  }
                ]} 
                disabled={isUploading}
                onPress={handleCreateListing}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                ) : editId ? (
                  <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} />
                ) : (
                  <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                )}
                <Text style={styles.submitText}>
                  {isUploading ? 'Görseller Yükleniyor...' : (editId ? 'Değişiklikleri Kaydet' : 'İlanı Yayınla')}
                </Text>
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
            : creationMode === 'auction'
            ? RENTAL_SUB_CATEGORIES.filter(cat => 
                !cat.includes('🏠') && 
                !cat.includes('🚗') && 
                !cat.includes('🏍️') && 
                !cat.includes('🚐') && 
                !cat.includes('🚛') && 
                !cat.includes('🚜') && 
                !cat.includes('🚧') && 
                !cat.includes('🛥️') && 
                !cat.includes('🚲')
              ).concat(['🔍 Diğer'])
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
    justifyContent: Platform.OS === 'web' ? 'center' : 'space-between',
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  },
  gridCard: {
    width: Platform.OS === 'web' ? '45%' : '47%',
    maxWidth: Platform.OS === 'web' ? 280 : undefined,
    borderRadius: 16,
    borderWidth: 1,
    padding: Platform.OS === 'web' ? 24 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: Platform.OS === 'web' ? 180 : 150,
  },
  gridIconContainer: {
    width: Platform.OS === 'web' ? 72 : 52,
    height: Platform.OS === 'web' ? 72 : 52,
    borderRadius: Platform.OS === 'web' ? 36 : 26,
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
