import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bid {
  id: string;
  bidderId: string;
  bidderName: string;
  bidderAvatar: string;
  amount: number;
  timestamp: number;
}

export interface AutoBid {
  bidderId: string;
  bidderName: string;
  bidderAvatar: string;
  maxAmount: number;
  createdAt: number;
}

export interface Listing {
  id: string;
  listingNumber?: string;
  title: string;
  description: string;
  sellerName: string;
  sellerId?: string;
  sellerAvatar: string;
  sellerTrustScore: number;
  sellerVerified: boolean;
  sellerPhone?: string;
  price: number;
  type: 'fixed' | 'offer' | 'auction' | 'rent';
  rentPeriod?: string;
  videoUrl: any; // Allow local require (number) or remote URL
  photos: any[]; // Allow local require (number[]) or remote URLs
  verifiedProduct: boolean;
  documentUrl?: string;
  timeLeft?: number; // seconds
  endTime?: number;
  bidsCount?: number;
  reservePrice?: number;
  favoritesCount: number;
  liked: boolean;
  favorited: boolean;
  category: string;
  condition: string;
  rating?: number;
  city: string;
  brand?: string;
  model?: string;
  year?: number;
  district?: string;
  neighborhood?: string;
  isRealEstate?: boolean;
  isVehicle?: boolean;
  status?: 'active' | 'pending_approval' | 'rejected' | 'suspended';
  stock?: number;
  rejectionReason?: string;
  latitude?: number;
  longitude?: number;
  km?: number;
  transmission?: 'Manuel' | 'Otomatik';
  sqm?: number;
  rooms?: string;
  minIncrement?: number;
  lastBidderId?: string;
  lastBidderName?: string;
  lastBidderAvatar?: string;
  bids?: Bid[];
  autoBids?: AutoBid[];
  auctionStatus?: 'active' | 'won' | 'purchased' | 'expired';
  auctionWonAt?: number;
  auctionPaymentDeadline?: number;
  auctionWinnerId?: string;
  auctionWinnerName?: string;
  auctionWinnerAvatar?: string;
  lastReminderSentAt?: number;
}

export interface Review {
  id: string;
  sellerName: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'photo' | 'video' | 'voice' | 'location' | 'document' | 'offer';
  mediaUrl?: string;
  fileName?: string;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterAmount?: number;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: any;
  otherPartyName: string;
  otherPartyAvatar: string;
  messages: Message[];
  fromSellerProfile?: boolean;
}

export interface Story {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  mediaUrl: string;
  createdAt: number;
  productId?: string;
  productTitle?: string;
  mediaType?: 'image' | 'video';
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed';
  trackingNumber?: string;
  createdAt: string;
  shippingCompany?: string;
  shippingFee?: number;
  cargoBarcodeUrl?: string;
  senderAddress?: string;
  senderPhone?: string;
  senderName?: string;
}

export interface CartItem {
  listing: Listing;
  quantity: number;
}

export interface RentACarApplication {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  shopName?: string;
  vergiLevhasi: string;
  esnafBelgesi: string;
  ruhsat: string;
  imzaSirkuleri: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  relatedListingId?: string;
}

export interface ModeratorPermissions {
  canModerateListings: boolean;
  canApproveFirms: boolean;
  canManageAds: boolean;
  canManageIssues: boolean;
  canManageCMS: boolean;
  isSuperAdmin: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  role: 'user' | 'super_admin' | 'customer' | 'seller' | 'moderator';
  trustScore: number;
  verified: boolean;
  shopName?: string;
  isRentACarApproved?: boolean;
  rentACarApplicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  liveAuctionBanUntil?: number;
  moderatorPermissions?: ModeratorPermissions;
}

export interface SavedAddress {
  id: string;
  name: string; // e.g. "Ev", "İş"
  receiverName: string;
  receiverPhone: string;
  city: string;
  district: string;
  address: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type?: 'cart' | 'chat' | 'system' | 'product';
}

export interface Ad {
  id: string;
  userId: string;
  userName: string;
  listingId: string;
  title?: string;
  description?: string;
  videoUrl: string;
  targetUrl?: string;
  durationType: '1day' | '3days' | '1week' | '1month';
  startDate: number;
  endDate: number;
  status: 'active' | 'pending' | 'expired';
}

export interface CustomerIssue {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerName: string;
  issueType: 'originality' | 'damaged' | 'different_product' | 'not_delivered' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'investigating' | 'refunded' | 'rejected';
  createdAt: string;
  adminNotes?: string;
}

export interface AdPriceConfig {
  price: number;
  enabled: boolean;
}

export interface AdPricing {
  '1day': AdPriceConfig;
  '3days': AdPriceConfig;
  '1week': AdPriceConfig;
  '1month': AdPriceConfig;
}

interface StoreState {
  ads: Ad[];
  adPricing: AdPricing;
  cmsLoaded: boolean;
  createAd: (ad: Omit<Ad, 'id' | 'startDate' | 'endDate' | 'status'>) => void;
  updateAdPricing: (pricing: AdPricing) => void;
  approveAd: (adId: string) => void;
  rejectAd: (adId: string) => void;
  updateAd: (adId: string, updatedFields: Partial<Ad>) => void;
  deleteAd: (adId: string) => void;
  toggleAdDurationOption: (durationType: '1day' | '3days' | '1week' | '1month', enabled: boolean) => void;
  currentUser: UserProfile | null;
  accounts: {
    [phone: string]: {
      user?: UserProfile;
      super_admin?: UserProfile;
      customer?: UserProfile;
      seller?: UserProfile;
      moderator?: UserProfile;
    };
  };
  registerAccount: (phone: string, role: 'user' | 'super_admin' | 'customer' | 'seller' | 'moderator', name: string, shopName?: string) => void;
  loginAccount: (phone: string, role: 'user' | 'super_admin' | 'customer' | 'seller' | 'moderator') => boolean;
  assignModerator: (phone: string, permissions: ModeratorPermissions) => void;
  removeModerator: (phone: string) => void;
  logoutAccount: () => void;
  updateProfileAvatar: (avatarUri: string) => void;
  listings: Listing[];
  rentACarApplications: RentACarApplication[];
  applyForRentACar: (app: Omit<RentACarApplication, 'id' | 'status' | 'createdAt'>) => void;
  approveRentACarApplication: (appId: string, note?: string) => void;
  rejectRentACarApplication: (appId: string, note?: string) => void;
  chats: Chat[];
  activeChatId: string | null;
  stories: Story[];
  addStory: (story: Omit<Story, 'id' | 'createdAt'>) => void;
  
  // CMS State & Actions
  liveCollage: HomeCollage;
  draftCollage: HomeCollage;
  liveFeaturedAuction: FeaturedAuctionState;
  draftFeaturedAuction: FeaturedAuctionState;
  updateDraftCollage: (collage: HomeCollage) => void;
  publishCollage: () => void;
  updateDraftFeaturedAuction: (auction: FeaturedAuctionState) => void;
  publishFeaturedAuction: () => void;
  loadCMSData: () => Promise<void>;
  
  // Actions
  toggleLike: (listingId: string) => void;
  toggleFavorite: (listingId: string) => void;
  placeBid: (listingId: string, amount: number, customBidder?: { id: string; name: string; avatar: string }) => { success: boolean; error?: string };
  setAutoBidLimit: (listingId: string, maxAmount: number) => { success: boolean; error?: string };
  cancelAutoBidLimit: (listingId: string) => { success: boolean; error?: string };
  sendInChatOffer: (chatId: string, amount: number) => void;
  respondToOffer: (chatId: string, messageId: string, response: 'accepted' | 'rejected', counterAmount?: number) => void;
  sendMessage: (chatId: string, text: string, type?: Message['type'], mediaUrl?: string, fileName?: string) => void;
  createChat: (listingId: string, fromSellerProfile?: boolean, targetUser?: UserProfile) => string;
  decrementTimers: () => void;
  addListing: (listing: Omit<Listing, 'id' | 'liked' | 'favorited' | 'favoritesCount'>) => void;
  deleteListing: (listingId: string) => void;
  updateListing: (listingId: string, updatedFields: Partial<Listing>) => void;
  
  // Cart State & Actions
  cart: CartItem[];
  addToCart: (listingId: string) => void;
  removeFromCart: (listingId: string) => void;
  updateCartQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;

  // Modal visibility states
  cartModalVisible: boolean;
  setCartModalVisible: (visible: boolean) => void;
  authModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;
  authStep: 'login' | 'register';
  setAuthStep: (step: 'login' | 'register') => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  checkoutStep: 'cart' | 'shipping' | 'payment' | 'completed';
  setCheckoutStep: (step: 'cart' | 'shipping' | 'payment' | 'completed') => void;

  // Order State & Actions
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => void;
  deleteOrderForUser: (orderId: string, role: 'buyer' | 'seller') => void;

  // Customer Issues State & Actions
  customerIssues: CustomerIssue[];
  reportIssue: (issue: Omit<CustomerIssue, 'id' | 'status' | 'createdAt'>) => void;
  updateIssueStatus: (issueId: string, status: CustomerIssue['status'], adminNotes?: string) => void;

  // Notification State & Actions
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  sendSystemNotificationToAll: (title: string, message: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;

  // Secure Server-side Simulation Actions
  serverCalculateCartTotal: (cartItems: { listingId: string; quantity: number }[]) => {
    items: { listing: Listing; quantity: number; price: number }[];
    subtotal: number;
    shipping: number;
    total: number;
    verificationToken: string;
  };
  serverValidateUploadedFile: (fileName: string, fileSize: number, mimeType?: string) => {
    success: boolean;
    error?: string;
  };
  startWebSocketSim: () => void;
  isBiometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => void;
  restoreSession: () => Promise<void>;
  savedCards: { id: string; token: string; cardSummary: string; cardHolder: string }[];
  addSavedCard: (card: { token: string; cardSummary: string; cardHolder: string }) => void;
  deleteSavedCard: (id: string) => void;
  savedAddresses: SavedAddress[];
  addSavedAddress: (address: Omit<SavedAddress, 'id'>) => void;
  deleteSavedAddress: (id: string) => void;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  compareList: Listing[];
  addToCompareList: (listing: Listing) => void;
  removeFromCompareList: (id: string) => void;
  clearCompareList: () => void;
}


export interface CollageBox {
  images: string[];
  imagesWeb?: string[];
  imagesMobile?: string[];
  link: string;
  titles?: string[];
  links?: string[];
  labels?: string[];
}

export interface HomeCollage {
  leftVertical: CollageBox;
  rightTop: CollageBox;
  rightBottom: CollageBox;
}

export interface FeaturedVehicle {
  id: string;
  title: string;
  image: string;
  startPrice: number;
  buyNowPrice: number;
  specEngine: string;
  specTransmission: string;
  specKm: string;
  color: string;
  cert: string;
}

export interface FeaturedAuctionState {
  heroImage: string;
  title: string;
  subtitle: string;
  vehicles: FeaturedVehicle[];
  footerTitle?: string;
  footerDescription?: string;
}

// Remote Video Assets Map (hosted on Firebase Storage)
const localVideos = {
  video_1: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/videos%2Fvideo_1.mp4?alt=media&token=ea1b33fa-45e8-4b1b-8f58-6d1ff8ea8cde',
  video_2: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/videos%2Fvideo_2.mp4?alt=media&token=9bb8bf02-5c65-4f3e-9e15-aaa2cd15ddd3',
  video_3: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/videos%2Fvideo_3.mp4?alt=media&token=34994bb0-f75b-415c-b22c-c41280829d9e',
  video_4: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/videos%2Fvideo_4.mp4?alt=media&token=d49a321a-129b-425a-a081-3a9dca0e2047',
  video_5: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/videos%2Fvideo_5.mp4?alt=media&token=0b9ad6a7-4751-4c90-b6e3-2aad59fd9e7d',
  video_6: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/videos%2Fvideo_6.mp4?alt=media&token=e13edc44-f6c9-4198-98c7-d65badf4d0f6',
};

// Remote Frame Images Map (hosted on Firebase Storage)
const localImages = {
  v1_f1: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_1_frame_1.jpg?alt=media&token=a3ce6891-61a3-4343-b573-79fbf9ed378f',
  v1_f2: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_1_frame_2.jpg?alt=media&token=61523fae-b998-429d-b235-58651d6e1283',
  v1_f3: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_1_frame_3.jpg?alt=media&token=2fb38c51-dde2-4b93-9f63-80faa1abb991',
  v2_f1: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_2_frame_1.jpg?alt=media&token=d93a51d4-6c8d-48b3-983f-b56fccf54405',
  v2_f2: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_2_frame_2.jpg?alt=media&token=eb1fb104-5deb-4cff-be95-3bce46800753',
  v2_f3: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_2_frame_3.jpg?alt=media&token=ef94185b-4c6a-4178-8c7f-8eb25d08d05b',
  v3_f1: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_3_frame_1.jpg?alt=media&token=e9ef7356-7301-437b-9fda-1f208cc94eec',
  v3_f2: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_3_frame_2.jpg?alt=media&token=e4135f43-4068-48bc-8c26-d389573bfb72',
  v3_f3: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_3_frame_3.jpg?alt=media&token=c88d8d4a-9f71-4120-94c3-fa6ab688df2e',
  v4_f1: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_4_frame_1.jpg?alt=media&token=b5f035c5-7470-4a31-af5a-1fe121d70a00',
  v4_f2: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_4_frame_2.jpg?alt=media&token=dc154eb5-a55b-46e9-b863-5aa9fc43033e',
  v4_f3: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_4_frame_3.jpg?alt=media&token=22ba6ef2-465f-4365-9fde-89964a12d141',
  v5_f1: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_5_frame_1.jpg?alt=media&token=4aa9a10b-41bb-4130-8bfb-973ec21cbf33',
  v5_f2: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_5_frame_2.jpg?alt=media&token=87f8a124-d5e5-4c09-8a1d-6558a2582d39',
  v5_f3: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_5_frame_3.jpg?alt=media&token=ada99a7e-f60d-47a1-91b4-a064ae319fc4',
  v6_f1: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_6_frame_1.jpg?alt=media&token=724882f8-8e60-469e-a0c7-4d00f6998d14',
  v6_f2: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_6_frame_2.jpg?alt=media&token=fa86fd56-ca8e-486e-b9e4-302e4a9b7d7c',
  v6_f3: 'https://firebasestorage.googleapis.com/v0/b/mezatliyoruz.firebasestorage.app/o/images%2Fvideo_6_frame_3.jpg?alt=media&token=00eb5833-dc65-4e27-bae7-3c46a5994078',
};

const initialListings: Listing[] = [
  {
    id: '1',
    title: 'Oversize Kadın Trençkot / Pardesü',
    description: 'Son moda oversize kesim, bej renk mevsimlik kadın trençkot. Su geçirmez özel gabardin kumaştan üretilmiştir. Kemer ve düğme detayları eksiksiz, sadece 1 kez giyilmiştir.',
    sellerName: 'Buse Giyim',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sellerTrustScore: 9.7,
    sellerVerified: true,
    price: 1850,
    type: 'offer',
    videoUrl: localVideos.video_1,
    photos: [localImages.v1_f1, localImages.v1_f2, localImages.v1_f3],
    verifiedProduct: false,
    favoritesCount: 42,
    liked: false,
    favorited: false,
    category: 'Giyim & Aksesuar',
    condition: 'Yeni Gibi',
    city: 'İstanbul',
  },
  {
    id: '2',
    title: 'Retro Ahşap Balkon & Bahçe Mobilya Seti',
    description: 'Doğal çam ağacından üretilmiş, katlanabilir 2 sandalye ve 1 masadan oluşan balkon mobilya seti. Tik yağı ile bakımı yeni yapılmıştır. Dar alanlar için mükemmel çözümdür.',
    sellerName: 'Atölye Kerem',
    sellerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    sellerTrustScore: 9.6,
    sellerVerified: false,
    price: 2400,
    type: 'fixed',
    videoUrl: localVideos.video_2,
    photos: [localImages.v2_f1, localImages.v2_f2, localImages.v2_f3],
    verifiedProduct: true,
    documentUrl: 'ahsap_malzeme_ve_garanti_belgesi.pdf',
    favoritesCount: 89,
    liked: false,
    favorited: false,
    category: 'Ev & Yaşam',
    condition: 'Yeni',
    city: 'İzmir',
  },
  {
    id: '3',
    title: 'El Yapımı Örme Makrome Balkon Salıncağı',
    description: 'Tamamen el düğümü makrome ipinden örülmüş, çift halkalı dayanıklı balkon salıncağı. 120 kg taşıma kapasitesine sahiptir. Metal iskeleti statik boyalıdır, paslanma yapmaz.',
    sellerName: 'Elif Dekor',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    sellerTrustScore: 9.9,
    sellerVerified: true,
    price: 3500,
    type: 'auction',
    timeLeft: 600, // 10 dakika
    bidsCount: 5,
    minIncrement: 50,
    reservePrice: 4000,
    videoUrl: localVideos.video_3,
    photos: [localImages.v3_f1, localImages.v3_f2, localImages.v3_f3],
    verifiedProduct: true,
    documentUrl: 'tasima_kapasitesi_test_raporu.pdf',
    favoritesCount: 174,
    liked: false,
    favorited: false,
    category: 'El Emeği & Sanat',
    condition: 'Kusursuz',
    city: 'Ankara',
    lastBidderId: 'bot_kemal_yilmaz',
    lastBidderName: 'Kemal Yılmaz',
    lastBidderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bids: [
      { id: 'b3_1', bidderId: 'bot_kemal_yilmaz', bidderName: 'Kemal Yılmaz', bidderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', amount: 3500, timestamp: Date.now() - 30000 },
      { id: 'b3_2', bidderId: 'bot_ayse_demir', bidderName: 'Ayşe Demir', bidderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: 3450, timestamp: Date.now() - 90000 },
      { id: 'b3_3', bidderId: 'bot_murat_kaya', bidderName: 'Murat Kaya', bidderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: 3400, timestamp: Date.now() - 150000 },
      { id: 'b3_4', bidderId: 'bot_selin_aksoy', bidderName: 'Selin Aksoy', bidderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', amount: 3350, timestamp: Date.now() - 210000 },
      { id: 'b3_5', bidderId: 'bot_can_yildiz', bidderName: 'Can Yıldız', bidderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', amount: 3300, timestamp: Date.now() - 270000 }
    ]
  },
  {
    id: '4',
    title: 'Daha Hızlı Yüzdüren Paletli Su Eldiveni',
    description: 'Yüzme antrenmanlarında direnç kazanmak ve daha hızlı yüzmek için tasarlanmış silikon paletli eldiven seti. M bedendir, ele tam oturur ve su kaydırma özelliğine sahiptir.',
    sellerName: 'Sporcu Selim',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    sellerTrustScore: 9.3,
    sellerVerified: false,
    price: 350,
    type: 'fixed',
    videoUrl: localVideos.video_4,
    photos: [localImages.v4_f1, localImages.v4_f2, localImages.v4_f3],
    verifiedProduct: false,
    favoritesCount: 15,
    liked: false,
    favorited: false,
    category: 'Kitap & Hobi',
    condition: 'Yeni',
    city: 'Antalya',
  },
  {
    id: '5',
    title: 'Özel Tasarım El Yapımı Seramik Bardak Seti',
    description: 'Kendi atölyemde çömlekçi çarkında şekillendirip yüksek ısıda fırınladığım 2 adet seramik kupa. Gıda ile temasa %100 uygundur. Eşsiz hediye arayanlar için idealdir.',
    sellerName: 'Seramik Tasarım',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    sellerTrustScore: 9.8,
    sellerVerified: true,
    price: 650,
    type: 'offer',
    videoUrl: localVideos.video_5,
    photos: [localImages.v5_f1, localImages.v5_f2, localImages.v5_f3],
    verifiedProduct: true,
    documentUrl: 'gida_temas_uygunluk_beyani.pdf',
    favoritesCount: 61,
    liked: false,
    favorited: false,
    category: 'Doğal Gıda',
    condition: 'Yeni',
    city: 'Bursa',
  },
  {
    id: '6',
    title: 'Pamuklu Bohem Yazlık Yatak Örtüsü',
    description: '%100 pamuklu iplikten üretilmiş, kenarları püsküllü bohem çift kişilik yatak örtüsü. Çamaşır makinesinde yıkanabilir. Çekme veya solma yapmaz. Nefes alan hafif dokuya sahiptir.',
    sellerName: 'Bohem Home',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    sellerTrustScore: 9.5,
    sellerVerified: false,
    price: 1100,
    type: 'auction',
    timeLeft: 110, // 1 dakika 50 saniye (anti-sniping testi için!)
    bidsCount: 14,
    minIncrement: 20,
    reservePrice: 1300,
    videoUrl: localVideos.video_6,
    photos: [localImages.v6_f1, localImages.v6_f2, localImages.v6_f3],
    verifiedProduct: false,
    favoritesCount: 230,
    liked: false,
    favorited: false,
    category: 'Ev & Yaşam',
    condition: 'Çok İyi',
    city: 'İstanbul',
    lastBidderId: 'bot_murat_kaya',
    lastBidderName: 'Murat Kaya',
    lastBidderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    bids: [
      { id: 'b6_1', bidderId: 'bot_murat_kaya', bidderName: 'Murat Kaya', bidderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: 1100, timestamp: Date.now() - 15000 },
      { id: 'b6_2', bidderId: 'bot_kemal_yilmaz', bidderName: 'Kemal Yılmaz', bidderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', amount: 1080, timestamp: Date.now() - 45000 },
      { id: 'b6_3', bidderId: 'bot_ayse_demir', bidderName: 'Ayşe Demir', bidderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: 1060, timestamp: Date.now() - 105000 },
      { id: 'b6_4', bidderId: 'bot_selin_aksoy', bidderName: 'Selin Aksoy', bidderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', amount: 1040, timestamp: Date.now() - 165000 },
      { id: 'b6_5', bidderId: 'bot_can_yildiz', bidderName: 'Can Yıldız', bidderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', amount: 1020, timestamp: Date.now() - 225000 }
    ]
  },
  {
    id: '7',
    title: 'Montblanc Meisterstück Vintage Dolma Kalem',
    description: "1980'lerden kalma orijinal Montblanc Meisterstück 149 dolma kalem. 14k altın uçlu, piston dolum sistemi sorunsuz çalışmaktadır. Herhangi bir kılcal çizik veya aşınma yoktur. Koleksiyonluk değerdedir.",
    sellerName: 'Antikacı Salih',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sellerTrustScore: 9.8,
    sellerVerified: true,
    price: 4500,
    type: 'auction',
    timeLeft: 3600,
    bidsCount: 4,
    minIncrement: 100,
    videoUrl: localVideos.video_3,
    photos: [localImages.v3_f1, localImages.v3_f2, localImages.v3_f3],
    verifiedProduct: true,
    documentUrl: 'montblanc_orjinallik_belgesi.pdf',
    favoritesCount: 112,
    liked: false,
    favorited: false,
    category: 'Antika & Koleksiyon',
    condition: 'Yeni Gibi',
    city: 'Ankara',
    lastBidderId: 'bot_can_yildiz',
    lastBidderName: 'Can Yıldız',
    lastBidderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bids: [
      { id: 'b7_1', bidderId: 'bot_can_yildiz', bidderName: 'Can Yıldız', bidderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', amount: 4500, timestamp: Date.now() - 40000 },
      { id: 'b7_2', bidderId: 'bot_kemal_yilmaz', bidderName: 'Kemal Yılmaz', bidderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', amount: 4400, timestamp: Date.now() - 100000 },
      { id: 'b7_3', bidderId: 'bot_ayse_demir', bidderName: 'Ayşe Demir', bidderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: 4300, timestamp: Date.now() - 180000 },
      { id: 'b7_4', bidderId: 'bot_murat_kaya', bidderName: 'Murat Kaya', bidderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: 4200, timestamp: Date.now() - 240000 }
    ]
  },
  {
    id: '8',
    title: 'Scrikss 33 Klasik Yazı Seti (Tükenmez & Versatil)',
    description: 'Sıfır kutusunda Scrikss 33 ikili yazı seti. Bir adet tükenmez, bir adet versatil kalem içerir. Krom kaplama gövde ve şık kadife kutusuyla mükemmel bir ofis hediyesidir.',
    sellerName: 'Kırtasiye Dünyası',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    sellerTrustScore: 9.2,
    sellerVerified: false,
    price: 850,
    type: 'fixed',
    videoUrl: localVideos.video_5,
    photos: [localImages.v5_f1, localImages.v5_f2, localImages.v5_f3],
    verifiedProduct: false,
    favoritesCount: 23,
    liked: false,
    favorited: false,
    category: 'Diğer',
    condition: 'Yeni',
    city: 'İzmir',
  },
  {
    id: '9',
    title: 'Cross 14 Ayar Altın Kaplama Klasik Tükenmez Kalem',
    description: 'Cross Classic Century 14 ayar altın kaplama gövdeli tükenmez kalem. Amerikan üretimidir. Orijinal kutusu ve faturası ile birlikte teslim edilecektir. Yazımı son derece akıcıdır.',
    sellerName: 'Koleksiyon Evi',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    sellerTrustScore: 9.9,
    sellerVerified: true,
    price: 2750,
    type: 'offer',
    videoUrl: localVideos.video_1,
    photos: [localImages.v1_f2, localImages.v1_f1, localImages.v1_f3],
    verifiedProduct: true,
    documentUrl: 'cross_orjinallik_sertifikasi.pdf',
    favoritesCount: 84,
    liked: false,
    favorited: false,
    category: 'Antika & Koleksiyon',
    condition: 'Kusursuz',
    city: 'İstanbul',
  },
  {
    id: '10',
    title: 'Lamy Safari Sınırlı Üretim Roller Kalem',
    description: 'Lamy Safari serisinin sınırlı üretim pastel mavi renk roller kalemi. Orijinal M63 refili ile birlikte verilecektir. Çok temiz kullanılmıştır.',
    sellerName: 'Öğrenci Dostu',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    sellerTrustScore: 9.4,
    sellerVerified: false,
    price: 650,
    type: 'fixed',
    videoUrl: localVideos.video_4,
    photos: [localImages.v4_f3, localImages.v4_f1, localImages.v4_f2],
    verifiedProduct: false,
    favoritesCount: 19,
    liked: false,
    favorited: false,
    category: 'Diğer',
    condition: 'Yeni Gibi',
    city: 'Bursa',
  },
  {
    id: '11',
    title: '2021 Mercedes-Benz S 400d 4MATIC L',
    description: 'Nadir temizlikte, hatasız boyasız bayii çıkışlı 2021 model Mercedes S400d. Özel tasarım maun kaplama, arka eğlence paketi ve buzdolabı mevcuttur. Sadece 42.000 km dedir.',
    sellerName: 'Galeri Ahmet',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sellerTrustScore: 9.8,
    sellerVerified: true,
    price: 2850000,
    type: 'fixed',
    videoUrl: localVideos.video_1,
    photos: [localImages.v1_f1, localImages.v1_f2, localImages.v1_f3],
    verifiedProduct: true,
    documentUrl: 'mercedes_ekspertiz_ve_ruhsat.pdf',
    favoritesCount: 342,
    liked: false,
    favorited: false,
    category: 'Antika & Koleksiyon',
    condition: 'Kusursuz',
    city: 'İstanbul',
    isVehicle: true,
  },
  {
    id: '12',
    title: 'Bodrum Yalıkavak Marina Manzaralı Lüks Villa',
    description: 'Yalıkavak marinaya sıfır konumda, özel havuzlu ve müstakil bahçeli 5+2 ultra lüks akıllı villa. Eşyaları dünyaca ünlü İtalyan markalarıyla döşenmiştir. Hemen taşınmaya hazırdır.',
    sellerName: 'Emlak VIP A.Ş.',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    sellerTrustScore: 9.9,
    sellerVerified: true,
    price: 8750000,
    type: 'fixed',
    videoUrl: localVideos.video_2,
    photos: [localImages.v2_f1, localImages.v2_f2, localImages.v2_f3],
    verifiedProduct: true,
    documentUrl: 'villa_imar_ve_tapu_durumu.pdf',
    favoritesCount: 512,
    liked: false,
    favorited: false,
    category: 'Antika & Koleksiyon',
    condition: 'Yeni',
    city: 'Muğla',
    isRealEstate: true,
  },
  {
    id: '13',
    title: 'Rolex Submariner Date Kol Saati',
    description: '2023 çıkışlı Rolex Submariner Date. Çelik kasa ve kordon, yeşil kadranlı (Starbucks). Kutu, sertifika ve yedek baklalarıyla eksiksiz durumdadır. Herhangi bir çizik dahi yoktur.',
    sellerName: 'Lüks Saat Dünyası',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    sellerTrustScore: 9.7,
    sellerVerified: true,
    price: 625000,
    type: 'auction',
    timeLeft: 3600,
    bidsCount: 14,
    minIncrement: 1000,
    videoUrl: localVideos.video_3,
    photos: [localImages.v3_f1, localImages.v3_f2, localImages.v3_f3],
    verifiedProduct: true,
    documentUrl: 'rolex_orjinallik_kart.pdf',
    favoritesCount: 201,
    liked: false,
    favorited: false,
    category: 'Antika & Koleksiyon',
    condition: 'Kusursuz',
    city: 'İstanbul',
    lastBidderId: 'bot_kemal_yilmaz',
    lastBidderName: 'Kemal Yılmaz',
    lastBidderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bids: [
      { id: 'b13_1', bidderId: 'bot_kemal_yilmaz', bidderName: 'Kemal Yılmaz', bidderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', amount: 625000, timestamp: Date.now() - 40000 },
      { id: 'b13_2', bidderId: 'bot_ayse_demir', bidderName: 'Ayşe Demir', bidderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', amount: 624000, timestamp: Date.now() - 100000 },
      { id: 'b13_3', bidderId: 'bot_murat_kaya', bidderName: 'Murat Kaya', bidderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', amount: 623000, timestamp: Date.now() - 160000 },
      { id: 'b13_4', bidderId: 'bot_selin_aksoy', bidderName: 'Selin Aksoy', bidderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', amount: 622000, timestamp: Date.now() - 220000 },
      { id: 'b13_5', bidderId: 'bot_can_yildiz', bidderName: 'Can Yıldız', bidderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', amount: 621000, timestamp: Date.now() - 280000 }
    ]
  },
  {
    id: '14',
    title: 'Leica M6 Klasik Rangefinder Fotoğraf Makinesi',
    description: '1984 üretimi efsanevi Leica M6 rangefinder film makinesi. 50mm f/2 Summicron lens ile birlikte verilmektedir. Mekanik aksamı ve vizörü tertemizdir, ışık ölçeri kusursuz çalışmaktadır.',
    sellerName: 'Koleksiyoncu Cem',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    sellerTrustScore: 9.6,
    sellerVerified: false,
    price: 42500,
    type: 'fixed',
    videoUrl: localVideos.video_5,
    photos: [localImages.v5_f1, localImages.v5_f2, localImages.v5_f3],
    verifiedProduct: false,
    favoritesCount: 78,
    liked: false,
    favorited: false,
    category: 'Antika & Koleksiyon',
    condition: 'Yeni Gibi',
    city: 'İzmir',
  },
  {
    id: '15',
    title: 'Osmanlı Reşat Altın 100 Kuruş (Sikke)',
    description: 'Sultan V. Mehmed Reşad dönemine ait, 1327 tarihli orijinal Osmanlı 100 Kuruş altın sikke. Çil kalitededir, aşınma ve darbe izi yoktur. Kuyumcu onaylı orijinallik belgesiyle gönderilecektir.',
    sellerName: 'Sultan Antika',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    sellerTrustScore: 9.9,
    sellerVerified: true,
    price: 56000,
    type: 'offer',
    videoUrl: localVideos.video_6,
    photos: [localImages.v6_f1, localImages.v6_f2, localImages.v6_f3],
    verifiedProduct: true,
    documentUrl: 'resat_altin_kuyumcu_ekspertiz.pdf',
    favoritesCount: 154,
    liked: false,
    favorited: false,
    category: 'Antika & Koleksiyon',
    condition: 'Yeni Gibi',
    city: 'Ankara',
  },
  {
    id: '16',
    title: 'Sony Alpha 7 III Aynasız Kamera (Kiralık)',
    description: 'Günlük veya haftalık kiralık Sony A7 III gövde. 24.2 MP full frame sensör, 4K video kaydı. Çift SD kart yuvası mevcuttur. Yanında 2 adet batarya ve şarj aleti verilecektir.',
    sellerName: 'Kamera Kiralama Evi',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    sellerTrustScore: 9.6,
    sellerVerified: true,
    price: 450,
    type: 'rent',
    rentPeriod: 'Günlük',
    videoUrl: localVideos.video_4,
    photos: [localImages.v4_f1, localImages.v4_f2, localImages.v4_f3],
    verifiedProduct: true,
    favoritesCount: 38,
    liked: false,
    favorited: false,
    category: 'Kitap & Hobi',
    condition: 'Yeni Gibi',
    city: 'İstanbul',
  },
  {
    id: '17',
    title: 'Profesyonel Ses ve Işık Sistemi (Kiralık)',
    description: 'Etkinlikler, düğünler veya partiler için kiralık ses sistemi. 2 adet aktif hoparlör, 1 adet mikser, telsiz mikrofonlar ve standlar dahildir. Günlük kiralama bedelidir.',
    sellerName: 'Ses Işık Organizasyon',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sellerTrustScore: 9.4,
    sellerVerified: true,
    price: 1500,
    type: 'rent',
    rentPeriod: 'Günlük',
    videoUrl: localVideos.video_6,
    photos: [localImages.v6_f1, localImages.v6_f2, localImages.v6_f3],
    verifiedProduct: false,
    favoritesCount: 22,
    liked: false,
    favorited: false,
    category: 'Diğer',
    condition: 'Çok İyi',
    city: 'Ankara',
  },
  {
    id: 'mega_emlak',
    title: 'Yalıkavak Marina Yanı Lüks Rezidans',
    description: 'Mega Holding A.Ş. güvencesiyle Bodrum Yalıkavak marina manzaralı 3+1 sıfır daire. Akıllı ev teknolojisi, 7/24 güvenlik ve özel yüzme havuzu.',
    sellerName: 'Mega Holding A.Ş.',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    sellerTrustScore: 10.0,
    sellerVerified: true,
    price: 15500000,
    type: 'fixed',
    photos: [localImages.v2_f1, localImages.v2_f2, localImages.v2_f3],
    verifiedProduct: true,
    favoritesCount: 110,
    liked: false,
    favorited: false,
    category: '🏠 Emlak',
    condition: 'Yeni',
    city: 'Muğla',
    isRealEstate: true,
    videoUrl: localVideos.video_2,
    sqm: 145,
    rooms: '3+1',
  },
  {
    id: 'mega_galeri',
    title: '2023 Tesla Model Y Long Range AWD',
    description: 'Hatasız, boyasız, sıfır ayarında 2023 model Tesla Model Y. Otopilot, cam tavan, ısıtmalı koltuklar mevcuttur. Mega Holding kurumsal oto galerisinden.',
    sellerName: 'Mega Holding A.Ş.',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    sellerTrustScore: 10.0,
    sellerVerified: true,
    price: 1950000,
    type: 'fixed',
    photos: [localImages.v1_f1, localImages.v1_f2, localImages.v1_f3],
    verifiedProduct: true,
    favoritesCount: 85,
    liked: false,
    favorited: false,
    category: 'Araçlar (Otomobil)',
    condition: 'Yeni Gibi',
    city: 'İstanbul',
    isVehicle: true,
    videoUrl: localVideos.video_1,
    km: 18000,
    transmission: 'Otomatik',
    year: 2023,
  },
  {
    id: 'mega_rent',
    title: 'Volkswagen Passat 2.0 TDI (Kiralık)',
    description: 'Yasal nedenlerden ötürü kurumsal NACE koduna sahip araç kiralama şirketimizden günlük/haftalık kiralık Passat. Bakımları yeni yapılmıştır.',
    sellerName: 'Mega Holding A.Ş.',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    sellerTrustScore: 10.0,
    sellerVerified: true,
    price: 1800,
    type: 'rent',
    rentPeriod: 'Günlük',
    photos: [localImages.v1_f3, localImages.v1_f1, localImages.v1_f2],
    verifiedProduct: true,
    favoritesCount: 47,
    liked: false,
    favorited: false,
    category: '🚗 Otomobil',
    condition: 'Kusursuz',
    city: 'Ankara',
    isVehicle: true,
    videoUrl: localVideos.video_3,
    km: 67000,
    transmission: 'Otomatik',
    year: 2021,
  },
  {
    id: 'mega_uretici',
    title: 'Karakovan Süzme Çiçek Balı (1 KG)',
    description: 'Doğu Anadolu yaylalarında Mega Holding yerel üretici arı çiftliğinde tamamen organik üretilmiş katkısız karakovan süzme çiçek balı.',
    sellerName: 'Mega Holding A.Ş.',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    sellerTrustScore: 10.0,
    sellerVerified: true,
    price: 450,
    type: 'fixed',
    photos: [localImages.v5_f1, localImages.v5_f2, localImages.v5_f3],
    verifiedProduct: true,
    favoritesCount: 154,
    liked: false,
    favorited: false,
    category: '🍯 Organik Bal & Arı Ürünleri',
    condition: 'Yeni',
    city: 'Erzurum',
    videoUrl: localVideos.video_5,
  }
];

const initialChats: Chat[] = [
  {
    id: 'chat_1',
    listingId: '1',
    listingTitle: 'Oversize Kadın Trençkot / Pardesü',
    listingImage: localImages.v1_f1,
    otherPartyName: 'Buse Giyim',
    otherPartyAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    messages: [
      {
        id: 'msg_1',
        senderId: 'customer_1',
        text: 'Merhaba, trençkot için son fiyat ne olur?',
        timestamp: new Date(Date.now() - 3600000 * 2),
        type: 'text',
      },
      {
        id: 'msg_2',
        senderId: 'seller_1',
        text: 'Selamlar, ürün sıfır ayarında ve su geçirmez. Buradan teklif butonunu kullanarak in-chat teklif iletebilirsiniz.',
        timestamp: new Date(Date.now() - 3600000 * 1.8),
        type: 'text',
      },
      {
        id: 'msg_3',
        senderId: 'customer_1',
        text: '1600 TL teklif ediyorum.',
        timestamp: new Date(Date.now() - 3600000),
        type: 'offer',
        offerAmount: 1600,
        offerStatus: 'pending'
      }
    ],
  }
];

export const defaultCollage: HomeCollage = {
  leftVertical: {
    images: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    ],
    imagesWeb: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    ],
    imagesMobile: [
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    ],
    titles: [
      'Canlı Mezatlar',
      'Bit Pazarı',
      'Üreticiden Tüketiciye'
    ],
    link: '/auctions',
    links: [
      '/auctions',
      'bit_pazari',
      'Üreticiden Tüketiciye'
    ],
    labels: [
      'MEZAT',
      'BİT PAZARI',
      'DOĞAL & EL YAPIMI'
    ]
  },
  rightTop: {
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'
    ],
    imagesWeb: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'
    ],
    imagesMobile: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'
    ],
    titles: [
      'Antikalar Bit Pazarında'
    ],
    link: 'bit_pazari'
  },
  rightBottom: {
    images: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'
    ],
    imagesWeb: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'
    ],
    imagesMobile: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'
    ],
    titles: [
      'Reklam Verin'
    ],
    link: '/profile?openAdModal=true'
  }
};

const defaultFeaturedAuction: FeaturedAuctionState = {
  heroImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000',
  title: 'Efsane Klasik Otomobil Serisi',
  subtitle: 'Koleksiyonluk Değerde Nadir Klasikler',
  footerTitle: 'Prestige Auction House',
  footerDescription: 'Bu müzayedede yer alan tüm araçlar ekspertiz onaylı, orijinal lisanslı ve noter onaylı sertifikalıdır.',
  vehicles: [
    {
      id: 'car_1',
      title: '1967 Ford Mustang Eleanor',
      image: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=600',
      startPrice: 2500000,
      buyNowPrice: 3200000,
      specEngine: '4.7L V8 400hp',
      specTransmission: 'Manuel 4 İleri',
      specKm: '42,500 km',
      color: 'Koyu Gri (Siyah Çizgili)',
      cert: 'Shelby Original Certificate',
    },
    {
      id: 'car_2',
      title: '1973 Porsche 911 Carrera RS',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
      startPrice: 4000000,
      buyNowPrice: 5000000,
      specEngine: '2.7L Flat-6 210hp',
      specTransmission: 'Manuel 5 İleri',
      specKm: '89,200 km',
      color: 'Grand Prix Beyazı (Yeşil)',
      cert: 'Porsche Matching Numbers Cert',
    },
    {
      id: 'car_3',
      title: '1958 Chevrolet Corvette C1',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
      startPrice: 3500000,
      buyNowPrice: 4200000,
      specEngine: '4.6L V8 283hp',
      specTransmission: 'Otomatik 2 İleri',
      specKm: '51,400 mi',
      color: 'Kırmızı - Beyaz',
      cert: 'NCRS Top Flight Certification',
    }
  ]
};

function processAutoBids(listing: Listing): Listing {
  let currentListing = { ...listing };
  let bids = [...(currentListing.bids || [])];
  let price = currentListing.price;
  let bidsCount = currentListing.bidsCount || 0;
  let timeLeft = currentListing.timeLeft;
  let lastBidderId = currentListing.lastBidderId;
  let lastBidderName = currentListing.lastBidderName;
  let lastBidderAvatar = currentListing.lastBidderAvatar;
  
  const minIncrement = currentListing.minIncrement !== undefined ? currentListing.minIncrement : 10;
  
  let bidPlacedInLoop = true;
  while (bidPlacedInLoop) {
    bidPlacedInLoop = false;
    
    // Sort auto-bids by when they were created (oldest first, i.e., button pressed first)
    const autoBids = [...(currentListing.autoBids || [])].sort((a, b) => a.createdAt - b.createdAt);
    
    // Find the next eligible auto-bidder
    // Eligible means:
    // 1. Not the current highest bidder (lastBidderId !== autoBid.bidderId)
    // 2. Can afford the next bid (autoBid.maxAmount >= price + minIncrement)
    const nextEligible = autoBids.find(ab => 
      ab.bidderId !== lastBidderId && 
      ab.maxAmount >= price + minIncrement
    );
    
    if (nextEligible) {
      // Place bid for this auto-bidder
      const bidAmount = price + minIncrement;
      price = bidAmount;
      bidsCount += 1;
      
      // Anti-sniping rule
      if (timeLeft !== undefined && timeLeft < 120) {
        timeLeft += 120;
      }
      
      lastBidderId = nextEligible.bidderId;
      lastBidderName = nextEligible.bidderName;
      lastBidderAvatar = nextEligible.bidderAvatar;
      
      const newBid: Bid = {
        id: `bid_auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bidderId: lastBidderId,
        bidderName: lastBidderName,
        bidderAvatar: lastBidderAvatar,
        amount: bidAmount,
        timestamp: Date.now(),
      };
      
      bids = [newBid, ...bids];
      
      // Update current listing properties for the next iteration of the loop
      currentListing.price = price;
      currentListing.bidsCount = bidsCount;
      currentListing.timeLeft = timeLeft;
      currentListing.lastBidderId = lastBidderId;
      currentListing.lastBidderName = lastBidderName;
      currentListing.lastBidderAvatar = lastBidderAvatar;
      currentListing.bids = bids;
      
      bidPlacedInLoop = true;
    }
  }
  
  return currentListing;
}

const cleanUndefinedFields = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedFields);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanUndefinedFields(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
};

const saveListingToFirestore = async (listing: Listing) => {
  try {
    const { doc, setDoc, getFirestore } = await import('firebase/firestore');
    const { app } = await import('./firebase');
    const db = getFirestore(app);
    const cleaned = cleanUndefinedFields(listing);
    await setDoc(doc(db, 'listings', listing.id), cleaned);
  } catch (e) {
    console.warn('Failed to save listing to Firestore:', e);
  }
};

const saveListingsToLocal = async (listings: Listing[]) => {
  try {
    await AsyncStorage.setItem('mezatliyoruz_local_listings', JSON.stringify(listings));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
};

let wsBidInterval: any = null;

export const useAppStore = create<StoreState>((set, get) => ({
  currentUser: null,
  accounts: {
    '5455798600': {
      user: {
        id: 'user_himmet',
        name: 'Himmet Akar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '5455798600',
        role: 'user',
        trustScore: 9.8,
        verified: true,
        isRentACarApproved: true,
        rentACarApplicationStatus: 'approved',
      },
      customer: {
        id: 'customer_himmet',
        name: 'Himmet Akar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '5455798600',
        role: 'customer',
        trustScore: 9.8,
        verified: true,
        isRentACarApproved: true,
        rentACarApplicationStatus: 'approved',
      },
      seller: {
        id: 'user_himmet',
        name: 'Himmet Akar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '5455798600',
        role: 'seller',
        trustScore: 9.9,
        verified: true,
        shopName: 'Akar Antika',
        isRentACarApproved: true,
        rentACarApplicationStatus: 'approved',
      }
    },
    '5327261026': {
      user: {
        id: 'user_oguz',
        name: 'Oğuz İbrahim Sarsmaz (Yönetici)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: '5327261026',
        role: 'user',
        trustScore: 10.0,
        verified: true,
      },
      customer: {
        id: 'customer_oguz',
        name: 'Oğuz İbrahim Sarsmaz (Yönetici)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: '5327261026',
        role: 'customer',
        trustScore: 10.0,
        verified: true,
      },
      super_admin: {
        id: 'super_admin_oguz',
        name: 'Oğuz İbrahim Sarsmaz (Yönetici)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: '5327261026',
        role: 'super_admin',
        trustScore: 10.0,
        verified: true,
      }
    }
  },

  liveCollage: defaultCollage,
  draftCollage: defaultCollage,
  liveFeaturedAuction: defaultFeaturedAuction,
  draftFeaturedAuction: defaultFeaturedAuction,
  orders: [],
  customerIssues: [],
  ads: [],
  cmsLoaded: false,
  adPricing: {
    '1day': { price: 0, enabled: true },
    '3days': { price: 0, enabled: true },
    '1week': { price: 0, enabled: true },
    '1month': { price: 0, enabled: true },
  },


  updateDraftCollage: (collage) => {
    set({ draftCollage: collage, liveCollage: collage });
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'home_collage'), { draft: collage, live: collage }, { merge: true });
      } catch (e: any) {
        console.warn('Failed to sync collage with Firebase:', e);
        Alert.alert('Taslak Kaydedilemedi', `Değişiklikler sunucuya senkronize edilemedi: ${e.message || e}`);
      }
    })();
  },

  publishCollage: () => {
    const draft = get().draftCollage;
    set({ liveCollage: draft });
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'home_collage'), { live: draft, draft: draft }, { merge: true });
      } catch (e: any) {
        console.warn('Failed to publish collage to Firebase:', e);
        Alert.alert('Slaytlar Yayınlanamadı', `Canlıya aktarma başarısız oldu: ${e.message || e}`);
      }
    })();
  },

  updateDraftFeaturedAuction: (auction) => {
    set({ draftFeaturedAuction: auction, liveFeaturedAuction: auction });
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'featured_auction'), { draft: auction, live: auction }, { merge: true });
      } catch (e) {
        console.warn('Failed to sync draft auction with Firebase:', e);
      }
    })();
  },

  publishFeaturedAuction: () => {
    const draft = get().draftFeaturedAuction;
    set({ liveFeaturedAuction: draft });
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'featured_auction'), { live: draft, draft: draft }, { merge: true });
      } catch (e) {
        console.warn('Failed to publish auction to Firebase:', e);
      }
    })();
  },

  loadCMSData: async () => {
    // 1. Try to load local listings first (so we instantly show new ones on refresh)
    try {
      const localListingsStr = await AsyncStorage.getItem('mezatliyoruz_local_listings');
      if (localListingsStr) {
        const parsed = JSON.parse(localListingsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Transfer all listings to Himmet Akar
          const sanitized = parsed.map(l => ({
            ...l,
            sellerName: 'Himmet Akar',
            sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            sellerTrustScore: 9.9,
            sellerVerified: true,
            sellerId: 'user_himmet'
          }));
          set({ listings: sanitized });
          console.log(`[DEBUG] Loaded ${parsed.length} listings from LocalStorage (sanitized to Himmet Akar).`);
        }
      }
    } catch (err) {
      console.warn('LocalStorage load error:', err);
    }

    try {
      const { doc, getDoc, getFirestore, collection, getDocs, setDoc } = await import('firebase/firestore');
      const { app } = await import('./firebase');
      const db = getFirestore(app);
      
      const collageSnap = await getDoc(doc(db, 'cms', 'home_collage'));
      if (collageSnap.exists()) {
        const data = collageSnap.data();
        const sanitizeCollage = (collage: any) => {
          if (!collage) return collage;
          const clean = JSON.parse(JSON.stringify(collage));
          
          // Backwards compatibility fallbacks
          ['leftVertical', 'rightTop', 'rightBottom'].forEach(boxKey => {
            if (clean[boxKey]) {
              if (!clean[boxKey].imagesWeb || clean[boxKey].imagesWeb.length === 0) {
                clean[boxKey].imagesWeb = clean[boxKey].images || [];
              }
              if (!clean[boxKey].imagesMobile || clean[boxKey].imagesMobile.length === 0) {
                clean[boxKey].imagesMobile = clean[boxKey].images || [];
              }
            }
          });

          if (clean.leftVertical) {
            if (clean.leftVertical.link === '/featured-auction') clean.leftVertical.link = '/auctions';
            if (clean.leftVertical.links) {
              clean.leftVertical.links = clean.leftVertical.links.map((l: string) => l === '/featured-auction' ? '/auctions' : l);
            }
          }
          if (clean.rightBottom) {
            if (clean.rightBottom.link === '/featured-auction') clean.rightBottom.link = '/auctions';
            if (clean.rightBottom.titles && (clean.rightBottom.titles[0]?.includes('Araba') || clean.rightBottom.titles[0]?.includes('araba') || clean.rightBottom.titles[0]?.includes('kaçırmayın'))) {
              clean.rightBottom.titles[0] = 'Canlı Mezatları İnceleyin!';
              clean.rightBottom.images[0] = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800';
            }
          }
          return clean;
        };
        if (data.live) set({ liveCollage: sanitizeCollage(data.live) });
        if (data.draft) set({ draftCollage: sanitizeCollage(data.draft) });
      }

      const auctionSnap = await getDoc(doc(db, 'cms', 'featured_auction'));
      if (auctionSnap.exists()) {
        const data = auctionSnap.data();
        let live = data.live;
        let draft = data.draft;
        if (live && (live.heroImage?.includes('1617788138017-80ad40651399') || !live.heroImage)) {
          live.heroImage = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000';
        }
        if (draft && (draft.heroImage?.includes('1617788138017-80ad40651399') || !draft.heroImage)) {
          draft.heroImage = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000';
        }
        if (live) set({ liveFeaturedAuction: live });
        if (draft) set({ draftFeaturedAuction: draft });
      }

      // Load Ad Pricing
      const pricingSnap = await getDoc(doc(db, 'cms', 'ad_pricing'));
      if (pricingSnap.exists()) {
        set({ adPricing: pricingSnap.data() as AdPricing });
      }

      // Load Ads from Firestore cms/ads_list
      try {
        const adsSnap = await getDoc(doc(db, 'cms', 'ads_list'));
        if (adsSnap.exists() && adsSnap.data().ads) {
          const adsList = adsSnap.data().ads as Ad[];
          set({ ads: adsList });
          AsyncStorage.setItem('mezatliyoruz_ads', JSON.stringify(adsList)).catch(err => console.warn(err));
        } else {
          const localAdsStr = await AsyncStorage.getItem('mezatliyoruz_ads');
          if (localAdsStr) set({ ads: JSON.parse(localAdsStr) });
        }
      } catch (adErr) {
        console.warn('Firestore load ads_list error, trying AsyncStorage fallback:', adErr);
        try {
          const localAdsStr = await AsyncStorage.getItem('mezatliyoruz_ads');
          if (localAdsStr) {
            set({ ads: JSON.parse(localAdsStr) });
          }
        } catch (storageErr) {
          console.warn('AsyncStorage fallback load ads error:', storageErr);
        }
      }

      // Load or seed listings
      const listingsCol = collection(db, 'listings');
      const listingsSnap = await getDocs(listingsCol);
      if (listingsSnap.empty) {
        // Seed database
        const currentListings = get().listings;
        for (const l of currentListings) {
          await setDoc(doc(db, 'listings', l.id), l);
        }
        await saveListingsToLocal(currentListings);
        console.log('[DEBUG] Firestore listings collection seeded.');
      } else {
        const loadedListings: Listing[] = [];
        listingsSnap.forEach((docSnap) => {
          const item = docSnap.data() as Listing;
          
          // Force Himmet Akar as the seller for all listings loaded from Firestore
          item.sellerName = 'Himmet Akar';
          item.sellerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
          item.sellerTrustScore = 9.9;
          item.sellerVerified = true;
          item.sellerId = 'user_himmet';

          if (!item.listingNumber) {
            let hash = 0;
            const idStr = item.id || '';
            for (let i = 0; i < idStr.length; i++) {
              hash = (hash << 5) - hash + idStr.charCodeAt(i);
              hash |= 0;
            }
            const positiveHash = Math.abs(hash);
            item.listingNumber = String(100000 + (positiveHash % 900000));
            
            // Backfill silently to Firestore
            (async () => {
              try {
                const { doc, setDoc, getFirestore } = await import('firebase/firestore');
                const { app } = await import('./firebase');
                const db = getFirestore(app);
                await setDoc(doc(db, 'listings', item.id), { listingNumber: item.listingNumber }, { merge: true });
              } catch (e) {
                console.warn('Failed to backfill listing number in Firestore:', e);
              }
            })();
          }
          loadedListings.push(item);
        });
        loadedListings.sort((a, b) => b.id.localeCompare(a.id));

        // Firestore is the single source of truth.
        // Only append local listings that are not in Firestore yet
        // and were user-created (id starts with 'listing_'), not seed data.
        const localListings = get().listings;
        const firestoreIds = new Set(loadedListings.map((l) => l.id));
        const localOnlyNew = localListings.filter(
          (l) => !firestoreIds.has(l.id) && l.id.startsWith('listing_')
        );
        const mergedListings = [...localOnlyNew, ...loadedListings];

        set({ listings: mergedListings });
        await saveListingsToLocal(mergedListings);
        console.log(`[DEBUG] Firestore: ${loadedListings.length}, local-only new: ${localOnlyNew.length}, total: ${mergedListings.length}`);
      }

    } catch (e) {
      console.log('CMS or listings data could not be loaded from Firebase:', e);
    } finally {
      set({ cmsLoaded: true });
    }
  },

  registerAccount: (phone, role, name, shopName) => set((state) => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.startsWith('90')) {
      cleanedPhone = cleanedPhone.slice(2);
    }
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = cleanedPhone.slice(1);
    }
    const currentAccount = state.accounts[cleanedPhone] || {};
    const newProfile: UserProfile = {
      id: `${role}_${Date.now()}`,
      name,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      phone: cleanedPhone,
      role,
      trustScore: 9.8,
      verified: true,
      shopName,
    };
    const updatedAccounts = {
      ...state.accounts,
      [cleanedPhone]: {
        ...currentAccount,
        [role]: newProfile,
      },
    };

    // Save accounts and session
    AsyncStorage.setItem('mezatliyoruz_accounts', JSON.stringify(updatedAccounts)).catch(err => console.warn(err));
    if (Platform.OS === 'web') {
      AsyncStorage.setItem('user_session_phone', cleanedPhone).catch(err => console.warn('Error saving phone on web:', err));
      AsyncStorage.setItem('user_session_role', role).catch(err => console.warn('Error saving role on web:', err));
    } else {
      try {
        if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
          SecureStore.setItemAsync('user_session_phone', cleanedPhone).catch(err => console.warn('Error saving secure phone:', err));
          SecureStore.setItemAsync('user_session_role', role).catch(err => console.warn('Error saving secure role:', err));
        }
      } catch (err) {
        console.warn('SecureStore item saving failed:', err);
      }
    }

    return {
      accounts: updatedAccounts,
      currentUser: newProfile,
    };
  }),

  loginAccount: (phone, role) => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.startsWith('90')) {
      cleanedPhone = cleanedPhone.slice(2);
    }
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = cleanedPhone.slice(1);
    }
    const account = get().accounts[cleanedPhone];
    if (account) {
      // Find the best match profile inside the account
      const matchedProfile = account[role] || account['super_admin'] || account['user'] || account['customer'] || account['seller'] || Object.values(account)[0];
      if (matchedProfile) {
        set({ currentUser: matchedProfile });
        
        if (Platform.OS === 'web') {
          AsyncStorage.setItem('user_session_phone', cleanedPhone).catch(err => console.warn('Error saving phone on web:', err));
          AsyncStorage.setItem('user_session_role', matchedProfile.role).catch(err => console.warn('Error saving role on web:', err));
        } else {
          try {
            if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
              SecureStore.setItemAsync('user_session_phone', cleanedPhone).catch(err => console.warn('Error saving secure phone:', err));
              SecureStore.setItemAsync('user_session_role', matchedProfile.role).catch(err => console.warn('Error saving secure role:', err));
            }
          } catch (err) {
            console.warn('SecureStore item saving failed:', err);
          }
        }

        return true;
      }
    }
    return false;
  },

  logoutAccount: () => {
    set({ currentUser: null });
    if (Platform.OS === 'web') {
      AsyncStorage.removeItem('user_session_phone').catch(err => console.warn('Error deleting phone on web:', err));
      AsyncStorage.removeItem('user_session_role').catch(err => console.warn('Error deleting role on web:', err));
    } else {
      try {
        if (SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
          SecureStore.deleteItemAsync('user_session_phone').catch(err => console.warn('Error deleting secure phone:', err));
          SecureStore.deleteItemAsync('user_session_role').catch(err => console.warn('Error deleting secure role:', err));
        }
      } catch (err) {
        console.warn('SecureStore item deletion failed:', err);
      }
    }
  },

  assignModerator: (phone, permissions) => set((state) => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.startsWith('90')) {
      cleanedPhone = cleanedPhone.slice(2);
    }
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = cleanedPhone.slice(1);
    }
    const account = state.accounts[cleanedPhone] || {};
    const baseProfile = account.user || account.seller || account.customer || account.super_admin || account.moderator;
    if (!baseProfile) return {};

    const newModeratorProfile: UserProfile = {
      ...baseProfile,
      role: 'moderator',
      moderatorPermissions: permissions
    };

    const updatedAccount = {
      ...account,
      moderator: newModeratorProfile
    };

    const updatedAccounts = {
      ...state.accounts,
      [cleanedPhone]: updatedAccount
    };
    AsyncStorage.setItem('mezatliyoruz_accounts', JSON.stringify(updatedAccounts)).catch(err => console.warn(err));

    const isCurrent = state.currentUser?.phone === cleanedPhone;

    return {
      accounts: updatedAccounts,
      currentUser: isCurrent ? newModeratorProfile : state.currentUser
    };
  }),

  removeModerator: (phone) => set((state) => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.startsWith('90')) {
      cleanedPhone = cleanedPhone.slice(2);
    }
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = cleanedPhone.slice(1);
    }
    const account = state.accounts[cleanedPhone] || {};
    if (!account.moderator) return {};

    const updatedAccount = { ...account };
    delete updatedAccount.moderator;

    const updatedAccounts = {
      ...state.accounts,
      [cleanedPhone]: updatedAccount
    };
    AsyncStorage.setItem('mezatliyoruz_accounts', JSON.stringify(updatedAccounts)).catch(err => console.warn(err));

    const isCurrent = state.currentUser?.phone === cleanedPhone && state.currentUser.role === 'moderator';
    const fallbackProfile = account.user || account.seller || account.customer || null;

    return {
      accounts: updatedAccounts,
      currentUser: isCurrent ? fallbackProfile : state.currentUser
    };
  }),

  restoreSession: async () => {
    try {
      // Load accounts from LocalStorage first to prevent race condition
      try {
        const localAccountsStr = await AsyncStorage.getItem('mezatliyoruz_accounts');
        if (localAccountsStr) {
          const parsed = JSON.parse(localAccountsStr);
          if (parsed && typeof parsed === 'object') {
            set((state) => ({
              accounts: {
                ...state.accounts,
                ...parsed
              }
            }));
          }
        }
      } catch (accountsErr) {
        console.warn('Error loading accounts inside restoreSession:', accountsErr);
      }

      // Load orders from LocalStorage
      try {
        const localOrdersStr = await AsyncStorage.getItem('mezatliyoruz_orders');
        if (localOrdersStr) {
          const parsed = JSON.parse(localOrdersStr);
          if (parsed && Array.isArray(parsed)) {
            set({ orders: parsed });
          }
        }
      } catch (ordersErr) {
        console.warn('Error loading orders inside restoreSession:', ordersErr);
      }

      // Load notifications from LocalStorage
      try {
        const localNotifsStr = await AsyncStorage.getItem('mezatliyoruz_notifications');
        if (localNotifsStr) {
          const parsed = JSON.parse(localNotifsStr);
          if (parsed && Array.isArray(parsed)) {
            set({ notifications: parsed });
          }
        }
      } catch (notifsErr) {
        console.warn('Error loading notifications inside restoreSession:', notifsErr);
      }

      // Load customer issues from LocalStorage
      try {
        const localIssuesStr = await AsyncStorage.getItem('mezatliyoruz_customer_issues');
        if (localIssuesStr) {
          const parsed = JSON.parse(localIssuesStr);
          if (parsed && Array.isArray(parsed)) {
            set({ customerIssues: parsed });
          }
        }
      } catch (issuesErr) {
        console.warn('Error loading customer issues inside restoreSession:', issuesErr);
      }

      // Load saved addresses from LocalStorage
      try {
        const localAddressesStr = await AsyncStorage.getItem('mezatliyoruz_saved_addresses');
        if (localAddressesStr) {
          const parsed = JSON.parse(localAddressesStr);
          if (parsed && Array.isArray(parsed)) {
            set({ savedAddresses: parsed });
          }
        }
      } catch (addrErr) {
        console.warn('Error loading saved addresses inside restoreSession:', addrErr);
      }

      let phone = null;
      let role = null;
      if (Platform.OS === 'web') {
        phone = await AsyncStorage.getItem('user_session_phone');
        role = await AsyncStorage.getItem('user_session_role');
      } else {
        if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
          phone = await SecureStore.getItemAsync('user_session_phone');
          role = await SecureStore.getItemAsync('user_session_role');
        }
      }
      if (phone && role) {
        const state = get();
        const account = state.accounts[phone];
        if (account && account[role as keyof typeof account]) {
          set({ currentUser: account[role as keyof typeof account]! });
          console.log('[DEBUG] Session restored successfully:', phone, role);
        }
      }
    } catch (err) {
      console.warn('Error restoring session:', err);
    }
  },

  updateProfileAvatar: (avatarUri) => set((state) => {
    if (!state.currentUser) return {};
    const updatedUser = { ...state.currentUser, avatar: avatarUri };
    
    // Also update in accounts store
    const phone = state.currentUser.phone;
    const role = state.currentUser.role;
    const updatedAccounts = { ...state.accounts };
    if (updatedAccounts[phone] && updatedAccounts[phone][role]) {
      updatedAccounts[phone][role] = { ...updatedAccounts[phone][role]!, avatar: avatarUri };
    }
    
    return {
      currentUser: updatedUser,
      accounts: updatedAccounts
    };
  }),
 
  stories: [],
 
  addStory: (story) => set((state) => {
    const isVideo = story.mediaUrl.toLowerCase().endsWith('.mp4') || 
                    story.mediaUrl.toLowerCase().endsWith('.mov') ||
                    story.mediaUrl.includes('.mp4?') ||
                    story.mediaUrl.includes('.mov?');
    return {
      stories: [
        {
          ...story,
          mediaType: isVideo ? 'video' : 'image',
          id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        },
        ...state.stories
      ]
    };
  }),

  createAd: (ad) => set((state) => {
    const durationDays = ad.durationType === '1day' ? 1 : ad.durationType === '3days' ? 3 : ad.durationType === '1week' ? 7 : 30;
    const now = Date.now();
    const newAd: Ad = {
      ...ad,
      id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      startDate: now,
      endDate: now + durationDays * 24 * 60 * 60 * 1000,
      status: 'active'
    };
    const newAds = [newAd, ...state.ads];
    
    // Save to Firestore
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'ads_list'), { ads: newAds }, { merge: true });
      } catch (e) {
        console.warn('Failed to save ads to Firestore:', e);
      }
    })();

    AsyncStorage.setItem('mezatliyoruz_ads', JSON.stringify(newAds)).catch(err => console.warn(err));
    return { ads: newAds };
  }),

  updateAdPricing: (pricing) => set(() => {
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'ad_pricing'), pricing);
      } catch (e) {
        console.warn('Failed to sync ad pricing to firestore:', e);
      }
    })();
    return { adPricing: pricing };
  }),

  approveAd: (adId) => set((state) => {
    const newAds = state.ads.map(ad => ad.id === adId ? { ...ad, status: 'active' as const } : ad);
    
    // Sync to Firestore
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'ads_list'), { ads: newAds }, { merge: true });
      } catch (e) {
        console.warn('Failed to approve ad in Firestore:', e);
      }
    })();

    AsyncStorage.setItem('mezatliyoruz_ads', JSON.stringify(newAds)).catch(err => console.warn(err));
    return { ads: newAds };
  }),

  rejectAd: (adId) => set((state) => {
    const newAds = state.ads.map(ad => ad.id === adId ? { ...ad, status: 'expired' as const } : ad);

    // Sync to Firestore
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'ads_list'), { ads: newAds }, { merge: true });
      } catch (e) {
        console.warn('Failed to reject ad in Firestore:', e);
      }
    })();

    AsyncStorage.setItem('mezatliyoruz_ads', JSON.stringify(newAds)).catch(err => console.warn(err));
    return { ads: newAds };
  }),

  updateAd: (adId, updatedFields) => set((state) => {
    const newAds = state.ads.map(ad => ad.id === adId ? { ...ad, ...updatedFields } : ad);

    // Sync to Firestore
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'ads_list'), { ads: newAds }, { merge: true });
      } catch (e) {
        console.warn('Failed to update ad in Firestore:', e);
      }
    })();

    AsyncStorage.setItem('mezatliyoruz_ads', JSON.stringify(newAds)).catch(err => console.warn(err));
    return { ads: newAds };
  }),

  deleteAd: (adId) => set((state) => {
    const newAds = state.ads.filter(ad => ad.id !== adId);

    // Sync to Firestore
    (async () => {
      try {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { app } = await import('./firebase');
        const db = getFirestore(app);
        await setDoc(doc(db, 'cms', 'ads_list'), { ads: newAds }, { merge: true });
      } catch (e) {
        console.warn('Failed to delete ad from Firestore:', e);
      }
    })();

    AsyncStorage.setItem('mezatliyoruz_ads', JSON.stringify(newAds)).catch(err => console.warn(err));
    return { ads: newAds };
  }),

  toggleAdDurationOption: (durationType, enabled) => set((state) => {
    const current = state.adPricing[durationType];
    const updatedPricing = {
      ...state.adPricing,
      [durationType]: { ...current, enabled }
    };
    try {
      const { doc, setDoc, getFirestore } = require('firebase/firestore');
      const { app } = require('./firebase');
      const db = getFirestore(app);
      setDoc(doc(db, 'cms', 'ad_pricing'), updatedPricing);
    } catch (e) {
      console.warn('Failed to sync ad pricing to firestore:', e);
    }
    return { adPricing: updatedPricing };
  }),

 
  rentACarApplications: [],

  applyForRentACar: (app) => set((state) => {
    const newApp: RentACarApplication = {
      ...app,
      id: `app_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Update currentUser state to pending
    const updatedUser = state.currentUser ? {
      ...state.currentUser,
      rentACarApplicationStatus: 'pending' as const
    } : null;
    
    // Update accounts dictionary as well
    let updatedAccounts = { ...state.accounts };
    if (updatedUser) {
      const phone = updatedUser.phone;
      const role = updatedUser.role;
      if (updatedAccounts[phone] && updatedAccounts[phone][role]) {
        updatedAccounts[phone] = {
          ...updatedAccounts[phone],
          [role]: updatedUser
        };
      }
    }

    return {
      rentACarApplications: [newApp, ...state.rentACarApplications],
      currentUser: updatedUser,
      accounts: updatedAccounts
    };
  }),

  approveRentACarApplication: (appId, note) => set((state) => {
    const updatedApps = state.rentACarApplications.map((app) => {
      if (app.id === appId) {
        return { ...app, status: 'approved' as const, adminNote: note || '' };
      }
      return app;
    });

    const targetApp = state.rentACarApplications.find((app) => app.id === appId);
    if (!targetApp) return { rentACarApplications: updatedApps };

    const targetUserId = targetApp.userId;
    
    const updatedListings = state.listings.map((l) => {
      if (l.sellerName === targetApp.shopName || l.sellerName === targetApp.userName) {
        if (l.status === 'pending_approval') {
          return { ...l, status: 'active' as const };
        }
      }
      return l;
    });

    let updatedCurrentUser = state.currentUser;
    if (updatedCurrentUser && updatedCurrentUser.id === targetUserId) {
      updatedCurrentUser = {
        ...updatedCurrentUser,
        isRentACarApproved: true,
        rentACarApplicationStatus: 'approved' as const,
        role: 'seller'
      };
    }

    let updatedAccounts = { ...state.accounts };
    Object.keys(updatedAccounts).forEach((phone) => {
      const acc = updatedAccounts[phone];
      ['user', 'super_admin', 'customer', 'seller'].forEach((role) => {
        const profile = acc[role as keyof typeof acc];
        if (profile && profile.id === targetUserId) {
          acc[role as keyof typeof acc] = {
            ...profile,
            isRentACarApproved: true,
            rentACarApplicationStatus: 'approved' as const,
            role: 'seller'
          } as any;
        }
      });
    });

    return {
      rentACarApplications: updatedApps,
      listings: updatedListings,
      currentUser: updatedCurrentUser,
      accounts: updatedAccounts
    };
  }),

  rejectRentACarApplication: (appId, note) => set((state) => {
    const updatedApps = state.rentACarApplications.map((app) => {
      if (app.id === appId) {
        return { ...app, status: 'rejected' as const, adminNote: note || '' };
      }
      return app;
    });

    const targetApp = state.rentACarApplications.find((app) => app.id === appId);
    if (!targetApp) return { rentACarApplications: updatedApps };

    const targetUserId = targetApp.userId;

    let updatedCurrentUser = state.currentUser;
    if (updatedCurrentUser && updatedCurrentUser.id === targetUserId) {
      updatedCurrentUser = {
        ...updatedCurrentUser,
        isRentACarApproved: false,
        rentACarApplicationStatus: 'rejected' as const
      };
    }

    let updatedAccounts = { ...state.accounts };
    Object.keys(updatedAccounts).forEach((phone) => {
      const acc = updatedAccounts[phone];
      ['user', 'super_admin', 'customer', 'seller'].forEach((role) => {
        const profile = acc[role as keyof typeof acc];
        if (profile && profile.id === targetUserId) {
          acc[role as keyof typeof acc] = {
            ...profile,
            isRentACarApproved: false,
            rentACarApplicationStatus: 'rejected' as const
          } as any;
        }
      });
    });

    return {
      rentACarApplications: updatedApps,
      currentUser: updatedCurrentUser,
      accounts: updatedAccounts
    };
  }),

  listings: initialListings.map((l) => {
    // Add mock coordinates around Istanbul/Izmir/Ankara for location-based search
    let lat = 41.0082;
    let lon = 28.9784;
    if (l.city === 'İstanbul') {
      lat = 41.0082 + (Math.random() - 0.5) * 0.15;
      lon = 28.9784 + (Math.random() - 0.5) * 0.15;
    } else if (l.city === 'İzmir') {
      lat = 38.4192 + (Math.random() - 0.5) * 0.2;
      lon = 27.1287 + (Math.random() - 0.5) * 0.2;
    } else if (l.city === 'Ankara') {
      lat = 39.9334 + (Math.random() - 0.5) * 0.2;
      lon = 32.8597 + (Math.random() - 0.5) * 0.2;
    } else if (l.city === 'Muğla' || l.city === 'Bodrum') {
      lat = 37.0344 + (Math.random() - 0.5) * 0.1;
      lon = 27.4305 + (Math.random() - 0.5) * 0.1;
    } else if (l.city === 'Bursa') {
      lat = 40.1885 + (Math.random() - 0.5) * 0.2;
      lon = 29.0610 + (Math.random() - 0.5) * 0.2;
    } else if (l.city === 'Antalya') {
      lat = 36.8969 + (Math.random() - 0.5) * 0.2;
      lon = 30.7133 + (Math.random() - 0.5) * 0.2;
    } else {
      lat = 41.0082 + (Math.random() - 0.5) * 0.3;
      lon = 28.9784 + (Math.random() - 0.5) * 0.3;
    }
    // Set all initial listings to belong to Himmet Akar and clear bid histories for production launch
    return {
      ...l,
      latitude: lat,
      longitude: lon,
      sellerName: 'Himmet Akar',
      sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      sellerTrustScore: 9.9,
      sellerVerified: true,
      sellerId: 'user_himmet',
      bids: [],
      bidsCount: 0,
      lastBidderId: undefined,
      lastBidderName: undefined,
      lastBidderAvatar: undefined
    };
  }),
  chats: [],
  reviews: [],
  addReview: (review) => set((state) => ({
    reviews: [
      ...state.reviews,
      {
        ...review,
        id: `rev_${Date.now()}`,
        createdAt: new Date().toLocaleDateString('tr-TR')
      }
    ]
  })),
  compareList: [],
  addToCompareList: (listing) => set((state) => {
    if (state.compareList.some((c) => c.id === listing.id)) return state;
    if (state.compareList.length >= 3) {
      Alert.alert('Limit Sınırı', 'Aynı anda en fazla 3 ilanı karşılaştırabilirsiniz.');
      return state;
    }
    return { compareList: [...state.compareList, listing] };
  }),
  removeFromCompareList: (id) => set((state) => ({
    compareList: state.compareList.filter((c) => c.id !== id),
  })),
  clearCompareList: () => set({ compareList: [] }),
  activeChatId: null,
  cart: [],
  notifications: [
    {
      id: 'notif_welcome',
      userId: 'all',
      title: 'Mezatliyoruz Uygulamasına Hoş Geldiniz! 🚀',
      message: 'Canlı mezatlar, bit pazarı ve üreticiden tüketiciye doğrudan satış özellikleri ile yayındayız.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false
    }
  ],

  addToCart: (listingId) => set((state) => {
    const listing = state.listings.find((l) => l.id === listingId);
    if (!listing) return state;
    const existingIndex = state.cart.findIndex((item) => item.listing.id === listingId);
    if (existingIndex > -1) {
      const updatedCart = [...state.cart];
      updatedCart[existingIndex].quantity += 1;
      return { cart: updatedCart };
    } else {
      return { cart: [...state.cart, { listing, quantity: 1 }] };
    }
  }),





  removeFromCart: (listingId) => set((state) => ({
    cart: state.cart.filter((item) => item.listing.id !== listingId)
  })),

  updateCartQuantity: (listingId, quantity) => set((state) => ({
    cart: state.cart.map((item) =>
      item.listing.id === listingId ? { ...item, quantity: Math.max(1, quantity) } : item
    )
  })),

  clearCart: () => set({ cart: [] }),

  cartModalVisible: false,
  setCartModalVisible: (visible) => set({ cartModalVisible: visible }),
  authModalVisible: false,
  setAuthModalVisible: (visible) => set({ authModalVisible: visible }),
  authStep: 'login',
  setAuthStep: (step) => set({ authStep: step }),
  authMode: 'login',
  setAuthMode: (mode) => set({ authMode: mode }),
  checkoutStep: 'cart',
  setCheckoutStep: (step) => set({ checkoutStep: step }),

  toggleLike: (listingId) => set((state) => {
    const updatedListings = state.listings.map((l) =>
      l.id === listingId
        ? { ...l, liked: !l.liked, favoritesCount: l.liked ? l.favoritesCount - 1 : l.favoritesCount + 1 }
        : l
    );
    const target = updatedListings.find((l) => l.id === listingId);
    if (target) saveListingToFirestore(target);
    saveListingsToLocal(updatedListings);
    return { listings: updatedListings };
  }),

  toggleFavorite: (listingId) => set((state) => {
    const updatedListings = state.listings.map((l) =>
      l.id === listingId ? { ...l, favorited: !l.favorited } : l
    );
    const target = updatedListings.find((l) => l.id === listingId);
    if (target) saveListingToFirestore(target);
    saveListingsToLocal(updatedListings);
    return { listings: updatedListings };
  }),

  placeBid: (listingId, amount, customBidder) => {
    let success = false;
    let error: string | undefined;

    set((state) => {
      const bidder = customBidder || state.currentUser;
      if (!bidder) {
        error = 'Teklif vermek için lütfen giriş yapın.';
        return {};
      }
      const bidderWithBan = bidder as any;
      if (bidderWithBan.liveAuctionBanUntil && bidderWithBan.liveAuctionBanUntil > Date.now()) {
        const remainingDays = Math.ceil((bidderWithBan.liveAuctionBanUntil - Date.now()) / (24 * 60 * 60 * 1000));
        error = `Canlı mezat katılım engeliniz bulunmaktadır. (Kalan Süre: ${remainingDays} gün). Ödemesi 48 saat içinde yapılmayan mezatlar nedeniyle askıya alındınız.`;
        return {};
      }
      const bidderId = bidder.id;
      const bidderName = bidder.name;
      const bidderAvatar = bidder.avatar;

      const updatedListings = state.listings.map((l) => {
        if (l.id === listingId) {
          if (l.type !== 'auction') {
            error = 'Bu ürün açık artırmada değil.';
            return l;
          }
          if (l.timeLeft !== undefined && l.timeLeft <= 0) {
            error = 'Açık artırma süresi doldu.';
            return l;
          }
          if (l.lastBidderId && l.lastBidderId === bidderId) {
            error = 'En yüksek teklif zaten sizin. Tekrar teklif veremezsiniz.';
            return l;
          }
          
          const increment = l.minIncrement !== undefined ? l.minIncrement : 10;
          const minRequired = l.price + increment;
          if (amount < minRequired) {
            error = `Teklif miktarı en az ${minRequired} TL olmalıdır (Minimum artış: ${increment} TL).`;
            return l;
          }

          success = true;
          let newTimeLeft = l.timeLeft;
          
          // Anti-Sniping Kuralı: Son 2 dakika (120 saniye) içinde teklif verilirse süreyi +2 dakika uzat
          if (l.timeLeft !== undefined && l.timeLeft < 120) {
            newTimeLeft = l.timeLeft + 120;
          }

          const newBid: Bid = {
            id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            bidderId,
            bidderName,
            bidderAvatar,
            amount,
            timestamp: Date.now(),
          };

          let updatedListing: Listing = {
            ...l,
            price: amount,
            bidsCount: (l.bidsCount || 0) + 1,
            timeLeft: newTimeLeft,
            lastBidderId: bidderId,
            lastBidderName: bidderName,
            lastBidderAvatar: bidderAvatar,
            bids: [newBid, ...(l.bids || [])],
          };

          // Clamp and handle Buy Now (reservePrice) limit check immediately:
          if (l.reservePrice && amount >= l.reservePrice) {
            updatedListing.price = l.reservePrice;
            updatedListing.auctionStatus = 'won';
            updatedListing.auctionWinnerId = bidderId;
            updatedListing.auctionWinnerName = bidderName;
            updatedListing.auctionWinnerAvatar = bidderAvatar;
            updatedListing.timeLeft = 0;
            updatedListing.endTime = Date.now();
            updatedListing.auctionWonAt = Date.now();
            updatedListing.auctionPaymentDeadline = Date.now() + 48 * 60 * 60 * 1000;
            if (updatedListing.bids && updatedListing.bids.length > 0) {
              updatedListing.bids[0].amount = l.reservePrice;
            }
          } else {
            // Trigger auto-bid evaluation against this new manual bid
            updatedListing = processAutoBids(updatedListing);
            
            // Check if auto-bids reached the Buy Now Price limit:
            if (l.reservePrice && updatedListing.price >= l.reservePrice) {
              updatedListing.price = l.reservePrice;
              updatedListing.auctionStatus = 'won';
              updatedListing.auctionWinnerId = updatedListing.lastBidderId;
              updatedListing.auctionWinnerName = updatedListing.lastBidderName;
              updatedListing.auctionWinnerAvatar = updatedListing.lastBidderAvatar;
              updatedListing.timeLeft = 0;
              updatedListing.endTime = Date.now();
              updatedListing.auctionWonAt = Date.now();
              updatedListing.auctionPaymentDeadline = Date.now() + 48 * 60 * 60 * 1000;
              if (updatedListing.bids && updatedListing.bids.length > 0) {
                updatedListing.bids[0].amount = l.reservePrice;
              }
            }
          }
          return updatedListing;
        }
        return l;
      });

      let newCart = [...state.cart];
      let newNotifications = [...(state.notifications || [])];

      const target = updatedListings.find((l) => l.id === listingId);
      if (target && success) {
        if (target.auctionStatus === 'won') {
          const winnerId = target.auctionWinnerId;
          
          // 1. If the winner is current user, automatically add to cart
          if (state.currentUser && winnerId === state.currentUser.id) {
            const inCart = newCart.some(item => item.listing.id === target.id);
            if (!inCart) {
              newCart.push({ listing: target, quantity: 1 });
            }
          }

          // 2. Create notification for the winner
          const now = Date.now();
          const newNotif: Notification = {
            id: `notif_${now}_won_${target.id}`,
            userId: winnerId!,
            title: '🏆 Mezatı Kazandınız!',
            message: `Tebrikler! "${target.title}" mezatını hemen al fiyatıyla kazandınız. Siparişinizi tamamlamak için 48 saatiniz bulunmaktadır.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'cart'
          };
          newNotifications = [newNotif, ...newNotifications];

          // 3. Create lost notifications for other bidders
          const otherBidders = Array.from(new Set(
            (target.bids || [])
              .map(bid => bid.bidderId)
              .filter(bidderId => bidderId && bidderId !== winnerId)
          ));

          otherBidders.forEach(bidderId => {
            const newLostNotif: Notification = {
              id: `notif_${now}_lost_${target.id}_${bidderId}`,
              userId: bidderId,
              title: '😢 Mezatı Kaybettiniz',
              message: `Katıldığınız "${target.title}" mezatını kaybettiniz. Fiyatları daha yakında takip ederek bir dahaki sefere şansınızı artırın.`,
              createdAt: new Date().toISOString(),
              isRead: false,
              type: 'product',
              productId: target.id
            };
            newNotifications = [newLostNotif, ...newNotifications];
          });
        }

        saveListingToFirestore(target);
        saveListingsToLocal(updatedListings);
      }

      return { 
        listings: updatedListings,
        cart: newCart,
        notifications: newNotifications
      };
    });

    return { success, error };
  },

  setAutoBidLimit: (listingId, maxAmount) => {
    let success = false;
    let error: string | undefined;

    set((state) => {
      const currentUser = state.currentUser;
      if (!currentUser) {
        error = 'Otomasyonu başlatmak için giriş yapmalısınız.';
        return {};
      }

      const updatedListings = state.listings.map((l) => {
        if (l.id === listingId) {
          if (l.type !== 'auction') {
            error = 'Bu ürün açık artırmada değil.';
            return l;
          }
          if (l.timeLeft !== undefined && l.timeLeft <= 0) {
            error = 'Açık artırma süresi doldu.';
            return l;
          }
          
          const minIncrement = l.minIncrement !== undefined ? l.minIncrement : 10;
          const minRequired = l.price + minIncrement;
          if (maxAmount < minRequired) {
            error = `Maksimum limit en az ${minRequired} TL olmalıdır (Mevcut fiyat + min artış).`;
            return l;
          }

          success = true;
          
          // Add or update auto-bid for current user
          const existingAutoBids = l.autoBids || [];
          const otherAutoBids = existingAutoBids.filter(ab => ab.bidderId !== currentUser.id);
          const newAutoBid: AutoBid = {
            bidderId: currentUser.id,
            bidderName: currentUser.name,
            bidderAvatar: currentUser.avatar,
            maxAmount,
            createdAt: Date.now()
          };
          
          let updatedListing: Listing = {
            ...l,
            autoBids: [...otherAutoBids, newAutoBid]
          };

          // Trigger auto-bid immediately if the user is not the current highest bidder
          if (updatedListing.lastBidderId !== currentUser.id) {
            const bidAmount = Math.min(updatedListing.price + minIncrement, maxAmount);
            if (bidAmount >= updatedListing.price + minIncrement) {
              let newTimeLeft = updatedListing.timeLeft;
              if (newTimeLeft !== undefined && newTimeLeft < 120) {
                newTimeLeft = newTimeLeft + 120;
              }
              
              const newBid: Bid = {
                id: `bid_auto_init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                bidderId: currentUser.id,
                bidderName: currentUser.name,
                bidderAvatar: currentUser.avatar,
                amount: bidAmount,
                timestamp: Date.now()
              };
              
              updatedListing.price = bidAmount;
              updatedListing.bidsCount = (updatedListing.bidsCount || 0) + 1;
              updatedListing.timeLeft = newTimeLeft;
              updatedListing.lastBidderId = currentUser.id;
              updatedListing.lastBidderName = currentUser.name;
              updatedListing.lastBidderAvatar = currentUser.avatar;
              updatedListing.bids = [newBid, ...(updatedListing.bids || [])];
            }
          }
          
          // Process other auto-bids in response to this
          updatedListing = processAutoBids(updatedListing);
          return updatedListing;
        }
        return l;
      });

      const target = updatedListings.find((l) => l.id === listingId);
      if (target && success) {
        saveListingToFirestore(target);
        saveListingsToLocal(updatedListings);
      }

      return { listings: updatedListings };
    });

    return { success, error };
  },

  cancelAutoBidLimit: (listingId) => {
    let success = false;
    let error: string | undefined;

    set((state) => {
      const currentUser = state.currentUser;
      if (!currentUser) {
        error = 'Giriş yapmalısınız.';
        return {};
      }

      const updatedListings = state.listings.map((l) => {
        if (l.id === listingId) {
          const existingAutoBids = l.autoBids || [];
          success = true;
          return {
            ...l,
            autoBids: existingAutoBids.filter(ab => ab.bidderId !== currentUser.id)
          };
        }
        return l;
      });

      const target = updatedListings.find((l) => l.id === listingId);
      if (target && success) {
        saveListingToFirestore(target);
        saveListingsToLocal(updatedListings);
      }

      return { listings: updatedListings };
    });

    return { success, error };
  },

  sendInChatOffer: (chatId, amount) => set((state) => {
    return {
      chats: state.chats.map((c) => {
        if (c.id === chatId) {
          const newMsg: Message = {
            id: `msg_${Date.now()}`,
            senderId: state.currentUser?.id || 'guest',
            text: `${amount} TL değerinde in-chat teklif gönderildi.`,
            timestamp: new Date(),
            type: 'offer',
            offerAmount: amount,
            offerStatus: 'pending'
          };
          return {
            ...c,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    };
  }),

  respondToOffer: (chatId, messageId, response, counterAmount) => set((state) => ({
    chats: state.chats.map((c) => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id === messageId) {
              return {
                ...m,
                offerStatus: response === 'accepted' ? 'accepted' : 'rejected',
                counterAmount: counterAmount
              };
            }
            return m;
          })
        };
      }
      return c;
    })
  })),

  sendMessage: (chatId, text, type = 'text', mediaUrl, fileName) => set((state) => ({
    chats: state.chats.map((c) => {
      if (c.id === chatId) {
        const newMsg: Message = {
          id: `msg_${Date.now()}`,
          senderId: state.currentUser?.id || 'guest',
          text,
          timestamp: new Date(),
          type,
          mediaUrl,
          fileName,
        };
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    })
  })),

  createChat: (listingId, fromSellerProfile, targetUser) => {
    const state = get();
    const otherPartyName = targetUser ? targetUser.name : (state.listings.find(l => l.id === listingId)?.sellerName || 'Satıcı');
    const otherPartyAvatar = targetUser ? targetUser.avatar : (state.listings.find(l => l.id === listingId)?.sellerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

    const existingChat = state.chats.find((c) => c.listingId === listingId && c.otherPartyName === otherPartyName);
    if (existingChat) {
      return existingChat.id;
    }

    const listing = state.listings.find((l) => l.id === listingId);
    if (!listing) return '';

    const newChatId = `chat_${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.photos[0],
      otherPartyName,
      otherPartyAvatar,
      fromSellerProfile: fromSellerProfile,
      messages: [
        {
          id: `msg_welcome`,
          senderId: 'system',
          text: fromSellerProfile ? 'Sohbet başladı.' : `"${listing.title}" ilanı için sohbet başladı.`,
          timestamp: new Date(),
          type: 'text',
        }
      ]
    };

    set((state) => ({
      chats: [...state.chats, newChat]
    }));

    return newChatId;
  },

  decrementTimers: () => set((state) => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    let newNotifications = [...state.notifications];
    let newCart = [...state.cart];
    let newAccounts = { ...state.accounts };
    let newCurrentUser = state.currentUser;
    let forceSaveToLocal = false;

    const updatedListings = state.listings.map((l) => {
      if (l.type === 'auction') {
        const updatedListing = { ...l };
        let newTimeLeft = l.timeLeft;

        if (l.endTime) {
          newTimeLeft = Math.max(0, Math.round((l.endTime - now) / 1000));
        } else if (l.timeLeft !== undefined && l.timeLeft > 0) {
          newTimeLeft = l.timeLeft - 1;
        }

        updatedListing.timeLeft = newTimeLeft;

        // Transition 1: Auction has just ended
        if (newTimeLeft === 0 && (l.auctionStatus === undefined || l.auctionStatus === 'active')) {
          // Set to won or expired
          if (l.lastBidderId) {
            updatedListing.auctionStatus = 'won';
            updatedListing.auctionWinnerId = l.lastBidderId;
            updatedListing.auctionWinnerName = l.lastBidderName;
            updatedListing.auctionWinnerAvatar = l.lastBidderAvatar;
            updatedListing.auctionWonAt = now;
            updatedListing.auctionPaymentDeadline = now + 48 * 60 * 60 * 1000; // 48h
            
            // If the winner is current user, automatically add to cart
            if (state.currentUser && l.lastBidderId === state.currentUser.id) {
              const inCart = newCart.some(item => item.listing.id === l.id);
              if (!inCart) {
                newCart.push({ listing: updatedListing, quantity: 1 });
              }
            }

            // Create notification for the winner
            const newNotif: Notification = {
              id: `notif_${now}_won_${l.id}`,
              userId: l.lastBidderId,
              title: '🏆 Mezatı Kazandınız!',
              message: `Tebrikler! "${l.title}" mezatını kazandınız. Siparişinizi tamamlamak için 48 saatiniz bulunmaktadır.`,
              createdAt: new Date().toISOString(),
              isRead: false,
              type: 'cart'
            };
            newNotifications = [newNotif, ...newNotifications];

            // Notify other participants who lost the auction
            const otherBidders = Array.from(new Set(
              (l.bids || [])
                .map(bid => bid.bidderId)
                .filter(bidderId => bidderId && bidderId !== l.lastBidderId)
            ));

            otherBidders.forEach(bidderId => {
              const newLostNotif: Notification = {
                id: `notif_${now}_lost_${l.id}_${bidderId}`,
                userId: bidderId,
                title: '😢 Mezatı Kaybettiniz',
                message: `Katıldığınız "${l.title}" mezatını kaybettiniz. Fiyatları daha yakından takip ederek bir dahaki sefere şansınızı artırın.`,
                createdAt: new Date().toISOString(),
                isRead: false,
                type: 'product',
                productId: l.id
              };
              newNotifications = [newLostNotif, ...newNotifications];

              if (Platform.OS !== 'web') {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: newLostNotif.title,
                    body: newLostNotif.message,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                  },
                  trigger: null,
                }).catch((err: any) => console.warn('Error scheduling local notification:', err));
              }
            });

            // Schedule local push notification if mobile
            if (Platform.OS !== 'web') {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: newNotif.title,
                  body: newNotif.message,
                  sound: true,
                  priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null,
              }).catch((err: any) => console.warn('Error scheduling local notification:', err));
            }
          } else {
            updatedListing.auctionStatus = 'expired'; // closed without winner
          }
          forceSaveToLocal = true;
        }

        // Transition 2: Mezat is won but not purchased yet, check reminders and deadlines
        if (updatedListing.auctionStatus === 'won') {
          // Check deadline (48 hours)
          if (updatedListing.auctionPaymentDeadline && now > updatedListing.auctionPaymentDeadline) {
            updatedListing.auctionStatus = 'expired';
            
            const winnerId = updatedListing.auctionWinnerId;
            if (winnerId) {
              // Apply 3-month ban
              const banUntil = now + 90 * 24 * 60 * 60 * 1000;
              
              if (newCurrentUser && newCurrentUser.id === winnerId) {
                newCurrentUser = {
                  ...newCurrentUser,
                  liveAuctionBanUntil: banUntil
                };
              }

              Object.keys(newAccounts).forEach((phone) => {
                const acc = newAccounts[phone];
                ['user', 'super_admin', 'customer', 'seller'].forEach((role) => {
                  const profile = acc[role as keyof typeof acc];
                  if (profile && profile.id === winnerId) {
                    acc[role as keyof typeof acc] = {
                      ...profile,
                      liveAuctionBanUntil: banUntil
                    } as any;
                  }
                });
              });

              // Remove from cart
              newCart = newCart.filter(item => item.listing.id !== l.id);

              // Send penalty notification
              const newNotif: Notification = {
                id: `notif_${now}_penalty_${l.id}`,
                userId: winnerId,
                title: '🚨 Canlı Mezat Cezası',
                message: `"${l.title}" ürünü için 48 saatlik satın alma süresi dolduğundan canlı mezatlara katılımınız 3 ay süreyle askıya alınmıştır.`,
                createdAt: new Date().toISOString(),
                isRead: false,
                type: 'system'
              };
              newNotifications = [newNotif, ...newNotifications];

              // Schedule local push notification if mobile
              if (Platform.OS !== 'web') {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: newNotif.title,
                    body: newNotif.message,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                  },
                  trigger: null,
                }).catch((err: any) => console.warn('Error scheduling local notification:', err));
              }
            }
            forceSaveToLocal = true;
          } 
          // Check 6-hour reminder
          else {
            const lastReminder = updatedListing.lastReminderSentAt || updatedListing.auctionWonAt || now;
            if (now - lastReminder >= 6 * 60 * 60 * 1000) {
              const currentHour = new Date().getHours();
              // Between 10:00 AM and 10:00 PM (10 to 22)
              if (currentHour >= 10 && currentHour < 22) {
                updatedListing.lastReminderSentAt = now;
                
                const winnerId = updatedListing.auctionWinnerId;
                if (winnerId) {
                  const newNotif: Notification = {
                    id: `notif_${now}_reminder_${l.id}`,
                    userId: winnerId,
                    title: '🔔 Ödeme Hatırlatması',
                    message: `Önemli: Kazandığınız "${l.title}" mezatının ödeme süresi dolmak üzere. Canlı mezatlara katılımınızın engellenmemesi için hemen siparişinizi tamamlayın.`,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                    type: 'cart'
                  };
                  newNotifications = [newNotif, ...newNotifications];

                  // Schedule local push notification if mobile
                  if (Platform.OS !== 'web') {
                    Notifications.scheduleNotificationAsync({
                      content: {
                        title: newNotif.title,
                        body: newNotif.message,
                        sound: true,
                        priority: Notifications.AndroidNotificationPriority.HIGH,
                      },
                      trigger: null,
                    }).catch((err: any) => console.warn('Error scheduling local notification:', err));
                  }
                }
              }
            }
          }
        }

        return updatedListing;
      }
      return l;
    });

    if (forceSaveToLocal) {
      saveListingsToLocal(updatedListings);
    }

    return {
      listings: updatedListings,
      stories: state.stories.filter((story) => now - story.createdAt < twentyFourHours),
      notifications: newNotifications,
      cart: newCart,
      accounts: newAccounts,
      currentUser: newCurrentUser
    };
  }),
  addOrder: (order) => {
    const state = get();
    // Recalculate secure server-side totalAmount using DB prices and shipping fee
    const itemSubtotal = order.items.reduce((sum, item) => {
      const dbListing = state.listings.find(l => l.id === item.listing.id);
      const actualPrice = dbListing ? dbListing.price : item.listing.price;
      return sum + actualPrice * item.quantity;
    }, 0);
    const secureTotalAmount = itemSubtotal + (order.shippingFee || 0);

    const generatedId = 'MZ-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...order,
      totalAmount: secureTotalAmount,
      id: generatedId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    const listing = order.items[0].listing;
    const existingChat = state.chats.find(c => c.listingId === listing.id);
    const chatId = existingChat ? existingChat.id : `chat_${Date.now()}`;
    
    if (!existingChat) {
      const newChat: Chat = {
        id: chatId,
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.photos[0],
        otherPartyName: listing.sellerName,
        otherPartyAvatar: listing.sellerAvatar,
        messages: [
          {
            id: `msg_welcome`,
            senderId: 'system',
            text: `"${listing.title}" ilanı için sohbet başladı.`,
            timestamp: new Date(),
            type: 'text',
          }
        ]
      };
      set(s => ({ chats: [...s.chats, newChat] }));
    }

    const cargoInfoText = order.shippingCompany 
      ? `\nKargo Firması: ${order.shippingCompany}\nKargo Ücreti: ${order.shippingFee} TL (Alıcı Ödemeli)\nKargo Takip Kodu: ${newOrder.trackingNumber || 'Hazırlanıyor'}`
      : '\nKargo: Mağazadan Teslim';

    const newMsg: Message = {
      id: `msg_order_${Date.now()}`,
      senderId: 'system',
      text: `🛒 YENİ SİPARİŞ! Sipariş No: ${generatedId}\nÜrün: ${listing.title}\nAdet: ${order.items[0].quantity}\nAlıcı: ${order.buyerName}\nAdres: ${order.buyerAddress}${cargoInfoText}\nDurum: Sipariş Alındı (Ödeme onaylandı).`,
      timestamp: new Date(),
      type: 'text',
    };
    
    set(s => {
      // Find seller ID
      let sellerId = 'demo_seller_mega_id';
      Object.values(s.accounts).forEach((acc: any) => {
        ['seller', 'user', 'super_admin'].forEach((role) => {
          const prof = acc[role];
          if (prof && (prof.shopName === listing.sellerName || prof.name === listing.sellerName)) {
            sellerId = prof.id;
          }
        });
      });

      const sNotif: Notification = {
        id: `notif_s_${Date.now()}`,
        userId: sellerId,
        title: 'Yeni Sipariş Alındı! 🛒',
        message: `"${listing.title}" ürünü için yeni bir sipariş aldınız. Sipariş No: ${generatedId}`,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      const bNotif: Notification = {
        id: `notif_b_${Date.now()}`,
        userId: order.buyerId,
        title: 'Siparişiniz Alındı! 🎉',
        message: `Siparişiniz başarıyla alındı. Sipariş No: ${generatedId}`,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      const extraNotifications: Notification[] = [];
      const updatedListings = s.listings.map((item) => {
        const purchasedItem = order.items.find(oi => oi.listing.id === item.id);
        if (purchasedItem) {
          if (item.type === 'auction') {
            return {
              ...item,
              auctionStatus: 'purchased' as const
            };
          } else {
            const currentStock = item.stock !== undefined ? item.stock : 1;
            const newStock = Math.max(0, currentStock - purchasedItem.quantity);
            
            if (newStock === 0) {
              let sellerId = item.sellerId || 'demo_seller_mega_id';
              Object.values(s.accounts).forEach((acc: any) => {
                ['seller', 'user', 'super_admin'].forEach((role) => {
                  const prof = acc[role];
                  if (prof && (prof.shopName === item.sellerName || prof.name === item.sellerName)) {
                    sellerId = prof.id;
                  }
                });
              });

              extraNotifications.push({
                id: `notif_stock_out_${Date.now()}_${item.id}`,
                userId: sellerId,
                title: 'Stok Tükendi ⚠️',
                message: `"${item.title}" başlıklı ilanınızın stoğu tükendiği için satıştan kaldırıldı. Satıcı panelinden stoğu güncelleyerek tekrar yayına alabilirsiniz.`,
                createdAt: new Date().toISOString(),
                isRead: false
              });
            }
            
            return {
              ...item,
              stock: newStock
            };
          }
        }
        return item;
      });
      
      saveListingsToLocal(updatedListings);
      order.items.forEach(oi => {
        const item = updatedListings.find(l => l.id === oi.listing.id);
        if (item) saveListingToFirestore(item);
      });

      const newOrders = [newOrder, ...s.orders];
      const newNotifs = [sNotif, bNotif, ...extraNotifications, ...s.notifications];
      AsyncStorage.setItem('mezatliyoruz_orders', JSON.stringify(newOrders)).catch(err => console.warn(err));
      AsyncStorage.setItem('mezatliyoruz_notifications', JSON.stringify(newNotifs)).catch(err => console.warn(err));
      return {
        orders: newOrders,
        chats: s.chats.map(c => c.id === chatId ? { ...c, messages: [...c.messages, newMsg] } : c),
        notifications: newNotifs,
        listings: updatedListings
      };
    });

    return generatedId;
  },

  updateOrderStatus: (orderId, status, trackingNumber) => set((state) => {
    const updatedOrders = state.orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
        };
      }
      return o;
    });

    const targetOrder = state.orders.find(o => o.id === orderId);
    if (targetOrder) {
      const listingId = targetOrder.items[0].listing.id;
      const chat = state.chats.find(c => c.listingId === listingId);
      
      let statusStr = '';
      if (status === 'processing') statusStr = 'Siparişiniz satıcı tarafından onaylandı ve işleme alındı.';
      else if (status === 'shipped') statusStr = `Siparişiniz kargoya verildi!\nKargo Takip No: ${trackingNumber || ''}`;
      else if (status === 'completed') statusStr = 'Siparişiniz tamamlandı. Bizi tercih ettiğiniz için teşekkür ederiz!';

      const statusTitle = status === 'processing' ? 'Siparişiniz Onaylandı ⚙️' : status === 'shipped' ? 'Siparişiniz Kargolandı 🚚' : 'Siparişiniz Tamamlandı ✅';

      const statusNotif: Notification = {
        id: `notif_${Date.now()}_status`,
        userId: targetOrder.buyerId,
        title: statusTitle,
        message: statusStr,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      const newNotifs = [statusNotif, ...state.notifications];
      AsyncStorage.setItem('mezatliyoruz_orders', JSON.stringify(updatedOrders)).catch(err => console.warn(err));
      AsyncStorage.setItem('mezatliyoruz_notifications', JSON.stringify(newNotifs)).catch(err => console.warn(err));

      if (chat) {
        const updateMsg: Message = {
          id: `msg_status_${Date.now()}`,
          senderId: 'system',
          text: `🔔 SİPARİŞ DURUM GÜNCELLEMESİ (No: ${orderId})\nYeni Durum: ${statusStr}`,
          timestamp: new Date(),
          type: 'text',
        };

        return {
          orders: updatedOrders,
          chats: state.chats.map(c => c.id === chat.id ? { ...c, messages: [...c.messages, updateMsg] } : c),
          notifications: newNotifs
        };
      } else {
        return {
          orders: updatedOrders,
          notifications: newNotifs
        };
      }
    }

    AsyncStorage.setItem('mezatliyoruz_orders', JSON.stringify(updatedOrders)).catch(err => console.warn(err));
    return { orders: updatedOrders };
  }),

  deleteOrderForUser: (orderId, role) => set((state) => {
    const updatedOrders = state.orders.map((o) => {
      if (o.id === orderId) {
        if (role === 'buyer') {
          return { ...o, buyerDeleted: true };
        } else if (role === 'seller') {
          return { ...o, sellerDeleted: true };
        }
      }
      return o;
    });
    AsyncStorage.setItem('mezatliyoruz_orders', JSON.stringify(updatedOrders)).catch(err => console.warn(err));
    return { orders: updatedOrders };
  }),

  reportIssue: (issue) => set((state) => {
    const newIssue: CustomerIssue = {
      ...issue,
      id: `issue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const newIssues = [newIssue, ...state.customerIssues];
    
    AsyncStorage.setItem('mezatliyoruz_customer_issues', JSON.stringify(newIssues)).catch(err => console.warn(err));
    
    const systemNotif: Notification = {
      id: `notif_${Date.now()}_issue`,
      userId: 'admin',
      title: 'Yeni Müşteri Sorunu Bildirildi ⚠️',
      message: `Sipariş #${issue.orderId} için "${issue.buyerName}" tarafından sorun bildirildi. Tür: ${issue.issueType}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    return {
      customerIssues: newIssues,
      notifications: [systemNotif, ...state.notifications]
    };
  }),

  updateIssueStatus: (issueId, status, adminNotes) => set((state) => {
    const updatedIssues = state.customerIssues.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : issue.adminNotes
        };
      }
      return issue;
    });

    AsyncStorage.setItem('mezatliyoruz_customer_issues', JSON.stringify(updatedIssues)).catch(err => console.warn(err));

    const targetIssue = state.customerIssues.find(i => i.id === issueId);
    if (targetIssue) {
      const buyerNotif: Notification = {
        id: `notif_${Date.now()}_issue_update`,
        userId: targetIssue.buyerId,
        title: 'Sorun Bildiriminiz Güncellendi ℹ️',
        message: `Sipariş #${targetIssue.orderId} için açtığınız destek talebi durumu: ${status === 'resolved' ? 'Çözüldü' : status === 'refunded' ? 'Para İadesi Yapıldı' : status === 'rejected' ? 'Reddedildi' : 'İnceleniyor'}. Not: ${adminNotes || ''}`,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      const updatedNotifications = [buyerNotif, ...state.notifications];
      AsyncStorage.setItem('mezatliyoruz_notifications', JSON.stringify(updatedNotifications)).catch(err => console.warn(err));
      return {
        customerIssues: updatedIssues,
        notifications: updatedNotifications
      };
    }

    return { customerIssues: updatedIssues };
  }),
  addListing: (newListing) => set((state) => {
    const listingNumber = String(Math.floor(100000 + Math.random() * 900000));
    const listingWithId: Listing = {
      ...newListing,
      id: `listing_${Date.now()}`,
      listingNumber,
      liked: false,
      favorited: false,
      favoritesCount: 0,
      status: 'pending_approval',
    };
    saveListingToFirestore(listingWithId);
    const updatedListings = [listingWithId, ...state.listings];
    saveListingsToLocal(updatedListings);
    return {
      listings: updatedListings
    };
  }),

  deleteListing: async (listingId) => {
    set((state) => {
      const updatedListings = state.listings.filter((l) => l.id !== listingId);
      saveListingsToLocal(updatedListings);
      return { listings: updatedListings };
    });
    try {
      const { doc, deleteDoc, getFirestore } = await import('firebase/firestore');
      const { app } = await import('./firebase');
      const db = getFirestore(app);
      await deleteDoc(doc(db, 'listings', listingId));
    } catch (e) {
      console.warn('Failed to delete listing from Firestore:', e);
    }
  },

  updateListing: (listingId, updatedFields) => set((state) => {
    const cleanedFields = cleanUndefinedFields(updatedFields);
    const updatedListings = state.listings.map((l) =>
      l.id === listingId ? { ...l, ...cleanedFields } : l
    );
    const target = updatedListings.find((l) => l.id === listingId);
    if (target) {
      saveListingToFirestore(target);
    }
    saveListingsToLocal(updatedListings);
    return { listings: updatedListings };
  }),

  addNotification: (notification) => set((state) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    if (Platform.OS !== 'web') {
      Notifications.scheduleNotificationAsync({
        content: {
          title: newNotif.title,
          body: newNotif.message,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      }).catch(err => console.warn('Error scheduling local notification:', err));
    }

    return {
      notifications: [newNotif, ...state.notifications]
    };
  }),

  sendSystemNotificationToAll: (title, message) => set((state) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_all`,
      userId: 'all',
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    if (Platform.OS !== 'web') {
      Notifications.scheduleNotificationAsync({
        content: {
          title: newNotif.title,
          body: newNotif.message,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      }).catch(err => console.warn('Error scheduling global notification:', err));
    }

    const updated = [newNotif, ...state.notifications];
    AsyncStorage.setItem('mezatliyoruz_notifications', JSON.stringify(updated)).catch(err => console.warn(err));
    return {
      notifications: updated
    };
  }),

  markNotificationAsRead: (notificationId) => set((state) => {
    const updated = state.notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    AsyncStorage.setItem('mezatliyoruz_notifications', JSON.stringify(updated)).catch(err => console.warn(err));
    return { notifications: updated };
  }),

  clearNotifications: () => {
    AsyncStorage.setItem('mezatliyoruz_notifications', JSON.stringify([])).catch(err => console.warn(err));
    set({ notifications: [] });
  },

  serverCalculateCartTotal: (cartItems) => {
    const dbListings = get().listings;
    const chats = get().chats;
    const verifiedItems = cartItems.map(item => {
      const dbListing = dbListings.find(l => l.id === item.listingId);
      if (!dbListing) {
        throw new Error(`Ürün bulunamadı: ${item.listingId}`);
      }

      // Check if there is an accepted chat offer for this listing
      const matchingChat = chats.find(c => c.listingId === item.listingId);
      let activePrice = dbListing.price;
      if (matchingChat) {
        const acceptedOffer = matchingChat.messages.find(m => m.type === 'offer' && m.offerStatus === 'accepted');
        if (acceptedOffer && acceptedOffer.offerAmount) {
          activePrice = acceptedOffer.offerAmount;
        }
      }

      return {
        listing: {
          ...dbListing,
          price: activePrice
        },
        quantity: item.quantity,
        price: activePrice
      };
    });

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    return {
      items: verifiedItems,
      subtotal,
      shipping,
      total,
      verificationToken: `VERIFIED_${total}_${Date.now()}`
    };
  },

  serverValidateUploadedFile: (fileName, fileSize, mimeType) => {
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSizeBytes) {
      return {
        success: false,
        error: 'Güvenlik Uyarısı: Dosya boyutu 10 MB limitini aşıyor!'
      };
    }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'];
    const lowerName = fileName.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some(ext => lowerName.endsWith(ext));

    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    const isMimeTypeAllowed = mimeType ? allowedMimeTypes.includes(mimeType) : true;

    if (!hasAllowedExtension || !isMimeTypeAllowed) {
      return {
        success: false,
        error: 'Güvenlik Uyarısı: Desteklenmeyen dosya formatı! (Sadece PDF, JPG, JPEG, PNG, WEBP, MP4, MOV yüklenebilir)'
      };
    }

    return { success: true };
  },

  savedCards: [
    { id: 'card_demo_1', token: 'tok_visa_4242', cardSummary: 'Visa (**** 4242)', cardHolder: 'Himmet Akar' }
  ],
  addSavedCard: (card) => set((state) => ({
    savedCards: [
      ...state.savedCards,
      { ...card, id: `card_${Date.now()}` }
    ]
  })),
  deleteSavedCard: (id) => set((state) => ({
    savedCards: state.savedCards.filter((c) => c.id !== id)
  })),

  savedAddresses: [
    {
      id: 'addr_demo_1',
      name: 'Ev',
      receiverName: 'Himmet Akar',
      receiverPhone: '(545) 579 86 00',
      city: 'Aydın',
      district: 'Didim',
      address: 'Altınkum Mah. 120. Sokak No:12 D:4'
    }
  ],
  addSavedAddress: (address) => set((state) => {
    const updated = [
      ...state.savedAddresses,
      { ...address, id: `addr_${Date.now()}` }
    ];
    AsyncStorage.setItem('mezatliyoruz_saved_addresses', JSON.stringify(updated)).catch(err => console.warn(err));
    return { savedAddresses: updated };
  }),
  deleteSavedAddress: (id) => set((state) => {
    const updated = state.savedAddresses.filter((a) => a.id !== id);
    AsyncStorage.setItem('mezatliyoruz_saved_addresses', JSON.stringify(updated)).catch(err => console.warn(err));
    return { savedAddresses: updated };
  }),

  isBiometricsEnabled: false,
  setBiometricsEnabled: (enabled) => set({ isBiometricsEnabled: enabled }),

  startWebSocketSim: () => {
    // Disabled simulation for production environment
  }
}));

export const getListingSeoUrl = (listing: { title: string; listingNumber?: string; id: string }) => {
  const slugify = (text: string) => {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'c',
      'ğ': 'g', 'Ğ': 'g',
      'ı': 'i', 'I': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o',
      'ş': 's', 'Ş': 's',
      'ü': 'u', 'Ü': 'u',
      'â': 'a', 'Â': 'a',
      'î': 'i', 'Î': 'i',
      'û': 'u', 'Û': 'u'
    };
    return text
      .toString()
      .split('')
      .map(char => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/\s+/g, '-')         // Replace spaces with -
      .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
      .replace(/\-\-+/g, '-')       // Replace multiple - with single -
      .replace(/^-+/, '')           // Trim - from start of text
      .replace(/-+$/, '');          // Trim - from end of text
  };
  const titleSlug = slugify(listing.title || 'ilan');
  const listingNo = listing.listingNumber || listing.id;
  return `/ilan/${titleSlug}-${listingNo}/detay`;
};

