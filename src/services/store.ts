import { create } from 'zustand';

export interface Listing {
  id: string;
  title: string;
  description: string;
  sellerName: string;
  sellerAvatar: string;
  sellerTrustScore: number;
  sellerVerified: boolean;
  price: number;
  type: 'fixed' | 'offer' | 'auction' | 'rent';
  rentPeriod?: string;
  videoUrl: any; // Allow local require (number) or remote URL
  photos: any[]; // Allow local require (number[]) or remote URLs
  verifiedProduct: boolean;
  documentUrl?: string;
  timeLeft?: number; // seconds
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
  status?: 'active' | 'pending_approval' | 'rejected';
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
  createdAt: string;
  relatedListingId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  role: 'user' | 'super_admin' | 'customer' | 'seller';
  trustScore: number;
  verified: boolean;
  shopName?: string;
  isRentACarApproved?: boolean;
  rentACarApplicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

interface StoreState {
  currentUser: UserProfile | null;
  accounts: {
    [phone: string]: {
      user?: UserProfile;
      super_admin?: UserProfile;
      customer?: UserProfile;
      seller?: UserProfile;
    };
  };
  registerAccount: (phone: string, role: 'user' | 'super_admin' | 'customer' | 'seller', name: string, shopName?: string) => void;
  loginAccount: (phone: string, role: 'user' | 'super_admin' | 'customer' | 'seller') => boolean;
  logoutAccount: () => void;
  listings: Listing[];
  rentACarApplications: RentACarApplication[];
  applyForRentACar: (app: Omit<RentACarApplication, 'id' | 'status' | 'createdAt'>) => void;
  approveRentACarApplication: (appId: string) => void;
  rejectRentACarApplication: (appId: string) => void;
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
  placeBid: (listingId: string, amount: number) => { success: boolean; error?: string };
  sendInChatOffer: (chatId: string, amount: number) => void;
  respondToOffer: (chatId: string, messageId: string, response: 'accepted' | 'rejected', counterAmount?: number) => void;
  sendMessage: (chatId: string, text: string, type?: Message['type'], mediaUrl?: string, fileName?: string) => void;
  createChat: (listingId: string) => string;
  decrementTimers: () => void;
  addListing: (listing: Omit<Listing, 'id' | 'liked' | 'favorited' | 'favoritesCount'>) => void;
  
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
}

export interface CollageBox {
  images: string[];
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
    type: 'auction',
    timeLeft: 80893,
    bidsCount: 18,
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
    type: 'auction',
    timeLeft: 120930,
    bidsCount: 7,
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
      require('../../assets/images/banner_live_auction.png'),
      require('../../assets/images/banner_flea_market.png'),
      require('../../assets/images/banner_producer.png')
    ],
    titles: [
      'Canlı Mezatlar',
      'Bit Pazarı',
      'Üreticiden Tüketiciye'
    ],
    link: '/featured-auction',
    links: [
      '/featured-auction',
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
    titles: [
      'Antikalar Bit Pazarında'
    ],
    link: 'bit_pazari'
  },
  rightBottom: {
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800'
    ],
    titles: [
      'Araba mezatını kaçırmayın!'
    ],
    link: '/featured-auction'
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

export const useAppStore = create<StoreState>((set, get) => ({
  currentUser: {
    id: 'customer_1',
    name: 'Himmet Akar',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '5555555555',
    role: 'customer',
    trustScore: 9.8,
    verified: true,
  },
  accounts: {
    '5555555555': {
      customer: {
        id: 'customer_1',
        name: 'Himmet Akar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '5555555555',
        role: 'customer',
        trustScore: 9.8,
        verified: true,
      },
      seller: {
        id: 'seller_1',
        name: 'Himmet Akar (Satıcı)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '5555555555',
        role: 'seller',
        trustScore: 9.9,
        verified: true,
        shopName: 'Akar Antika',
      }
    },
    '5555555557': {
      customer: {
        id: 'customer_2',
        name: 'Himmet Akar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '5555555557',
        role: 'customer',
        trustScore: 9.8,
        verified: true,
      },
      super_admin: {
        id: 'super_admin_1',
        name: 'Himmet Akar (Süper Admin)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '5555555557',
        role: 'super_admin',
        trustScore: 10.0,
        verified: true,
      }
    },
    '5555555559': {
      customer: {
        id: 'customer_3',
        name: 'Mega Kurumsal Yetkilisi',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        phone: '5555555559',
        role: 'customer',
        trustScore: 10.0,
        verified: true,
      },
      seller: {
        id: 'seller_3',
        name: 'Mega Kurumsal Yetkilisi',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        phone: '5555555559',
        role: 'seller',
        trustScore: 10.0,
        verified: true,
        shopName: 'Mega Holding A.Ş.',
        isRentACarApproved: true,
      }
    }
  },

  liveCollage: defaultCollage,
  draftCollage: defaultCollage,
  liveFeaturedAuction: defaultFeaturedAuction,
  draftFeaturedAuction: defaultFeaturedAuction,

  updateDraftCollage: (collage) => {
    set({ draftCollage: collage });
    try {
      const { doc, setDoc } = require('firebase/firestore');
      const { db } = require('./firebase');
      setDoc(doc(db, 'cms', 'home_collage'), { draft: collage }, { merge: true });
    } catch (e) {
      console.warn('Failed to sync draft collage with Firebase:', e);
    }
  },

  publishCollage: () => {
    const draft = get().draftCollage;
    set({ liveCollage: draft });
    try {
      const { doc, setDoc } = require('firebase/firestore');
      const { db } = require('./firebase');
      setDoc(doc(db, 'cms', 'home_collage'), { live: draft, draft: draft }, { merge: true });
    } catch (e) {
      console.warn('Failed to publish collage to Firebase:', e);
    }
  },

  updateDraftFeaturedAuction: (auction) => {
    set({ draftFeaturedAuction: auction });
    try {
      const { doc, setDoc } = require('firebase/firestore');
      const { db } = require('./firebase');
      setDoc(doc(db, 'cms', 'featured_auction'), { draft: auction }, { merge: true });
    } catch (e) {
      console.warn('Failed to sync draft auction with Firebase:', e);
    }
  },

  publishFeaturedAuction: () => {
    const draft = get().draftFeaturedAuction;
    set({ liveFeaturedAuction: draft });
    try {
      const { doc, setDoc } = require('firebase/firestore');
      const { db } = require('./firebase');
      setDoc(doc(db, 'cms', 'featured_auction'), { live: draft, draft: draft }, { merge: true });
    } catch (e) {
      console.warn('Failed to publish auction to Firebase:', e);
    }
  },

  loadCMSData: async () => {
    try {
      const { doc, getDoc, getFirestore } = await import('firebase/firestore');
      const { app } = await import('./firebase');
      const db = getFirestore(app);
      
      const collageSnap = await getDoc(doc(db, 'cms', 'home_collage'));
      if (collageSnap.exists()) {
        const data = collageSnap.data();
        if (data.live) set({ liveCollage: data.live });
        if (data.draft) set({ draftCollage: data.draft });
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
    } catch (e) {
      console.log('CMS data could not be loaded from Firebase (using offline defaults).');
    }
  },

  registerAccount: (phone, role, name, shopName) => set((state) => {
    let cleanedPhone = phone.replace(/\D/g, '');
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
    return {
      accounts: updatedAccounts,
      currentUser: newProfile,
    };
  }),

  loginAccount: (phone, role) => {
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = cleanedPhone.slice(1);
    }
    const account = get().accounts[cleanedPhone];
    if (account && account[role]) {
      set({ currentUser: account[role] });
      return true;
    }
    return false;
  },

  logoutAccount: () => set({ currentUser: null }),
 
  stories: [
    {
      id: 'story_mock_1',
      sellerId: 'seller_1',
      sellerName: 'Akar Antika',
      sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      mediaUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      productId: '1',
    },
    {
      id: 'story_mock_2',
      sellerId: 'seller_2',
      sellerName: 'Retro Bazaar',
      sellerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      mediaUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
      productId: '2',
    },
    {
      id: 'story_mock_3',
      sellerId: 'seller_3',
      sellerName: 'Nostalji Evi',
      sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      mediaUrl: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=800',
      createdAt: Date.now() - 6 * 60 * 60 * 1000,
      productId: '3',
    },
    {
      id: 'story_mock_4',
      sellerId: 'seller_4',
      sellerName: 'Koleksiyoner',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
      createdAt: Date.now() - 8 * 60 * 60 * 1000,
      productId: '4',
    },
    {
      id: 'story_mock_5',
      sellerId: 'seller_5',
      sellerName: 'El Emeği Sanat',
      sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      mediaUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
      createdAt: Date.now() - 10 * 60 * 60 * 1000,
      productId: '5',
    }
  ],
 
  addStory: (story) => set((state) => ({
    stories: [
      {
        ...story,
        id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      },
      ...state.stories
    ]
  })),
 
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

  approveRentACarApplication: (appId) => set((state) => {
    const updatedApps = state.rentACarApplications.map((app) => {
      if (app.id === appId) {
        return { ...app, status: 'approved' as const };
      }
      return app;
    });

    const targetApp = state.rentACarApplications.find((app) => app.id === appId);
    if (!targetApp) return { rentACarApplications: updatedApps };

    const targetUserId = targetApp.userId;
    
    // Update the listings of this user to active if they were pending
    const updatedListings = state.listings.map((l) => {
      if (l.sellerName === targetApp.shopName || l.sellerName === targetApp.userName) {
        if (l.status === 'pending_approval') {
          return { ...l, status: 'active' as const };
        }
      }
      return l;
    });

    // Update currentUser if it matches the targetUserId
    let updatedCurrentUser = state.currentUser;
    if (updatedCurrentUser && updatedCurrentUser.id === targetUserId) {
      updatedCurrentUser = {
        ...updatedCurrentUser,
        isRentACarApproved: true,
        rentACarApplicationStatus: 'approved' as const
      };
    }

    // Update in accounts
    let updatedAccounts = { ...state.accounts };
    Object.keys(updatedAccounts).forEach((phone) => {
      const acc = updatedAccounts[phone];
      ['user', 'super_admin', 'customer', 'seller'].forEach((role) => {
        const profile = acc[role as keyof typeof acc];
        if (profile && profile.id === targetUserId) {
          acc[role as keyof typeof acc] = {
            ...profile,
            isRentACarApproved: true,
            rentACarApplicationStatus: 'approved' as const
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

  rejectRentACarApplication: (appId) => set((state) => {
    const updatedApps = state.rentACarApplications.map((app) => {
      if (app.id === appId) {
        return { ...app, status: 'rejected' as const };
      }
      return app;
    });

    const targetApp = state.rentACarApplications.find((app) => app.id === appId);
    if (!targetApp) return { rentACarApplications: updatedApps };

    const targetUserId = targetApp.userId;

    // Update currentUser if it matches
    let updatedCurrentUser = state.currentUser;
    if (updatedCurrentUser && updatedCurrentUser.id === targetUserId) {
      updatedCurrentUser = {
        ...updatedCurrentUser,
        isRentACarApproved: false,
        rentACarApplicationStatus: 'rejected' as const
      };
    }

    // Update in accounts
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

  listings: initialListings,
  chats: initialChats,
  activeChatId: null,
  cart: [],

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

  toggleLike: (listingId) => set((state) => ({
    listings: state.listings.map((l) =>
      l.id === listingId
        ? { ...l, liked: !l.liked, favoritesCount: l.liked ? l.favoritesCount - 1 : l.favoritesCount + 1 }
        : l
    ),
  })),

  toggleFavorite: (listingId) => set((state) => ({
    listings: state.listings.map((l) =>
      l.id === listingId ? { ...l, favorited: !l.favorited } : l
    ),
  })),

  placeBid: (listingId, amount) => {
    let success = false;
    let error: string | undefined;

    set((state) => {
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
          if (amount <= l.price) {
            error = `Teklif miktarı mevcut fiyattan (${l.price} TL) yüksek olmalıdır.`;
            return l;
          }

          success = true;
          let newTimeLeft = l.timeLeft;
          
          // Anti-Sniping Kuralı: Son 2 dakika (120 saniye) içinde teklif verilirse süreyi +2 dakika uzat
          if (l.timeLeft !== undefined && l.timeLeft < 120) {
            newTimeLeft = l.timeLeft + 120;
          }

          return {
            ...l,
            price: amount,
            bidsCount: (l.bidsCount || 0) + 1,
            timeLeft: newTimeLeft,
          };
        }
        return l;
      });

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

  createChat: (listingId) => {
    const state = get();
    const existingChat = state.chats.find((c) => c.listingId === listingId);
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

    set((state) => ({
      chats: [...state.chats, newChat]
    }));

    return newChatId;
  },

  decrementTimers: () => set((state) => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return {
      listings: state.listings.map((l) => {
        if (l.type === 'auction' && l.timeLeft !== undefined && l.timeLeft > 0) {
          return {
            ...l,
            timeLeft: l.timeLeft - 1
          };
        }
        return l;
      }),
      stories: state.stories.filter((story) => now - story.createdAt < twentyFourHours)
    };
  }),

  addListing: (newListing) => set((state) => {
    const listingWithId: Listing = {
      ...newListing,
      id: `listing_${Date.now()}`,
      liked: false,
      favorited: false,
      favoritesCount: 0,
    };
    return {
      listings: [listingWithId, ...state.listings]
    };
  })
}));
