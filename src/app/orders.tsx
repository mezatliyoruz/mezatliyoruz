import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  useWindowDimensions,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/services/store';
import { Colors } from '@/constants/theme';
import { ArrowLeft, ShoppingBag, Truck, CheckCircle2, ShieldAlert, Star, MessageSquare } from 'lucide-react-native';
import GlobalHeader from '@/components/global-header';
import CargoTrackingModal from '@/components/cargo-tracking-modal';

export default function OrdersScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const { currentUser, orders, updateOrderStatus, addReview, reportIssue, listings, addOrder } = useAppStore();
  const [activeTab, setActiveTab] = useState<'bought' | 'sold'>('bought');
  const [trackingCodes, setTrackingCodes] = useState<{ [key: string]: string }>({});

  // Cargo tracking states
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [selectedTrackingNum, setSelectedTrackingNum] = useState('');
  const [selectedTrackingCarrier, setSelectedTrackingCarrier] = useState('');

  // Review states
  const [reviewOrder, setReviewOrder] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  // Issue states
  const [reportingIssueOrderId, setReportingIssueOrderId] = useState<string | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<'originality' | 'damaged' | 'different_product' | 'not_delivered' | 'other'>('originality');
  const [issueDescription, setIssueDescription] = useState('');

  if (!currentUser) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ShieldAlert size={48} color={theme.gold} />
        <Text style={{ color: theme.text, fontSize: 16, marginTop: 12, fontWeight: 'bold' }}>Giriş Yapmalısınız</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>Siparişlerinizi görüntülemek için lütfen giriş yapın.</Text>
        <Pressable 
          style={{ backgroundColor: theme.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 }}
          onPress={() => router.push('/')}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Ana Sayfaya Git</Text>
        </Pressable>
      </View>
    );
  }

  // Filter orders
  const boughtOrders = (orders || []).filter(o => o.buyerId === currentUser.id);
  const soldOrders = (orders || []).filter(o => 
    o.items.some(item => item.listing.sellerName === currentUser.name)
  );

  const currentOrdersList = activeTab === 'bought' ? boughtOrders : soldOrders;

  const handleUpdateStatus = (orderId: string, status: any, trackingNumber?: string) => {
    updateOrderStatus(orderId, status, trackingNumber);
    Alert.alert('Başarılı', 'Sipariş durumu güncellendi.');
  };

  const handleSendReview = (order: any) => {
    if (!comment.trim()) {
      Alert.alert('Hata', 'Lütfen bir yorum yazın.');
      return;
    }
    // Add review for seller
    addReview({
      sellerName: order.sellerName,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      rating,
      comment: comment.trim(),
    });
    setReviewOrder(null);
    setComment('');
    Alert.alert('Teşekkürler', 'Değerlendirmeniz satıcıya iletildi.');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'processing': return 'Hazırlanıyor';
      case 'shipped': return 'Kargoda';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'completed': return '#10B981';
      default: return theme.textSecondary;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {isDesktop ? null : <GlobalHeader />}

      {/* Header for Back navigation */}
      <View style={[styles.pageHeader, { borderBottomColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement || theme.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Siparişlerim</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.backgroundSelected }]}>
        <Pressable 
          style={[styles.tabItem, activeTab === 'bought' && { borderBottomColor: theme.gold }]}
          onPress={() => setActiveTab('bought')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'bought' ? theme.gold : theme.textSecondary }]}>
            Satın Aldıklarım ({boughtOrders.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabItem, activeTab === 'sold' && { borderBottomColor: theme.gold }]}
          onPress={() => setActiveTab('sold')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'sold' ? theme.gold : theme.textSecondary }]}>
            Sattıklarım ({soldOrders.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {currentOrdersList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 12 }}>Henüz siparişiniz bulunmamaktadır.</Text>
          </View>
        ) : (
          currentOrdersList.map((order) => (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.backgroundElement || theme.background, borderColor: theme.backgroundSelected }]}>
              {/* Card Header */}
              <View style={[styles.cardHeader, { borderBottomColor: theme.backgroundSelected }]}>
                <View>
                  <Text style={[styles.orderId, { color: theme.text }]}>Sipariş ID: #{order.id.slice(-8).toUpperCase()}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>{order.createdAt}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                  <Text style={{ color: getStatusColor(order.status), fontSize: 11, fontWeight: 'bold' }}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>

              {/* Items List */}
              <View style={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{item.listing.title}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                        Adet: {item.quantity} | Satıcı: {item.listing.sellerName}
                      </Text>
                    </View>
                    <Text style={[styles.itemPrice, { color: theme.text }]}>{(item.listing.price * item.quantity).toLocaleString('tr-TR')} TL</Text>
                  </View>
                ))}
              </View>

              {/* Address and Total */}
              <View style={[styles.cardFooter, { borderTopColor: theme.backgroundSelected }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Teslimat Adresi</Text>
                  <Text style={[styles.addressText, { color: theme.text }]} numberOfLines={1}>{order.buyerAddress}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Toplam Tutar</Text>
                  <Text style={[styles.totalAmount, { color: theme.gold }]}>{order.totalAmount.toLocaleString('tr-TR')} TL</Text>
                </View>
              </View>

              {/* Cargo info if shipped or assigned */}
              {order.shippingCompany && (
                <View style={{ gap: 6, backgroundColor: theme.backgroundSelected + '40', borderRadius: 8, padding: 10, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Truck size={16} color={theme.gold} />
                    <Text style={{ color: theme.text, fontSize: 12, marginLeft: 8, fontWeight: 'bold' }}>
                      {order.shippingCompany}
                    </Text>
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                    Kargo Tipi: <Text style={{ color: theme.text, fontWeight: '600' }}>Alıcı Ödemeli</Text> | Ücret: <Text style={{ color: theme.text, fontWeight: '600' }}>{order.shippingFee} TL</Text>
                  </Text>
                  {order.trackingNumber && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                      <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Takip Numarası: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{order.trackingNumber}</Text>
                      </Text>
                      <Pressable
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: theme.gold,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                          gap: 2,
                        }}
                        onPress={() => {
                          setSelectedTrackingNum(order.trackingNumber || '');
                          setSelectedTrackingCarrier(order.shippingCompany || 'Kargo Firması');
                          setTrackingModalVisible(true);
                        }}
                      >
                        <Truck size={10} color="#000000" />
                        <Text style={{ color: '#000000', fontSize: 10, fontWeight: 'bold' }}>Takip Et</Text>
                      </Pressable>
                    </View>
                  )}
                  {order.cargoBarcodeUrl && (
                    <Pressable 
                      style={{ alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, backgroundColor: theme.gold }}
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          window.open(order.cargoBarcodeUrl, '_blank');
                        } else {
                          Alert.alert('Barkod Adresi', order.cargoBarcodeUrl);
                        }
                      }}
                    >
                      <Text style={{ color: '#000000', fontSize: 10, fontWeight: 'bold' }}>📄 Geliver Barkodunu Yazdır</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Actions */}
              {activeTab === 'sold' ? (
                <View style={styles.actionsRow}>
                  {order.status === 'pending' && (
                    <Pressable 
                      style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
                      onPress={() => handleUpdateStatus(order.id, 'processing')}
                    >
                      <Text style={styles.actionBtnText}>Hazırlanmaya Başla</Text>
                    </Pressable>
                  )}
                  {order.status === 'processing' && (
                    <View style={{ flex: 1, gap: 8 }}>
                      <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                        placeholder="Kargo takip kodu girin..."
                        placeholderTextColor={theme.textSecondary}
                        value={trackingCodes[order.id] || ''}
                        onChangeText={(txt) => setTrackingCodes(prev => ({ ...prev, [order.id]: txt }))}
                      />
                      <Pressable 
                        style={[styles.actionBtn, { backgroundColor: '#8B5CF6' }]}
                        onPress={() => {
                          const code = trackingCodes[order.id];
                          if (!code || !code.trim()) {
                            Alert.alert('Hata', 'Lütfen kargo takip kodunu girin.');
                            return;
                          }
                          handleUpdateStatus(order.id, 'shipped', code.trim());
                        }}
                      >
                        <Text style={styles.actionBtnText}>Kargoya Ver</Text>
                      </Pressable>
                    </View>
                  )}
                  {order.status === 'shipped' && (
                    <Pressable 
                      style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => handleUpdateStatus(order.id, 'completed')}
                    >
                      <Text style={styles.actionBtnText}>Teslim Edildi Olarak İşaretle</Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                /* Buyer Actions */
                (order.status === 'completed' || order.status === 'shipped') && (
                  <View style={[styles.actionsRow, { gap: 10 }]}>
                    {order.status === 'completed' && (
                      <Pressable 
                        style={[styles.actionBtn, { backgroundColor: theme.gold }]}
                        onPress={() => setReviewOrder(order.id)}
                      >
                        <Star size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.actionBtnText}>Satıcıyı Değerlendir</Text>
                      </Pressable>
                    )}
                    
                    <Pressable 
                      style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                      onPress={() => {
                        setReportingIssueOrderId(order.id);
                        setSelectedIssueType('originality');
                        setIssueDescription('');
                      }}
                    >
                      <ShieldAlert size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnText}>Sorun Bildir</Text>
                    </Pressable>
                  </View>
                )
              )}

              {/* Issue Reporting Box */}
              {reportingIssueOrderId === order.id && (
                <View style={[styles.reviewBox, { borderColor: '#EF4444' }]}>
                  <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>⚠️ Sorun Bildir & Destek Talebi</Text>
                  
                  {/* Issue Type Selector */}
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 6 }}>Sorun Türü Seçin:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {[
                      { type: 'originality', label: 'Orijinallik Şüphesi' },
                      { type: 'damaged', label: 'Hasarlı Ürün' },
                      { type: 'different_product', label: 'Farklı Ürün' },
                      { type: 'not_delivered', label: 'Teslim Edilmedi' },
                      { type: 'other', label: 'Diğer' }
                    ].map((item) => {
                      const isSel = selectedIssueType === item.type;
                      return (
                        <Pressable
                          key={item.type}
                          onPress={() => setSelectedIssueType(item.type as any)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: isSel ? '#EF4444' : theme.backgroundSelected,
                            backgroundColor: isSel ? 'rgba(239, 68, 68, 0.08)' : theme.backgroundElement,
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: isSel ? '#EF4444' : theme.text }}>
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <TextInput
                    style={[styles.reviewInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                    placeholder={selectedIssueType === 'other' ? 'Lütfen sorununuzu detaylıca yazın...' : 'Sorunla ilgili eklemek istediğiniz detaylar (isteğe bağlı)...'}
                    placeholderTextColor={theme.textSecondary}
                    value={issueDescription}
                    onChangeText={setIssueDescription}
                    multiline
                  />

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <Pressable 
                      style={[styles.reviewActionBtn, { backgroundColor: theme.backgroundSelected }]}
                      onPress={() => setReportingIssueOrderId(null)}
                    >
                      <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>İptal</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.reviewActionBtn, { backgroundColor: '#EF4444' }]}
                      onPress={() => {
                        if (selectedIssueType === 'other' && !issueDescription.trim()) {
                          Alert.alert('Hata', 'Lütfen sorununuzu açıklayın.');
                          return;
                        }
                        reportIssue({
                          orderId: order.id,
                          buyerId: currentUser.id,
                          buyerName: currentUser.name,
                          sellerName: order.sellerName,
                          issueType: selectedIssueType,
                          description: issueDescription.trim() || `${selectedIssueType === 'originality' ? 'Orijinallik Şüphesi' : selectedIssueType === 'damaged' ? 'Hasarlı Ürün' : selectedIssueType === 'different_product' ? 'Farklı Ürün' : 'Teslim Edilmedi'} sorunu bildirildi.`
                        });
                        setReportingIssueOrderId(null);
                        Alert.alert('Sorun Bildirildi', 'Destek talebiniz yöneticiye iletilmiştir. Sipariş bedeli bloke edilerek inceleme başlatılacaktır.');
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Gönder</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Review Input Box */}
              {reviewOrder === order.id && (
                <View style={[styles.reviewBox, { borderColor: theme.backgroundSelected }]}>
                  <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>Satıcı Değerlendirmesi</Text>
                  
                  {/* Rating selector */}
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} onPress={() => setRating(star)}>
                        <Star size={20} color={star <= rating ? theme.gold : theme.textSecondary} fill={star <= rating ? theme.gold : 'transparent'} />
                      </Pressable>
                    ))}
                  </View>

                  <TextInput
                    style={[styles.reviewInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                    placeholder="Deneyiminizi paylaşın..."
                    placeholderTextColor={theme.textSecondary}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <Pressable 
                      style={[styles.reviewActionBtn, { backgroundColor: theme.backgroundSelected }]}
                      onPress={() => setReviewOrder(null)}
                    >
                      <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>İptal</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.reviewActionBtn, { backgroundColor: theme.gold }]}
                      onPress={() => handleSendReview(order)}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Gönder</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
      <CargoTrackingModal
        visible={trackingModalVisible}
        onClose={() => setTrackingModalVisible(false)}
        trackingNumber={selectedTrackingNum}
        carrierName={selectedTrackingCarrier}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pageHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  orderId: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  addressText: {
    fontSize: 12,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cargoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  reviewBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  reviewInput: {
    height: 60,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  reviewActionBtn: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
