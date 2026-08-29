import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  useWindowDimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, Listing } from '@/services/store';
import { Colors } from '@/constants/theme';
import { ArrowLeft, Tag, Edit2, Trash2, X, ShieldAlert, Camera, CheckCircle2, AlertCircle, Megaphone } from 'lucide-react-native';
import GlobalHeader from '@/components/global-header';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'react-native-compressor';

// ─── Upload helper ────────────────────────────────────────────────────────────
const uploadFileToStorage = async (uri: string, path: string): Promise<string> => {
  if (!uri) return '';
  if (uri.startsWith('data:') || (uri.startsWith('http') && !uri.includes('blob:'))) return uri;
  try {
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { app } = await import('@/services/firebase');
    const storage = getStorage(app);
    try {
      const { getAuth, signInAnonymously } = await import('firebase/auth');
      const auth = getAuth(app);
      if (!auth.currentUser) await signInAnonymously(auth);
    } catch (_) {}
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  } catch (e) {
    // Base64 fallback
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(uri);
        reader.readAsDataURL(blob);
      });
    } catch {
      return uri;
    }
  }
};

// ─── Condition & Category options ────────────────────────────────────────────
const CONDITIONS = ['Sıfır', 'Çok İyi', 'İyi', 'Orta', 'Kötü'];
const CATEGORIES = [
  'Elektronik', 'Mobilya', 'Giyim', 'Kitap', 'Koleksiyon', 'Araç',
  'Emlak', 'Spor', 'Oyuncak', 'Ev & Bahçe', 'Diğer'
];

export default function MyListingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const { currentUser, listings, deleteListing, updateListing, adPricing, ads, createAd, deleteAd, updateAd } = useAppStore();
  const [activeTab, setActiveTab] = useState<'hemenAl' | 'mezat' | 'reklamlar'>('hemenAl');

  // Ad states
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [selectedAdListingId, setSelectedAdListingId] = useState('');
  const [selectedAdDuration, setSelectedAdDuration] = useState<'1day' | '3days' | '1week' | '1month'>('1day');
  const [newAdVideoUri, setNewAdVideoUri] = useState<string | null>(null);
  const [isAdCompressing, setIsAdCompressing] = useState(false);
  const [adCompressionProgress, setAdCompressionProgress] = useState(0);

  // Ad Edit states
  const [editAdModalVisible, setEditAdModalVisible] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [editAdTitle, setEditAdTitle] = useState('');
  const [editAdDescription, setEditAdDescription] = useState('');
  const [editAdVideo, setEditAdVideo] = useState<string | null>(null);
  const [isAdSaving, setIsAdSaving] = useState(false);
  const [adSaveError, setAdSaveError] = useState('');

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
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        let finalUri = asset.uri;

        if (Platform.OS !== 'web') {
          setIsAdCompressing(true);
          setAdCompressionProgress(0);
          
          finalUri = await Video.compress(
            asset.uri,
            {
              compressionMethod: 'auto',
            },
            (progress) => {
              setAdCompressionProgress(Math.round(progress * 100));
            }
          );
          setIsAdCompressing(false);
        }

        setNewAdVideoUri(finalUri);
      }
    } catch (err) {
      console.warn('Ad video picking/compression error:', err);
      setIsAdCompressing(false);
      Alert.alert('Hata', 'Video işlenirken bir hata oluştu.');
    }
  };

  // ── Delete confirm ──────────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Edit states ─────────────────────────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCondition, setEditCondition] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [editStock, setEditStock] = useState('1');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!currentUser) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ShieldAlert size={48} color={theme.gold} />
        <Text style={{ color: theme.text, fontSize: 16, marginTop: 12, fontWeight: 'bold' }}>Giriş Yapmalısınız</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>İlanlarınızı yönetmek için lütfen giriş yapın.</Text>
        <Pressable
          style={{ backgroundColor: theme.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 }}
          onPress={() => router.push('/')}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Ana Sayfaya Git</Text>
        </Pressable>
      </View>
    );
  }

  const myListings = listings.filter(l => l.sellerName === currentUser.name || (currentUser.shopName && l.sellerName === currentUser.shopName));
  const myAds = ads.filter(ad => ad.userId === currentUser.id);

  const hemenAlListings = myListings.filter(l => l.type !== 'auction');
  const mezatListings = myListings.filter(l => l.type === 'auction');

  const currentTabListings = activeTab === 'hemenAl' ? hemenAlListings : (activeTab === 'mezat' ? mezatListings : []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    await deleteListing(deleteConfirmId);
    setIsDeleting(false);
    setDeleteConfirmId(null);
  };

  // ── Open edit ───────────────────────────────────────────────────────────────
  const handleOpenEdit = (listing: Listing) => {
    setSelectedListing(listing);
    setEditTitle(listing.title);
    setEditDescription(listing.description);
    setEditPrice(listing.price.toString());
    setEditStock(listing.stock !== undefined ? String(listing.stock) : '1');
    setEditCondition(listing.condition || '');
    setEditCategory(listing.category || '');
    setEditPhotos(listing.photos ? listing.photos.map((p: any) => typeof p === 'number' ? '' : p).filter(Boolean) : []);
    setSaveError('');
    setEditModalVisible(true);
  };

  // ── Open Ad edit ────────────────────────────────────────────────────────────
  const handleOpenEditAd = (ad: any) => {
    setSelectedAd(ad);
    setEditAdTitle(ad.title || '');
    setEditAdDescription(ad.description || '');
    setEditAdVideo(ad.videoUrl || '');
    setAdSaveError('');
    setEditAdModalVisible(true);
  };

  // ── Pick Ad Video ───────────────────────────────────────────────────────────
  const handlePickAdEditVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermelisiniz.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditAdVideo(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Ad video picking error:', err);
    }
  };

  // ── Save Ad edit ────────────────────────────────────────────────────────────
  const handleUpdateAd = async () => {
    if (!selectedAd) return;
    setIsAdSaving(true);
    setAdSaveError('');

    try {
      let finalVideoUrl = editAdVideo;
      // Upload local video if changed
      if (finalVideoUrl && (finalVideoUrl.startsWith('file:') || finalVideoUrl.startsWith('ph:') || finalVideoUrl.startsWith('content:') || finalVideoUrl.includes('blob:'))) {
        finalVideoUrl = await uploadFileToStorage(finalVideoUrl, `ads/video_${selectedAd.id}_${Date.now()}.mp4`);
      }

      updateAd(selectedAd.id, {
        title: editAdTitle.trim() || undefined,
        description: editAdDescription.trim() || undefined,
        videoUrl: finalVideoUrl || '',
      });

      setEditAdModalVisible(false);
      setSelectedAd(null);
    } catch (e) {
      setAdSaveError('Güncelleme sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsAdSaving(false);
    }
  };

  // ── Pick photo ──────────────────────────────────────────────────────────────
  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      let finalUri = result.assets[0].uri;
      try {
        const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
        const manipResult = await manipulateAsync(
          finalUri,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );
        finalUri = manipResult.uri;
      } catch (err) {
        console.warn('Failed to compress listing photo:', err);
      }
      setEditPhotos(prev => [...prev, finalUri]);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setEditPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Save edit ───────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!selectedListing) return;
    if (!editTitle.trim() || !editPrice.trim() || !editDescription.trim()) {
      setSaveError('Lütfen tüm alanları doldurun.');
      return;
    }
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setSaveError('Lütfen geçerli bir fiyat girin.');
      return;
    }
    if (editPhotos.length === 0) {
      setSaveError('En az 1 fotoğraf gereklidir.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      // Upload any local/blob photos
      const uploadedPhotos = await Promise.all(
        editPhotos.map(async (uri, idx) => {
          if (uri.startsWith('http') && !uri.includes('blob:')) return uri;
          if (uri.startsWith('data:')) return uri;
          return await uploadFileToStorage(uri, `listings/${selectedListing.id}/photo_${idx}_${Date.now()}`);
        })
      );

      const isTitleChanged = editTitle.trim() !== selectedListing.title;
      const isDescChanged = editDescription.trim() !== selectedListing.description;
      const isConditionChanged = editCondition !== (selectedListing.condition || '');
      const isCategoryChanged = editCategory !== (selectedListing.category || '');
      
      const oldPhotos = selectedListing.photos || [];
      const isPhotosChanged = uploadedPhotos.length !== oldPhotos.length || 
        uploadedPhotos.some((p, i) => p !== oldPhotos[i]);
        
      const hasOtherChanges = isTitleChanged || isDescChanged || isConditionChanged || isCategoryChanged || isPhotosChanged;
      
      let listingStatus = selectedListing.status || 'active';
      const parsedStock = selectedListing.type === 'auction' ? undefined : (parseInt(editStock) || 1);
      
      if (hasOtherChanges) {
        listingStatus = 'pending_approval';
      } else {
        if (parsedStock !== undefined && parsedStock > 0) {
          listingStatus = 'active';
        }
      }

      updateListing(selectedListing.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        price: priceNum,
        condition: editCondition,
        category: editCategory,
        photos: uploadedPhotos,
        stock: parsedStock,
        status: listingStatus,
      });

      if (listingStatus === 'pending_approval') {
        Alert.alert('Onay Bekliyor', 'İlanınızdaki kritik değişiklikler nedeniyle ilan tekrar yönetici onayına gönderildi.');
      } else {
        Alert.alert('Başarılı', 'İlanınız başarıyla güncellendi.');
      }

      setEditModalVisible(false);
      setSelectedListing(null);
    } catch (e) {
      setSaveError('Güncelleme sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  // Inline formatTime helper
  const formatTimeHelper = (seconds: number) => {
    if (seconds <= 0) return 'Süre Doldu';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'sa ' : ''}${m}dk ${s}sn`;
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {isDesktop ? null : <GlobalHeader />}

      <View style={[styles.pageHeader, { borderBottomColor: theme.backgroundSelected, backgroundColor: (theme as any).backgroundElement || theme.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: theme.text }]}>İlanlarım</Text>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme.backgroundSelected,
        backgroundColor: (theme as any).backgroundElement || theme.background,
      }}>
        <Pressable
          onPress={() => setActiveTab('hemenAl')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'hemenAl' ? theme.gold : 'transparent',
          }}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: '800',
            color: activeTab === 'hemenAl' ? theme.gold : theme.textSecondary,
          }}>
            İlanlarım ({hemenAlListings.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('mezat')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'mezat' ? theme.gold : 'transparent',
          }}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: '800',
            color: activeTab === 'mezat' ? theme.gold : theme.textSecondary,
          }}>
            Mezatlarım ({mezatListings.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('reklamlar')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'reklamlar' ? theme.gold : 'transparent',
          }}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: '800',
            color: activeTab === 'reklamlar' ? theme.gold : theme.textSecondary,
          }}>
            Reklamlarım ({myAds.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {activeTab === 'reklamlar' ? (
          myAds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Megaphone size={48} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 12, textAlign: 'center', paddingHorizontal: 20 }}>
                Henüz reklam verilmiş bir ilanınız bulunmamaktadır. İlanlarınızın yanındaki "Reklam Ver" butonunu kullanarak vitrine taşıyabilirsiniz.
              </Text>
            </View>
          ) : (
            myAds.map((ad) => {
              const associatedListing = listings.find(l => l.id === ad.listingId);
              const durationText = ad.durationType === '1day' ? '1 Gün' : ad.durationType === '3days' ? '3 Gün' : ad.durationType === '1week' ? '1 Hafta' : '1 Ay';
              const endDateStr = new Date(ad.endDate).toLocaleDateString('tr-TR');
              
              return (
                <View key={ad.id} style={[styles.listingCard, { backgroundColor: (theme as any).backgroundElement || theme.background, borderColor: theme.backgroundSelected }]}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {associatedListing?.photos && associatedListing.photos[0] ? (
                      <Image
                        source={typeof associatedListing.photos[0] === 'number' ? associatedListing.photos[0] : { uri: associatedListing.photos[0] as string }}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={[styles.productImage, { backgroundColor: theme.backgroundSelected, alignItems: 'center', justifyContent: 'center' }]}>
                        <Megaphone size={24} color={theme.textSecondary} />
                      </View>
                    )}
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <View>
                        <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={2}>
                          {ad.title || associatedListing?.title || 'Profil Yönlendirmeli Reklam'}
                        </Text>
                        
                        <View style={{
                          alignSelf: 'flex-start',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                          backgroundColor: ad.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : ad.status === 'pending' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          marginTop: 4,
                          marginBottom: 2,
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: ad.status === 'active' ? '#10B981' : ad.status === 'pending' ? '#F59E0B' : '#EF4444'
                          }}>
                            {ad.status === 'active' ? '● Aktif' : ad.status === 'pending' ? '⏳ Onay Bekliyor' : '● Süresi Dolmuş'}
                          </Text>
                        </View>

                        {ad.description ? (
                          <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }} numberOfLines={2}>
                            {ad.description}
                          </Text>
                        ) : null}

                        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>
                          Süre: {durationText} • Bitiş: {endDateStr}
                        </Text>
                      </View>

                      <View style={styles.cardActions}>
                        <Pressable
                          style={[styles.actionBtn, { borderColor: theme.backgroundSelected }]}
                          onPress={() => handleOpenEditAd(ad)}
                        >
                          <Edit2 size={12} color={theme.text} />
                          <Text style={[styles.actionBtnText, { color: theme.text }]}>Düzenle</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                          onPress={() => {
                            Alert.alert(
                              'Reklamı Kaldır',
                              'Bu reklamı yayından kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.',
                              [
                                { text: 'Vazgeç', style: 'cancel' },
                                {
                                  text: 'Evet, Kaldır',
                                  style: 'destructive',
                                  onPress: () => {
                                    deleteAd(ad.id);
                                    Alert.alert('Başarılı', 'Reklam kaldırıldı.');
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Trash2 size={12} color="#EF4444" />
                          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Kaldır</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )
        ) : (
          currentTabListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Tag size={48} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 12, textAlign: 'center', paddingHorizontal: 20 }}>
                {activeTab === 'hemenAl' 
                  ? 'Yayınlanmış sabit fiyatlı, teklifli veya kiralık bir ilanınız bulunmamaktadır.' 
                  : 'Yayınlanmış açık artırma (mezat) ilanınız bulunmamaktadır.'}
              </Text>
              <Pressable
                style={{ backgroundColor: theme.gold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 16 }}
                onPress={() => router.push('/create')}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>İlan Oluştur</Text>
              </Pressable>
            </View>
          ) : (
            currentTabListings.map((listing) => (
              <Pressable
                key={listing.id}
                style={[styles.listingCard, { backgroundColor: (theme as any).backgroundElement || theme.background, borderColor: theme.backgroundSelected }]}
                onPress={() => {
                  router.push(`/product/${listing.id}` as any);
                }}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {listing.photos && listing.photos[0] ? (
                    <Image
                      source={typeof listing.photos[0] === 'number' ? listing.photos[0] : { uri: listing.photos[0] as string }}
                      style={styles.productImage}
                    />
                  ) : (
                    <View style={[styles.productImage, { backgroundColor: theme.backgroundSelected, alignItems: 'center', justifyContent: 'center' }]}>
                      <Camera size={24} color={theme.textSecondary} />
                    </View>
                  )}
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={2}>{listing.title}</Text>

                      {listing.type !== 'auction' && listing.stock !== undefined && listing.stock <= 0 ? (
                        <View style={{
                          alignSelf: 'flex-start',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          marginTop: 4,
                          marginBottom: 2,
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: '#EF4444'
                          }}>
                            ⚠️ Tükendi (Satışta Değil)
                          </Text>
                        </View>
                      ) : listing.status && listing.status !== 'active' ? (
                        <View style={{
                          alignSelf: 'flex-start',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                          backgroundColor: listing.status === 'pending_approval' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          marginTop: 4,
                          marginBottom: 2,
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: listing.status === 'pending_approval' ? '#F59E0B' : '#EF4444'
                          }}>
                            {listing.status === 'pending_approval' ? '⏳ Onay Bekliyor' : listing.status === 'suspended' ? '⚠️ Yayından Kaldırıldı' : '❌ Reddedildi'}
                          </Text>
                        </View>
                      ) : null}

                      {listing.status === 'suspended' && listing.rejectionReason && (
                        <Text style={{ fontSize: 11, color: '#EF4444', fontStyle: 'italic', marginTop: 2, marginBottom: 2 }}>
                          Gerekçe: {listing.rejectionReason}
                        </Text>
                      )}

                      <Text style={{ color: theme.gold, fontSize: 13, fontWeight: '900', marginTop: 4 }}>
                        {listing.price.toLocaleString('tr-TR')} TL
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                        {listing.category} | {listing.type === 'auction' ? 'Mezat' : listing.type === 'rent' ? 'Kiralık' : listing.type === 'offer' ? 'Teklifli' : 'Sabit Fiyat'}
                        {listing.type !== 'auction' && ` | Stok: ${listing.stock !== undefined ? listing.stock : 1} adet`}
                      </Text>

                      {listing.type === 'auction' && (
                        (listing.timeLeft === 0 || listing.auctionStatus === 'expired' || listing.auctionStatus === 'won' || listing.auctionStatus === 'purchased') ? (
                          <View style={{
                            marginTop: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 4,
                            backgroundColor: listing.auctionStatus === 'won' || listing.auctionStatus === 'purchased' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            alignSelf: 'flex-start',
                          }}>
                            <Text style={{
                              color: listing.auctionStatus === 'won' || listing.auctionStatus === 'purchased' ? '#10B981' : '#EF4444',
                              fontSize: 10,
                              fontWeight: '800',
                            }}>
                              {listing.auctionStatus === 'won'
                                ? `KAZANILDI (Kazanan: ${listing.auctionWinnerName || 'Alıcı'})`
                                : listing.auctionStatus === 'purchased'
                                ? 'SATILDI (Ödeme Alındı)'
                                : 'SÜRESİ DOLDU (Teklif Yok)'}
                            </Text>
                          </View>
                        ) : (
                          <View style={{
                            marginTop: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 4,
                            backgroundColor: 'rgba(9, 105, 218, 0.12)',
                            alignSelf: 'flex-start',
                          }}>
                            <Text style={{
                              color: '#0969da',
                              fontSize: 10,
                              fontWeight: '800',
                            }}>
                              AKTİF (Kalan Süre: {listing.timeLeft !== undefined ? formatTimeHelper(listing.timeLeft) : 'Devam Ediyor'})
                            </Text>
                          </View>
                        )
                      )}
                    </View>

                    <View style={styles.cardActions}>
                      {listing.status === 'suspended' && (
                        <Pressable
                          style={[styles.actionBtn, { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}
                          onPress={() => {
                            updateListing(listing.id, { status: 'pending_approval', rejectionReason: undefined });
                            Alert.alert('Başarılı', 'İlanınız yeniden onay için yöneticiye gönderildi.');
                          }}
                        >
                          <Text style={[styles.actionBtnText, { color: '#10B981', fontWeight: 'bold' }]}>Yeniden Yayınla</Text>
                        </Pressable>
                      )}
                      <Pressable
                        style={[styles.actionBtn, { borderColor: theme.backgroundSelected }]}
                        onPress={() => handleOpenEdit(listing)}
                      >
                        <Edit2 size={12} color={theme.text} />
                        <Text style={[styles.actionBtnText, { color: theme.text }]}>Düzenle</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, { borderColor: theme.gold }]}
                        onPress={() => {
                          setSelectedAdListingId(listing.id);
                          setAdModalVisible(true);
                        }}
                      >
                        <Megaphone size={12} color={theme.gold} />
                        <Text style={[styles.actionBtnText, { color: theme.gold, fontWeight: 'bold' }]}>Reklam Ver</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                        onPress={() => setDeleteConfirmId(listing.id)}
                      >
                        <Trash2 size={12} color="#EF4444" />
                        <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Sil</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))
          )
        )}
      </ScrollView>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      <Modal visible={!!deleteConfirmId} transparent animationType="fade" onRequestClose={() => setDeleteConfirmId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmBox, { backgroundColor: (theme as any).backgroundElement || theme.background, borderColor: theme.backgroundSelected }]}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Trash2 size={36} color="#EF4444" />
            </View>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>İlanı Sil</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
              Bu ilanı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                style={[styles.footerBtn, { borderWidth: 1, borderColor: theme.backgroundSelected, flex: 1 }]}
                onPress={() => setDeleteConfirmId(null)}
              >
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={[styles.footerBtn, { backgroundColor: '#EF4444', flex: 1 }]}
                onPress={handleDeleteConfirmed}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Evet, Sil</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => !isSaving && setEditModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.editBox, { backgroundColor: (theme as any).backgroundElement || theme.background, borderColor: theme.backgroundSelected }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>İlanı Düzenle</Text>
              {!isSaving && (
                <Pressable onPress={() => setEditModalVisible(false)}>
                  <X size={20} color={theme.text} />
                </Pressable>
              )}
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>

              {/* Photos */}
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Fotoğraflar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {editPhotos.map((uri, idx) => (
                    <View key={idx} style={{ position: 'relative' }}>
                      <Image source={{ uri }} style={styles.thumbImg} />
                      <Pressable
                        style={styles.removePhotoBtn}
                        onPress={() => handleRemovePhoto(idx)}
                      >
                        <X size={10} color="#fff" />
                      </Pressable>
                    </View>
                  ))}
                  {editPhotos.length < 8 && (
                    <Pressable
                      style={[styles.addPhotoBtn, { borderColor: theme.backgroundSelected, backgroundColor: isDark ? '#1a2340' : '#f5f5f5' }]}
                      onPress={handlePickPhoto}
                    >
                      <Camera size={22} color={theme.textSecondary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2 }}>Ekle</Text>
                    </Pressable>
                  )}
                </View>
              </ScrollView>

              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Başlık *</Text>
                <TextInput
                  style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: isDark ? '#111827' : '#f9f9f9' }]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Ürün başlığı"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Açıklama *</Text>
                <TextInput
                  style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: isDark ? '#111827' : '#f9f9f9', height: 90, paddingVertical: 8 }]}
                  multiline
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Ürün açıklaması"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              {/* Price */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Fiyat (TL) *</Text>
                <TextInput
                  style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: isDark ? '#111827' : '#f9f9f9' }]}
                  keyboardType="numeric"
                  value={editPrice}
                  onChangeText={setEditPrice}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              {/* Stock (Stok Adedi) - Exclude Auctions */}
              {selectedListing?.type !== 'auction' && (
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Stok Adedi *</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: isDark ? '#111827' : '#f9f9f9' }]}
                    keyboardType="numeric"
                    value={editStock}
                    onChangeText={setEditStock}
                    placeholder="1"
                    placeholderTextColor={theme.textSecondary}
                  />
                  <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 2 }}>
                    Ürününüzün stokta kaç adet olduğunu güncelleyin. Stok biterse ilan otomatik olarak yayından kalkar.
                  </Text>
                </View>
              )}

              {/* Condition */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Durum</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {CONDITIONS.map(c => (
                    <Pressable
                      key={c}
                      style={[
                        styles.chipBtn,
                        { borderColor: editCondition === c ? theme.gold : theme.backgroundSelected },
                        editCondition === c && { backgroundColor: theme.gold + '22' }
                      ]}
                      onPress={() => setEditCondition(c)}
                    >
                      <Text style={{ color: editCondition === c ? theme.gold : theme.textSecondary, fontSize: 12, fontWeight: '600' }}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Kategori</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {CATEGORIES.map(c => (
                    <Pressable
                      key={c}
                      style={[
                        styles.chipBtn,
                        { borderColor: editCategory === c ? theme.gold : theme.backgroundSelected },
                        editCategory === c && { backgroundColor: theme.gold + '22' }
                      ]}
                      onPress={() => setEditCategory(c)}
                    >
                      <Text style={{ color: editCategory === c ? theme.gold : theme.textSecondary, fontSize: 12, fontWeight: '600' }}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Error */}
              {!!saveError && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 4 }}>
                  <AlertCircle size={14} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>{saveError}</Text>
                </View>
              )}

            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.footerBtn, { borderWidth: 1, borderColor: theme.backgroundSelected, flex: 1 }]}
                onPress={() => !isSaving && setEditModalVisible(false)}
              >
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.footerBtn, { backgroundColor: isSaving ? theme.gold + '88' : theme.gold, flex: 1 }]}
                onPress={handleUpdate}
                disabled={isSaving}
              >
                {isSaving ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator size="small" color="#000" />
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 12 }}>Kaydediliyor...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} color="#000" />
                    <Text style={{ color: '#000000', fontWeight: 'bold' }}>Güncelle</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Edit Ad Modal ────────────────────────────────────────────────── */}
      <Modal visible={editAdModalVisible} transparent animationType="fade" onRequestClose={() => !isAdSaving && setEditAdModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.editBox, { backgroundColor: (theme as any).backgroundElement || theme.background, borderColor: theme.backgroundSelected }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Reklamı Düzenle</Text>
              {!isAdSaving && (
                <Pressable onPress={() => setEditAdModalVisible(false)}>
                  <X size={20} color={theme.text} />
                </Pressable>
              )}
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Reklam Başlığı (İsteğe Bağlı)</Text>
                <TextInput
                  style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: isDark ? '#111827' : '#f9f9f9' }]}
                  value={editAdTitle}
                  onChangeText={setEditAdTitle}
                  placeholder="Profil Yönlendirmeli Reklam"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Reklam Açıklaması (İsteğe Bağlı)</Text>
                <TextInput
                  style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: isDark ? '#111827' : '#f9f9f9', height: 90, paddingVertical: 8 }]}
                  multiline
                  value={editAdDescription}
                  onChangeText={setEditAdDescription}
                  placeholder="Reklam alt açıklama metni"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              {/* Video selection */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Reklam Videosu</Text>
                {editAdVideo ? (
                  <View style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.backgroundSelected,
                    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 6
                  }}>
                    <Text style={{ color: theme.text, fontSize: 12, flex: 1 }} numberOfLines={1}>
                      {editAdVideo.startsWith('http') ? 'Aktif Video URL' : 'Yeni Seçilen Video'}
                    </Text>
                    <Pressable onPress={() => setEditAdVideo(null)}>
                      <X size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={handlePickAdEditVideo}
                    style={{
                      height: 38,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: theme.gold,
                      backgroundColor: 'rgba(9, 105, 218, 0.03)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 6
                    }}
                  >
                    <Camera size={14} color={theme.gold} />
                    <Text style={{ color: theme.gold, fontSize: 12, fontWeight: 'bold' }}>Dikey Video Seç</Text>
                  </Pressable>
                )}
              </View>

              {/* Error */}
              {!!adSaveError && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <AlertCircle size={14} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>{adSaveError}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.footerBtn, { borderWidth: 1, borderColor: theme.backgroundSelected, flex: 1 }]}
                onPress={() => !isAdSaving && setEditAdModalVisible(false)}
              >
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.footerBtn, { backgroundColor: isAdSaving ? theme.gold + '88' : theme.gold, flex: 1 }]}
                onPress={handleUpdateAd}
                disabled={isAdSaving}
              >
                {isAdSaving ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator size="small" color="#000" />
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 12 }}>Kaydediliyor...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} color="#000" />
                    <Text style={{ color: '#000000', fontWeight: 'bold' }}>Reklamı Güncelle</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
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
          <View
            style={{
              width: '92%',
              maxWidth: 440,
              maxHeight: '85%',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.gold,
              backgroundColor: (theme as any).backgroundElement || theme.background,
              gap: 16,
            }}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text, fontSize: 16 }]}>📢 Reklam Paneli</Text>
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
                        <Text style={{ fontSize: 11, color: theme.textSecondary }}>Süre: {activeUserAd.durationType === '1day' ? '1 Gün' : activeUserAd.durationType === '3days' ? '3 Gün' : activeUserAd.durationType === '1week' ? '1 Haftalık' : '1 Aylık'}</Text>
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

                // Selected Listing to Advertise
                const targetListing = listings.find(l => l.id === selectedAdListingId);
                if (!targetListing) return null;

                const adConfig = adPricing[selectedAdDuration] || { price: 0, enabled: true };

                return (
                  <View style={{ gap: 14 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary }}>REKLAM YAPILACAK İLAN</Text>
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.backgroundSelected,
                      gap: 10
                    }}>
                      <Image
                        source={typeof targetListing.photos[0] === 'number' ? targetListing.photos[0] : { uri: targetListing.photos[0] }}
                        style={{ width: 44, height: 44, borderRadius: 6 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>{targetListing.title}</Text>
                        <Text style={{ fontSize: 11, color: theme.textSecondary }}>Fiyat: {targetListing.price.toLocaleString('tr-TR')} TL</Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary, marginTop: 6 }}>REKLAM VİDEOSU SEÇENEKLERİ</Text>
                    <View style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.backgroundSelected, gap: 10 }}>
                      {!targetListing.videoUrl && !newAdVideoUri ? (
                        <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold' }}>
                          ⚠️ Bu ilanın dikey bir videosu bulunmamaktadır. Reklam verebilmek için lütfen aşağıdaki butondan galerinizden dikey bir video seçip yükleyin.
                        </Text>
                      ) : (
                        <Text style={{ fontSize: 12, color: theme.text }}>
                          {newAdVideoUri ? '✅ Özel reklam videosu seçildi.' : 'ℹ️ İlanınızın varsayılan videosu kullanılacaktır.'}
                        </Text>
                      )}
                      
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable
                          onPress={handlePickAdVideo}
                          disabled={isAdCompressing}
                          style={{
                            flex: 1,
                            height: 38,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: theme.gold,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isAdCompressing ? 'rgba(0,0,0,0.05)' : 'transparent'
                          }}
                        >
                          <Text style={{ color: theme.gold, fontSize: 12, fontWeight: 'bold' }}>
                            {isAdCompressing ? `Sıkıştırılıyor (${adCompressionProgress}%)` : (targetListing.videoUrl ? 'Başka Video Seç' : 'Dikey Video Yükle')}
                          </Text>
                        </Pressable>

                        {newAdVideoUri && (
                          <Pressable
                            onPress={() => setNewAdVideoUri(null)}
                            style={{
                              paddingHorizontal: 12,
                              height: 38,
                              borderRadius: 6,
                              backgroundColor: '#EF4444',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>Varsayılana Dön</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>

                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary, marginTop: 6 }}>REKLAM SÜRESİNİ SEÇİN</Text>
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
                      onPress={() => {
                        const finalVideo = newAdVideoUri || targetListing.videoUrl || '';
                        if (!finalVideo) {
                          if (Platform.OS === 'web') {
                            window.alert('Lütfen reklam için bir dikey video seçip yükleyin.');
                          } else {
                            Alert.alert('Video Eksik', 'Lütfen reklam için bir dikey video seçip yükleyin.');
                          }
                          return;
                        }
                        
                        // Submit ad
                        createAd({
                          userId: currentUser.id,
                          userName: currentUser.name,
                          listingId: selectedAdListingId,
                          videoUrl: finalVideo,
                          durationType: selectedAdDuration
                        });

                        if (Platform.OS === 'web') {
                          window.alert('Reklamınız başarıyla oluşturuldu ve yayına alındı!');
                        } else {
                          Alert.alert('Başarılı', 'Reklamınız başarıyla oluşturuldu ve yayına alındı!');
                        }
                        setAdModalVisible(false);
                        setNewAdVideoUri(null);
                      }}
                      disabled={!(newAdVideoUri || targetListing.videoUrl)}
                      style={{
                        backgroundColor: (newAdVideoUri || targetListing.videoUrl) ? theme.gold : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                        paddingVertical: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 10
                      }}
                    >
                      <Text style={{ color: (newAdVideoUri || targetListing.videoUrl) ? '#000000' : theme.textSecondary, fontSize: 14, fontWeight: 'bold' }}>
                        {adConfig.price === 0 ? 'Reklamı Başlat (Ücretsiz)' : `Ödeme Yap ve Reklamı Başlat (${adConfig.price} TL)`}
                      </Text>
                    </Pressable>
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pageHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 12, flex: 1 },
  container: { padding: 16, gap: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  listingCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  productImage: { width: 90, height: 90, borderRadius: 8 },
  productTitle: { fontSize: 14, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  actionBtnText: { fontSize: 11, fontWeight: 'bold' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  confirmBox: { width: '100%', maxWidth: 360, borderRadius: 14, borderWidth: 1, padding: 24 },
  editBox: { width: '100%', maxWidth: 500, borderRadius: 14, borderWidth: 1, padding: 20, gap: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 15, fontWeight: 'bold' },
  formGroup: { gap: 4, marginBottom: 12 },
  formLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  formInput: { minHeight: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 13 },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 8 },
  footerBtn: { height: 42, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  thumbImg: { width: 72, height: 72, borderRadius: 8 },
  removePhotoBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  addPhotoBtn: { width: 72, height: 72, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  chipBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
});
