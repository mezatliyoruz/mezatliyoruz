import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  useWindowDimensions,
  Platform,
  Text,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Animated as RNAnimated,
  Switch,
} from 'react-native';
import { useAppStore, Listing, UserProfile, AdPricing, Ad, ModeratorPermissions, getListingSeoUrl } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { User, ShieldCheck, Heart, Clock, ChevronRight, Tag, Plus, LogOut, Car, ShieldAlert, Home, Key, Store, Briefcase, Camera, X, Fingerprint, Star, FileText, ShoppingCart, MessageSquare, Gavel, Megaphone, Pencil, Trash2, Pause, Play, Copy, Truck } from 'lucide-react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'react-native-compressor';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useVideoPlayer, VideoView } from 'expo-video';
import { formatTime } from '@/utils/time';
import Svg, { Path, Circle, Rect, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { ABOUT_US_TEXT, DELIVERY_RETURN_TEXT, PRIVACY_POLICY_TEXT, DISTANCE_SELLING_TEXT } from '@/constants/legal';
import CargoTrackingModal from '@/components/cargo-tracking-modal';

const getUserBadges = (user: any) => {
  const state = useAppStore.getState();
  const accountPair = state.accounts[user.phone] || {};
  const sellerAccount = (accountPair.seller || {}) as any;

  const shopName = user.shopName || sellerAccount.shopName || '';
  const displayName = user.name || '';
  const nameLower = (shopName + ' ' + displayName).toLowerCase();
  const badges = [];

  const isRealEstate = nameLower.includes('emlak') || sellerAccount.isRealEstate;
  const isVehicle = nameLower.includes('galeri') || user.isRentACarApproved || sellerAccount.isRentACarApproved;
  const isRent = user.isRentACarApproved || sellerAccount.isRentACarApproved;
  const isProducer = nameLower.includes('üretici') || nameLower.includes('bahçe') || nameLower.includes('atölye') || nameLower.includes('üretim') || nameLower.includes('bal') || nameLower.includes('zeytin');
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
  
  if (badges.length === 0 && (user.shopName || sellerAccount.shopName)) {
    badges.push({
      label: 'KURUMSAL',
      name: '🏢 Kurumsal Üye',
      description: 'Bu üye resmi belgelerini sunmuş ve doğrulanmış kurumsal bir firmadır.',
      image: require('@/assets/images/badge_kurumsal.png'),
      color: '#EC4899',
    });
  }

  if (user.rentACarApplicationStatus === 'approved' || user.role === 'seller' || user.role === 'super_admin') {
    badges.push({
      label: 'ONAYLI SATICI',
      name: '✅ Onaylı Satıcı',
      description: 'Bu kullanıcının vergi levhası ve kimlik bilgileri onaylanmış, platformda satış yapmaya yetkili satıcıdır.',
      image: require('@/assets/images/badge_dogrulanmis.png'),
      color: '#10B981',
    });
  }

  return badges;
};

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { openAdModal } = useLocalSearchParams<{ openAdModal?: string }>();
  useEffect(() => {
    if (openAdModal === 'true') {
      setAdModalVisible(true);
    }
  }, [openAdModal]);



  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const inputBg = isDark ? '#1E293B' : '#F1F5F9';
  const inputBorder = isDark ? '#334155' : '#CBD5E1';
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const { currentUser, listings, deleteListing, loginAccount, registerAccount, logoutAccount, rentACarApplications, approveRentACarApplication, rejectRentACarApplication, orders, updateOrderStatus, updateProfileAvatar, stories, addStory, isBiometricsEnabled, setBiometricsEnabled, addReview, reviews, createChat, setCartModalVisible, setCheckoutStep, adPricing, updateAdPricing, ads, deleteAd, createAd, updateAd, toggleAdDurationOption, publishCollage, draftCollage, updateDraftCollage, accounts, assignModerator, removeModerator, updateListing, addNotification, customerIssues, updateIssueStatus, addOrder } = useAppStore();

  const hasCMSPerm = currentUser?.role === 'super_admin' || currentUser?.moderatorPermissions?.isSuperAdmin || currentUser?.moderatorPermissions?.canManageCMS;
  const hasFirmsPerm = currentUser?.role === 'super_admin' || currentUser?.moderatorPermissions?.isSuperAdmin || currentUser?.moderatorPermissions?.canApproveFirms;
  const hasPricingPerm = currentUser?.role === 'super_admin' || currentUser?.moderatorPermissions?.isSuperAdmin || currentUser?.moderatorPermissions?.canManageAds;
  const hasListingPerm = currentUser?.role === 'super_admin' || currentUser?.moderatorPermissions?.isSuperAdmin || currentUser?.moderatorPermissions?.canModerateListings;
  const hasIssuesPerm = currentUser?.role === 'super_admin' || currentUser?.moderatorPermissions?.isSuperAdmin || currentUser?.moderatorPermissions?.canManageIssues;

  // Search states for moderation and firms
  const [modListingSearch, setModListingSearch] = useState('');
  const [modFirmAppNote, setModFirmAppNote] = useState<{[appId: string]: string}>({});

  // Ad states
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [selectedAdListingId, setSelectedAdListingId] = useState('');
  const [selectedAdDuration, setSelectedAdDuration] = useState<'1day' | '3days' | '1week' | '1month'>('1day');
  const [newAdVideoUri, setNewAdVideoUri] = useState<string | null>(null);
  const [isAdCompressing, setIsAdCompressing] = useState(false);
  const [adCompressionProgress, setAdCompressionProgress] = useState(0);
  const [isAdUploading, setIsAdUploading] = useState(false);
  const [adUploadProgress, setAdUploadProgress] = useState(0);
  const [newAdRemoteVideoUrl, setNewAdRemoteVideoUrl] = useState<string | null>(null);

  // Cargo tracking states
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [selectedTrackingNum, setSelectedTrackingNum] = useState('');
  const [selectedTrackingCarrier, setSelectedTrackingCarrier] = useState('');
  const [adminPricing, setAdminPricing] = useState<AdPricing>(adPricing);
  const [adDestinationType, setAdDestinationType] = useState<'listing' | 'profile'>('listing');
  const [customAdTitle, setCustomAdTitle] = useState('');
  const [customAdDescription, setCustomAdDescription] = useState('');

  // Edit Ad states
  const [editingAd, setEditingAd] = useState<any>(null);
  const [editAdModalVisible, setEditAdModalVisible] = useState(false);
  const [editAdDestinationType, setEditAdDestinationType] = useState<'listing' | 'profile'>('listing');
  const [editAdSelectedListingId, setEditAdSelectedListingId] = useState('');
  const [editAdTitle, setEditAdTitle] = useState('');
  const [editAdDescription, setEditAdDescription] = useState('');
  const [editAdVideoUri, setEditAdVideoUri] = useState<string | null>(null);
  const [isAdEditingCompressing, setIsAdEditingCompressing] = useState(false);
  const [adEditingCompressionProgress, setAdEditingCompressionProgress] = useState(0);
  const [isAdEditingUploading, setIsAdEditingUploading] = useState(false);
  const [adEditingUploadProgress, setAdEditingUploadProgress] = useState(0);
  const [editAdRemoteVideoUrl, setEditAdRemoteVideoUrl] = useState<string | null>(null);
  const [isUploadingEditVideo, setIsUploadingEditVideo] = useState(false);

  const [adminActiveTab, setAdminActiveTab] = useState<'admin' | 'personal'>('admin');
  const [personalActiveTab, setPersonalActiveTab] = useState<'listings' | 'bought' | 'sales' | 'won'>('listings');
  const [adminPanelActiveTab, setAdminPanelActiveTab] = useState<'cms' | 'pricing' | 'moderation' | 'firms' | 'issues' | 'mods' | 'finance'>('cms');

  // Direct CMS Edit States
  const [selectedCMSBoxKey, setSelectedCMSBoxKey] = useState<'leftVertical' | 'rightTop' | 'rightBottom'>('leftVertical');
  const [cmsImagesWeb, setCmsImagesWeb] = useState<string[]>(['']);
  const [cmsImagesMobile, setCmsImagesMobile] = useState<string[]>(['']);
  const [cmsTitles, setCmsTitles] = useState<string[]>(['']);
  const [cmsLinks, setCmsLinks] = useState<string[]>(['']);
  const [cmsLabels, setCmsLabels] = useState<string[]>(['']);
  const [isSavingCMS, setIsSavingCMS] = useState(false);

  // Load draft collage into local CMS edit state when active box or collage changes
  useEffect(() => {
    if (draftCollage) {
      const targetBox = draftCollage[selectedCMSBoxKey] || { images: [], imagesWeb: [], imagesMobile: [], titles: [], links: [], labels: [] };
      
      let len = 1;
      if (selectedCMSBoxKey === 'leftVertical') {
        const webLen = targetBox.imagesWeb?.length || 0;
        const mobLen = targetBox.imagesMobile?.length || 0;
        const imgLen = targetBox.images?.length || 0;
        len = Math.max(webLen, mobLen, imgLen, 1);
      }

      const imgWebArr = Array(len).fill('');
      const imgMobileArr = Array(len).fill('');
      const titleArr = Array(len).fill('');
      const linkArr = Array(len).fill('');
      const labelArr = Array(len).fill('');

      for (let i = 0; i < len; i++) {
        imgWebArr[i] = targetBox.imagesWeb?.[i] || targetBox.images?.[i] || '';
        imgMobileArr[i] = targetBox.imagesMobile?.[i] || targetBox.images?.[i] || '';
        titleArr[i] = targetBox.titles?.[i] || '';
        linkArr[i] = targetBox.links?.[i] || targetBox.link || '';
        labelArr[i] = targetBox.labels?.[i] || '';
      }

      setCmsImagesWeb(imgWebArr);
      setCmsImagesMobile(imgMobileArr);
      setCmsTitles(titleArr);
      setCmsLinks(linkArr);
      setCmsLabels(labelArr);
    }
  }, [draftCollage, selectedCMSBoxKey]);

  // Suspension Reason Modal states
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [selectedSuspendListing, setSelectedSuspendListing] = useState<Listing | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendMode, setSuspendMode] = useState<'suspend' | 'reject'>('suspend');
  const [selectedModListing, setSelectedModListing] = useState<Listing | null>(null);

  // Moderator management states
  const [modSearchName, setModSearchName] = useState('');
  const [modSelectedPhone, setModSelectedPhone] = useState('');
  const [modPerms, setModPerms] = useState({
    canModerateListings: false,
    canApproveFirms: false,
    canManageAds: false,
    canManageIssues: false,
    canManageCMS: false,
    isSuperAdmin: false
  });
  // For inline moderator permission editing
  const [expandedModPhone, setExpandedModPhone] = useState<string | null>(null);
  const [editingModPerms, setEditingModPerms] = useState<Record<string, ModeratorPermissions>>({});

  useEffect(() => {
    setAdminPricing(adPricing);
  }, [adPricing]);

  const handleOpenSuspendModal = (listing: Listing, mode: 'suspend' | 'reject' = 'suspend') => {
    setSelectedSuspendListing(listing);
    setSuspendReason('');
    setSuspendMode(mode);
    setSuspendModalVisible(true);
  };

  const handleConfirmSuspend = () => {
    if (!selectedSuspendListing) return;
    if (!suspendReason.trim()) {
      alert('Lütfen bir gerekçe girin.');
      return;
    }

    const newStatus = suspendMode === 'reject' ? 'rejected' : 'suspended';
    
    updateListing(selectedSuspendListing.id, {
      status: newStatus,
      rejectionReason: suspendReason.trim()
    });

    // Notify listing owner
    addNotification({
      userId: selectedSuspendListing.sellerId || 'user',
      title: suspendMode === 'reject' ? 'İlanınız Reddedildi ❌' : 'İlanınız Yayından Kaldırıldı ⚠️',
      message: suspendMode === 'reject'
        ? `"${selectedSuspendListing.title}" başlıklı yeni ilanınız yönetici tarafından reddedildi. Gerekçe: ${suspendReason.trim()}. İlanınızı düzenleyerek tekrar onaya gönderebilirsiniz.`
        : `"${selectedSuspendListing.title}" başlıklı ilanınız yönetici tarafından yayından kaldırıldı. Gerekçe: ${suspendReason.trim()}. İlanınızı düzenleyerek yeniden yayınlaya başvurabilirsiniz.`,
      type: 'system'
    });

    setSuspendModalVisible(false);
    if (suspendMode === 'reject') {
      alert('İlan reddedildi ve kullanıcıya bildirim gönderildi.');
    } else {
      alert('İlan yayından kaldırıldı ve kullanıcıya bildirim gönderildi.');
    }
  };

  const assignableUsers = useMemo(() => {
    const list: { name: string; phone: string; currentRole: string }[] = [];
    Object.keys(accounts).forEach((phone) => {
      const roles = accounts[phone];
      // Find any profile in this phone entry
      const baseProfile = roles.user || roles.seller || roles.customer || roles.moderator;
      if (baseProfile && baseProfile.role !== 'super_admin') {
        list.push({
          name: baseProfile.name,
          phone: baseProfile.phone,
          currentRole: baseProfile.role
        });
      }
    });
    return list;
  }, [accounts]);

  const activeModerators = useMemo(() => {
    const list: UserProfile[] = [];
    Object.keys(accounts).forEach((phone) => {
      const roles = accounts[phone];
      if (roles.moderator) {
        list.push(roles.moderator);
      }
    });
    return list;
  }, [accounts]);



  const changeProfileAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        updateProfileAvatar(selectedImage.uri);
        Alert.alert('Başarılı', 'Profil resminiz başarıyla güncellendi.');
      }
    } catch (error) {
      console.error('Profil resmi seçme hatası:', error);
      Alert.alert('Hata', 'Profil resmi seçilirken bir hata oluştu.');
    }
  };

  const handlePickAdVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermelisiniz.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        videoMaxDuration: 8,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setNewAdVideoUri(asset.uri);
        setNewAdRemoteVideoUrl(null);
        setIsAdCompressing(true);
        setAdCompressionProgress(0);
        setAdUploadProgress(0);

        let finalUri = asset.uri;

        if (Platform.OS !== 'web') {
          try {
            finalUri = await Video.compress(
              asset.uri,
              {
                compressionMethod: 'auto',
              },
              (progress) => {
                setAdCompressionProgress(Math.round(progress * 100));
              }
            );
          } catch (compressErr) {
            console.warn('Video compression failed, using original:', compressErr);
          }
        }
        setIsAdCompressing(false);

        // Immediately start upload
        setIsAdUploading(true);
        try {
          const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
          const { app } = await import('@/services/firebase');
          const storage = getStorage(app);
          
          const filename = `ad_video_${currentUser?.id || 'guest'}_${Date.now()}.mp4`;
          const response = await fetch(finalUri);
          const blob = await response.blob();
          const fileRef = ref(storage, `ads/${filename}`);
          
          const uploadTask = uploadBytesResumable(fileRef, blob);
          
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setAdUploadProgress(progress);
            }, 
            (error) => {
              console.error('Upload failed:', error);
              setIsAdUploading(false);
              Alert.alert('Hata', 'Video sunucuya yüklenirken hata oluştu.');
            }, 
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setNewAdRemoteVideoUrl(downloadUrl);
              setIsAdUploading(false);
            }
          );
        } catch (uploadErr: any) {
          console.error('Firebase setup/upload error:', uploadErr);
          setIsAdUploading(false);
          Alert.alert('Hata', `Video yüklenirken hata oluştu: ${uploadErr.message || uploadErr}`);
        }
      }
    } catch (err) {
      console.warn('Ad video picking/compression/upload error:', err);
      setIsAdCompressing(false);
      setIsAdUploading(false);
      Alert.alert('Hata', 'Video işlenirken bir hata oluştu.');
    }
  };

  const handlePickEditAdVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeri erişim izni gerekiyor.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setEditAdVideoUri(asset.uri);
        setEditAdRemoteVideoUrl(null);
        setIsAdEditingCompressing(true);
        setAdEditingCompressionProgress(0);
        setAdEditingUploadProgress(0);

        let finalUri = asset.uri;
        if (Platform.OS !== 'web') {
          try {
            finalUri = await Video.compress(
              asset.uri,
              {
                compressionMethod: 'auto',
              },
              (progress) => {
                setAdEditingCompressionProgress(Math.round(progress * 100));
              }
            );
          } catch (compressErr) {
            console.warn('Video compression failed for edit, using original:', compressErr);
          }
        }
        setIsAdEditingCompressing(false);

        // Immediately start upload
        setIsAdEditingUploading(true);
        try {
          const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
          const { app } = await import('@/services/firebase');
          const storage = getStorage(app);
          
          const filename = `ad_video_${currentUser?.id || 'guest'}_${Date.now()}.mp4`;
          const response = await fetch(finalUri);
          const blob = await response.blob();
          const fileRef = ref(storage, `ads/${filename}`);
          
          const uploadTask = uploadBytesResumable(fileRef, blob);
          
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setAdEditingUploadProgress(progress);
            }, 
            (error) => {
              console.error('Edit upload failed:', error);
              setIsAdEditingUploading(false);
              Alert.alert('Hata', 'Video sunucuya yüklenirken hata oluştu.');
            }, 
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setEditAdRemoteVideoUrl(downloadUrl);
              setIsAdEditingUploading(false);
            }
          );
        } catch (uploadErr: any) {
          console.error('Firebase setup/upload error for edit:', uploadErr);
          setIsAdEditingUploading(false);
          Alert.alert('Hata', `Video yüklenirken hata oluştu: ${uploadErr.message || uploadErr}`);
        }
      }
    } catch (err) {
      console.warn('Edit ad video picking/compression/upload error:', err);
      setIsAdEditingCompressing(false);
      setIsAdEditingUploading(false);
      Alert.alert('Hata', 'Video işlenirken bir hata oluştu.');
    }
  };

  const handleSaveDirectCMS = async () => {
    setIsSavingCMS(true);
    try {
      try {
        const { getAuth, signInAnonymously } = await import('firebase/auth');
        const { app } = await import('@/services/firebase');
        const auth = getAuth(app);
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (authErr) {
        console.warn('Anonymous auth failed:', authErr);
      }

      const finalImages: string[] = [];
      const finalImagesWeb: string[] = [];
      const finalImagesMobile: string[] = [];
      const finalTitles: string[] = [];
      const finalLinks: string[] = [];
      const finalLabels: string[] = [];
      
      const maxLen = cmsImagesWeb.length;

      const uploadImageIfNeeded = async (uri: string, index: number, suffix: string) => {
        if (!uri) return '';
        if (typeof uri === 'number') return String(uri);
        
        let targetUrl = String(uri).trim();
        if (targetUrl !== '') {
          if (targetUrl.startsWith('file:') || targetUrl.startsWith('ph:') || targetUrl.startsWith('content:') || targetUrl.includes('blob:') || targetUrl.startsWith('data:')) {
            try {
              const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
              const { app } = await import('@/services/firebase');
              const storage = getStorage(app);
              
              const filename = `collage_${selectedCMSBoxKey}_${index}_${suffix}_${Date.now()}.jpg`;
              const response = await fetch(targetUrl);
              const blob = await response.blob();
              const fileRef = ref(storage, `listings/collage/${filename}`);
              
              await uploadBytes(fileRef, blob);
              targetUrl = await getDownloadURL(fileRef);
            } catch (err: any) {
              console.error(`Failed uploading ${suffix} image to storage:`, err);
              throw new Error(`${suffix} Görseli Firebase'e yüklenemedi: ${err.message || err}`);
            }
          }
        }
        return targetUrl;
      };

      for (let i = 0; i < maxLen; i++) {
        const rawWeb = cmsImagesWeb[i];
        const webUrl = await uploadImageIfNeeded(rawWeb, i, 'web');
        
        const rawMobile = cmsImagesMobile[i];
        const mobileUrl = await uploadImageIfNeeded(rawMobile, i, 'mobile');

        const mainUrl = webUrl || mobileUrl || '';

        if (webUrl || mobileUrl) {
          finalImagesWeb.push(webUrl);
          finalImagesMobile.push(mobileUrl);
          finalImages.push(mainUrl);
          finalTitles.push((cmsTitles[i] || '').trim());
          finalLinks.push((cmsLinks[i] || '').trim());
          finalLabels.push((cmsLabels[i] || '').trim());
        }
      }
      
      const updatedCollage = {
        ...draftCollage,
        [selectedCMSBoxKey]: {
          images: finalImages,
          imagesWeb: finalImagesWeb,
          imagesMobile: finalImagesMobile,
          titles: finalTitles,
          link: finalLinks[0] || '',
          links: finalLinks,
          labels: finalLabels,
        }
      };
      
      updateDraftCollage(updatedCollage);
      Alert.alert('Başarılı', 'Slayt Değişiklikleri Kaydedildi ve Canlıya Aktarıldı!');
    } catch (e: any) {
      console.warn('Error saving collage draft:', e);
      Alert.alert('Hata', `Kaydederken bir sorun oluştu: ${e.message || e}`);
    } finally {
      setIsSavingCMS(false);
    }
  };

  const handleAddSlide = () => {
    setCmsImagesWeb(prev => [...prev, '']);
    setCmsImagesMobile(prev => [...prev, '']);
    setCmsTitles(prev => [...prev, '']);
    setCmsLinks(prev => [...prev, '']);
    setCmsLabels(prev => [...prev, '']);
  };

  const handleRemoveSlide = (index: number) => {
    setCmsImagesWeb(prev => prev.filter((_, idx) => idx !== index));
    setCmsImagesMobile(prev => prev.filter((_, idx) => idx !== index));
    setCmsTitles(prev => prev.filter((_, idx) => idx !== index));
    setCmsLinks(prev => prev.filter((_, idx) => idx !== index));
    setCmsLabels(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          Alert.alert("Güvenlik Hatası", "Cihazınızda Face ID / Parmak İzi bulunamadı veya etkinleştirilmedi.");
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Biyometrik doğrulamayı etkinleştirmek için parmak izinizi veya yüzünüzü taratın.',
          fallbackLabel: 'Şifre Kullan',
        });

        if (result.success) {
          setBiometricsEnabled(true);
          Alert.alert("Başarılı", "Biyometrik doğrulama başarıyla aktifleştirildi! 🛡️");
        }
      } catch (err) {
        console.warn('Biometric setup failed:', err);
        Alert.alert("Hata", "Biyometrik doğrulama başlatılırken hata oluştu.");
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  // Personal profile stories logic
  const personalStories = currentUser ? (stories || []).filter(s => s.sellerId === currentUser.id || s.sellerName === currentUser.name) : [];
  const hasStories = personalStories.length > 0;

  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const storyProgress = useRef(new RNAnimated.Value(0)).current;
  const [storyListingSelect, setStoryListingSelect] = useState<Listing | null>(null);

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
    if (storyViewerVisible && personalStories.length > 0) {
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
    if (activeStoryIndex < personalStories.length - 1) {
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

  // Auth Form States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'sms'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});
  const [reviewedOrders, setReviewedOrders] = useState<string[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalModalTitle, setLegalModalTitle] = useState('');
  const [legalModalContent, setLegalModalContent] = useState('');

  const handleOpenReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = () => {
    if (!selectedOrderForReview || !currentUser) return;
    addReview({
      sellerName: selectedOrderForReview.sellerName,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      rating: reviewRating,
      comment: reviewComment.trim() || 'Harika bir alışverişti, teşekkürler!'
    });
    setReviewedOrders(prev => [...prev, selectedOrderForReview.id]);
    setReviewModalVisible(false);
    Alert.alert('Teşekkürler!', 'Değerlendirmeniz başarıyla satıcı profiline kaydedildi.');
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
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

  const handleSendOtp = async () => {
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

    let phoneToUse = cleanedPhone;
    if (phoneToUse.startsWith('0')) {
      phoneToUse = phoneToUse.slice(1);
    }
    const formattedPhone = `+90${phoneToUse}`;

    try {
      if (Platform.OS === 'web') {
        const { getAuth, signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth');
        const { app } = await import('@/services/firebase');
        const auth = getAuth(app);

        // Ensure recaptcha-container element exists
        let container = document.getElementById('recaptcha-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'recaptcha-container';
          container.style.display = 'none';
          document.body.appendChild(container);
        }

        let recaptchaVerifier = (window as any).recaptchaVerifier;
        if (!recaptchaVerifier) {
          recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verified');
            }
          });
          (window as any).recaptchaVerifier = recaptchaVerifier;
        }

        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
        (window as any).confirmationResult = confirmationResult;

        setAuthMode(authStep === 'login' ? 'login' : 'register');
        setAuthStep('sms');
        Alert.alert('Doğrulama Kodu Gönderildi', 'Telefonunuza gelen 6 haneli doğrulama kodunu girin.');
      } else {
        // Mobile fallback / simulation for Expo Go
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setSentOtpCode(otp);
        setAuthOtpCode('');
        setAuthMode(authStep === 'login' ? 'login' : 'register');
        setAuthStep('sms');
        Alert.alert('SMS Simülasyonu', `Expo Go ortamında SMS simüle edildi. Doğrulama kodunuz: ${otp}`);
      }
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      setAuthError(`Kod gönderilirken hata oluştu: ${err.message || err}`);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError('');
    const cleanedOtp = authOtpCode.replace(/\s/g, '');
    if (cleanedOtp.length < 6) {
      setAuthError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    try {
      let firebaseUid = `user_${Date.now()}`;
      let firebaseDisplayName = authName;

      if (Platform.OS === 'web') {
        const confirmationResult = (window as any).confirmationResult;
        if (!confirmationResult) {
          // If we lose confirmationResult state or it's a test bypass
          if (cleanedOtp === '123456' || cleanedOtp === sentOtpCode) {
            // Bypass allowed for local testing
          } else {
            setAuthError('Doğrulama oturumu bulunamadı. Lütfen numarayı tekrar girip kod isteyin.');
            return;
          }
        } else {
          const userCredential = await confirmationResult.confirm(cleanedOtp);
          const firebaseUser = userCredential.user;
          firebaseUid = firebaseUser.uid;
          if (firebaseUser.displayName) {
            firebaseDisplayName = firebaseUser.displayName;
          }
        }
      } else {
        // Mobile mock verification
        if (cleanedOtp !== sentOtpCode && cleanedOtp !== '123456') {
          setAuthError('Hatalı doğrulama kodu. Lütfen tekrar deneyin.');
          return;
        }
      }

      // Local store registration/login
      if (authMode === 'login') {
        const success = loginAccount(authPhone, 'user');
        if (success) {
          setAuthPhone('');
          setAuthOtpCode('');
          setAuthName('');
        } else {
          // If user doesn't exist in local accounts yet, auto-register them
          registerAccount(authPhone, 'user', firebaseDisplayName || 'Yeni Üye');
          setAuthPhone('');
          setAuthOtpCode('');
          setAuthName('');
        }
      } else if (authMode === 'register') {
        registerAccount(authPhone, 'user', authName || firebaseDisplayName || 'Yeni Üye');
        setAuthPhone('');
        setAuthName('');
        setAuthOtpCode('');
      }

      // Sync verified profile doc to Firestore
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/services/firebase');
        await setDoc(doc(db, 'users', firebaseUid), {
          uid: firebaseUid,
          name: authName || firebaseDisplayName || 'Yeni Üye',
          phone: authPhone,
          role: 'user',
          lastLogin: new Date().toISOString(),
          verified: true
        }, { merge: true });
      } catch (dbErr) {
        console.warn('Firestore user doc sync skipped/failed:', dbErr);
      }

    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      setAuthError(`Kod doğrulanamadı: ${err.message || err}`);
    }
  };



  if (!currentUser) {
    const isDark = scheme === 'dark';
    const cardBg = isDark ? '#111A30' : '#FFFFFF';
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 70 : 40 }]}>
        {Platform.OS === 'web' && React.createElement('div', { id: 'recaptcha-container', style: { display: 'none' } })}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }} 
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        >
          <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', paddingHorizontal: 20, gap: 20 }}>
            
            {/* Logo & Header */}
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ 
                width: 64, 
                height: 64, 
                borderRadius: 32, 
                backgroundColor: isDark ? 'rgba(218, 165, 32, 0.12)' : 'rgba(218, 165, 32, 0.06)', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderWidth: 1.5, 
                borderColor: 'rgba(218, 165, 32, 0.25)' 
              }}>
                <User size={28} color={theme.gold} />
              </View>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <ThemedText style={{ fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.5 }}>Mezatliyoruz</ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
                  Ücretsiz hesap oluşturarak hemen teklif verin ve alışverişe başlayın.
                </ThemedText>
              </View>
            </View>

            {/* Login/Signup Card */}
            <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)', padding: 20, borderRadius: 16 }]}>
              <View style={{ gap: 16 }}>
                {authError !== '' && <Text style={styles.errorText}>{authError}</Text>}

                {authStep !== 'sms' && (
                  /* Pill Segmented Tab Control */
                  <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderRadius: 12, padding: 3, gap: 4 }}>
                    <Pressable
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: authMode === 'login' ? (isDark ? '#334155' : '#FFFFFF') : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: authMode === 'login' ? 0.05 : 0,
                        shadowRadius: 2,
                        elevation: authMode === 'login' ? 1 : 0
                      }}
                      onPress={() => { setAuthMode('login'); setAuthStep('login'); setAuthError(''); }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: authMode === 'login' ? theme.gold : theme.textSecondary }}>
                        Giriş Yap
                      </Text>
                    </Pressable>

                    <Pressable
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: authMode === 'register' ? (isDark ? '#334155' : '#FFFFFF') : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: authMode === 'register' ? 0.05 : 0,
                        shadowRadius: 2,
                        elevation: authMode === 'register' ? 1 : 0
                      }}
                      onPress={() => { setAuthMode('register'); setAuthStep('register'); setAuthError(''); }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: authMode === 'register' ? theme.gold : theme.textSecondary }}>
                        Kayıt Ol
                      </Text>
                    </Pressable>
                  </View>
                )}

                {authStep === 'login' && (
                  <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 16 }}>
                      Giriş için tek kullanımlık SMS doğrulama kodu gönderilecektir.
                    </Text>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Telefon Numarası</Text>
                      <TextInput
                        style={{
                          height: 42,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isDark ? '#334155' : '#CBD5E1',
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          color: theme.text,
                          paddingHorizontal: 12,
                          fontSize: 14,
                        }}
                        placeholder="0555 555 55 55"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="phone-pad"
                        value={authPhone}
                        onChangeText={(text) => setAuthPhone(formatPhoneNumber(text))}
                      />
                    </View>
                    <Pressable 
                      style={{
                        height: 42,
                        borderRadius: 10,
                        backgroundColor: theme.gold,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 6,
                        shadowColor: theme.gold,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 1
                      }} 
                      onPress={handleSendOtp}
                    >
                      <Text style={{ color: '#000000', fontSize: 13, fontWeight: 'bold' }}>Giriş Yap</Text>
                    </Pressable>
                  </View>
                )}

                {authStep === 'register' && (
                  <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 16 }}>
                      Yeni kayıt oluşturun. Doğrulama için SMS kodu gönderilecektir.
                    </Text>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Adı Soyadı</Text>
                      <TextInput
                        style={{
                          height: 42,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isDark ? '#334155' : '#CBD5E1',
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          color: theme.text,
                          paddingHorizontal: 12,
                          fontSize: 14,
                        }}
                        placeholder="Örn: Himmet Akar"
                        placeholderTextColor={theme.textSecondary}
                        value={authName}
                        onChangeText={setAuthName}
                      />
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Telefon Numarası</Text>
                      <TextInput
                        style={{
                          height: 42,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isDark ? '#334155' : '#CBD5E1',
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          color: theme.text,
                          paddingHorizontal: 12,
                          fontSize: 14,
                        }}
                        placeholder="0555 555 55 55"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="phone-pad"
                        value={authPhone}
                        onChangeText={(text) => setAuthPhone(formatPhoneNumber(text))}
                      />
                    </View>
                    <Pressable 
                      style={{
                        height: 42,
                        borderRadius: 10,
                        backgroundColor: theme.gold,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 6,
                        shadowColor: theme.gold,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 1
                      }} 
                      onPress={handleSendOtp}
                    >
                      <Text style={{ color: '#000000', fontSize: 13, fontWeight: 'bold' }}>Kayıt Ol</Text>
                    </Pressable>
                  </View>
                )}

                {authStep === 'sms' && (
                  <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 12, lineHeight: 16 }}>
                      <Text style={{ fontWeight: 'bold', color: theme.text }}>{authPhone}</Text> numaralı telefona gönderilen 6 haneli doğrulama kodunu girin.
                    </Text>
                    <View style={styles.formGroup}>
                      <TextInput
                        style={{
                          height: 44,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.gold,
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          color: theme.text,
                          fontSize: 20,
                          textAlign: 'center',
                          letterSpacing: 8,
                        }}
                        placeholder="000000"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        maxLength={6}
                        value={authOtpCode}
                        onChangeText={setAuthOtpCode}
                      />
                    </View>
                    <Pressable 
                      style={{
                        height: 42,
                        borderRadius: 10,
                        backgroundColor: theme.gold,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 6,
                      }} 
                      onPress={handleVerifyOtp}
                    >
                      <Text style={{ color: '#000000', fontSize: 13, fontWeight: 'bold' }}>Kodu Doğrula ve Giriş Yap</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { setAuthStep('login'); setAuthOtpCode(''); }}
                      style={{ alignSelf: 'center', marginTop: 4 }}
                    >
                      <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Telefonu Değiştir</Text>
                    </Pressable>
                  </View>
                )}

              </View>
            </View>

          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // Listings belonging to this user
  const userListings = listings.filter((item) => {
    return (
      item.sellerName === currentUser.name ||
      (currentUser.shopName && item.sellerName === currentUser.shopName)
    );
  });

  // Won auctions by this user
  const wonListings = listings.filter((item) => {
    return (
      item.type === 'auction' &&
      item.timeLeft !== undefined &&
      item.timeLeft <= 0 &&
      item.auctionWinnerId === currentUser?.id
    );
  });

  // Bought orders by this user
  const boughtOrders = orders.filter(o => o.buyerId === currentUser?.id);

  // Sold orders (seller orders) belonging to this user's listings
  const sellerOrders = orders.filter(o => 
    o.items.some(item => 
      item.listing.sellerName === currentUser?.name || 
      (currentUser?.shopName && item.listing.sellerName === currentUser.shopName)
    )
  );

  const cardBg = isDark ? '#111A30' : '#FFFFFF';
  const itemBg = isDark ? '#080E1C' : '#F8FAFC';
  const itemBorder = isDark ? '#1F2E54' : '#E2E8F0';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {hasStories ? (
            <View style={styles.storyAvatarWrapper}>
              <Pressable 
                onPress={() => { setStoryViewerVisible(true); setActiveStoryIndex(0); }}
                style={({ pressed }) => [
                  pressed && { opacity: 0.85 }
                ]}
              >
                <LinearGradient
                  colors={['#38BDF8', '#0969DA', '#4F46E5']}
                  style={styles.storyRingGradient}
                >
                  <View style={[styles.avatarContainerStory, { backgroundColor: cardBg }]}>
                    <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
                  </View>
                </LinearGradient>
              </Pressable>
              <Pressable 
                onPress={changeProfileAvatar}
                style={[styles.cameraOverlayStory, { backgroundColor: theme.gold, borderColor: isDark ? '#111A30' : '#FFFFFF' }]}
              >
                <Camera size={11} color="#0B132B" strokeWidth={2.5} />
              </Pressable>
            </View>
          ) : (
            <Pressable 
              onPress={changeProfileAvatar}
              style={({ pressed }) => [
                styles.avatarContainer, 
                { borderColor: theme.gold },
                pressed && { opacity: 0.85 }
              ]}
            >
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
              <View style={[styles.cameraOverlay, { backgroundColor: theme.gold, borderColor: isDark ? '#111A30' : '#FFFFFF' }]}>
                <Camera size={12} color="#0B132B" strokeWidth={2.5} />
              </View>
            </Pressable>
          )}
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {currentUser.name}
              </Text>
              {currentUser.verified && (
                <Pressable
                  onPress={() => {
                    const badges = getUserBadges(currentUser);
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
              Güven Skoru: {currentUser.trustScore}/10
            </Text>

            <View style={styles.badgesRow}>
              {currentUser.verified && getUserBadges(currentUser).length === 0 && (
                <Pressable
                  onPress={() => Alert.alert("Doğrulanmış Hesap", "Bu kullanıcının kimliği Bakanlık entegrasyonu ve resmi belgelerle doğrulanmıştır.", [{ text: 'Tamam' }])}
                  style={[styles.badgeItem, {
                    backgroundColor: isDark ? 'rgba(9, 105, 218, 0.12)' : 'rgba(9, 105, 218, 0.08)',
                    borderColor: isDark ? 'rgba(9, 105, 218, 0.25)' : 'rgba(184, 134, 11, 0.2)'
                  }]}
                >
                  <ShieldCheck size={12} color={isDark ? theme.gold : theme.goldAccent} />
                  <Text style={[styles.badgeText, { color: isDark ? theme.gold : theme.goldAccent }]}>
                    Doğrulanmış Hesap
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => Alert.alert("Telefon Doğrulanmış", "Bu kullanıcının cep telefonu numarası SMS OTP doğrulaması ile onaylanmıştır.", [{ text: 'Tamam' }])}
                style={[styles.badgeItem, {
                  backgroundColor: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(52, 211, 153, 0.08)',
                  borderColor: isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(5, 150, 105, 0.2)'
                }]}
              >
                <ShieldCheck size={12} color={isDark ? '#34D399' : '#059669'} />
                <Text style={[styles.badgeText, { color: isDark ? '#34D399' : '#059669' }]}>Telefon Doğrulanmış</Text>
              </Pressable>

              {currentUser.rentACarApplicationStatus === 'pending' && (
                <Pressable
                  onPress={() => Alert.alert("Satıcı Onayı Bekliyor", "Belgeleriniz yüklenmiştir. Süper Admin onayından sonra ilan/mezat ekleyebilirsiniz.", [{ text: 'Tamam' }])}
                  style={[styles.badgeItem, {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.2)'
                  }]}
                >
                  <ShieldAlert size={12} color={isDark ? '#F59E0B' : '#D97706'} />
                  <Text style={[styles.badgeText, { color: isDark ? '#F59E0B' : '#D97706' }]}>Satıcı Onayı Bekliyor</Text>
                </Pressable>
              )}

              {(() => {
                if (!currentUser.verified) return null;
                const badges = getUserBadges(currentUser);
                return badges.map((badge, idx) => (
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
                ));
              })()}
            </View>
          </View>
        </View>



        {/* Logout Button */}
        <Pressable
          style={[styles.logoutBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
          onPress={() => {
            logoutAccount();
            Alert.alert('Çıkış Yapıldı', 'Başarıyla çıkış yaptınız.');
          }}
        >
          <LogOut size={16} color={theme.textSecondary} />
          <Text style={[styles.logoutBtnText, { color: theme.textSecondary }]}>Çıkış Yap</Text>
        </Pressable>

        {/* Developer Role Switcher Tool */}
        (
          <View style={{ marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.gold, backgroundColor: isDark ? 'rgba(9, 105, 218,0.05)' : '#FFFBEB', gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.gold }}>🛠️ GELİŞTİRİCİ ARACI (Test Kolaylığı)</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: theme.textSecondary, backgroundColor: 'rgba(9, 105, 218,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                Aktif Rol: {currentUser.role?.toUpperCase()}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4 }}>
              Doğrulama rozetlerini ve admin onay ekranlarını kolayca test etmek için profilinizi aşağıdan değiştirebilirsiniz:
            </Text>
            
            <View style={{ gap: 6 }}>
              {/* Row 1: Users */}
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  onPress={() => {
                    if (!currentUser) return;
                    useAppStore.setState({
                      currentUser: {
                        ...currentUser,
                        role: 'user',
                        name: 'Himmet Akar',
                        shopName: undefined,
                        isRentACarApproved: false,
                        verified: true,
                      }
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: !currentUser.shopName && currentUser.role !== 'super_admin' ? theme.gold : 'rgba(9, 105, 218,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: !currentUser.shopName && currentUser.role !== 'super_admin' ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                    Bireysel Üye
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!currentUser) return;
                    useAppStore.setState({
                      currentUser: {
                        ...currentUser,
                        role: 'super_admin',
                        name: 'Himmet Akar (Süper Admin)',
                        shopName: undefined,
                        isRentACarApproved: false,
                        verified: true,
                      }
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: currentUser.role === 'super_admin' ? theme.gold : 'rgba(9, 105, 218,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: currentUser.role === 'super_admin' ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                    Süper Admin
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!currentUser) return;
                    useAppStore.setState({
                      currentUser: {
                        ...currentUser,
                        role: 'moderator',
                        name: 'Mehmet Yılmaz (Moderatör)',
                        shopName: undefined,
                        isRentACarApproved: false,
                        verified: true,
                        moderatorPermissions: {
                          canModerateListings: true,
                          canApproveFirms: true,
                          canManageAds: true,
                          canManageIssues: true,
                          canManageCMS: true,
                          isSuperAdmin: false
                        }
                      }
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: currentUser.role === 'moderator' ? theme.gold : 'rgba(9, 105, 218,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: currentUser.role === 'moderator' ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                    Moderatör
                  </Text>
                </Pressable>
              </View>

              {/* Row 2: Corporates */}
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  onPress={() => {
                    if (!currentUser) return;
                    useAppStore.setState({
                      currentUser: {
                        ...currentUser,
                        role: 'seller',
                        name: 'Emlak VIP Yetkilisi',
                        shopName: 'VIP Emlak Ofisi',
                        isRentACarApproved: false,
                        verified: true,
                      }
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: currentUser.shopName?.includes('Emlak') ? theme.gold : 'rgba(9, 105, 218,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: currentUser.shopName?.includes('Emlak') ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                    Kurumsal Emlak
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!currentUser) return;
                    useAppStore.setState({
                      currentUser: {
                        ...currentUser,
                        role: 'seller',
                        name: 'Galeri Ahmet Yetkilisi',
                        shopName: 'Ahmet Oto Galeri',
                        isRentACarApproved: false,
                        verified: true,
                      }
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: currentUser.shopName?.includes('Galeri') && !currentUser.isRentACarApproved ? theme.gold : 'rgba(9, 105, 218,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: currentUser.shopName?.includes('Galeri') && !currentUser.isRentACarApproved ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                    Kurumsal Galeri
                  </Text>
                </Pressable>
              </View>

              {/* Row 3: Rent a Car & Producer */}
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  onPress={() => {
                    if (!currentUser) return;
                    useAppStore.setState({
                      currentUser: {
                        ...currentUser,
                        role: 'seller',
                        name: 'Akar Kiralama Yetkilisi',
                        shopName: 'Akar Rent a Car',
                        isRentACarApproved: true,
                        verified: true,
                      }
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: currentUser.isRentACarApproved ? theme.gold : 'rgba(9, 105, 218,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: currentUser.isRentACarApproved ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                    Rent a Car Firması
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!currentUser) return;
                    useAppStore.setState({
                      currentUser: {
                        ...currentUser,
                        role: 'seller',
                        name: 'Ege Tarım Yetkilisi',
                        shopName: 'Doğal Ege Bahçesi Üreticisi',
                        isRentACarApproved: false,
                        verified: true,
                      }
                    });
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: currentUser.shopName?.includes('Bahçe') || currentUser.shopName?.includes('Üretici') ? theme.gold : 'rgba(9, 105, 218,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: currentUser.shopName?.includes('Bahçe') || currentUser.shopName?.includes('Üretici') ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                    Yerel Üretici
                  </Text>
                </Pressable>
              </View>

              {/* Row 4: Mega Corporate All Badges */}
              <Pressable
                onPress={() => {
                  if (!currentUser) return;
                  useAppStore.setState({
                    currentUser: {
                      ...currentUser,
                      role: 'seller',
                      name: 'Mega Kurumsal Yetkilisi',
                      shopName: 'Mega Holding A.Ş.',
                      isRentACarApproved: true,
                      verified: true,
                    }
                  });
                }}
                style={{
                  width: '100%',
                  height: 34,
                  borderRadius: 4,
                  backgroundColor: currentUser.shopName === 'Mega Holding A.Ş.' ? theme.gold : 'rgba(9, 105, 218,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 4,
                }}
              >
                <Text style={{ color: currentUser.shopName === 'Mega Holding A.Ş.' ? '#FFFFFF' : theme.gold, fontWeight: 'bold', fontSize: 11 }}>
                  🏆 Mega Kurumsal (Tüm Rozetlere Sahip Üye)
                </Text>
              </Pressable>
            </View>
          </View>
        )

        {/* Super Admin Tab Selector */}
        {(currentUser.role === 'super_admin' || currentUser.role === 'moderator') && (
          <View style={{ flexDirection: 'row', backgroundColor: cardBg, borderRadius: 10, borderWidth: 1, borderColor: itemBorder, padding: 4, marginTop: 16 }}>
            <Pressable
              onPress={() => setAdminActiveTab('admin')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: adminActiveTab === 'admin' ? theme.gold : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: adminActiveTab === 'admin' ? '#000000' : theme.text }}>
                ⚙️ Yönetim Paneli
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => setAdminActiveTab('personal')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: adminActiveTab === 'personal' ? theme.gold : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: adminActiveTab === 'personal' ? '#000000' : theme.text }}>
                👤 Kişisel Hesabım
              </Text>
            </Pressable>
          </View>
        )}

        {(currentUser.role === 'super_admin' || currentUser.role === 'moderator') && adminActiveTab === 'admin' && (
          <View style={isDesktop ? { flexDirection: 'row', gap: 20, marginTop: 16, alignItems: 'flex-start' } : { gap: 14, marginTop: 16 }}>
            {/* Admin Panel Sub-Tabs Menu */}
            {isDesktop ? (
              <View style={{ width: 240, backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor: itemBorder, padding: 8, gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary, paddingHorizontal: 12, paddingVertical: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>⚙️ Yönetim Paneli</Text>
                {[
                  { id: 'cms', label: '💻 CMS Yönetimi', visible: hasCMSPerm },
                  { id: 'pricing', label: '📢 Reklam Yönetimi', visible: hasPricingPerm },
                  { id: 'moderation', label: '🛡️ İlan Kontrolü', visible: hasListingPerm },
                  { id: 'firms', label: '🏢 Firma Onayı', visible: hasFirmsPerm },
                  { id: 'issues', label: '⚠️ Destek Yönetimi', visible: hasIssuesPerm },
                  { id: 'mods', label: '👥 Moderatör Yetki', visible: currentUser.role === 'super_admin' },
                  { id: 'finance', label: '📊 Finans Raporu', visible: currentUser.role === 'super_admin' },
                ].filter(t => t.visible).map((tab) => {
                  const isActive = adminPanelActiveTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setAdminPanelActiveTab(tab.id as any)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderRadius: 8,
                        backgroundColor: isActive ? theme.gold : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: isActive ? '#FFFFFF' : theme.text }}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ flexDirection: 'row', backgroundColor: cardBg, borderRadius: 10, borderWidth: 1, borderColor: itemBorder, padding: 4, gap: 4 }}
              >
                {[
                  { id: 'cms', label: '💻 CMS Yönetimi', visible: hasCMSPerm },
                  { id: 'pricing', label: '📢 Reklam Yönetimi', visible: hasPricingPerm },
                  { id: 'moderation', label: '🛡️ İlan Kontrolü', visible: hasListingPerm },
                  { id: 'firms', label: '🏢 Firma Onayı', visible: hasFirmsPerm },
                  { id: 'issues', label: '⚠️ Destek Yönetimi', visible: hasIssuesPerm },
                  { id: 'mods', label: '👥 Moderatör Yetki', visible: currentUser.role === 'super_admin' },
                  { id: 'finance', label: '📊 Finans Raporu', visible: currentUser.role === 'super_admin' },
                ].filter(t => t.visible).map((tab) => {
                  const isActive = adminPanelActiveTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setAdminPanelActiveTab(tab.id as any)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: isActive ? theme.gold : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: isActive ? '#FFFFFF' : theme.text }}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Main Content Pane */}
            <View style={isDesktop ? { flex: 1, gap: 14 } : { gap: 14, flex: 1 }}>

            {/* 1. CMS & Karusel Yönetimi */}
            {adminPanelActiveTab === 'cms' && hasCMSPerm && (
              <View style={{ padding: 18, borderRadius: 16, backgroundColor: cardBg, borderWidth: 1, borderColor: itemBorder, gap: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 15 }}>💻 Ana Sayfa Görsel & Slayt Yönetimi (CMS)</Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                  Ana sayfadaki görsel ve slayt alanlarını buradan düzenleyin. Web ve Mobil için ayrı görseller yükleyerek her iki cihazda da kusursuz görüntü sağlayabilirsiniz.
                </Text>

                {/* Box Selector Tabs */}
                <View style={{ flexDirection: 'row', backgroundColor: inputBg, borderRadius: 8, padding: 3, gap: 4 }}>
                  {[
                    { id: 'leftVertical', label: 'Sol Karusel (10 Slayt)' },
                    { id: 'rightTop', label: 'Sağ Üst Slayt (1)' },
                    { id: 'rightBottom', label: 'Sağ Alt Slayt (1)' },
                  ].map((box) => {
                    const isSelected = selectedCMSBoxKey === box.id;
                    return (
                      <Pressable
                        key={box.id}
                        onPress={() => setSelectedCMSBoxKey(box.id as any)}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 6,
                          backgroundColor: isSelected ? theme.gold : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: isSelected ? '#000000' : theme.text }}>
                          {box.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Slides Form */}
                <View style={{ gap: 16, marginTop: 4 }}>
                  {cmsImagesWeb.map((_, i) => (
                    <View key={`cms_slide_${i}`} style={{ padding: 14, borderRadius: 12, backgroundColor: itemBg, borderWidth: 1, borderColor: itemBorder, gap: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.gold }}>
                          {selectedCMSBoxKey === 'leftVertical' ? `Slayt ${i + 1}` : 'Görsel Alanı'}
                        </Text>
                        {selectedCMSBoxKey === 'leftVertical' && cmsImagesWeb.length > 1 && (
                          <Pressable
                            onPress={() => handleRemoveSlide(i)}
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              borderWidth: 0.5,
                              borderColor: '#EF4444'
                            }}
                          >
                            <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>Slaytı Sil</Text>
                          </Pressable>
                        )}
                      </View>

                      {/* Image Upload Fields: Web and Mobile Side by Side on Desktop, Stacked on Mobile */}
                      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12 }}>
                        {/* Web Image */}
                        <View style={{ flex: 1, gap: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary }}>
                            🖥️ Web Görseli ({selectedCMSBoxKey === 'leftVertical' ? 'Oran: 5/2 - 1000x400 px' : 'Oran: 5/1 - 1000x200 px'})
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {cmsImagesWeb[i] ? (
                              <View style={{ position: 'relative', width: 50, height: 50, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: itemBorder }}>
                                <Image source={{ uri: cmsImagesWeb[i] }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                <Pressable 
                                  onPress={() => {
                                    const copy = [...cmsImagesWeb];
                                    copy[i] = '';
                                    setCmsImagesWeb(copy);
                                  }}
                                  style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <X size={10} color="#FFFFFF" />
                                </Pressable>
                              </View>
                            ) : null}
                            <Pressable
                              onPress={async () => {
                                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                if (!permissionResult.granted) { Alert.alert('İzin Gerekli', 'Galeri izni gereklidir.'); return; }
                                const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
                                if (!result.canceled && result.assets?.[0]?.uri) {
                                  const copy = [...cmsImagesWeb];
                                  copy[i] = result.assets[0].uri;
                                  setCmsImagesWeb(copy);
                                }
                              }}
                              style={{ flex: 1, height: 36, borderRadius: 6, borderWidth: 1, borderColor: theme.gold, backgroundColor: 'rgba(217, 119, 6, 0.03)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                            >
                              <Camera size={13} color={theme.gold} />
                              <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold' }}>Web Görseli Yükle</Text>
                            </Pressable>
                          </View>
                        </View>

                        {/* Mobile Image */}
                        <View style={{ flex: 1, gap: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary }}>
                            📱 Mobil Görseli ({selectedCMSBoxKey === 'leftVertical' ? 'Oran: 2/3 - 400x600 px' : 'Oran: 5/3 - 500x300 px'})
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {cmsImagesMobile[i] ? (
                              <View style={{ position: 'relative', width: 50, height: 50, borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: itemBorder }}>
                                <Image source={{ uri: cmsImagesMobile[i] }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                <Pressable 
                                  onPress={() => {
                                    const copy = [...cmsImagesMobile];
                                    copy[i] = '';
                                    setCmsImagesMobile(copy);
                                  }}
                                  style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <X size={10} color="#FFFFFF" />
                                </Pressable>
                              </View>
                            ) : null}
                            <Pressable
                              onPress={async () => {
                                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                if (!permissionResult.granted) { Alert.alert('İzin Gerekli', 'Galeri izni gereklidir.'); return; }
                                const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
                                if (!result.canceled && result.assets?.[0]?.uri) {
                                  const copy = [...cmsImagesMobile];
                                  copy[i] = result.assets[0].uri;
                                  setCmsImagesMobile(copy);
                                }
                              }}
                              style={{ flex: 1, height: 36, borderRadius: 6, borderWidth: 1, borderColor: theme.gold, backgroundColor: 'rgba(217, 119, 6, 0.03)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                            >
                              <Camera size={13} color={theme.gold} />
                              <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold' }}>Mobil Görseli Yükle</Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>

                      {/* Text inputs */}
                      <View style={{ gap: 8, marginTop: 4 }}>
                        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 10 }}>
                          <View style={{ flex: 1, gap: 4 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary }}>BAŞLIK</Text>
                            <TextInput
                              style={{ height: 34, borderRadius: 6, borderWidth: 1, borderColor: itemBorder, backgroundColor: inputBg, color: theme.text, paddingHorizontal: 10, fontSize: 12 }}
                              placeholder="Müzayede veya Slayt Başlığı"
                              placeholderTextColor={theme.textSecondary}
                              value={cmsTitles[i]}
                              onChangeText={(val) => {
                                const copy = [...cmsTitles];
                                copy[i] = val;
                                setCmsTitles(copy);
                              }}
                            />
                          </View>

                          {selectedCMSBoxKey === 'leftVertical' && (
                            <View style={{ flex: 1, gap: 4 }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary }}>ETİKET ROZETİ (ÖRN: MEZAT)</Text>
                              <TextInput
                                style={{ height: 34, borderRadius: 6, borderWidth: 1, borderColor: itemBorder, backgroundColor: inputBg, color: theme.text, paddingHorizontal: 10, fontSize: 12 }}
                                placeholder="Rozet yazısı"
                                placeholderTextColor={theme.textSecondary}
                                value={cmsLabels[i]}
                                onChangeText={(val) => {
                                  const copy = [...cmsLabels];
                                  copy[i] = val;
                                  setCmsLabels(copy);
                                }}
                              />
                            </View>
                          )}
                        </View>

                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary }}>YÖNLENDİRME BAĞLANTISI (LİNK)</Text>
                          <TextInput
                            style={{ height: 34, borderRadius: 6, borderWidth: 1, borderColor: itemBorder, backgroundColor: inputBg, color: theme.text, paddingHorizontal: 10, fontSize: 12 }}
                            placeholder="Örn: /auctions veya bit_pazari veya boş"
                            placeholderTextColor={theme.textSecondary}
                            value={cmsLinks[i]}
                            onChangeText={(val) => {
                              const copy = [...cmsLinks];
                              copy[i] = val;
                              setCmsLinks(copy);
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  {selectedCMSBoxKey === 'leftVertical' && (
                    <Pressable
                      onPress={handleAddSlide}
                      style={{
                        height: 38,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: theme.gold,
                        backgroundColor: 'rgba(217, 119, 6, 0.02)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        marginTop: 4
                      }}
                    >
                      <Plus size={14} color={theme.gold} />
                      <Text style={{ color: theme.gold, fontSize: 12, fontWeight: 'bold' }}>Yeni Slayt Ekle</Text>
                    </Pressable>
                  )}

                  {/* Submit buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <Pressable
                      onPress={handleSaveDirectCMS}
                      disabled={isSavingCMS}
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 8,
                        backgroundColor: theme.gold,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isSavingCMS ? 0.7 : 1
                      }}
                    >
                      <Text style={{ color: '#000000', fontSize: 13, fontWeight: 'bold' }}>
                        {isSavingCMS ? 'Kaydediliyor ve Yükleniyor...' : '⚡ Slayt Değişikliklerini Kaydet & Canlıya Al'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* 3. Reklam Yönetimi */}
            {adminPanelActiveTab === 'pricing' && hasPricingPerm && (
              <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: itemBorder, gap: 12 }}>
                <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>📢 Reklam Yönetimi</Text>
                
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary, marginBottom: 4 }}>Reklam Süre Fiyatları & Aktiflik Durumları</Text>
                {/* Ad pricing inputs - Horizontal Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  {['1day', '3days', '1week', '1month'].map((duration) => {
                    const config = adminPricing[duration as keyof AdPricing] || { price: 0, enabled: true };
                    const label = duration === '1day' ? '1 Günlük' : duration === '3days' ? '3 Günlük' : duration === '1week' ? '1 Haftalık' : '1 Aylık';
                    return (
                      <View 
                        key={duration} 
                        style={{ 
                          flex: 1,
                          minWidth: isDesktop ? 130 : 140, // responsive minWidth to trigger wrapping on small mobile screens
                          padding: 12, 
                          borderRadius: 8, 
                          borderWidth: 1, 
                          borderColor: itemBorder, 
                          backgroundColor: itemBg,
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {/* Label */}
                        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{label}</Text>

                        {/* Price Input Row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 }}>
                          <TextInput
                            keyboardType="numeric"
                            value={config.price.toString()}
                            onChangeText={(val) => {
                              const priceNum = parseFloat(val) || 0;
                              setAdminPricing(prev => ({
                                ...prev,
                                [duration]: { ...prev[duration as keyof AdPricing], price: priceNum }
                              }));
                            }}
                            style={{
                              width: 60,
                              height: 32,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: inputBorder,
                              backgroundColor: inputBg,
                              color: theme.text,
                              textAlign: 'center',
                              fontSize: 12,
                            }}
                          />
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>TL</Text>
                        </View>

                        {/* Toggle Switch */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Text style={{ fontSize: 11, color: config.enabled ? '#10B981' : theme.textSecondary }}>
                            {config.enabled ? 'Açık' : 'Kapalı'}
                          </Text>
                          <Pressable
                            onPress={() => {
                              const nextEnabled = !config.enabled;
                              setAdminPricing(prev => ({
                                ...prev,
                                [duration]: { ...prev[duration as keyof AdPricing], enabled: nextEnabled }
                              }));
                            }}
                            style={{
                              width: 44,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: config.enabled ? '#10B981' : '#EF4444',
                              justifyContent: 'center',
                              paddingHorizontal: 2,
                            }}
                          >
                            <View style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              backgroundColor: '#FFFFFF',
                              alignSelf: config.enabled ? 'flex-end' : 'flex-start',
                            }} />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <Pressable
                  onPress={() => {
                    updateAdPricing(adminPricing);
                    alert('Reklam fiyatları ve aktiflik durumları başarıyla kaydedildi!');
                  }}
                  style={{
                    backgroundColor: theme.gold,
                    paddingVertical: 10,
                    borderRadius: 6,
                    alignItems: 'center',
                    marginTop: 4
                  }}
                >
                  <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 13 }}>Reklam Fiyatlarını Kaydet</Text>
                </Pressable>

                <View style={{ height: 1, backgroundColor: itemBorder, marginVertical: 14 }} />

                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary, marginBottom: 4 }}>📋 Sistemdeki Reklamlar & Talepler</Text>
                {ads.length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 10 }}>Sistemde aktif reklam bulunmamaktadır.</Text>
                ) : (
                  <View style={{ gap: 10 }}>
                    {ads.map((ad) => {
                      const associatedListing = listings.find(l => l.id === ad.listingId);
                      return (
                        <View key={ad.id} style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 6 }}>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{ad.title || associatedListing?.title || 'Profil Yönlendirmeli Reklam'}</Text>
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Yayınlayan: {ad.userName} • Süre: {ad.durationType}</Text>
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Bitiş: {new Date(ad.endDate).toLocaleDateString('tr-TR')}</Text>
                          <Pressable
                            onPress={() => deleteAd(ad.id)}
                            style={{
                              alignSelf: 'flex-end',
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 4,
                              backgroundColor: '#EF4444',
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>Yayından Kaldır</Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* 4. İlan Kontrolü & Moderasyon */}
            {adminPanelActiveTab === 'moderation' && hasListingPerm && (
              <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: itemBorder, gap: 12 }}>
                <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>🛡️ İlan Kontrolü & Moderasyon</Text>
                
                {/* Search Input */}
                <TextInput
                  style={{
                    height: 38,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
                    color: theme.text,
                    paddingHorizontal: 10,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                  placeholder="İlan adı, satıcı adı veya İlan No ile arayın..."
                  placeholderTextColor={theme.textSecondary}
                  value={modListingSearch}
                  onChangeText={setModListingSearch}
                />

                {/* Onay bekleyen ilanlar */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary }}>Onay Bekleyen İlanlar</Text>
                {listings.filter(l => l.status === 'pending_approval').filter(l => {
                  const q = modListingSearch.toLowerCase().trim();
                  if (!q) return true;
                  return l.title.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q) || (l.listingNumber && l.listingNumber.includes(q));
                }).length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic', paddingLeft: 6, marginBottom: 4 }}>Aranan kriterde onay bekleyen ilan bulunmamaktadır.</Text>
                ) : (
                  <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 } : { gap: 8, marginBottom: 8 }}>
                    {listings.filter(l => l.status === 'pending_approval').filter(l => {
                      const q = modListingSearch.toLowerCase().trim();
                      if (!q) return true;
                      return l.title.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q) || (l.listingNumber && l.listingNumber.includes(q));
                    }).map((item) => (
                      <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.gold, backgroundColor: itemBg, gap: 8, width: isDesktop ? '49%' : '100%', minWidth: isDesktop ? 300 : undefined }}>
                        <Pressable 
                          onPress={() => setSelectedModListing(item)}
                          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        >
                          <Image
                            source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                            style={{ width: 36, height: 36, borderRadius: 6 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>{item.title}</Text>
                            <Text style={{ fontSize: 10, color: theme.textSecondary }}>
                              İlan No: <Text style={{ color: theme.gold, fontWeight: 'bold' }}>{item.listingNumber || 'Atanmadı'}</Text> • Satıcı: {item.sellerName} • {item.price.toLocaleString('tr-TR')} TL
                            </Text>
                          </View>
                        </Pressable>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <Pressable
                            onPress={() => {
                              updateListing(item.id, { status: 'active', rejectionReason: undefined });
                              addNotification({
                                userId: item.sellerId || 'user',
                                title: 'İlanınız Onaylandı ✅',
                                message: `"${item.title}" başlıklı ilanınız yönetici tarafından onaylanarak yayına girdi!`,
                                type: 'system'
                              });
                              alert('İlan onaylanarak yayına girdi ve kullanıcıya bildirim gönderildi!');
                            }}
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 5,
                              borderRadius: 4,
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              borderWidth: 0.5,
                              borderColor: '#10B981'
                            }}
                          >
                            <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>Onayla ✓</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleOpenSuspendModal(item, 'reject')}
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 5,
                              borderRadius: 4,
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              borderWidth: 0.5,
                              borderColor: '#EF4444'
                            }}
                          >
                            <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>Reddet ×</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Yayındaki / Askıdaki İlanlar */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary }}>Sistemdeki Tüm İlanlar</Text>
                <ScrollView style={{ maxHeight: isDesktop ? 500 : 250 }} showsVerticalScrollIndicator={true}>
                  <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 10 } : { gap: 8 }}>
                    {listings.filter(l => l.status !== 'pending_approval').filter(l => {
                      const q = modListingSearch.toLowerCase().trim();
                      if (!q) return true;
                      return l.title.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q) || (l.listingNumber && l.listingNumber.includes(q));
                    }).map((item) => (
                      <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 8, width: isDesktop ? '49%' : '100%', minWidth: isDesktop ? 300 : undefined }}>
                        <Pressable 
                          onPress={() => setSelectedModListing(item)}
                          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        >
                          <Image
                            source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                            style={{ width: 36, height: 36, borderRadius: 6 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>{item.title}</Text>
                            <Text style={{ fontSize: 10, color: theme.textSecondary }}>
                              İlan No: <Text style={{ color: theme.gold, fontWeight: 'bold' }}>{item.listingNumber || 'Atanmadı'}</Text> • Satıcı: {item.sellerName} • Durum:{' '}
                              <Text style={{ fontWeight: 'bold', color: item.status === 'suspended' ? '#F59E0B' : item.status === 'rejected' ? '#EF4444' : '#10B981' }}>
                                {item.status === 'suspended' ? 'Yayından Kaldırıldı' : item.status === 'rejected' ? 'Reddedildi' : 'Aktif'}
                              </Text>
                            </Text>
                          </View>
                        </Pressable>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {item.status !== 'suspended' && (
                            <Pressable
                              onPress={() => handleOpenSuspendModal(item)}
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 5,
                                borderRadius: 4,
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderWidth: 0.5,
                                borderColor: '#F59E0B'
                              }}
                            >
                              <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: 'bold' }}>Kaldır</Text>
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => {
                              if (Platform.OS === 'web') {
                                const confirmed = window.confirm(`"${item.title}" ilanını sistemden kalıcı olarak silmek istediğinize emin misiniz?`);
                                if (confirmed) {
                                  deleteListing(item.id);
                                  alert('İlan sistemden kalıcı olarak silindi.');
                                }
                              } else {
                                Alert.alert('İlanı Sil', `"${item.title}" ilanını sistemden kalıcı olarak silmek istediğinize emin misiniz?`, [
                                  { text: 'Vazgeç', style: 'cancel' },
                                  { text: 'Sil', style: 'destructive', onPress: () => {
                                      deleteListing(item.id);
                                      alert('İlan sistemden kalıcı olarak silindi.');
                                    } 
                                  }
                                ]);
                              }
                            }}
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 5,
                              borderRadius: 4,
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              borderWidth: 0.5,
                              borderColor: '#EF4444'
                            }}
                          >
                            <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>Sil</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* 5. Satıcı Onayı & Evrak Denetimi */}
            {adminPanelActiveTab === 'firms' && hasFirmsPerm && (
              <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: itemBorder, gap: 12 }}>
                <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>🤝 Satıcı Onayı & Evrak Denetimi</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Satış yapmak isteyen üyelerin yüklediği Vergi Levhası ve Kimlik belgesini inceleyip satış yetkilerini onaylayın veya reddedin.</Text>

                {/* Onay Bekleyen Satıcı Başvuruları */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary, marginTop: 4 }}>Onay Bekleyen Başvurular</Text>
                {rentACarApplications.filter(app => app.status === 'pending').length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic', paddingLeft: 6, marginBottom: 4 }}>Onay bekleyen satıcı başvurusu bulunmamaktadır.</Text>
                ) : (
                  rentACarApplications.filter(app => app.status === 'pending').map((app) => (
                    <View key={app.id} style={{ padding: 12, borderRadius: 8, backgroundColor: itemBg, borderWidth: 1, borderColor: theme.gold, gap: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 13 }}>{app.userName}</Text>
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Tel: {app.userPhone}</Text>
                        </View>
                      </View>

                      <View style={{ gap: 4, backgroundColor: cardBg, padding: 8, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary }}>YÜKLENEN EVRAKLAR:</Text>
                        <Text style={{ fontSize: 11, color: theme.text }}>Vergi Levhası: {app.vergiLevhasi}</Text>
                        <Text style={{ fontSize: 11, color: theme.text }}>Kimlik Görseli (Ön/Arka): {app.esnafBelgesi}</Text>
                      </View>

                      {/* Explanation Note Input */}
                      <View style={{ gap: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary }}>ONAY / RED AÇIKLAMASI (OPSİYONEL)</Text>
                        <TextInput
                          style={{
                            height: 36,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: itemBorder,
                            backgroundColor: inputBg,
                            color: theme.text,
                            paddingHorizontal: 10,
                            fontSize: 12,
                          }}
                          placeholder="Kullanıcıya iletilecek açıklama notu girin..."
                          placeholderTextColor={theme.textSecondary}
                          value={modFirmAppNote[app.id] || ''}
                          onChangeText={(val) => {
                            setModFirmAppNote(prev => ({ ...prev, [app.id]: val }));
                          }}
                        />
                      </View>

                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable
                          onPress={() => {
                            rejectRentACarApplication(app.id, modFirmAppNote[app.id]);
                            alert('Satıcı başvurusu reddedildi.');
                          }}
                          style={{
                            flex: 1,
                            height: 34,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: '#EF4444',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                          }}
                        >
                          <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 11 }}>Reddet</Text>
                        </Pressable>
                        
                        <Pressable
                          onPress={() => {
                            approveRentACarApplication(app.id, modFirmAppNote[app.id]);
                            alert('Satıcı başvurusu onaylandı ve satış yetkisi verildi!');
                          }}
                          style={{
                            flex: 1.5,
                            height: 34,
                            borderRadius: 6,
                            backgroundColor: '#10B981',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 }}>Başvuruyu Onayla</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}

                {/* Yetkilendirilmiş Aktif Satıcılar */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary, marginTop: 8 }}>Aktif Onaylı Satıcılar</Text>
                {rentACarApplications.filter(app => app.status === 'approved').length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic', paddingLeft: 6 }}>Sistemde onaylı aktif satıcı bulunmamaktadır.</Text>
                ) : (
                  rentACarApplications.filter(app => app.status === 'approved').map((app) => (
                    <View key={app.id} style={{ padding: 10, borderRadius: 8, backgroundColor: itemBg, borderWidth: 1, borderColor: itemBorder, gap: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: 'bold', color: theme.text, fontSize: 13 }}>{app.userName}</Text>
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Tel: {app.userPhone}</Text>
                        </View>
                        <Pressable
                          onPress={() => {
                            rejectRentACarApplication(app.id, 'Yönetici tarafından yetki iptal edildi.');
                            alert('Kullanıcının satıcı yetkisi kaldırıldı.');
                          }}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 4,
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            borderWidth: 0.5,
                            borderColor: '#EF4444',
                          }}
                        >
                          <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>Yetkiyi Kaldır</Text>
                        </Pressable>
                      </View>
                      {app.adminNote ? (
                        <Text style={{ fontSize: 11, color: theme.textSecondary, fontStyle: 'italic', marginTop: 2 }}>
                          Onay Notu: {app.adminNote}
                        </Text>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}
            {/* 6. Müşteri Sorunları & Destek Talepleri (Admin Only) */}
            {adminPanelActiveTab === 'issues' && hasIssuesPerm && (
              <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: itemBorder, gap: 12 }}>
                <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>⚠️ Müşteri Sorunları & Destek Talepleri ({customerIssues.filter(i => i.status === 'pending').length} Bekleyen)</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Alıcılar tarafından bildirilen ürün orijinalliği, teslimat veya hasar uyuşmazlıklarını buradan inceleyip karara bağlayabilirsiniz.</Text>
                
                {customerIssues.length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 10 }}>Bildirilmiş bir müşteri sorunu bulunmamaktadır.</Text>
                ) : (
                  <View style={{ gap: 10 }}>
                    {customerIssues.map((issue) => {
                      const isPending = issue.status === 'pending';
                      return (
                        <View key={issue.id} style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 6 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Sipariş: #{issue.orderId.slice(-8).toUpperCase()}</Text>
                            <View style={{ 
                              paddingHorizontal: 8, 
                              paddingVertical: 3, 
                              borderRadius: 4, 
                              backgroundColor: issue.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 
                                             issue.status === 'resolved' || issue.status === 'refunded' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              borderWidth: 0.5,
                              borderColor: issue.status === 'pending' ? '#F59E0B' : 
                                           issue.status === 'resolved' || issue.status === 'refunded' ? '#22C55E' : '#EF4444'
                            }}>
                              <Text style={{ fontSize: 8, fontWeight: 'bold', color: issue.status === 'pending' ? '#F59E0B' : 
                                           issue.status === 'resolved' || issue.status === 'refunded' ? '#22C55E' : '#EF4444' }}>
                                {issue.status === 'pending' ? 'BEKLEMEDE' : 
                                 issue.status === 'resolved' ? 'ÇÖZÜLDÜ' : 
                                 issue.status === 'refunded' ? 'İADE EDİLDİ' : 'REDDEDİLDİ'}
                              </Text>
                            </View>
                          </View>
                          
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Tür: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{
                            issue.issueType === 'originality' ? 'Orijinallik Şüphesi' :
                            issue.issueType === 'damaged' ? 'Hasarlı Ürün' :
                            issue.issueType === 'different_product' ? 'Farklı Ürün' :
                            issue.issueType === 'not_delivered' ? 'Teslim Edilmedi' : 'Diğer'
                          }</Text></Text>

                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Bildiren: {issue.buyerName} | Satıcı: {issue.sellerName}</Text>
                          <Text style={{ fontSize: 12, color: theme.text, backgroundColor: theme.backgroundSelected + '20', padding: 8, borderRadius: 6 }}>
                            Açıklama: {issue.description}
                          </Text>

                          {issue.adminNotes && (
                            <Text style={{ fontSize: 11, color: theme.gold, marginTop: 4 }}>Yönetici Notu: {issue.adminNotes}</Text>
                          )}

                          {isPending && (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
                              <Pressable
                                onPress={() => {
                                  if (Platform.OS === 'web') {
                                    const note = window.prompt('Alıcıya iletilecek inceleme notunu yazın:');
                                    if (note !== null) {
                                      updateIssueStatus(issue.id, 'resolved', note);
                                      alert('Talep çözüldü olarak işaretlendi.');
                                    }
                                  } else {
                                    updateIssueStatus(issue.id, 'resolved', 'İnceleme tamamlandı, sorun giderildi.');
                                    alert('Talep çözüldü olarak işaretlendi.');
                                  }
                                }}
                                style={{
                                  paddingHorizontal: 10,
                                  paddingVertical: 6,
                                  borderRadius: 4,
                                  backgroundColor: '#10B981',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>Sorunu Çöz</Text>
                              </Pressable>

                              <Pressable
                                onPress={() => {
                                  if (Platform.OS === 'web') {
                                    const note = window.prompt('Para iadesi gerekçesini ve talimatını yazın:');
                                    if (note !== null) {
                                      updateIssueStatus(issue.id, 'refunded', note);
                                      alert('Para iadesi onaylandı.');
                                    }
                                  } else {
                                    updateIssueStatus(issue.id, 'refunded', 'Alıcı haklı bulundu, iade başlatıldı.');
                                    alert('Para iadesi onaylandı.');
                                  }
                                }}
                                style={{
                                  paddingHorizontal: 10,
                                  paddingVertical: 6,
                                  borderRadius: 4,
                                  backgroundColor: '#3B82F6',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>Para İadesi Yap</Text>
                              </Pressable>

                              <Pressable
                                onPress={() => {
                                  if (Platform.OS === 'web') {
                                    const note = window.prompt('Red gerekçesini yazın:');
                                    if (note !== null) {
                                      updateIssueStatus(issue.id, 'rejected', note);
                                      alert('Talep reddedildi.');
                                    }
                                  } else {
                                    updateIssueStatus(issue.id, 'rejected', 'Talep haksız bulundu.');
                                    alert('Talep reddedildi.');
                                  }
                                }}
                                style={{
                                  paddingHorizontal: 10,
                                  paddingVertical: 6,
                                  borderRadius: 4,
                                  backgroundColor: '#EF4444',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>Talebi Reddet</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* 7. Moderatör Ata & Yetkilendir (Super Admin Only) */}
            {adminPanelActiveTab === 'mods' && currentUser.role === 'super_admin' && (
              <View style={{ padding: 16, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: itemBorder, gap: 12 }}>
                <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>👥 Moderatör Ata & Yetki Yönetimi</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Sistem üyelerinden birini moderatör olarak atayın ve yetkilerini özelleştirin.</Text>
                
                {/* Search / Select User */}
                <TextInput
                  style={{
                    height: 38,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
                    color: theme.text,
                    paddingHorizontal: 10,
                    fontSize: 12,
                  }}
                  placeholder="İsim yazarak üye arayın..."
                  placeholderTextColor={theme.textSecondary}
                  value={modSearchName}
                  onChangeText={setModSearchName}
                />

                {/* Filtered assignable users list */}
                {modSearchName.trim().length > 0 && (
                  <View style={{ maxHeight: 150, borderWidth: 1, borderColor: itemBorder, borderRadius: 8, backgroundColor: itemBg, padding: 4 }}>
                    <ScrollView nestedScrollEnabled={true}>
                      {assignableUsers
                        .filter(u => u.name.toLowerCase().includes(modSearchName.toLowerCase()))
                        .map((user) => (
                          <Pressable
                            key={user.phone}
                            onPress={() => {
                              setModSelectedPhone(user.phone);
                              setModSearchName(''); // clear search
                            }}
                            style={{
                              padding: 10,
                              borderBottomWidth: 0.5,
                              borderBottomColor: itemBorder,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 12, color: theme.text, fontWeight: '600' }}>{user.name}</Text>
                            <Text style={{ fontSize: 11, color: theme.textSecondary }}>Tel: {user.phone} ({user.currentRole === 'moderator' ? 'Mod' : 'Üye'})</Text>
                          </Pressable>
                        ))}
                    </ScrollView>
                  </View>
                )}

                {/* Selected user details & permissions toggles */}
                {(() => {
                  const selectedUser = assignableUsers.find(u => u.phone === modSelectedPhone);
                  if (!selectedUser) return null;

                  const handleToggleSuperAdminNew = (val: boolean) => {
                    if (val) {
                      const msg = "Bu yetkiyi açarsanız ilgili kişi adminin tüm yetkilerine (Tam Denetim) sahip olur. Devam etmek istiyor musunuz?";
                      if (Platform.OS === 'web') {
                        const ok = window.confirm(msg);
                        if (ok) {
                          setModPerms({
                            isSuperAdmin: true,
                            canModerateListings: true,
                            canApproveFirms: true,
                            canManageAds: true,
                            canManageIssues: true,
                            canManageCMS: true
                          });
                        }
                      } else {
                        Alert.alert("Tam Denetim Yetkisi", msg, [
                          { text: "Vazgeç", style: "cancel" },
                          { text: "Yetkilendir", style: "destructive", onPress: () => {
                              setModPerms({
                                isSuperAdmin: true,
                                canModerateListings: true,
                                canApproveFirms: true,
                                canManageAds: true,
                                canManageIssues: true,
                                canManageCMS: true
                              });
                            }
                          }
                        ]);
                      }
                    } else {
                      setModPerms({
                        isSuperAdmin: false,
                        canModerateListings: false,
                        canApproveFirms: false,
                        canManageAds: false,
                        canManageIssues: false,
                        canManageCMS: false
                      });
                    }
                  };

                  return (
                    <View style={{ padding: 12, borderRadius: 8, backgroundColor: itemBg, borderWidth: 1, borderColor: theme.gold, gap: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.text }}>Seçilen Üye: {selectedUser.name}</Text>
                        <Pressable onPress={() => setModSelectedPhone('')} style={{ padding: 4 }}>
                          <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: 'bold' }}>Temizle</Text>
                        </Pressable>
                      </View>

                      {/* Super Admin Switch at the top */}
                      <View style={{ padding: 10, borderRadius: 6, backgroundColor: 'rgba(217, 119, 6, 0.05)', borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.15)', gap: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.gold }}>👑 Tam Denetim (Super Admin)</Text>
                            <Text style={{ fontSize: 10, color: theme.textSecondary }}>Bu yetki açıldığında kullanıcı paneldeki tüm yetkilere tam erişim kazanır.</Text>
                          </View>
                          <Pressable
                            onPress={() => handleToggleSuperAdminNew(!modPerms.isSuperAdmin)}
                            style={{
                              width: 44,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: modPerms.isSuperAdmin ? theme.gold : '#EF4444',
                              justifyContent: 'center',
                              paddingHorizontal: 2,
                            }}
                          >
                            <View style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              backgroundColor: '#FFFFFF',
                              alignSelf: modPerms.isSuperAdmin ? 'flex-end' : 'flex-start',
                            }} />
                          </Pressable>
                        </View>
                      </View>

                      {/* Permissions switches */}
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary, marginTop: 4 }}>Moderatör Yetkileri:</Text>
                      <View style={{ gap: 8 }}>
                        {[
                          { key: 'canApproveFirms', label: '🏢 Firma Onay Yetkisi', desc: 'Yeni kayıt olan firmaların vergi levhası ve evraklarını denetleyerek satış yapmalarına izin verir.' },
                          { key: 'canModerateListings', label: '🛡️ İlan Kontrol Yetkisi', desc: 'Yeni eklenen ilanları onaylar, reddeder veya yayından kaldırır.' },
                          { key: 'canManageAds', label: '📢 Reklam Yönetimi Yetkisi', desc: 'Reklam fiyatlarını belirler, yayındaki reklam ve bannerları yönetir.' },
                          { key: 'canManageIssues', label: '⚠️ Destek Sistemi Yetkisi', desc: 'Alıcı ve satıcı arasındaki destek taleplerini çözer.' },
                          { key: 'canManageCMS', label: '💻 Slayt & CMS Yönetimi Yetkisi', desc: 'Ana sayfa slayt karuseli ve CMS içeriklerini günceller.' }
                        ].map((perm) => {
                          const val = modPerms[perm.key as keyof typeof modPerms];
                          return (
                            <View key={perm.key} style={{ paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: itemBorder, gap: 2 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{perm.label}</Text>
                                <Pressable
                                  disabled={modPerms.isSuperAdmin} // lock if super admin is checked
                                  onPress={() => {
                                    setModPerms(prev => ({ ...prev, [perm.key]: !val }));
                                  }}
                                  style={{
                                    width: 44,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: val ? '#10B981' : '#EF4444',
                                    justifyContent: 'center',
                                    paddingHorizontal: 2,
                                    opacity: modPerms.isSuperAdmin ? 0.5 : 1
                                  }}
                                >
                                  <View style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    backgroundColor: '#FFFFFF',
                                    alignSelf: val ? 'flex-end' : 'flex-start',
                                  }} />
                                </Pressable>
                              </View>
                              <Text style={{ fontSize: 10, color: theme.textSecondary }}>{perm.desc}</Text>
                            </View>
                          );
                        })}
                      </View>

                      <Pressable
                        onPress={() => {
                          assignModerator(modSelectedPhone, modPerms);
                          setModSelectedPhone('');
                          alert(`${selectedUser.name} başarıyla moderatör olarak atandı ve yetkilendirildi!`);
                        }}
                        style={{
                          backgroundColor: theme.gold,
                          paddingVertical: 10,
                          borderRadius: 6,
                          alignItems: 'center',
                          marginTop: 6,
                        }}
                      >
                        <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 12 }}>Atamayı Tamamla</Text>
                      </Pressable>
                    </View>
                  );
                })()}

                {/* Active Moderators list */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary, marginTop: 8 }}>Aktif Moderatörler</Text>
                {activeModerators.length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic', paddingLeft: 6 }}>Sistemde aktif moderatör bulunmamaktadır.</Text>
                ) : (
                  <View style={{ gap: 8 }}>
                    {activeModerators.map((mod) => {
                      const isExpanded = expandedModPhone === mod.phone;
                      const currentPerms = editingModPerms[mod.phone] || mod.moderatorPermissions || {
                        canModerateListings: false,
                        canApproveFirms: false,
                        canManageAds: false,
                        canManageIssues: false,
                        canManageCMS: false,
                        isSuperAdmin: false,
                      };

                      const isTargetSuper = mod.role === 'super_admin' || currentPerms.isSuperAdmin;

                      const handleToggleSuperAdminEdit = (val: boolean) => {
                        if (val) {
                          const msg = "Bu yetkiyi açarsanız ilgili kişi adminin tüm yetkilerine (Tam Denetim) sahip olur. Devam etmek istiyor musunuz?";
                          if (Platform.OS === 'web') {
                            const ok = window.confirm(msg);
                            if (ok) {
                              setEditingModPerms(prev => ({
                                ...prev,
                                [mod.phone]: {
                                  isSuperAdmin: true,
                                  canModerateListings: true,
                                  canApproveFirms: true,
                                  canManageAds: true,
                                  canManageIssues: true,
                                  canManageCMS: true
                                }
                              }));
                            }
                          } else {
                            Alert.alert("Tam Denetim Yetkisi", msg, [
                              { text: "Vazgeç", style: "cancel" },
                              { text: "Yetkilendir", style: "destructive", onPress: () => {
                                  setEditingModPerms(prev => ({
                                    ...prev,
                                    [mod.phone]: {
                                      isSuperAdmin: true,
                                      canModerateListings: true,
                                      canApproveFirms: true,
                                      canManageAds: true,
                                      canManageIssues: true,
                                      canManageCMS: true
                                    }
                                  }));
                                }
                              }
                            ]);
                          }
                        } else {
                          setEditingModPerms(prev => ({
                            ...prev,
                            [mod.phone]: {
                              isSuperAdmin: false,
                              canModerateListings: false,
                              canApproveFirms: false,
                              canManageAds: false,
                              canManageIssues: false,
                              canManageCMS: false
                            }
                          }));
                        }
                      };

                      return (
                        <View key={mod.phone} style={{ borderRadius: 8, backgroundColor: itemBg, borderWidth: 1, borderColor: isExpanded ? theme.gold : itemBorder, overflow: 'hidden' }}>
                          {/* Header Row */}
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, gap: 8 }}>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{mod.name}</Text>
                                {isTargetSuper && (
                                  <View style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 8, color: theme.gold, fontWeight: 'bold' }}>👑 Tam Yetkili</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={{ fontSize: 10, color: theme.textSecondary }}>Tel: {mod.phone}</Text>
                            </View>
                            
                            {/* Disable editing/deleting other super admins to avoid mutual modifications */}
                            {isTargetSuper ? (
                              <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                                <Text style={{ fontSize: 9, color: '#10B981', fontWeight: 'bold' }}>Sistem Yöneticisi</Text>
                              </View>
                            ) : (
                              <View style={{ flexDirection: 'row', gap: 6 }}>
                                <Pressable
                                  onPress={() => {
                                    if (isExpanded) {
                                      setExpandedModPhone(null);
                                    } else {
                                      setExpandedModPhone(mod.phone);
                                      setEditingModPerms(prev => ({
                                        ...prev,
                                        [mod.phone]: mod.moderatorPermissions || {
                                          canModerateListings: false,
                                          canApproveFirms: false,
                                          canManageAds: false,
                                          canManageIssues: false,
                                          canManageCMS: false,
                                          isSuperAdmin: false,
                                        }
                                      }));
                                    }
                                  }}
                                  style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 4,
                                    backgroundColor: isExpanded ? 'rgba(9, 105, 218, 0.15)' : 'rgba(9, 105, 218, 0.08)',
                                    borderWidth: 0.5,
                                    borderColor: '#0969DA'
                                  }}
                                >
                                  <Text style={{ color: '#0969DA', fontSize: 10, fontWeight: 'bold' }}>
                                    {isExpanded ? 'Kapat' : '✏️ Yetki Düzenle'}
                                  </Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    removeModerator(mod.phone);
                                    if (expandedModPhone === mod.phone) setExpandedModPhone(null);
                                    alert(`${mod.name} moderatörlük yetkisi geri alındı.`);
                                  }}
                                  style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                    borderWidth: 0.5,
                                    borderColor: '#EF4444'
                                  }}
                                >
                                  <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>Yetki Geri Al</Text>
                                </Pressable>
                              </View>
                            )}
                          </View>

                          {/* Permission badges (always visible) */}
                          {!isExpanded && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, paddingBottom: 10 }}>
                              {currentPerms.isSuperAdmin && (
                                <View style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, color: theme.gold, fontWeight: 'bold' }}>👑 Tam Denetim</Text>
                                </View>
                              )}
                              {currentPerms.canApproveFirms && (
                                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, color: '#10B981', fontWeight: 'bold' }}>🏢 Firma Onay</Text>
                                </View>
                              )}
                              {currentPerms.canModerateListings && (
                                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, color: '#10B981', fontWeight: 'bold' }}>🛡️ İlan Kontrol</Text>
                                </View>
                              )}
                              {currentPerms.canManageAds && (
                                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, color: '#10B981', fontWeight: 'bold' }}>📢 Reklam</Text>
                                </View>
                              )}
                              {currentPerms.canManageIssues && (
                                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, color: '#10B981', fontWeight: 'bold' }}>⚠️ Destek</Text>
                                </View>
                              )}
                              {currentPerms.canManageCMS && (
                                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, color: '#10B981', fontWeight: 'bold' }}>💻 CMS/Slayt</Text>
                                </View>
                              )}
                              {!currentPerms.isSuperAdmin && !currentPerms.canApproveFirms && !currentPerms.canModerateListings && !currentPerms.canManageAds && !currentPerms.canManageIssues && !currentPerms.canManageCMS && (
                                <Text style={{ fontSize: 9, color: theme.textSecondary, fontStyle: 'italic' }}>Henüz yetki atanmamış</Text>
                              )}
                            </View>
                          )}

                          {/* Inline Permission Editor (expanded) */}
                          {isExpanded && (
                            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(245, 158, 11, 0.3)', gap: 10, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.04)' : 'rgba(245, 158, 11, 0.03)' }}>
                              <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary }}>Yetkileri Düzenle:</Text>
                              
                              {/* Super Admin Switch inside editor */}
                              <View style={{ padding: 8, borderRadius: 6, backgroundColor: 'rgba(217, 119, 6, 0.05)', borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.15)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.gold }}>👑 Tam Denetim (Super Admin)</Text>
                                </View>
                                <Pressable
                                  onPress={() => handleToggleSuperAdminEdit(!currentPerms.isSuperAdmin)}
                                  style={{
                                    width: 44,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: currentPerms.isSuperAdmin ? theme.gold : '#EF4444',
                                    justifyContent: 'center',
                                    paddingHorizontal: 2,
                                  }}
                                >
                                  <View style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    backgroundColor: '#FFFFFF',
                                    alignSelf: currentPerms.isSuperAdmin ? 'flex-end' : 'flex-start',
                                  }} />
                                </Pressable>
                              </View>

                              {/* Specific permissions */}
                              {[
                                { key: 'canApproveFirms', label: '🏢 Firma Onay Yetkisi' },
                                { key: 'canModerateListings', label: '🛡️ İlan Kontrol Yetkisi' },
                                { key: 'canManageAds', label: '📢 Reklam Yönetimi Yetkisi' },
                                { key: 'canManageIssues', label: '⚠️ Destek Sistemi Yetkisi' },
                                { key: 'canManageCMS', label: '💻 Slayt & CMS Yönetimi' }
                              ].map((perm) => {
                                const val = currentPerms[perm.key as keyof ModeratorPermissions];
                                return (
                                  <View key={perm.key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: theme.text, flex: 1 }}>{perm.label}</Text>
                                    <Pressable
                                      disabled={currentPerms.isSuperAdmin}
                                      onPress={() => {
                                        setEditingModPerms(prev => ({
                                          ...prev,
                                          [mod.phone]: { ...currentPerms, [perm.key]: !val }
                                        }));
                                      }}
                                      style={{
                                        width: 44,
                                        height: 22,
                                        borderRadius: 11,
                                        backgroundColor: val ? '#10B981' : (isDark ? '#374151' : '#D1D5DB'),
                                        justifyContent: 'center',
                                        paddingHorizontal: 2,
                                        opacity: currentPerms.isSuperAdmin ? 0.5 : 1
                                      }}
                                    >
                                      <View style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 9,
                                        backgroundColor: '#FFFFFF',
                                        alignSelf: val ? 'flex-end' : 'flex-start',
                                      }} />
                                    </Pressable>
                                  </View>
                                );
                              })}
                              
                              <Pressable
                                onPress={() => {
                                  assignModerator(mod.phone, currentPerms);
                                  setExpandedModPhone(null);
                                  alert(`${mod.name} yetkileri güncellendi!`);
                                }}
                                style={{
                                  backgroundColor: theme.gold,
                                  paddingVertical: 8,
                                  borderRadius: 6,
                                  alignItems: 'center',
                                  marginTop: 4,
                                }}
                              >
                                <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 12 }}>Yetkileri Kaydet</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {adminPanelActiveTab === 'finance' && currentUser.role === 'super_admin' && (
              <FinanceReportPanel />
            )}
            </View>
          </View>
        )}

        {((currentUser.role !== 'super_admin' && currentUser.role !== 'moderator') || adminActiveTab === 'personal') && (
          <>
            {/* Personal Sub-Tabs Bar */}
            <View style={{ flexDirection: 'row', backgroundColor: cardBg, borderRadius: 10, borderWidth: 1, borderColor: itemBorder, padding: 4, marginTop: 16, marginBottom: 16 }}>
              {[
                { id: 'listings', label: '🏷️ İlanlarım', count: userListings.length },
                { id: 'bought', label: '🛒 Siparişlerim', count: boughtOrders.length },
                { id: 'sales', label: '💰 Satışlarım', count: sellerOrders.length },
                { id: 'won', label: '🏆 Kazandıklarım', count: wonListings.length },
              ].map((tab) => {
                const isActive = personalActiveTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setPersonalActiveTab(tab.id as any)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: isActive ? theme.gold : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 6
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: isActive ? '#FFFFFF' : theme.text }} numberOfLines={1}>
                      {tab.label}
                    </Text>
                    {tab.count > 0 && (
                      <View style={{
                        backgroundColor: isActive ? '#FFFFFF' : theme.gold,
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        minWidth: 18,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: isActive ? theme.gold : '#FFFFFF' }}>
                          {tab.count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {personalActiveTab === 'won' && (
              <>
                {/* KAZANDIĞIM MEZATLAR BÖLÜMÜ */}
                <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>KAZANDIĞIM MEZATLAR</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.countBadgeText}>{wonListings.length}</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {wonListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text, textAlign: 'center' }]}>Henüz kazandığınız bir mezat bulunmamaktadır.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {wonListings.map((item) => {
                const hoursLeft = item.auctionPaymentDeadline 
                  ? Math.max(0, Math.round((item.auctionPaymentDeadline - Date.now()) / (60 * 60 * 1000)))
                  : 0;

                return (
                  <View key={item.id} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>ID: #{item.id}</Text>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 4,
                        backgroundColor: item.auctionStatus === 'won' ? 'rgba(245, 158, 11, 0.12)' : item.auctionStatus === 'purchased' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: item.auctionStatus === 'won' ? '#F59E0B' : item.auctionStatus === 'purchased' ? '#10B981' : '#EF4444'
                        }}>
                          {item.auctionStatus === 'won' ? 'Ödeme Bekliyor' : item.auctionStatus === 'purchased' ? 'Satın Alındı' : 'Süre Aşımı / İptal'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <Image
                        source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                        style={{ width: 50, height: 50, borderRadius: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Kapanış Fiyatı: {item.price.toLocaleString('tr-TR')} TL
                        </Text>
                        {item.auctionStatus === 'won' && (
                          <Text style={{ color: hoursLeft <= 6 ? '#EF4444' : theme.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                            ⏳ Kalan Süre: {hoursLeft > 0 ? `${hoursLeft} saat` : '< 1 saat'}
                          </Text>
                        )}
                      </View>
                    </View>

                    {item.auctionStatus === 'won' && (
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <Pressable
                          style={{
                            flex: 1.5,
                            backgroundColor: '#10B981',
                            height: 34,
                            borderRadius: 6,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 6
                          }}
                          onPress={() => {
                            setCheckoutStep('cart');
                            setCartModalVisible(true);
                          }}
                        >
                          <ShoppingCart size={13} color="#FFFFFF" />
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>Sepete Git & Satın Al</Text>
                        </Pressable>

                        <Pressable
                          style={{
                            flex: 1,
                            borderColor: theme.gold,
                            borderWidth: 1,
                            backgroundColor: 'transparent',
                            height: 34,
                            borderRadius: 6,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 6
                          }}
                          onPress={() => {
                            const chatId = createChat(item.id);
                            router.push(`/chat/${chatId}`);
                          }}
                        >
                          <MessageSquare size={13} color={theme.gold} />
                          <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold' }}>Satıcıya Yaz</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </>
    )}

    {personalActiveTab === 'bought' && (
      <>
        {/* BUYER ORDERS SECTION */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>SİPARİŞLERİM</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.countBadgeText}>{orders.filter(o => o.buyerId === currentUser?.id).length}</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {(() => {
            const buyerOrders = orders.filter(o => o.buyerId === currentUser?.id);
            if (buyerOrders.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.text, textAlign: 'center' }]}>Henüz bir sipariş vermediniz.</Text>
                </View>
              );
            }
            return (
              <View style={{ gap: 12 }}>
                {buyerOrders.map((order) => (
                  <View key={order.id} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>{order.id}</Text>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 4,
                        backgroundColor: order.status === 'pending' ? 'rgba(245, 158, 11, 0.12)' : order.status === 'processing' ? 'rgba(59, 130, 246, 0.12)' : order.status === 'shipped' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)'
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: order.status === 'pending' ? '#F59E0B' : order.status === 'processing' ? '#3B82F6' : order.status === 'shipped' ? '#8B5CF6' : '#10B981'
                        }}>
                          {order.status === 'pending' ? 'Ödeme Alındı' : order.status === 'processing' ? 'Hazırlanıyor' : order.status === 'shipped' ? 'Kargoya Verildi' : 'Tamamlandı'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <Image
                        source={typeof order.items[0].listing.photos[0] === 'number' ? order.items[0].listing.photos[0] : { uri: order.items[0].listing.photos[0] }}
                        style={{ width: 44, height: 44, borderRadius: 6 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>
                          {order.items[0].listing.title}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Adet: {order.items[0].quantity} • Tutar: {order.totalAmount.toLocaleString('tr-TR')} TL
                        </Text>
                      </View>
                    </View>

                    {order.trackingNumber && (
                      <View style={{ 
                        padding: 10, 
                        borderRadius: 8, 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9', 
                        borderLeftWidth: 3, 
                        borderLeftColor: '#8B5CF6',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 4
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Kargo Takip No:</Text>
                          <Text style={{ fontSize: 12, color: theme.text, fontWeight: 'bold', marginTop: 2 }}>
                            {order.trackingNumber}
                          </Text>
                        </View>
                        <Pressable
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.gold,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                            gap: 4,
                          }}
                          onPress={() => {
                            setSelectedTrackingNum(order.trackingNumber);
                            setSelectedTrackingCarrier(order.shippingCompany || 'Kargo Firması');
                            setTrackingModalVisible(true);
                          }}
                        >
                          <Truck size={12} color="#000000" />
                          <Text style={{ color: '#000000', fontSize: 11, fontWeight: 'bold' }}>Kargom Nerede?</Text>
                        </Pressable>
                      </View>
                    )}

                    {order.status === 'completed' && (
                      <Pressable
                        style={{
                          backgroundColor: 'rgba(9, 105, 218, 0.1)',
                          borderColor: theme.gold,
                          borderWidth: 1,
                          paddingVertical: 8,
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 4,
                          flexDirection: 'row',
                          gap: 6
                        }}
                        onPress={() => handleOpenReviewModal(order)}
                        disabled={reviewedOrders.includes(order.id)}
                      >
                        <Star size={13} color={theme.gold} fill={reviewedOrders.includes(order.id) ? theme.gold : 'transparent'} />
                        <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold' }}>
                          {reviewedOrders.includes(order.id) ? 'Değerlendirildi' : 'Satıcıyı Değerlendir'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            );
          })()}
        </View>
      </>
    )}

    {personalActiveTab === 'sales' && (
      <>
        {/* SELLER ORDERS (SALES) SECTION */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>GELEN SİPARİŞLER (SATIŞLARINIZ)</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.countBadgeText}>{orders.filter(o => 
              o.items.some(item => 
                item.listing.sellerName === currentUser?.name || 
                (currentUser?.shopName && item.listing.sellerName === currentUser.shopName)
              )
            ).length}</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {(() => {
            const sellerOrders = orders.filter(o => 
              o.items.some(item => 
                item.listing.sellerName === currentUser?.name || 
                (currentUser?.shopName && item.listing.sellerName === currentUser.shopName)
              )
            );
            if (sellerOrders.length === 0) {
              return (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.text, textAlign: 'center' }]}>Henüz bir sipariş almadınız.</Text>
                </View>
              );
            }
            return (
              <View style={{ gap: 12 }}>
                {sellerOrders.map((order) => {
                  const trackingValue = trackingInputs[order.id] || '';
                  return (
                    <View key={order.id} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>{order.id}</Text>
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                          backgroundColor: order.status === 'pending' ? 'rgba(245, 158, 11, 0.12)' : order.status === 'processing' ? 'rgba(59, 130, 246, 0.12)' : order.status === 'shipped' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)'
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: order.status === 'pending' ? '#F59E0B' : order.status === 'processing' ? '#3B82F6' : order.status === 'shipped' ? '#8B5CF6' : '#10B981'
                          }}>
                            {order.status === 'pending' ? 'Yeni Sipariş' : order.status === 'processing' ? 'İşleme Alındı' : order.status === 'shipped' ? 'Kargoda' : 'Tamamlandı'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Image
                          source={typeof order.items[0].listing.photos[0] === 'number' ? order.items[0].listing.photos[0] : { uri: order.items[0].listing.photos[0] }}
                          style={{ width: 44, height: 44, borderRadius: 6 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>
                            {order.items[0].listing.title}
                          </Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                              Alıcı: {order.buyerName} ({order.buyerPhone})
                            </Text>
                            <Pressable 
                              onPress={() => {
                                const buyerProfile: UserProfile = {
                                  id: order.buyerId,
                                  name: order.buyerName,
                                  phone: order.buyerPhone,
                                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                                  role: 'user',
                                  trustScore: 9.8,
                                  verified: true
                                };
                                const chatId = createChat(order.items[0].listing.id, true, buyerProfile);
                                router.push(`/chat/${chatId}`);
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: 'rgba(9, 105, 218, 0.1)',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                                borderWidth: 0.5,
                                borderColor: theme.gold
                              }}
                            >
                              <MessageSquare size={10} color={theme.gold} />
                              <Text style={{ color: theme.gold, fontSize: 9, fontWeight: 'bold' }}>Alıcıya Yaz</Text>
                            </Pressable>
                          </View>
                          <Text style={{ color: theme.textSecondary, fontSize: 11 }} numberOfLines={1}>
                            Adres: {order.buyerAddress}
                          </Text>
                        </View>
                      </View>

                      {order.status === 'pending' && (
                        <Pressable
                          style={{ height: 36, borderRadius: 6, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}
                          onPress={() => {
                            updateOrderStatus(order.id, 'processing');
                            Alert.alert("Başarılı", "Sipariş işleme alındı! Müşteriye bildirim gönderildi.");
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Siparişi İşleme Al</Text>
                        </Pressable>
                      )}

                      {order.status === 'processing' && (
                        <View style={{ gap: 6, marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600' }}>Kargo Takip No Giriniz (Zorunlu):</Text>
                          <TextInput
                            style={{
                              height: 38,
                              borderWidth: 1,
                              borderColor: theme.backgroundSelected,
                              borderRadius: 6,
                              paddingHorizontal: 10,
                              fontSize: 12,
                              color: theme.text,
                              backgroundColor: theme.background
                            }}
                            placeholder="Örn: MNG12345678"
                            placeholderTextColor={theme.textSecondary}
                            value={trackingValue}
                            onChangeText={(txt) => setTrackingInputs(prev => ({ ...prev, [order.id]: txt }))}
                          />
                          <Pressable
                            style={{
                              height: 36,
                              borderRadius: 6,
                              backgroundColor: trackingValue.trim() ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: trackingValue.trim() ? 0 : 1,
                              borderColor: theme.backgroundSelected
                            }}
                            disabled={!trackingValue.trim()}
                            onPress={() => {
                              if (!trackingValue.trim()) {
                                Alert.alert("Hata", "Lütfen önce kargo takip numarası girin.");
                                return;
                              }
                              updateOrderStatus(order.id, 'shipped', trackingValue.trim());
                              Alert.alert("Başarılı", "Sipariş kargoya verildi! Takip numarası kaydedildi ve müşteriye bildirim gönderildi.");
                            }}
                          >
                            <Text style={{ color: trackingValue.trim() ? '#FFFFFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
                              Kargoya Verildi Olarak İşaretle
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      {order.status === 'shipped' && (
                        <View style={{ gap: 6, marginTop: 4 }}>
                          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Takip Numarası: {order.trackingNumber}</Text>
                          <Pressable
                            style={{ height: 36, borderRadius: 6, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => {
                              updateOrderStatus(order.id, 'completed');
                              Alert.alert("Başarılı", "Sipariş tamamlandı olarak işaretlendi! Müşteriye bildirim gönderildi.");
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Siparişi Tamamla</Text>
                          </Pressable>
                        </View>
                      )}

                      {order.status === 'completed' && (
                        <View style={{ padding: 6, borderRadius: 6, backgroundColor: 'rgba(16, 185, 129, 0.08)', borderWidth: 1, borderColor: '#10B981', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '700' }}>✓ İşlem Başarıyla Tamamlandı</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })()}
        </View>
      </>
    )}

    {personalActiveTab === 'listings' && (
      <>
        {/* Active Listings Header */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>İLANLARINIZ</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.countBadgeText}>{userListings.length}</Text>
          </View>
        </View>

        {/* Listings Container */}
        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)' }]}>
          {userListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Tag size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                Henüz yayınlanmış bir ilanınız bulunmuyor.
              </Text>
              <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
                İlan eklemek için alttaki + butonuna tıklayabilirsiniz.
              </Text>
              <Pressable
                style={[styles.addListingBtn, { backgroundColor: '#0969da' }]}
                onPress={() => {
                  console.log('[DEBUG] Profil screen "+ İlan Ver" button pressed!');
                  navigation.navigate('create');
                }}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addListingBtnText}>İlan Ver</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.listingsList}>
              {userListings.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.listingItem, { backgroundColor: itemBg, borderColor: itemBorder }]}
                  onPress={() => {
                    console.log('[DEBUG] Navigating to product:', item.id);
                    router.push(`/product/${item.id}` as any);
                  }}
                >
                  <Image
                    source={typeof item.photos[0] === 'number' ? item.photos[0] : { uri: item.photos[0] }}
                    style={styles.listingThumb}
                  />
                  <View style={styles.listingDetails}>
                    <Text style={[styles.listingTitleText, { color: theme.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>

                    {item.status && item.status !== 'active' && (
                      <View style={{
                        alignSelf: 'flex-start',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 4,
                        backgroundColor: item.status === 'pending_approval' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        marginTop: 4,
                        marginBottom: 2,
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: item.status === 'pending_approval' ? '#F59E0B' : '#EF4444'
                        }}>
                          {item.status === 'pending_approval' ? '⏳ Onay Bekliyor' : item.status === 'suspended' ? '⚠️ Yayından Kaldırıldı' : '❌ Reddedildi'}
                        </Text>
                      </View>
                    )}

                    {item.status === 'suspended' && item.rejectionReason && (
                      <Text style={{ fontSize: 11, color: '#EF4444', fontStyle: 'italic', marginTop: 2, marginBottom: 2 }}>
                        Gerekçe: {item.rejectionReason}
                      </Text>
                    )}

                    <View style={styles.listingMetaRow}>
                      <Text style={[styles.listingPriceText, { color: isDark ? theme.gold : theme.goldAccent }]}>
                        {item.price.toLocaleString('tr-TR')} TL
                      </Text>

                      <View style={[
                        styles.typeBadge,
                        {
                          backgroundColor: item.type === 'auction'
                            ? 'rgba(9, 105, 218, 0.12)'
                            : item.type === 'offer'
                            ? 'rgba(147, 51, 234, 0.12)'
                            : 'rgba(59, 130, 246, 0.12)',
                          borderColor: item.type === 'auction'
                            ? 'rgba(9, 105, 218, 0.25)'
                            : item.type === 'offer'
                            ? 'rgba(147, 51, 234, 0.25)'
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
                              : '#3B82F6'
                          }
                        ]}>
                          {item.type === 'auction' ? 'Mezat' : item.type === 'offer' ? 'Teklifli' : 'Sabit Fiyat'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.listingStatusRow}>
                      <View style={styles.statusItem}>
                        <Heart size={12} color="#EF4444" fill="#EF4444" />
                        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                          {item.favoritesCount} Beğeni
                        </Text>
                      </View>

                      {item.type === 'auction' && item.timeLeft !== undefined && (
                        <View style={styles.statusItem}>
                          <Clock size={12} color={theme.gold} />
                          <Text style={[styles.statusText, { color: theme.gold }]}>
                            {item.timeLeft > 0 ? formatTime(item.timeLeft) : 'Süre Doldu'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {item.status === 'suspended' && (
                        <Pressable
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderColor: '#10B981',
                            borderWidth: 1,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 4,
                          }}
                          onPress={(e) => {
                            e.stopPropagation();
                            updateListing(item.id, { status: 'pending_approval', rejectionReason: undefined });
                            Alert.alert('Başarılı', 'İlanınız yeniden onay için yöneticiye gönderildi.');
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#10B981' }}>
                            ⚡ Yeniden Yayınla
                          </Text>
                        </Pressable>
                      )}
                      <Pressable
                        style={{
                          backgroundColor: 'rgba(9, 105, 218, 0.1)',
                          borderColor: theme.gold,
                          borderWidth: 1,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 4,
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

                      <Pressable
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          borderColor: '#F59E0B',
                          borderWidth: 1,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 4,
                        }}
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push(`/create?editId=${item.id}`);
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#F59E0B' }}>
                          ✏️ Düzenle
                        </Text>
                      </Pressable>

                      <Pressable
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: '#EF4444',
                          borderWidth: 1,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 4,
                        }}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (Platform.OS === 'web') {
                            const confirmed = window.confirm('Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
                            if (confirmed) {
                              deleteListing(item.id);
                              alert('İlanınız başarıyla silindi.');
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
                                    deleteListing(item.id);
                                    Alert.alert('Başarılı', 'İlanınız başarıyla silindi.');
                                  }
                                }
                              ]
                            );
                          }
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#EF4444' }}>
                          🗑️ Sil
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <ChevronRight size={18} color={theme.textSecondary} style={{ marginRight: 4 }} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </>
    )}

        {/* HİZMETLER VE AYARLAR SECTION */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>HİZMETLER VE AYARLAR</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)', gap: 12, marginBottom: 16 }]}>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8,
              cursor: 'pointer' as any
            }}
            onPress={() => setAdModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={16} color="#F59E0B" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>Reklam Paneli (Reklam Ver)</Text>
            </View>
            <ChevronRight size={16} color={theme.textSecondary} />
          </Pressable>

          {/* Aktif Reklamlarım (Personal ads management for the current user) */}
          {(() => {
            const myAds = ads.filter(ad => ad.userId === currentUser?.id);
            if (myAds.length === 0) return null;
            return (
              <View style={{ borderTopWidth: 1, borderTopColor: theme.backgroundSelected, paddingTop: 12, gap: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.gold, marginBottom: 4 }}>📋 Aktif Reklamlarım ({myAds.length})</Text>
                {myAds.map((ad) => {
                  const associatedListing = listings.find(l => l.id === ad.listingId);
                  const isLive = ad.status === 'active';
                  
                  return (
                    <View key={ad.id} style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: itemBorder, backgroundColor: itemBg, gap: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.text, flex: 1 }} numberOfLines={1}>
                          {ad.title || associatedListing?.title || 'Profil Yönlendirmeli Reklam'}
                        </Text>
                        <View style={{ 
                          paddingHorizontal: 8, 
                          paddingVertical: 3, 
                          borderRadius: 4, 
                          backgroundColor: isLive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          borderWidth: 0.5,
                          borderColor: isLive ? '#22C55E' : '#F59E0B'
                        }}>
                          <Text style={{ fontSize: 9, fontWeight: 'bold', color: isLive ? '#22C55E' : '#F59E0B' }}>
                            {isLive ? 'YAYINDA' : 'YAYINDA DEĞİL'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                        Süre: {ad.durationType} • Bitiş: {new Date(ad.endDate).toLocaleDateString('tr-TR')}
                      </Text>

                      {/* Action Buttons Row */}
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, justifyContent: 'flex-end' }}>
                        {/* Düzenle Button */}
                        <Pressable
                          onPress={() => {
                            setEditingAd(ad);
                            setEditAdTitle(ad.title || '');
                            setEditAdDescription(ad.description || '');
                            setEditAdVideoUri(ad.videoUrl || null);
                            setEditAdSelectedListingId(ad.listingId === 'profile' ? '' : ad.listingId || '');
                            setEditAdDestinationType(ad.listingId === 'profile' ? 'profile' : 'listing');
                            setEditAdModalVisible(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: theme.backgroundSelected,
                            borderWidth: 1,
                            borderColor: theme.gold
                          }}
                        >
                          <Pencil size={11} color={theme.gold} />
                          <Text style={{ color: theme.gold, fontSize: 10, fontWeight: 'bold' }}>Düzenle</Text>
                        </Pressable>

                        {/* Yayından Kaldır / Yayına Al Button */}
                        <Pressable
                          onPress={() => {
                            const newStatus = isLive ? 'expired' : 'active';
                            updateAd(ad.id, { status: newStatus });
                            alert(isLive ? 'Reklam yayından kaldırıldı (durduruldu).' : 'Reklam yayına alındı!');
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: isLive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            borderWidth: 1,
                            borderColor: isLive ? '#F59E0B' : '#22C55E'
                          }}
                        >
                          {isLive ? <Pause size={11} color="#F59E0B" /> : <Play size={11} color="#22C55E" />}
                          <Text style={{ color: isLive ? '#F59E0B' : '#22C55E', fontSize: 10, fontWeight: 'bold' }}>
                            {isLive ? 'Yayından Kaldır' : 'Yayına Al'}
                          </Text>
                        </Pressable>

                        {/* Sil Button */}
                        <Pressable
                          onPress={() => {
                            if (Platform.OS === 'web') {
                              const confirmed = window.confirm('Bu reklamı kalıcı olarak silmek istediğinize emin misiniz?');
                              if (confirmed) {
                                deleteAd(ad.id);
                                alert('Reklam başarıyla silindi.');
                              }
                            } else {
                              Alert.alert(
                                'Reklamı Sil',
                                'Bu reklamı kalıcı olarak silmek istediğinize emin misiniz?',
                                [
                                  { text: 'İptal', style: 'cancel' },
                                  { 
                                    text: 'Sil', 
                                    style: 'destructive',
                                    onPress: () => {
                                      deleteAd(ad.id);
                                      alert('Reklam başarıyla silindi.');
                                    }
                                  }
                                ]
                              );
                            }
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            borderWidth: 1,
                            borderColor: '#EF4444'
                          }}
                        >
                          <Trash2 size={11} color="#EF4444" />
                          <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>Sil</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })()}
        </View>

        {/* BİLGİLENDİRME VE SÖZLEŞMELER SECTION */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionHeaderLine, { backgroundColor: theme.gold }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>BİLGİLENDİRME VE SÖZLEŞMELER</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)', gap: 12, marginBottom: 20 }]}>
          {[
            { title: 'Hakkımızda', text: ABOUT_US_TEXT },
            { title: 'Teslimat ve İade Şartları', text: DELIVERY_RETURN_TEXT },
            { title: 'Gizlilik Sözleşmesi (KVKK)', text: PRIVACY_POLICY_TEXT },
            { title: 'Mesafeli Satış Sözleşmesi', text: DISTANCE_SELLING_TEXT },
          ].map((item, idx) => (
            <Pressable
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: idx < 3 ? 1 : 0,
                borderBottomColor: theme.backgroundSelected,
                cursor: 'pointer' as any
              }}
              onPress={() => {
                setLegalModalTitle(item.title);
                setLegalModalContent(item.text);
                setLegalModalVisible(true);
              }}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(9, 105, 218, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color={theme.gold} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>{item.title}</Text>
              </View>
              <ChevronRight size={16} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
          </>
        )}
      </ScrollView>

      {/* Suspension Reason Input Modal */}
      <Modal
        visible={suspendModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuspendModalVisible(false)}
      >
        <View style={styles.storyViewerBackdrop}>
          <View style={{
            width: '90%',
            maxWidth: 450,
            backgroundColor: theme.backgroundElement,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.backgroundSelected,
            padding: 20,
            gap: 16,
          }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.text }}>
              {suspendMode === 'reject' ? 'İlanı Reddet ❌' : 'İlanı Yayından Kaldır ⚠️'}
            </Text>
            
            <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>
              {suspendMode === 'reject'
                ? `"${selectedSuspendListing?.title}" yeni ilanını reddetmek için gerekçenizi yazın. Satıcıya bildirim gönderilecek, ilan düzenleyerek tekrar başvurabilecektir.`
                : `"${selectedSuspendListing?.title}" ilanını yayından kaldırmak için gerekçenizi yazın. Satıcıya bildirim gönderilecek, ilan düzenleyerek yeniden yayınlaya başvurabilecektir.`
              }
            </Text>

            <TextInput
              style={{
                height: 80,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: inputBorder,
                backgroundColor: inputBg,
                color: theme.text,
                padding: 10,
                fontSize: 12,
                textAlignVertical: 'top',
              }}
              placeholder="Örn: Görsel kalitesi düşük veya açıklama kurallara aykırı."
              placeholderTextColor={theme.textSecondary}
              multiline
              value={suspendReason}
              onChangeText={setSuspendReason}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={() => setSuspendModalVisible(false)}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.backgroundSelected,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 12 }}>İptal</Text>
              </Pressable>
              
              <Pressable
                onPress={handleConfirmSuspend}
                style={{
                  flex: 1.5,
                  height: 38,
                  borderRadius: 6,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
                  {suspendMode === 'reject' ? 'Gerekçe Bildir & Reddet' : 'Gerekçe Bildir & Kaldır'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* İlan Detay & Moderasyon Önizleme Modalı */}
      <Modal
        visible={!!selectedModListing}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedModListing(null)}
      >
        <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{
            width: '95%',
            maxWidth: isDesktop ? 950 : 450,
            height: isDesktop ? 580 : '85%',
            backgroundColor: theme.backgroundElement,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.backgroundSelected,
            overflow: 'hidden',
            flexDirection: isDesktop ? 'row' : 'column',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 8,
          }}>
            {/* Close button top right */}
            <Pressable 
              onPress={() => setSelectedModListing(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999,
              }}
            >
              <X size={18} color="#FFF" />
            </Pressable>

            {/* Media Section */}
            <View style={{ 
              width: isDesktop ? 480 : '100%', 
              height: isDesktop ? '100%' : 260, 
              backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              position: 'relative',
              overflow: 'hidden',
              borderRightWidth: isDesktop ? 1 : 0,
              borderRightColor: theme.backgroundSelected,
              borderBottomWidth: isDesktop ? 0 : 1,
              borderBottomColor: theme.backgroundSelected,
            }}>
              {selectedModListing?.photos?.[0] && (
                <Image 
                  source={typeof selectedModListing.photos[0] === 'number' ? selectedModListing.photos[0] : { uri: selectedModListing.photos[0] }}
                  style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.15 : 0.08 }]}
                  blurRadius={15}
                  resizeMode="cover"
                />
              )}
              {selectedModListing?.videoUrl ? (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Image 
                    source={typeof selectedModListing.photos[0] === 'number' ? selectedModListing.photos[0] : { uri: selectedModListing.photos[0] }}
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  />
                  <View style={{ position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                    <Play size={30} color="#FFF" />
                  </View>
                  <Text style={{ position: 'absolute', bottom: 12, color: '#FFF', fontSize: 11, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                    Video İçerikli İlan
                  </Text>
                </View>
              ) : selectedModListing?.photos?.[0] ? (
                <Image 
                  source={typeof selectedModListing.photos[0] === 'number' ? selectedModListing.photos[0] : { uri: selectedModListing.photos[0] }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: theme.textSecondary }}>Görsel Yok</Text>
                </View>
              )}
            </View>

            {/* Detail & Action Content Section */}
            <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
              <ScrollView showsVerticalScrollIndicator style={{ flex: 1, marginBottom: 12 }}>
                {/* Category Badge & Condition */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <View style={{ backgroundColor: 'rgba(218, 165, 32, 0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ color: theme.gold, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {selectedModListing?.condition}
                    </Text>
                  </View>
                  <Text style={{ color: theme.textSecondary }}>•</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                      İlan No: <Text style={{ fontWeight: 'bold', color: theme.text }}>{selectedModListing?.listingNumber || 'Atanmadı'}</Text>
                    </Text>
                    {selectedModListing?.listingNumber && (
                      <Pressable
                        onPress={async () => {
                          const Clipboard = await import('expo-clipboard');
                          await Clipboard.setStringAsync(selectedModListing.listingNumber!);
                          alert('İlan numarası kopyalandı.');
                        }}
                        style={{ padding: 4 }}
                      >
                        <Copy size={11} color={theme.gold} />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Title */}
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 6 }}>
                  {selectedModListing?.title}
                </Text>

                {/* Price */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0969da', marginBottom: 16 }}>
                  {selectedModListing?.price?.toLocaleString('tr-TR')} TL
                </Text>

                {/* Specs & Seller Card */}
                <View style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  backgroundColor: theme.background, 
                  borderWidth: 1, 
                  borderColor: theme.backgroundSelected,
                  gap: 8,
                  marginBottom: 16
                }}>
                  <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                    👤 Satıcı: <Text style={{ fontWeight: 'bold', color: theme.text }}>{selectedModListing?.sellerName}</Text>
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                    📦 Stok Durumu: <Text style={{ fontWeight: 'bold', color: theme.text }}>{selectedModListing?.stock !== undefined ? `${selectedModListing.stock} Adet` : 'Belirtilmedi'}</Text>
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                    🏷️ İlan Tipi: <Text style={{ fontWeight: 'bold', color: theme.text }}>{selectedModListing?.type === 'auction' ? 'Açık Artırma' : selectedModListing?.type === 'offer' ? 'Teklifli Satış' : 'Sabit Fiyat'}</Text>
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                    🛡️ Durum: <Text style={{ 
                      fontWeight: 'bold', 
                      color: selectedModListing?.status === 'active' ? '#10B981' : selectedModListing?.status === 'pending_approval' ? theme.gold : '#EF4444' 
                    }}>
                      {selectedModListing?.status === 'active' ? 'Yayında (Aktif)' : selectedModListing?.status === 'pending_approval' ? 'Onay Bekliyor' : 'Askıda / Reddedildi'}
                    </Text>
                  </Text>
                </View>

                {/* Description */}
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text, marginBottom: 4 }}>Açıklama</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                  {selectedModListing?.description || 'Açıklama girilmemiş.'}
                </Text>
              </ScrollView>

              {/* Actions Footer */}
              <View style={{ gap: 8 }}>
                {selectedModListing?.status === 'pending_approval' ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      onPress={() => {
                        if (!selectedModListing) return;
                        updateListing(selectedModListing.id, { status: 'active', rejectionReason: undefined });
                        addNotification({
                          userId: selectedModListing.sellerId || 'user',
                          title: 'İlanınız Onaylandı ✅',
                          message: `"${selectedModListing.title}" başlıklı ilanınız yönetici tarafından onaylanarak yayına girdi!`,
                          type: 'system'
                        });
                        alert('İlan onaylanarak yayına girdi ve kullanıcıya bildirim gönderildi!');
                        setSelectedModListing(null);
                      }}
                      style={{
                        flex: 1.5,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: '#10B981',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Onayla ✓</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        if (!selectedModListing) return;
                        setSelectedModListing(null);
                        handleOpenSuspendModal(selectedModListing, 'reject');
                      }}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: '#EF4444',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Reddet ×</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {selectedModListing?.status !== 'suspended' && (
                      <Pressable
                        onPress={() => {
                          if (!selectedModListing) return;
                          setSelectedModListing(null);
                          handleOpenSuspendModal(selectedModListing);
                        }}
                        style={{
                          flex: 1,
                          height: 38,
                          borderRadius: 8,
                          backgroundColor: '#F59E0B',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Yayından Kaldır</Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => {
                        if (!selectedModListing) return;
                        const id = selectedModListing.id;
                        const title = selectedModListing.title;
                        const doDelete = () => {
                          deleteListing(id);
                          alert('İlan sistemden kalıcı olarak silindi.');
                          setSelectedModListing(null);
                        };

                        if (Platform.OS === 'web') {
                          const confirmed = window.confirm(`"${title}" ilanını sistemden kalıcı olarak silmek istediğinize emin misiniz?`);
                          if (confirmed) {
                            doDelete();
                          }
                        } else {
                          Alert.alert('İlanı Sil', `"${title}" ilanını sistemden kalıcı olarak silmek istediğinize emin misiniz?`, [
                            { text: 'Vazgeç', style: 'cancel' },
                            { text: 'Sil', style: 'destructive', onPress: doDelete }
                          ]);
                        }
                      }}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 8,
                        backgroundColor: '#EF4444',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Kalıcı Olarak Sil</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Global Legal Modal */}
      <Modal
        visible={legalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <View style={styles.storyViewerBackdrop}>
          <View style={{
            width: '90%',
            maxWidth: 550,
            height: '70%',
            backgroundColor: theme.backgroundElement,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.backgroundSelected,
            overflow: 'hidden',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.backgroundSelected,
            }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text }}>{legalModalTitle}</Text>
              <Pressable style={{ padding: 4 }} onPress={() => setLegalModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              <Text style={{ fontSize: 13, color: theme.text, lineHeight: 22 }}>
                {legalModalContent}
              </Text>
            </ScrollView>
          </View>
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
          {personalStories.length > 0 && activeStoryIndex < personalStories.length && (
            <View style={styles.storyViewerContainer}>
              {/* Full Screen Media (Image or Video) */}
              {(() => {
                const currentStory = personalStories[activeStoryIndex];
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
                {personalStories.map((st, idx) => {
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
                  source={{ uri: currentUser.avatar }} 
                  style={styles.storyViewerAvatar} 
                />
                <Text style={styles.storyViewerUsername}>
                  {currentUser.name}
                </Text>
                
                <Pressable style={styles.storyViewerCloseBtn} onPress={() => setStoryViewerVisible(false)}>
                  <X size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Bottom Actions */}
              {personalStories[activeStoryIndex].productId && (
                <View style={styles.storyViewerActions}>
                  <Pressable 
                    style={[styles.storyViewerBtn, { backgroundColor: 'rgba(9, 105, 218, 0.45)', borderColor: 'rgba(9, 105, 218, 0.6)', borderWidth: 1 }]}
                    onPress={() => {
                      const pid = personalStories[activeStoryIndex].productId;
                      const storyListing = listings.find(l => l.id === pid);
                      setStoryViewerVisible(false);
                      if (storyListing) {
                        router.push(getListingSeoUrl(storyListing) as any);
                      } else {
                        router.push(`/product/${pid}`);
                      }
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

      <CargoTrackingModal
        visible={trackingModalVisible}
        onClose={() => setTrackingModalVisible(false)}
        trackingNumber={selectedTrackingNum}
        carrierName={selectedTrackingCarrier}
      />

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

      {/* REVIEW SUBMISSION MODAL */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView
            type="backgroundElement"
            style={{
              width: '90%',
              maxWidth: 400,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.gold,
              gap: 16,
            }}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Satıcıyı Değerlendir</ThemedText>
              <Pressable onPress={() => setReviewModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            {selectedOrderForReview && (
              <View style={{ gap: 4, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>DEĞERLENDİRİLEN SATICI</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold' }}>
                  {selectedOrderForReview.sellerName}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11, fontStyle: 'italic', marginTop: 2, textAlign: 'center' }}>
                  "{selectedOrderForReview.items[0].listing.title}"
                </Text>
              </View>
            )}

            {/* Star Rating Selectors */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={{ padding: 4 }}
                >
                  <Star
                    size={32}
                    color={theme.gold}
                    fill={star <= reviewRating ? theme.gold : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Comment Input */}
            <View style={{ gap: 6 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Yorumunuz (İsteğe Bağlı)</Text>
              <TextInput
                style={{
                  height: 80,
                  borderColor: theme.backgroundSelected,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  color: theme.text,
                  backgroundColor: theme.background,
                  fontSize: 13,
                  textAlignVertical: 'top',
                }}
                placeholder="Alışveriş deneyiminiz nasıldı? (Örn: Hızlı kargo, ilgili satıcı...)"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                value={reviewComment}
                onChangeText={setReviewComment}
              />
            </View>

            <Pressable
              style={{
                backgroundColor: theme.gold,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
              }}
              onPress={handleSubmitReview}
            >
              <Text style={{ color: '#000000', fontSize: 13, fontWeight: 'bold' }}>Değerlendirmeyi Gönder</Text>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>

      {/* USER AD MANAGEMENT MODAL */}
      <Modal
        visible={adModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView
            type="backgroundElement"
            style={{
              width: '92%',
              maxWidth: 440,
              maxHeight: '85%',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.gold,
              gap: 16,
            }}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>📢 Reklam Paneli</ThemedText>
              <Pressable onPress={() => setAdModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
              {(() => {
                if (!currentUser) return null;
                const activeUserAd = ads.find(ad => ad.userId === currentUser.id && ad.status === 'active');
                if (activeUserAd) {
                  const associatedListing = listings.find(l => l.id === activeUserAd.listingId);
                  return (
                    <View style={{ gap: 12 }}>
                      <View style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        borderWidth: 1,
                        borderColor: '#10B981',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 14 }}>Aktif Reklamınız Bulunmaktadır</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center' }}>Aynı anda en fazla 1 adet aktif reklam yayınlayabilirsiniz.</Text>
                      </View>

                      <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.backgroundSelected, gap: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.text }}>{associatedListing?.title || 'İlan Silinmiş'}</Text>
                        <Text style={{ fontSize: 11, color: theme.textSecondary }}>Süre: {activeUserAd.durationType === '1day' ? '1 Gün' : activeUserAd.durationType === '3days' ? '3 Gün' : activeUserAd.durationType === '1week' ? '1 Hafta' : '1 Ay'}</Text>
                        <Text style={{ fontSize: 11, color: theme.textSecondary }}>Bitiş Tarihi: {new Date(activeUserAd.endDate).toLocaleDateString('tr-TR')}</Text>
                      </View>

                      <Pressable
                        onPress={() => {
                          deleteAd(activeUserAd.id);
                          alert('Reklamınız başarıyla yayından kaldırıldı.');
                        }}
                        style={{
                          backgroundColor: '#EF4444',
                          paddingVertical: 12,
                          borderRadius: 8,
                          alignItems: 'center',
                          marginTop: 8
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Reklamı Yayından Kaldır</Text>
                      </Pressable>
                    </View>
                  );
                }

                // Create new ad
                const userListings = listings.filter(l => l.sellerName === currentUser.name || (currentUser.shopName && l.sellerName === currentUser.shopName));
                
                const selectedListing = userListings.find(l => l.id === selectedAdListingId) || userListings[0];
                if (adDestinationType === 'listing' && !selectedAdListingId && selectedListing) {
                  setSelectedAdListingId(selectedListing.id);
                }

                const adConfig = adPricing[selectedAdDuration] || { price: 0, enabled: true };

                return (
                  <View style={{ gap: 14 }}>
                    {/* Destination Type Selector */}
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>1. REKLAM YÖNLENDİRME HEDEFİ</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Pressable
                        onPress={() => setAdDestinationType('listing')}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: adDestinationType === 'listing' ? theme.gold : theme.backgroundSelected,
                          backgroundColor: adDestinationType === 'listing' ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: adDestinationType === 'listing' ? theme.gold : theme.text }}>İlana Yönlendir</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setAdDestinationType('profile');
                          setSelectedAdListingId('');
                        }}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: adDestinationType === 'profile' ? theme.gold : theme.backgroundSelected,
                          backgroundColor: adDestinationType === 'profile' ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: adDestinationType === 'profile' ? theme.gold : theme.text }}>Profilime Yönlendir</Text>
                      </Pressable>
                    </View>

                    {/* Destination Selection/Listing selector */}
                    {adDestinationType === 'listing' ? (
                      <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>2. REKLAM YAPILACAK İLANI SEÇİN</Text>
                        {userListings.length === 0 ? (
                          <Text style={{ fontSize: 11, color: '#EF4444', fontStyle: 'italic', paddingVertical: 4 }}>
                            Aktif ilanınız bulunmamaktadır. Lütfen profil seçeneğini kullanın ya da önce ilan ekleyin.
                          </Text>
                        ) : (
                          <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={true}>
                            <View style={{ gap: 6 }}>
                              {userListings.map((listing) => {
                                const isSelected = selectedAdListingId === listing.id;
                                return (
                                  <Pressable
                                    key={listing.id}
                                    onPress={() => setSelectedAdListingId(listing.id)}
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      padding: 8,
                                      borderRadius: 8,
                                      borderWidth: 1,
                                      borderColor: isSelected ? theme.gold : theme.backgroundSelected,
                                      backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.03)' : 'transparent',
                                      gap: 8
                                    }}
                                  >
                                    <Image
                                      source={typeof listing.photos[0] === 'number' ? listing.photos[0] : { uri: listing.photos[0] }}
                                      style={{ width: 36, height: 36, borderRadius: 6 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>{listing.title}</Text>
                                      <Text style={{ fontSize: 10, color: theme.textSecondary }}>Fiyat: {listing.price.toLocaleString('tr-TR')} TL</Text>
                                    </View>
                                    {listing.videoUrl && (
                                      <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ fontSize: 9, color: '#10B981', fontWeight: 'bold' }}>Videolu</Text>
                                      </View>
                                    )}
                                  </Pressable>
                                );
                              })}
                            </View>
                          </ScrollView>
                        )}
                      </View>
                    ) : (
                      <View style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: theme.backgroundSelected }}>
                        <Text style={{ fontSize: 12, color: theme.text, lineHeight: 18 }}>
                          📢 Reklamınız doğrudan satıcı profilinize yönlendirilecektir: <Text style={{ fontWeight: 'bold', color: theme.gold }}>@{currentUser.shopName || currentUser.name}</Text>
                        </Text>
                      </View>
                    )}

                    {/* Custom Title and Description Inputs */}
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>{adDestinationType === 'listing' ? '3.' : '2.'} REKLAM METİNLERİ (OPSİYONEL)</Text>
                    <View style={{ gap: 8 }}>
                      <TextInput
                        style={{
                          height: 38,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: theme.backgroundSelected,
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          color: theme.text,
                          paddingHorizontal: 10,
                          fontSize: 12
                        }}
                        placeholder={selectedListing?.title ? `Reklam Başlığı (Boşsa: ${selectedListing.title})` : "Örn: En Özel Koleksiyon Ürünlerim"}
                        placeholderTextColor={theme.textSecondary}
                        value={customAdTitle}
                        onChangeText={setCustomAdTitle}
                      />
                      <TextInput
                        style={{
                          height: 38,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: theme.backgroundSelected,
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          color: theme.text,
                          paddingHorizontal: 10,
                          fontSize: 12
                        }}
                        placeholder={selectedListing?.description ? `Reklam Açıklaması (Boşsa: ${selectedListing.description.substring(0, 30)}...)` : "Örn: Profilimdeki harika ürünleri ve yeni mezatları kaçırmayın."}
                        placeholderTextColor={theme.textSecondary}
                        value={customAdDescription}
                        onChangeText={setCustomAdDescription}
                      />
                    </View>

                    {/* Video Selection Section */}
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>{adDestinationType === 'listing' ? '4.' : '3.'} REKLAM REELS VİDEOSU</Text>
                    <View style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.backgroundSelected, gap: 10 }}>
                      <Text style={{ fontSize: 12, color: theme.text }}>
                        {newAdRemoteVideoUrl 
                          ? '✅ Reklam videosu hazır ve yüklendi.' 
                          : (isAdCompressing || isAdUploading)
                          ? '⏳ Video işleniyor ve yükleniyor...'
                          : (adDestinationType === 'listing' && selectedListing?.videoUrl) 
                          ? 'ℹ️ İlanınızın mevcut videosu kullanılacaktır.' 
                          : '⚠️ Lütfen cihazınızdan bir Reels videosu yükleyin (Maksimum 8 saniye).'}
                      </Text>
                      
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable
                          onPress={handlePickAdVideo}
                          disabled={isAdCompressing || isAdUploading}
                          style={{
                            flex: 1,
                            height: 38,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: theme.gold,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: (isAdCompressing || isAdUploading) ? 'rgba(0,0,0,0.05)' : 'transparent'
                          }}
                        >
                          <Text style={{ color: theme.gold, fontSize: 12, fontWeight: 'bold' }}>
                            {isAdCompressing 
                              ? `Sıkıştırılıyor (${adCompressionProgress}%)` 
                              : isAdUploading 
                              ? `Yükleniyor (${adUploadProgress}%)` 
                              : (newAdRemoteVideoUrl ? 'Videoyu Değiştir' : 'Cihazdan Video Yükle')}
                          </Text>
                        </Pressable>

                        {newAdVideoUri && (
                          <Pressable
                            onPress={() => {
                              setNewAdVideoUri(null);
                              setNewAdRemoteVideoUrl(null);
                            }}
                            disabled={isAdCompressing || isAdUploading}
                            style={{
                              paddingHorizontal: 12,
                              height: 38,
                              borderRadius: 6,
                              backgroundColor: '#EF4444',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: (isAdCompressing || isAdUploading) ? 0.5 : 1
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>Temizle</Text>
                          </Pressable>
                        )}
                      </View>

                      {/* Small Upload/Compression Progress Bar */}
                      {(isAdCompressing || isAdUploading) && (
                        <View style={{ height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                          <View style={{ 
                            height: '100%', 
                            width: `${isAdCompressing ? adCompressionProgress : adUploadProgress}%`, 
                            backgroundColor: isAdCompressing ? '#F59E0B' : '#10B981', 
                            borderRadius: 2 
                          }} />
                        </View>
                      )}

                      {newAdRemoteVideoUrl && (
                        <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600', marginTop: 2 }}>
                          ⚡ Video hazır ve buluta yüklendi!
                        </Text>
                      )}
                    </View>

                    {/* Ad Duration selector */}
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>{adDestinationType === 'listing' ? '5.' : '4.'} REKLAM SÜRESİNİ SEÇİN</Text>
                    <View style={{ gap: 8 }}>
                      {Object.keys(adPricing).map((durationKey) => {
                        const duration = durationKey as '1day' | '3days' | '1week' | '1month';
                        const config = adPricing[duration];
                        if (!config.enabled) return null;

                        const label = duration === '1day' ? '1 Günlük Reklam' : duration === '3days' ? '3 Günlük Reklam' : duration === '1week' ? '1 Haftalık Reklam' : '1 Aylık Reklam';
                        const isSelected = selectedAdDuration === duration;

                        return (
                          <Pressable
                            key={duration}
                            onPress={() => setSelectedAdDuration(duration)}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: 12,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? theme.gold : theme.backgroundSelected,
                              backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.05)' : 'transparent'
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: isSelected ? 'bold' : 'normal', color: theme.text }}>{label}</Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.gold }}>
                              {config.price === 0 ? 'Ücretsiz' : `${config.price.toLocaleString('tr-TR')} TL`}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Pressable
                      onPress={async () => {
                        if (adDestinationType === 'listing' && !selectedAdListingId) {
                          alert('Lütfen bir ilan seçin.');
                          return;
                        }
                        
                        if (isAdCompressing || isAdUploading) {
                          alert('Lütfen video sıkıştırma ve yükleme işleminin tamamlanmasını bekleyin.');
                          return;
                        }

                        let remoteVideoUrl = newAdRemoteVideoUrl || (adDestinationType === 'listing' && selectedListing?.videoUrl) || '';
                        if (!remoteVideoUrl && newAdVideoUri) {
                          alert('Lütfen video yükleme işleminin bitmesini bekleyin.');
                          return;
                        }

                        if (!remoteVideoUrl) {
                          alert('Lütfen reklam için cihazdan bir video yükleyin veya videolu bir ilan seçin.');
                          return;
                        }

                        const targetListing = listings.find(l => l.id === selectedAdListingId);
                        const targetLink = adDestinationType === 'profile' 
                          ? `/seller/${currentUser.shopName || currentUser.name}` 
                          : (targetListing ? getListingSeoUrl(targetListing) : `/product/${selectedAdListingId}`);

                        const titleText = customAdTitle.trim() || selectedListing?.title || `${currentUser.shopName || currentUser.name} Mağazası`;
                        const descriptionText = customAdDescription.trim() || selectedListing?.description || 'En yeni ilanlarımızı ve mezatlarımızı profilimizde bulabilirsiniz.';
                        
                        // Submit ad
                        createAd({
                          userId: currentUser.id,
                          userName: currentUser.shopName || currentUser.name,
                          listingId: adDestinationType === 'profile' ? 'profile' : selectedAdListingId,
                          videoUrl: remoteVideoUrl,
                          durationType: selectedAdDuration,
                          title: titleText,
                          description: descriptionText,
                          targetUrl: targetLink
                        } as any);

                        alert('Reklamınız başarıyla oluşturuldu ve yayına alındı!');
                        setAdModalVisible(false);
                        setNewAdVideoUri(null);
                        setCustomAdTitle('');
                        setCustomAdDescription('');
                      }}
                      style={{
                        backgroundColor: theme.gold,
                        paddingVertical: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 10
                      }}
                    >
                      <Text style={{ color: '#000000', fontSize: 14, fontWeight: 'bold' }}>Reklam Yayınla</Text>
                    </Pressable>
                  </View>
                );
              })()}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

      {/* EDIT AD MODAL */}
      <Modal
        visible={editAdModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditAdModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView
            type="backgroundElement"
            style={{
              width: '92%',
              maxWidth: 440,
              maxHeight: '85%',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.gold,
              gap: 16,
            }}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>✏️ Reklamı Düzenle</ThemedText>
              <Pressable onPress={() => setEditAdModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 16 }}>
              {/* Ad Destination type selection */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>1. REKLAM HEDEFİ</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    onPress={() => setEditAdDestinationType('listing')}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      paddingVertical: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: editAdDestinationType === 'listing' ? theme.gold : theme.backgroundSelected,
                      backgroundColor: editAdDestinationType === 'listing' ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                    }}
                  >
                    <Megaphone size={14} color={editAdDestinationType === 'listing' ? theme.gold : theme.text} />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: editAdDestinationType === 'listing' ? theme.gold : theme.text }}>İlana Yönlendir</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setEditAdDestinationType('profile');
                      setEditAdSelectedListingId('');
                    }}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      paddingVertical: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: editAdDestinationType === 'profile' ? theme.gold : theme.backgroundSelected,
                      backgroundColor: editAdDestinationType === 'profile' ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                    }}
                  >
                    <User size={14} color={editAdDestinationType === 'profile' ? theme.gold : theme.text} />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: editAdDestinationType === 'profile' ? theme.gold : theme.text }}>Profilime Yönlendir</Text>
                  </Pressable>
                </View>
              </View>

              {/* Target Listing select dropdown */}
              {editAdDestinationType === 'listing' && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>İLAN SEÇİN</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {listings
                      .filter(l => l.sellerName === (currentUser?.shopName || currentUser?.name))
                      .map((l) => {
                        const isSelected = l.id === editAdSelectedListingId;
                        return (
                          <Pressable
                            key={l.id}
                            onPress={() => setEditAdSelectedListingId(l.id)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: isSelected ? theme.gold : theme.backgroundSelected,
                              backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.08)' : theme.backgroundElement,
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '600', color: isSelected ? theme.gold : theme.text }}>
                              {l.title}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </ScrollView>
                </View>
              )}

              {/* Ad Title & Description inputs */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>2. REKLAM DETAYLARI</Text>
                <TextInput
                  style={{
                    height: 40,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
                    color: theme.text,
                    paddingHorizontal: 12,
                    fontSize: 13,
                  }}
                  placeholder="Reklam başlığı girin..."
                  placeholderTextColor={theme.textSecondary}
                  value={editAdTitle}
                  onChangeText={setEditAdTitle}
                />
                <TextInput
                  style={{
                    height: 60,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
                    color: theme.text,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    fontSize: 13,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Reklam açıklaması girin..."
                  placeholderTextColor={theme.textSecondary}
                  value={editAdDescription}
                  onChangeText={setEditAdDescription}
                  multiline
                />
              </View>

              {/* Video selection */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>3. REKLAM VİDEOSU</Text>
                {editAdVideoUri ? (
                  <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.backgroundSelected, backgroundColor: itemBg, gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: theme.text, fontSize: 12 }}>
                        {editAdRemoteVideoUrl 
                          ? '✅ Reklam videosu hazır ve yüklendi.' 
                          : (isAdEditingCompressing || isAdEditingUploading)
                          ? '⏳ Video işleniyor ve yükleniyor...'
                          : '✅ Video seçildi.'}
                      </Text>
                      <Pressable
                        onPress={() => {
                          setEditAdVideoUri(null);
                          setEditAdRemoteVideoUrl(null);
                        }}
                        disabled={isAdEditingCompressing || isAdEditingUploading}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          backgroundColor: '#EF4444',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>Kaldır</Text>
                      </Pressable>
                    </View>

                    {/* Progress Bar for editing video */}
                    {(isAdEditingCompressing || isAdEditingUploading) && (
                      <View style={{ height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                        <View style={{ 
                          height: '100%', 
                          width: `${isAdEditingCompressing ? adEditingCompressionProgress : adEditingUploadProgress}%`, 
                          backgroundColor: isAdEditingCompressing ? '#F59E0B' : '#10B981', 
                          borderRadius: 2 
                        }} />
                      </View>
                    )}

                    {(isAdEditingCompressing || isAdEditingUploading) && (
                      <Text style={{ fontSize: 10, color: theme.textSecondary }}>
                        {isAdEditingCompressing 
                          ? `Sıkıştırılıyor: %${adEditingCompressionProgress}` 
                          : `Sunucuya yükleniyor: %${adEditingUploadProgress}`}
                      </Text>
                    )}

                    {editAdRemoteVideoUrl && (
                      <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '600' }}>
                        ⚡ Düzenlenen video buluta başarıyla yüklendi!
                      </Text>
                    )}
                  </View>
                ) : (
                  <Pressable
                    onPress={handlePickEditAdVideo}
                    style={{
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderColor: theme.gold,
                      borderRadius: 8,
                      height: 80,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Camera size={20} color={theme.gold} />
                    <Text style={{ fontSize: 11, color: theme.gold, fontWeight: '600' }}>Yeni Video Yükle</Text>
                  </Pressable>
                )}
              </View>

              {/* Save Button */}
              <Pressable
                onPress={async () => {
                  if (editAdDestinationType === 'listing' && !editAdSelectedListingId) {
                    alert('Lütfen bir ilan seçin.');
                    return;
                  }
                  
                  if (isAdEditingCompressing || isAdEditingUploading) {
                    alert('Lütfen video sıkıştırma ve yükleme işleminin tamamlanmasını bekleyin.');
                    return;
                  }

                  let remoteVideoUrl = editAdRemoteVideoUrl || editAdVideoUri;
                  if (!remoteVideoUrl) {
                    alert('Lütfen reklam için bir video seçin.');
                    return;
                  }

                  setIsUploadingEditVideo(true);

                  const targetListing = listings.find(l => l.id === editAdSelectedListingId);
                  const targetLink = editAdDestinationType === 'profile'
                    ? `/seller/${currentUser.shopName || currentUser.name}`
                    : (targetListing ? getListingSeoUrl(targetListing) : `/product/${editAdSelectedListingId}`);

                  // Update ad in store and Firestore
                  updateAd(editingAd.id, {
                    title: editAdTitle.trim(),
                    description: editAdDescription.trim(),
                    videoUrl: remoteVideoUrl,
                    targetUrl: targetLink,
                    listingId: editAdDestinationType === 'profile' ? 'profile' : editAdSelectedListingId
                  });

                  setIsUploadingEditVideo(false);
                  setEditAdModalVisible(false);
                  alert('Reklamınız başarıyla güncellendi!');
                }}
                disabled={isUploadingEditVideo}
                style={{
                  backgroundColor: theme.gold,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                  opacity: isUploadingEditVideo ? 0.7 : 1,
                }}
              >
                <Text style={{ color: '#000000', fontSize: 14, fontWeight: 'bold' }}>
                  {isUploadingEditVideo ? 'Reklam Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                </Text>
              </Pressable>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  scrollContainer: {
    paddingBottom: 120,
    gap: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
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
    gap: 4,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
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
  formCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
  },
  addListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  addListingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listingsList: {
    gap: 12,
  },
  listingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
  },
  listingThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  listingDetails: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  listingTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listingPriceText: {
    fontSize: 14,
    fontWeight: '800',
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
  listingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0969da',
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  storyAvatarWrapper: {
    position: 'relative',
  },
  storyRingGradient: {
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
  cameraOverlayStory: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shortcutCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    minHeight: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shortcutIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shortcutBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  shortcutBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

// ==========================================
// SUPER ADMIN FINANCE PANEL COMPONENT
// ==========================================
function FinanceReportPanel() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const { orders, ads } = useAppStore();

  // Combine with mock orders/ads to show beautiful statistics
  const mockOrders = useMemo(() => {
    const list = [...orders];
    const sellers = ["Akar Antika", "Mega Kurumsal", "Derya Galeri", "Bahçe Dünyası"];
    const buyers = ["Ali Yılmaz", "Veli Demir", "Ayşe Kaya", "Fatma Şahin", "Mehmet Öztürk"];
    const paymentMethods = ["Kredi Kartı", "Havale/EFT", "Cüzdan"];
    const listingTypes = ["auction", "fixed", "offer"];
    
    const now = new Date();
    for (let i = 1; i <= 35; i++) {
      const orderDate = new Date();
      orderDate.setDate(now.getDate() - (i % 30));
      orderDate.setHours(10 + (i % 12), (i * 13) % 60, 0, 0);
      
      const price = 500 + (i * 350) % 7500;
      const listingType = listingTypes[i % listingTypes.length];
      
      list.push({
        id: `ORD-FI-${1000 + i}`,
        buyerId: `buy-${i % 5}`,
        buyerName: buyers[i % buyers.length],
        buyerPhone: `0555555550${i % 5}`,
        buyerAddress: "Atatürk Mah. No: " + i + " Çankaya/Ankara",
        sellerName: sellers[i % sellers.length],
        totalAmount: price,
        status: 'completed',
        createdAt: orderDate.toISOString(),
        items: [
          {
            quantity: 1,
            listing: {
              id: `lst-${i}`,
              title: `${sellers[i % sellers.length]} Özel Ürün #${i}`,
              price: price,
              type: listingType,
              category: "Antika & Koleksiyon",
              photos: ["https://picsum.photos/200"],
            }
          }
        ],
        paymentMethod: paymentMethods[i % paymentMethods.length],
      } as any);
    }
    return list;
  }, [orders]);

  const mockAds = useMemo(() => {
    const list = [...ads];
    const sellers = ["Akar Antika", "Mega Kurumsal", "Derya Galeri", "Bahçe Dünyası"];
    const durationTypes = ['1day', '3days', '1week', '1month'];
    const now = new Date();
    for (let i = 1; i <= 15; i++) {
      const adDate = new Date();
      adDate.setDate(now.getDate() - (i * 2) % 30);
      
      list.push({
        id: `AD-${2000 + i}`,
        userId: `usr-${i % 4}`,
        userName: sellers[i % sellers.length],
        listingId: `lst-${i}`,
        title: `Sponsorlu Reklam #${i}`,
        durationType: durationTypes[i % durationTypes.length] as any,
        startDate: adDate.getTime(),
        endDate: adDate.getTime() + 86400000 * (i % 4 === 0 ? 30 : i % 4 === 1 ? 7 : 3),
        status: i % 5 === 0 ? 'expired' : 'active',
        videoUrl: ''
      });
    }
    return list;
  }, [ads]);

  // Filters State
  const [period, setPeriod] = useState<'7days' | '30days' | 'thisMonth' | 'all'>('30days');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [sellerSearchInput, setSellerSearchInput] = useState('');
  const [showSellerSuggestions, setShowSellerSuggestions] = useState(false);
  const [isSearchingSellers, setIsSearchingSellers] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [financeSubTab, setFinanceSubTab] = useState<'summary' | 'products'>('summary');
  const chartScrollRef = useRef<ScrollView>(null);

  // Simulated database query effect for matching sellers
  useEffect(() => {
    if (sellerSearchInput.length >= 3) {
      setIsSearchingSellers(true);
      const timer = setTimeout(() => {
        setIsSearchingSellers(false);
        setShowSellerSuggestions(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearchingSellers(false);
      setShowSellerSuggestions(false);
      if (sellerSearchInput === '') {
        setSellerFilter('all');
      }
    }
  }, [sellerSearchInput]);

  // Extract Unique Sellers
  const sellersList = useMemo(() => {
    const set = new Set<string>();
    mockOrders.forEach(o => {
      if (o.sellerName) set.add(o.sellerName);
    });
    return Array.from(set);
  }, [mockOrders]);

  // Filtered Orders & Ads
  const filteredData = useMemo(() => {
    const now = new Date();
    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (startDateStr) {
      startLimit = new Date(startDateStr);
      if (!isNaN(startLimit.getTime())) {
        startLimit.setHours(0, 0, 0, 0);
      } else {
        startLimit = null;
      }
    }
    if (endDateStr) {
      endLimit = new Date(endDateStr);
      if (!isNaN(endLimit.getTime())) {
        endLimit.setHours(23, 59, 59, 999);
      } else {
        endLimit = null;
      }
    }

    if (!startDateStr && !endDateStr) {
      if (period === '7days') {
        startLimit = new Date();
        startLimit.setDate(now.getDate() - 7);
        startLimit.setHours(0, 0, 0, 0);
      } else if (period === '30days') {
        startLimit = new Date();
        startLimit.setDate(now.getDate() - 30);
        startLimit.setHours(0, 0, 0, 0);
      } else if (period === 'thisMonth') {
        startLimit = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Filter orders
    const filteredOrders = mockOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (startLimit && orderDate < startLimit) return false;
      if (endLimit && orderDate > endLimit) return false;
      if (sellerFilter !== 'all' && order.sellerName !== sellerFilter) return false;
      
      if (searchText.trim() !== '') {
        const search = searchText.toLowerCase();
        const matchesBuyer = order.buyerName?.toLowerCase().includes(search);
        const matchesSeller = order.sellerName?.toLowerCase().includes(search);
        const matchesId = order.id.toLowerCase().includes(search);
        if (!matchesBuyer && !matchesSeller && !matchesId) return false;
      }
      return true;
    });

    // Filter ads
    const filteredAds = mockAds.filter(ad => {
      const adDate = new Date(ad.startDate);
      if (startLimit && adDate < startLimit) return false;
      if (endLimit && adDate > endLimit) return false;
      if (sellerFilter !== 'all' && ad.userName !== sellerFilter) return false;
      return true;
    });

    return { orders: filteredOrders, ads: filteredAds };
  }, [mockOrders, mockAds, period, startDateStr, endDateStr, sellerFilter, searchText]);

  // Financial Calculations
  const metrics = useMemo(() => {
    let totalCiro = 0;
    let totalOrdersCount = filteredData.orders.length;
    let completedOrders = 0;
    
    filteredData.orders.forEach(o => {
      totalCiro += o.totalAmount;
      if (o.status === 'completed') {
        completedOrders++;
      }
    });

    // Commissions (assume 10% rate)
    const commissionRevenue = totalCiro * 0.1;

    // Ad Revenues
    let adRevenue = 0;
    const adRates = { '1day': 150, '3days': 350, '1week': 600, '1month': 1800 };
    filteredData.ads.forEach(ad => {
      const rate = adRates[ad.durationType as '1day'] || 150;
      adRevenue += rate;
    });

    const totalProfit = commissionRevenue + adRevenue;
    const avgOrderVal = totalOrdersCount > 0 ? totalCiro / totalOrdersCount : 0;

    return {
      totalCiro,
      totalOrdersCount,
      commissionRevenue,
      adRevenue,
      totalProfit,
      avgOrderVal,
      completedOrders
    };
  }, [filteredData]);

  // SVG Trend Chart Data Points (Continuous daily points)
  const trendPoints = useMemo(() => {
    const dayMap: { [dateStr: string]: number } = {};
    filteredData.orders.forEach(o => {
      const d = new Date(o.createdAt);
      const dateKey = `${d.getDate()}/${d.getMonth() + 1}`;
      dayMap[dateKey] = (dayMap[dateKey] || 0) + o.totalAmount;
    });

    // Determine the start and end dates
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        startDate = new Date();
        startDate.setDate(now.getDate() - 30);
        endDate = now;
      }
    } else {
      if (period === '7days') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === '30days') {
        startDate.setDate(now.getDate() - 30);
      } else if (period === 'thisMonth') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate.setDate(now.getDate() - 30);
      }
    }

    const points: { label: string, value: number }[] = [];
    const current = new Date(startDate);
    current.setHours(0,0,0,0);
    const limit = new Date(endDate);
    limit.setHours(23,59,59,999);

    let count = 0;
    while (current <= limit && count < 100) {
      const dateKey = `${current.getDate()}/${current.getMonth() + 1}`;
      points.push({
        label: dateKey,
        value: dayMap[dateKey] || 0
      });
      current.setDate(current.getDate() + 1);
      count++;
    }

    return points;
  }, [filteredData, period, startDateStr, endDateStr]);

  // SVGs geometry details for Trend Line Chart (showing exactly 15 days visible window)
  const viewportWidth = isDesktop ? 680 : width - 72;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const stepX = useMemo(() => {
    const plotWidth = viewportWidth - paddingLeft - paddingRight;
    const visibleDays = Math.min(trendPoints.length, 15);
    return visibleDays > 1 ? plotWidth / (visibleDays - 1) : plotWidth;
  }, [trendPoints.length, viewportWidth]);

  const svgWidth = useMemo(() => {
    if (trendPoints.length <= 15) return viewportWidth;
    return paddingLeft + paddingRight + (trendPoints.length - 1) * stepX;
  }, [trendPoints.length, viewportWidth, stepX]);

  const chartPoints = useMemo(() => {
    if (trendPoints.length === 0) return [];
    const maxVal = Math.max(...trendPoints.map(p => p.value), 500);
    const minVal = 0;
    const yRange = maxVal - minVal;
    const plotHeight = svgHeight - paddingTop - paddingBottom;
    
    return trendPoints.map((p, index) => {
      const x = paddingLeft + index * stepX;
      const y = paddingTop + plotHeight - ((p.value - minVal) * plotHeight) / yRange;
      return { x, y, label: p.label, value: p.value };
    });
  }, [trendPoints, stepX]);

  // Scroll to the end of the chart (most recent days) when layout finishes
  useEffect(() => {
    if (chartPoints.length > 0) {
      const timer = setTimeout(() => {
        chartScrollRef.current?.scrollToEnd({ animated: false });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [chartPoints, financeSubTab]);

  // Match sellers for autocomplete input
  const matchingSellers = useMemo(() => {
    if (sellerSearchInput.length < 3) return [];
    return sellersList.filter(name => 
      name.toLowerCase().includes(sellerSearchInput.toLowerCase())
    );
  }, [sellersList, sellerSearchInput]);

  // Sold Products and Sellers Aggregated Insights (Top Lists)
  const insights = useMemo(() => {
    const productStats: { [title: string]: { title: string, count: number, revenue: number, category: string } } = {};
    const sellerStats: { [name: string]: { name: string, count: number, revenue: number } } = {};

    filteredData.orders.forEach(order => {
      const seller = order.sellerName || "Bilinmeyen Satıcı";
      if (!sellerStats[seller]) {
        sellerStats[seller] = { name: seller, count: 0, revenue: 0 };
      }
      sellerStats[seller].count += 1;
      sellerStats[seller].revenue += order.totalAmount;

      (order.items || []).forEach(item => {
        const title = item.listing?.title || "Özel Ürün";
        const category = item.listing?.category || "Genel";
        const qty = item.quantity || 1;
        const rev = order.totalAmount;

        if (!productStats[title]) {
          productStats[title] = { title, count: 0, revenue: 0, category };
        }
        productStats[title].count += qty;
        productStats[title].revenue += rev;
      });
    });

    const topSoldProducts = Object.values(productStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topRevenueProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const topSellers = Object.values(sellerStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      topSoldProducts,
      topRevenueProducts,
      topSellers
    };
  }, [filteredData.orders]);

  // Path helper
  const generateAreaPath = (points: {x: number, y: number}[], height: number, leftMargin: number, bottomMargin: number) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const zeroY = height - bottomMargin;
    path += ` L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
    return path;
  };

  const generateLinePath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  // CSV Export simulation
  const handleExportCsv = async () => {
    let csvContent = "Siparis ID,Tarih,Satici,Alici,Tutar (TL),Komisyon (10% TL),Odeme Yontemi,Durum\n";
    filteredData.orders.forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString('tr-TR');
      const commission = (o.totalAmount * 0.1).toFixed(2);
      const method = (o as any).paymentMethod || "Kredi Kartı";
      csvContent += `${o.id},"${date}","${o.sellerName}","${o.buyerName}",${o.totalAmount},${commission},"${method}","${o.status}"\n`;
    });

    if (Platform.OS === 'web') {
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `finans_raporu_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(csvContent);
      Alert.alert("Başarılı", "Finans raporu CSV formatında panoya kopyalandı!");
    }
  };

  // Splits for payment methods and listing types
  const paymentSplits = useMemo(() => {
    const splits: { [key: string]: number } = { "Kredi Kartı": 0, "Havale/EFT": 0, "Cüzdan": 0 };
    filteredData.orders.forEach(o => {
      const method = (o as any).paymentMethod || "Kredi Kartı";
      splits[method] = (splits[method] || 0) + 1;
    });
    return Object.keys(splits).map(k => ({ label: k, value: splits[k] })).filter(item => item.value > 0);
  }, [filteredData]);

  const typeSplits = useMemo(() => {
    const splits: { [key: string]: number } = { "Hemen Al": 0, "Canlı Mezat": 0, "Teklifli": 0 };
    filteredData.orders.forEach(o => {
      const listing = o.items[0]?.listing;
      const type = listing?.type === 'auction' ? "Canlı Mezat" : listing?.type === 'offer' ? "Teklifli" : "Hemen Al";
      splits[type] = (splits[type] || 0) + 1;
    });
    return Object.keys(splits).map(k => ({ label: k, value: splits[k] })).filter(item => item.value > 0);
  }, [filteredData]);

  const cardBg = isDark ? '#111A30' : '#FFFFFF';
  const itemBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
  const inputBg = isDark ? '#070C19' : '#F8FAFC';

  return (
    <View style={{ gap: 20 }}>
      {/* Header Title */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 240 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>📊 Finansal Analiz & Gelir Takip Raporu</Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary }}>Platform genelindeki tüm satışları, komisyonları ve reklam gelirlerini takip edin.</Text>
        </View>
        <Pressable 
          onPress={handleExportCsv}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.gold,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            shadowColor: theme.gold,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2
          }}
        >
          <FileText size={16} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Raporu Dışa Aktar (CSV)</Text>
        </Pressable>
      </View>

      {/* Sub-Tabs: Summary & Product Detail Report */}
      <View style={{ flexDirection: 'row', backgroundColor: inputBg, borderRadius: 10, padding: 4, alignSelf: 'flex-start', gap: 4 }}>
        <Pressable
          onPress={() => setFinanceSubTab('summary')}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: financeSubTab === 'summary' ? theme.gold : 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: financeSubTab === 'summary' ? '#FFFFFF' : theme.textSecondary }}>
            📊 Genel Özet & Analiz
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFinanceSubTab('products')}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: financeSubTab === 'products' ? theme.gold : 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: financeSubTab === 'products' ? '#FFFFFF' : theme.textSecondary }}>
            📦 Ürün & Satıcı Detayları
          </Text>
        </Pressable>
      </View>

      {/* Filters Panel */}
      <View style={{ padding: 16, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>Filtreleme Seçenekleri</Text>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          {/* Period Quick Select */}
          <View style={{ flex: 1, minWidth: 260, gap: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary }}>Zaman Aralığı</Text>
            <View style={{ flexDirection: 'row', backgroundColor: inputBg, borderRadius: 8, padding: 3, gap: 4 }}>
              {(['7days', '30days', 'thisMonth', 'all'] as const).map((p) => {
                const labels = { '7days': '7 Gün', '30days': '30 Gün', 'thisMonth': 'Bu Ay', 'all': 'Tümü' };
                const isActive = period === p && !startDateStr && !endDateStr;
                return (
                  <Pressable
                    key={p}
                    onPress={() => {
                      setPeriod(p);
                      setStartDateStr('');
                      setEndDateStr('');
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: isActive ? (isDark ? '#334155' : '#FFFFFF') : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: isActive ? theme.gold : theme.textSecondary }}>
                      {labels[p]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* User/Seller Selector */}
          <View style={{ flex: 1, minWidth: 200, gap: 6, position: 'relative', zIndex: 100 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary }}>Satıcı Arayın (Veritabanından)</Text>
            <View style={{ position: 'relative' }}>
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                height: 38, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: isDark ? '#334155' : '#CBD5E1', 
                backgroundColor: inputBg,
                paddingHorizontal: 10,
                gap: 6
              }}>
                <TextInput
                  style={{
                    flex: 1,
                    color: theme.text,
                    fontSize: 12,
                    fontWeight: 'bold',
                    height: '100%',
                    padding: 0
                  }}
                  placeholder="Satıcı adı yazın (Mega vb.)..."
                  placeholderTextColor={theme.textSecondary}
                  value={sellerSearchInput}
                  onChangeText={(text) => {
                    setSellerSearchInput(text);
                    if (text === '') {
                      setSellerFilter('all');
                      setShowSellerSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (sellerSearchInput.length >= 3) {
                      setShowSellerSuggestions(true);
                    }
                  }}
                />
                {isSearchingSellers && (
                  <Text style={{ fontSize: 10, color: theme.gold, fontWeight: 'bold' }}>🔍 Aranıyor...</Text>
                )}
                {(sellerSearchInput.length > 0 || sellerFilter !== 'all') && (
                  <Pressable 
                    onPress={() => {
                      setSellerSearchInput('');
                      setSellerFilter('all');
                      setShowSellerSuggestions(false);
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: 'bold' }}>✕</Text>
                  </Pressable>
                )}
              </View>

              {/* Suggestions Dropdown overlay */}
              {showSellerSuggestions && sellerSearchInput.length >= 3 && (
                <View style={{
                  position: 'absolute',
                  top: 42,
                  left: 0,
                  right: 0,
                  backgroundColor: cardBg,
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  borderWidth: 1,
                  borderRadius: 8,
                  maxHeight: 180,
                  zIndex: 9999,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                  padding: 4,
                }}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 170 }} showsVerticalScrollIndicator={true}>
                    {matchingSellers.length === 0 ? (
                      <Text style={{ padding: 10, fontSize: 11, color: theme.textSecondary, textAlign: 'center' }}>
                        Eşleşen satıcı bulunamadı.
                      </Text>
                    ) : (
                      matchingSellers.map((name) => (
                        <Pressable
                          key={name}
                          onPress={() => {
                            setSellerFilter(name);
                            setSellerSearchInput(name);
                            setShowSellerSuggestions(false);
                          }}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 6,
                            backgroundColor: 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>
                            {name}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Custom Date Picker Inputs */}
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9', paddingTop: 12 }}>
          <View style={{ flex: 1, minWidth: 140, gap: 4 }}>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>Başlangıç Tarihi (Örn: 2026-08-01)</Text>
            <TextInput
              style={{
                height: 38,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? '#334155' : '#CBD5E1',
                backgroundColor: inputBg,
                color: theme.text,
                paddingHorizontal: 10,
                fontSize: 12,
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={startDateStr}
              onChangeText={(text) => {
                setStartDateStr(text);
                setPeriod('all');
              }}
            />
          </View>
          <View style={{ flex: 1, minWidth: 140, gap: 4 }}>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>Bitiş Tarihi (Örn: 2026-08-30)</Text>
            <TextInput
              style={{
                height: 38,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? '#334155' : '#CBD5E1',
                backgroundColor: inputBg,
                color: theme.text,
                paddingHorizontal: 10,
                fontSize: 12,
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={endDateStr}
              onChangeText={(text) => {
                setEndDateStr(text);
                setPeriod('all');
              }}
            />
          </View>
        </View>
      </View>

      {financeSubTab === 'summary' && (
        <View style={{ gap: 20 }}>
          {/* Metrics Row (KPI Cards) */}
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'TOPLAM CİRO', val: `${metrics.totalCiro.toLocaleString('tr-TR')} TL`, bg: 'rgba(9, 105, 218, 0.08)', border: '#0969da', icon: ShoppingCart },
              { label: 'PLATFORM KOMİSYON (%10)', val: `${metrics.commissionRevenue.toLocaleString('tr-TR')} TL`, bg: 'rgba(218, 165, 32, 0.08)', border: theme.gold, icon: ShieldCheck },
              { label: 'REKLAM GELİRLERİ', val: `${metrics.adRevenue.toLocaleString('tr-TR')} TL`, bg: 'rgba(16, 185, 129, 0.08)', border: '#10B981', icon: Megaphone },
              { label: 'NET PLATFORM KARI', val: `${metrics.totalProfit.toLocaleString('tr-TR')} TL`, bg: 'rgba(139, 92, 246, 0.08)', border: '#8B5CF6', icon: Tag },
              { label: 'SEPET ORTALAMASI', val: `${metrics.avgOrderVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`, bg: 'rgba(100, 116, 139, 0.08)', border: '#64748B', icon: Gavel },
              { label: 'TOPLAM SİPARİŞ', val: `${metrics.totalOrdersCount} Adet`, bg: 'rgba(239, 68, 68, 0.08)', border: '#EF4444', icon: Clock }
            ].map((kpi, idx) => {
              const IconComponent = kpi.icon;
              return (
                <View 
                  key={idx} 
                  style={{
                    flex: 1,
                    minWidth: isDesktop ? 180 : 130,
                    backgroundColor: cardBg,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: kpi.border,
                    padding: 14,
                    gap: 6,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: theme.textSecondary, letterSpacing: 0.5 }}>{kpi.label}</Text>
                    <View style={{ padding: 4, borderRadius: 6, backgroundColor: kpi.bg }}>
                      <IconComponent size={14} color={kpi.border} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>{kpi.val}</Text>
                </View>
              );
            })}
          </View>

          {/* Revenue Trend Area Graph (SVG) */}
          <View style={{ padding: 18, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
            <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>📈 Günlük Satış Hasılat Trendi (Ciro)</Text>
            
            {chartPoints.length === 0 ? (
              <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Bu filtre aralığında satış verisi bulunmamaktadır.</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', position: 'relative' }}>
                {/* Fixed Y Axis labels on the left */}
                <Svg width={paddingLeft} height={svgHeight} style={{ position: 'absolute', left: 0, top: 0, zIndex: 10, backgroundColor: cardBg }}>
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const maxVal = Math.max(...trendPoints.map(p => p.value), 500);
                    const val = maxVal - (maxVal * ratio);
                    const plotHeight = svgHeight - paddingTop - paddingBottom;
                    const y = paddingTop + plotHeight * ratio + 3;
                    return (
                      <SvgText
                        key={idx}
                        x={paddingLeft - 8}
                        y={y}
                        fill={theme.textSecondary}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)} TL
                      </SvgText>
                    );
                  })}
                </Svg>

                {/* Horizontally scrollable plot area */}
                <ScrollView 
                  ref={chartScrollRef}
                  horizontal 
                  showsHorizontalScrollIndicator={true}
                  style={{ width: '100%', marginLeft: paddingLeft }}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <Svg width={svgWidth - paddingLeft} height={svgHeight}>
                    <Defs>
                      <SvgLinearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={theme.gold} stopOpacity="0.3" />
                        <Stop offset="100%" stopColor={theme.gold} stopOpacity="0.0" />
                      </SvgLinearGradient>
                    </Defs>
                    
                    {/* Y grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                      const plotHeight = svgHeight - paddingTop - paddingBottom;
                      const y = paddingTop + plotHeight * ratio;
                      return (
                        <Path
                          key={idx}
                          d={`M 0 ${y} L ${svgWidth - paddingLeft - paddingRight} ${y}`}
                          stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      );
                    })}

                    {/* Vertical grid lines for each day */}
                    {chartPoints.map((pt, idx) => {
                      const plotX = pt.x - paddingLeft;
                      return (
                        <Path
                          key={`v-${idx}`}
                          d={`M ${plotX} ${paddingTop} L ${plotX} ${svgHeight - paddingBottom}`}
                          stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Area fill */}
                    <Path
                      d={generateAreaPath(
                        chartPoints.map(pt => ({ ...pt, x: pt.x - paddingLeft })),
                        svgHeight,
                        0,
                        paddingBottom
                      )}
                      fill="url(#areaGrad)"
                    />

                    {/* Line path */}
                    <Path
                      d={generateLinePath(chartPoints.map(pt => ({ ...pt, x: pt.x - paddingLeft })))}
                      fill="none"
                      stroke={theme.gold}
                      strokeWidth="2.5"
                    />

                    {/* Data circle markers */}
                    {chartPoints.map((pt, ptIdx) => {
                      const plotX = pt.x - paddingLeft;
                      return (
                        <Circle
                          key={ptIdx}
                          cx={plotX}
                          cy={pt.y}
                          r="4"
                          fill={theme.gold}
                          stroke={cardBg}
                          strokeWidth="1.5"
                        />
                      );
                    })}

                    {/* X Axis Date labels (showing every day) */}
                    {chartPoints.map((pt, idx) => {
                      const plotX = pt.x - paddingLeft;
                      return (
                        <SvgText
                          key={idx}
                          x={plotX}
                          y={svgHeight - paddingBottom + 16}
                          fill={theme.textSecondary}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {pt.label}
                        </SvgText>
                      );
                    })}
                  </Svg>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Distribution Splits (Donut Graphs) */}
          <View style={isDesktop ? { flexDirection: 'row', gap: 20 } : { gap: 14 }}>
            <View style={{ flex: 1, padding: 18, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
              <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>💳 Ödeme Yöntemi Dağılımı</Text>
              {paymentSplits.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>Veri bulunmuyor.</Text>
              ) : (
                <SvgDonutChart 
                  data={paymentSplits} 
                  colors={['#0969da', theme.gold, '#10B981']} 
                />
              )}
            </View>

            <View style={{ flex: 1, padding: 18, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
              <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>🏷️ İlan Türü Satış Oranları</Text>
              {typeSplits.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>Veri bulunmuyor.</Text>
              ) : (
                <SvgDonutChart 
                  data={typeSplits} 
                  colors={['#8B5CF6', '#EF4444', '#F59E0B']} 
                />
              )}
            </View>
          </View>

          {/* Detailed Transactions List */}
          <View style={{ padding: 18, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 13 }}>🗒️ Detaylı İşlem ve Satış Geçmişi</Text>
              
              {/* Quick Search */}
              <TextInput
                style={{
                  height: 32,
                  width: 200,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  backgroundColor: inputBg,
                  color: theme.text,
                  paddingHorizontal: 8,
                  fontSize: 12,
                }}
                placeholder="Satıcı, alıcı veya ID ara..."
                placeholderTextColor={theme.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <View style={{ gap: 8 }}>
              {filteredData.orders.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>Arama kriterlerine uygun işlem bulunamadı.</Text>
              ) : (
                filteredData.orders.slice(0, 10).map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString('tr-TR');
                  const commission = order.totalAmount * 0.1;
                  const type = order.items[0]?.listing?.type === 'auction' ? 'Mezat' : order.items[0]?.listing?.type === 'offer' ? 'Teklifli' : 'Hemen Al';
                  const method = (order as any).paymentMethod || "Kredi Kartı";
                  
                  return (
                    <View 
                      key={order.id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.015)' : '#F8FAFC',
                        borderWidth: 0.5,
                        borderColor: itemBorder,
                        flexDirection: isDesktop ? 'row' : 'column',
                        justifyContent: 'space-between',
                        gap: 8
                      }}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.gold }}>{order.id}</Text>
                          <Text style={{ fontSize: 10, color: theme.textSecondary }}>{date}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
                          Satıcı: <Text style={{ color: theme.text }}>{order.sellerName}</Text> | Alıcı: <Text style={{ color: theme.textSecondary }}>{order.buyerName}</Text>
                        </Text>
                      </View>

                      <View style={isDesktop ? { alignItems: 'flex-end', justifyContent: 'center' } : { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{order.totalAmount.toLocaleString('tr-TR')} TL</Text>
                        <Text style={{ fontSize: 10, color: '#10B981', fontWeight: 'bold' }}>Komisyon (%10): {commission.toLocaleString('tr-TR')} TL</Text>
                      </View>
                      
                      <View style={isDesktop ? { justifyContent: 'center', minWidth: 130, alignItems: 'flex-end' } : { flexDirection: 'row', gap: 10, marginTop: 2 }}>
                        <Text style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 'bold' }}>Tür: {type}</Text>
                        <Text style={{ fontSize: 10, color: theme.textSecondary, fontWeight: 'bold' }}>Yöntem: {method}</Text>
                      </View>
                    </View>
                  );
                })
              )}
              
              {filteredData.orders.length > 10 && (
                <Text style={{ fontSize: 11, color: theme.textSecondary, textAlign: 'center', marginTop: 6 }}>
                  ... ve {filteredData.orders.length - 10} işlem daha listeleniyor. Tam listeyi CSV dışa aktararak görebilirsiniz.
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {financeSubTab === 'products' && (
        <View style={{ gap: 20 }}>
          {/* Top Cards for Products and Sellers Insights */}
          <View style={isDesktop ? { flexDirection: 'row', gap: 20 } : { gap: 16 }}>
            {/* Top 10 Sellers */}
            <View style={{ flex: 1, padding: 18, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
              <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>🏆 En Çok Satış Yapan 10 Satıcı (Top 10)</Text>
              <View style={{ gap: 8 }}>
                {insights.topSellers.length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>Veri bulunmuyor.</Text>
                ) : (
                  insights.topSellers.map((seller, index) => (
                    <View key={seller.name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: index < insights.topSellers.length - 1 ? 0.5 : 0, borderBottomColor: itemBorder }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>#{index + 1}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>{seller.name}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981' }}>{seller.revenue.toLocaleString('tr-TR')} TL</Text>
                        <Text style={{ fontSize: 10, color: theme.textSecondary }}>{seller.count} İşlem</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Most Sold Products */}
            <View style={{ flex: 1, padding: 18, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
              <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>📦 En Çok Satılan Ürünler (Adet Bazlı)</Text>
              <View style={{ gap: 8 }}>
                {insights.topSoldProducts.length === 0 ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>Veri bulunmuyor.</Text>
                ) : (
                  insights.topSoldProducts.map((p, index) => (
                    <View key={p.title} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: index < insights.topSoldProducts.length - 1 ? 0.5 : 0, borderBottomColor: itemBorder }}>
                      <View style={{ flex: 1, gap: 2, marginRight: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>{p.title}</Text>
                        <Text style={{ fontSize: 10, color: theme.textSecondary }}>Kategori: {p.category}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', minWidth: 60 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.gold }}>{p.count} Adet</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>

          {/* En Çok Gelir Getiren Ürünler */}
          <View style={{ padding: 18, backgroundColor: cardBg, borderRadius: 14, borderWidth: 1, borderColor: itemBorder, gap: 14 }}>
            <Text style={{ fontWeight: 'bold', color: theme.gold, fontSize: 14 }}>💰 En Çok Gelir Getiren Ürünler (Tutar Bazlı)</Text>
            <View style={{ gap: 8 }}>
              {insights.topRevenueProducts.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>Veri bulunmuyor.</Text>
              ) : (
                insights.topRevenueProducts.map((p, index) => (
                  <View key={p.title} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: index < insights.topRevenueProducts.length - 1 ? 0.5 : 0, borderBottomColor: itemBorder }}>
                    <View style={{ flex: 1, gap: 2, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>#{index + 1}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>{p.title}</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: theme.textSecondary }}>Kategori: {p.category}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', minWidth: 90 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981' }}>{p.revenue.toLocaleString('tr-TR')} TL</Text>
                      <Text style={{ fontSize: 10, color: theme.textSecondary }}>{p.count} Adet Satıldı</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// Donut Chart helper component
const SvgDonutChart = ({ data, colors, size = 100, strokeWidth = 12 }: { data: { label: string, value: number }[], colors: string[], size?: number, strokeWidth?: number }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercent = 0;
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <Svg width={size} height={size}>
        {total === 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        ) : (
          data.map((item, idx) => {
            const percent = item.value / total;
            const strokeDashoffset = circumference - (percent * circumference);
            const rotation = (accumulatedPercent * 360) - 90;
            accumulatedPercent += percent;
            
            return (
              <Circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors[idx % colors.length]}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            );
          })
        )}
      </Svg>
      <View style={{ gap: 4 }}>
        {data.map((item, idx) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          return (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors[idx % colors.length] }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B' }}>
                {item.label}: <Text style={{ fontWeight: 'bold', color: '#1E293B' }}>{percent}%</Text> ({item.value})
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
