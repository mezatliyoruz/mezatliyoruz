import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, Pressable, Text, TextInput, Image, Platform, ActivityIndicator, Switch, Alert, FlatList } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { useAppStore, SavedAddress } from '@/services/store';
import { X, ShoppingCart, Trash2, Minus, Plus, ChevronRight, CreditCard, Check, Truck, MapPin } from 'lucide-react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { PaymentService } from '@/services/payment';
import { CargoService, CargoOffer } from '@/services/cargo';
import { TURKEY_CITIES } from '@/constants/cities';

export default function GlobalCartModal() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const {
    cart,
    cartModalVisible,
    setCartModalVisible,
    checkoutStep,
    setCheckoutStep,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    currentUser,
    addOrder,
    savedCards,
    addSavedCard,
    deleteSavedCard,
    savedAddresses,
    addSavedAddress,
    deleteSavedAddress,
  } = useAppStore();

  // Shipping Form
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingDistrict, setShippingDistrict] = useState('');

  // Address Saving Form
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddressName, setNewAddressName] = useState('');
  const [saveAddressSecurely, setSaveAddressSecurely] = useState(true);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setShippingName(addr.receiverName);
    setShippingPhone(addr.receiverPhone);
    setShippingCity(addr.city);
    setShippingDistrict(addr.district);
    setShippingAddress(addr.address);
    setCargoOffers([]);
    setSelectedOffer(null);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId(null);
    setShippingName('');
    setShippingPhone('');
    setShippingCity('');
    setShippingDistrict('');
    setShippingAddress('');
    setNewAddressName('');
    setCargoOffers([]);
    setSelectedOffer(null);
  };

  // Auto-select first saved address on modal open if available
  useEffect(() => {
    if (cartModalVisible && checkoutStep === 'shipping' && savedAddresses && savedAddresses.length > 0 && selectedAddressId === null) {
      handleSelectAddress(savedAddresses[0]);
    }
  }, [cartModalVisible, checkoutStep, savedAddresses]);

  const checkAndSaveAddress = () => {
    if (selectedAddressId === null && saveAddressSecurely) {
      addSavedAddress({
        name: newAddressName.trim() || 'Diğer Adres',
        receiverName: shippingName,
        receiverPhone: shippingPhone,
        city: shippingCity,
        district: shippingDistrict,
        address: shippingAddress
      });
    }
  };
  
  // Cargo Selection Form
  const [cargoOffers, setCargoOffers] = useState<CargoOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CargoOffer | null>(null);

  // Payment Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [orderId, setOrderId] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [saveCardSecurely, setSaveCardSecurely] = useState(false);

  // Debounced auto-fetch cargo offers
  useEffect(() => {
    if (checkoutStep !== 'shipping') return;
    
    // Validate inputs silently before fetching
    const isNameValid = shippingName.trim().length >= 3;
    const isPhoneValid = shippingPhone.replace(/\D/g, '').length >= 10;
    const isCityValid = shippingCity.trim().length >= 2;
    const isDistrictValid = shippingDistrict.trim().length >= 2;
    const isAddressValid = shippingAddress.trim().length >= 5;

    if (!isNameValid || !isPhoneValid || !isCityValid || !isDistrictValid || !isAddressValid) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingOffers(true);
      setFormErrors(prev => { const copy = { ...prev }; delete copy.selectedOffer; return copy; });
      try {
        const offers = await CargoService.getOffers({
          name: shippingName,
          phone: shippingPhone,
          city: shippingCity,
          district: shippingDistrict,
          address: shippingAddress
        });
        const sortedOffers = [...offers].sort((a, b) => a.price - b.price);
        setCargoOffers(sortedOffers);
        if (sortedOffers.length > 0) {
          setSelectedOffer(sortedOffers[0]); // Auto-select cheapest offer
        }
      } catch (err) {
        console.warn('Auto fetch cargo offers failed:', err);
      } finally {
        setLoadingOffers(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [shippingName, shippingPhone, shippingCity, shippingDistrict, shippingAddress, checkoutStep]);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.listing.price * item.quantity, 0);
  const cartTotal = cartSubtotal + (selectedOffer ? selectedOffer.price : 0);

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

  const handleFetchCargoOffers = async () => {
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingCity.trim() || !shippingDistrict.trim() || !shippingAddress.trim()) {
      Alert.alert('Eksik Bilgi', 'Kargo tekliflerini almak için lütfen Adı Soyadı, Telefon, İl, İlçe ve Adres alanlarını doldurun.');
      return;
    }
    setLoadingOffers(true);
    setFormErrors(prev => { const copy = { ...prev }; delete copy.selectedOffer; return copy; });
    try {
      const offers = await CargoService.getOffers({
        name: shippingName,
        phone: shippingPhone,
        city: shippingCity,
        district: shippingDistrict,
        address: shippingAddress
      });
      // Sort offers cheapest first
      const sortedOffers = [...offers].sort((a, b) => a.price - b.price);
      setCargoOffers(sortedOffers);
      if (sortedOffers.length > 0) {
        setSelectedOffer(sortedOffers[0]); // Auto-select cheapest offer
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    const errors: { [key: string]: string } = {};
    if (checkoutStep === 'shipping') {
      if (!shippingName.trim()) errors.shippingName = 'Ad Soyad zorunludur.';
      if (!shippingPhone.trim()) errors.shippingPhone = 'Telefon numarası zorunludur.';
      if (!shippingCity.trim()) errors.shippingCity = 'İl zorunludur.';
      if (!shippingDistrict.trim()) errors.shippingDistrict = 'İlçe zorunludur.';
      if (!shippingAddress.trim()) errors.shippingAddress = 'Teslimat adresi zorunludur.';
      if (!selectedOffer) errors.selectedOffer = 'Lütfen kargo seçeneklerini listeleyin ve bir firma seçin.';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      checkAndSaveAddress(); // Save address if new and checked
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      const isSavedCardUsed = selectedCardId !== null;

      if (!isSavedCardUsed) {
        if (!cardHolder.trim()) errors.cardHolder = 'Kart sahibi adı zorunludur.';
        if (cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = 'Geçersiz kart numarası.';
        if (cardExpiry.length < 5) errors.cardExpiry = 'Geçersiz son kullanma tarihi.';
        if (cardCvv.length < 3) errors.cardCvv = 'Geçersiz CVV.';

        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return;
        }
      }

      setFormErrors({});
      setPaymentError('');
      setIsProcessing(true);

      try {
        const paymentItems = cart.map(item => ({
          id: item.listing.id,
          title: item.listing.title,
          price: item.listing.price,
          quantity: item.quantity
        }));

        const paymentDetails = {
          items: paymentItems,
          totalAmount: cartTotal,
          shippingName,
          shippingPhone,
          shippingAddress
        };

        let response;

        if (isSavedCardUsed) {
          // Process payment with stored token securely
          const selectedCard = savedCards.find(c => c.id === selectedCardId);
          response = await PaymentService.processPaymentWithToken(
            selectedCard?.token || '',
            paymentDetails
          );
        } else {
          // Process payment with raw card details
          response = await PaymentService.processPayment(
            {
              cardNumber,
              cardHolder,
              cardExpiry,
              cardCvv
            },
            paymentDetails
          );

          // If payment succeeds and user chose to save the card securely
          if (response.success && response.transactionStatus === 'SUCCESS' && saveCardSecurely) {
            const tokenizeResult = await PaymentService.tokenizeCard({
              cardNumber,
              cardHolder,
              cardExpiry,
              cardCvv
            });
            if (tokenizeResult.success && tokenizeResult.token && tokenizeResult.cardSummary) {
              addSavedCard({
                token: tokenizeResult.token,
                cardSummary: tokenizeResult.cardSummary,
                cardHolder: cardHolder
              });
            }
          }
        }

        if (response.success && response.transactionStatus === 'SUCCESS') {
          // Accept/create shipping transaction on Geliver API
          let trackingNumber = '';
          let cargoBarcodeUrl = '';
          if (selectedOffer) {
            try {
              const shipmentResult = await CargoService.createShipmentTransaction(selectedOffer.id, {
                name: shippingName,
                phone: shippingPhone,
                city: shippingCity,
                district: shippingDistrict,
                address: shippingAddress,
              });
              if (shipmentResult.success) {
                trackingNumber = shipmentResult.trackingNumber;
                cargoBarcodeUrl = shipmentResult.labelUrl;
              }
            } catch (e) {
              console.warn('Geliver transaction creation failed:', e);
            }
          }

          const generatedId = addOrder({
            buyerId: currentUser?.id || 'guest_buyer',
            buyerName: shippingName,
            buyerPhone: shippingPhone,
            buyerAddress: `${shippingAddress}, ${shippingDistrict}/${shippingCity}`,
            sellerName: cart[0]?.listing.sellerName || 'Himmet Akar',
            items: [...cart],
            totalAmount: cartTotal,
            shippingCompany: selectedOffer?.carrierName,
            shippingFee: selectedOffer?.price,
            trackingNumber: trackingNumber || undefined,
            cargoBarcodeUrl: cargoBarcodeUrl || undefined,
            senderName: 'Himmet Akar',
            senderPhone: '05455798600',
            senderAddress: 'Caferağa Mah. Moda Cad. No:45 Kadıköy, İstanbul',
          });

          setOrderId(generatedId || response.orderId || '');
          clearCart();
          setCheckoutStep('completed');
          
          // Clear inputs
          setCardHolder('');
          setCardNumber('');
          setCardExpiry('');
          setCardCvv('');
          setShippingName('');
          setShippingPhone('');
          setShippingCity('');
          setShippingDistrict('');
          setShippingAddress('');
          setSelectedCardId(null);
          setSaveCardSecurely(false);
          setCargoOffers([]);
          setSelectedOffer(null);
        } else {
          setPaymentError(response.errorMessage || 'Ödeme işlemi başarısız oldu.');
        }
      } catch (err) {
        setPaymentError('Ödeme işlemi sırasında bağlantı hatası oluştu.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <Modal
      visible={cartModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setCartModalVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <ThemedView type="backgroundElement" style={[styles.modalContent, { maxHeight: '85%', borderTopColor: theme.backgroundSelected }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>
              {checkoutStep === 'cart'
                ? 'Sepetim'
                : checkoutStep === 'shipping'
                ? 'Teslimat Bilgileri'
                : checkoutStep === 'payment'
                ? 'Ödeme Yap'
                : 'Siparişiniz Alındı!'}
            </ThemedText>
            <Pressable onPress={() => setCartModalVisible(false)}>
              <X size={22} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {checkoutStep === 'cart' && (
              <View style={{ gap: 16 }}>
                {cart.length === 0 ? (
                  <View style={styles.emptyCartBox}>
                    <ShoppingCart size={48} color={theme.textSecondary} style={{ marginBottom: 12 }} />
                    <ThemedText style={{ color: theme.textSecondary, textAlign: 'center' }}>
                      Sepetiniz henüz boş.
                    </ThemedText>
                  </View>
                ) : (
                  <View style={{ gap: 16 }}>
                    {cart.map((item) => (
                      <View key={item.listing.id} style={[styles.cartItemRow, { borderColor: theme.backgroundSelected }]}>
                        <Image
                          source={typeof item.listing.photos[0] === 'number' ? item.listing.photos[0] : { uri: item.listing.photos[0] }}
                          style={styles.cartItemImage}
                        />
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={[styles.cartItemTitle, { color: theme.text }]} numberOfLines={1}>
                            {item.listing.title}
                          </Text>
                          <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold' }}>
                            {item.listing.condition}
                          </Text>
                          <Text style={[styles.cartItemPrice, { color: theme.text }]}>
                            {(item.listing.price * item.quantity).toLocaleString('tr-TR')} TL
                          </Text>
                        </View>

                        <View style={[styles.cartQuantityRow, { borderColor: theme.backgroundSelected }]}>
                          <Pressable
                            style={styles.cartQtyBtn}
                            onPress={() =>
                              item.quantity === 1
                                ? removeFromCart(item.listing.id)
                                : updateCartQuantity(item.listing.id, item.quantity - 1)
                            }
                          >
                            <Minus size={12} color={theme.text} />
                          </Pressable>
                          <Text style={[styles.cartQtyText, { color: theme.text }]}>{item.quantity}</Text>
                          <Pressable
                            style={styles.cartQtyBtn}
                            onPress={() => updateCartQuantity(item.listing.id, item.quantity + 1)}
                          >
                            <Plus size={12} color={theme.text} />
                          </Pressable>
                        </View>

                        <Pressable style={styles.cartTrashBtn} onPress={() => removeFromCart(item.listing.id)}>
                          <Trash2 size={16} color="#EF4444" />
                        </Pressable>
                      </View>
                    ))}

                    <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />

                    <View style={[styles.summaryContainer, { backgroundColor: theme.background }]}>
                       <View style={styles.summaryRow}>
                          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Ara Toplam</Text>
                          <Text style={{ color: theme.text, fontSize: 13 }}>{cartSubtotal.toLocaleString('tr-TR')} TL</Text>
                       </View>
                       <View style={styles.summaryRow}>
                          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Kargo</Text>
                          <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>Sonraki adımda hesaplanacaktır</Text>
                       </View>
                       <View style={[styles.summaryRow, { marginTop: 8 }]}>
                          <Text style={{ color: theme.text, fontSize: 15, fontWeight: 'bold' }}>Toplam</Text>
                          <Text style={{ color: theme.gold, fontSize: 17, fontWeight: 'black' }}>
                            {cartTotal.toLocaleString('tr-TR')} TL
                          </Text>
                       </View>
                    </View>

                    <Pressable style={[styles.checkoutBtn, { backgroundColor: theme.gold }]} onPress={() => setCheckoutStep('shipping')}>
                      <Text style={[styles.checkoutBtnText, { color: '#000000' }]}>Ödemeye Geç</Text>
                      <ChevronRight size={16} color="#000000" />
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {checkoutStep === 'shipping' && (
              <View style={{ gap: 16 }}>
                {/* Saved Addresses Segment Selector */}
                {savedAddresses.length > 0 && (
                  <View style={{ gap: 10, marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary }}>KAYITLI ADRESLERİM</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                      {savedAddresses.map((addr) => {
                        const isSelected = addr.id === selectedAddressId;
                        return (
                          <Pressable
                            key={addr.id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? theme.gold : theme.backgroundSelected,
                              backgroundColor: isSelected ? 'rgba(9, 105, 218, 0.12)' : theme.backgroundElement,
                              gap: 6,
                            }}
                            onPress={() => handleSelectAddress(addr)}
                          >
                            <MapPin size={12} color={isSelected ? theme.gold : theme.textSecondary} />
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: isSelected ? theme.gold : theme.text }}>
                              {addr.name}
                            </Text>
                            {isSelected && (
                              <Pressable
                                style={{ marginLeft: 4 }}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  deleteSavedAddress(addr.id);
                                  if (savedAddresses.length <= 1) {
                                    handleSelectNewAddress();
                                  } else {
                                    const remaining = savedAddresses.filter(a => a.id !== addr.id);
                                    handleSelectAddress(remaining[0]);
                                  }
                                }}
                              >
                                <Trash2 size={12} color="#EF4444" />
                              </Pressable>
                            )}
                          </Pressable>
                        );
                      })}
                      <Pressable
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          borderColor: selectedAddressId === null ? theme.gold : theme.textSecondary,
                          backgroundColor: selectedAddressId === null ? 'rgba(9, 105, 218, 0.05)' : 'transparent',
                          gap: 6,
                        }}
                        onPress={handleSelectNewAddress}
                      >
                        <Plus size={12} color={selectedAddressId === null ? theme.gold : theme.textSecondary} />
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: selectedAddressId === null ? theme.gold : theme.textSecondary }}>
                          Yeni Adres Ekle
                        </Text>
                      </Pressable>
                    </ScrollView>
                  </View>
                )}

                {selectedAddressId === null && (
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Adres Başlığı</Text>
                    <TextInput
                      style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                      placeholder="Örn: Ev, İş, Yazlık"
                      placeholderTextColor={theme.textSecondary}
                      value={newAddressName}
                      onChangeText={setNewAddressName}
                    />
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Adı Soyadı</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                    placeholder="Örn: Himmet Akar"
                    placeholderTextColor={theme.textSecondary}
                    value={shippingName}
                    onChangeText={(text) => {
                      setShippingName(text);
                      if (formErrors.shippingName) {
                        setFormErrors(prev => { const copy = { ...prev }; delete copy.shippingName; return copy; });
                      }
                    }}
                  />
                  {formErrors.shippingName && <Text style={styles.formErrorText}>{formErrors.shippingName}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Telefon Numarası</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                    placeholder="5XX XXX XX XX"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="phone-pad"
                    value={shippingPhone}
                    onChangeText={(text) => {
                      setShippingPhone(formatPhoneNumber(text));
                      if (formErrors.shippingPhone) {
                        setFormErrors(prev => { const copy = { ...prev }; delete copy.shippingPhone; return copy; });
                      }
                    }}
                  />
                  {formErrors.shippingPhone && <Text style={styles.formErrorText}>{formErrors.shippingPhone}</Text>}
                </View>

                {/* City & District Picker Dropdowns */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>İl</Text>
                    <Pressable
                      style={[styles.formInput, { justifyContent: 'center', borderColor: theme.backgroundSelected }]}
                      onPress={() => setCityModalVisible(true)}
                    >
                      <Text style={{ color: shippingCity ? theme.text : theme.textSecondary, fontSize: 14 }}>
                        {shippingCity || 'Seçiniz'}
                      </Text>
                    </Pressable>
                    {formErrors.shippingCity && <Text style={styles.formErrorText}>{formErrors.shippingCity}</Text>}
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.formLabel, { color: theme.textSecondary }]}>İlçe</Text>
                    <Pressable
                      style={[styles.formInput, { justifyContent: 'center', borderColor: theme.backgroundSelected }]}
                      onPress={() => {
                        if (!shippingCity) {
                          Alert.alert('İl Seçilmedi', 'Lütfen önce il seçimi yapınız.');
                          return;
                        }
                        setDistrictModalVisible(true);
                      }}
                    >
                      <Text style={{ color: shippingDistrict ? theme.text : theme.textSecondary, fontSize: 14 }}>
                        {shippingDistrict || 'Seçiniz'}
                      </Text>
                    </Pressable>
                    {formErrors.shippingDistrict && <Text style={styles.formErrorText}>{formErrors.shippingDistrict}</Text>}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Teslimat Adresi</Text>
                  <TextInput
                    style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected, height: 60, paddingVertical: 10 }]}
                    placeholder="Mahalle, cadde, sokak ve kapı no yazın..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={2}
                    value={shippingAddress}
                    onChangeText={(text) => {
                      setShippingAddress(text);
                      if (formErrors.shippingAddress) {
                        setFormErrors(prev => { const copy = { ...prev }; delete copy.shippingAddress; return copy; });
                      }
                    }}
                  />
                  {formErrors.shippingAddress && <Text style={styles.formErrorText}>{formErrors.shippingAddress}</Text>}
                </View>

                {selectedAddressId === null && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 }}>
                    <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>Bu adresi teslimat için kaydet</Text>
                    <Switch
                      value={saveAddressSecurely}
                      onValueChange={setSaveAddressSecurely}
                      trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: theme.gold }}
                      thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                    />
                  </View>
                )}

                {/* Cargo Service Selector (Geliver API Integration) */}
                <View style={{ gap: 8, marginTop: 4, padding: 12, borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderWidth: 1, borderColor: theme.backgroundSelected }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.gold }}>🚚 Kargo Seçenekleri (Geliver API)</Text>
                    {cargoOffers.length > 0 && (
                      <Pressable onPress={handleFetchCargoOffers} disabled={loadingOffers}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.gold }}>Yeniden Sorgula</Text>
                      </Pressable>
                    )}
                  </View>

                  {cargoOffers.length === 0 ? (
                    <View style={{ paddingVertical: 10, alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 11, color: theme.textSecondary, textAlign: 'center', lineHeight: 15 }}>
                        Farklı kargo firmalarının güncel fiyat tekliflerini almak için lütfen adres bilgilerinizi girip sorgulayın.
                      </Text>
                      <Pressable 
                        style={{ height: 34, borderRadius: 6, backgroundColor: theme.gold, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }} 
                        onPress={handleFetchCargoOffers}
                        disabled={loadingOffers}
                      >
                        {loadingOffers ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <Text style={{ color: '#000000', fontSize: 12, fontWeight: 'bold' }}>Fiyat Tekliflerini Sorgula</Text>
                        )}
                      </Pressable>
                    </View>
                  ) : (
                    <View style={{ gap: 8 }}>
                      {cargoOffers.map((offer) => {
                        const isSelected = selectedOffer?.id === offer.id;
                        return (
                          <Pressable
                            key={offer.id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: 10,
                              borderRadius: 6,
                              borderWidth: isSelected ? 1.5 : 1,
                              borderColor: isSelected ? theme.gold : theme.backgroundSelected,
                              backgroundColor: isSelected ? (isDark ? 'rgba(9, 105, 218,0.04)' : '#FFFBF7') : theme.background,
                            }}
                            onPress={() => setSelectedOffer(offer)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 2 }}>
                                {offer.logo ? (
                                  <Image source={{ uri: offer.logo }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                                ) : (
                                  <Truck size={16} color="#94A3B8" />
                                )}
                              </View>
                              <View>
                                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 12 }}>{offer.carrierName}</Text>
                                <Text style={{ color: theme.textSecondary, fontSize: 10 }}>Teslimat: {offer.estimatedDelivery}</Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }}>{offer.price} TL</Text>
                              {isSelected && (
                                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.gold, alignItems: 'center', justifyContent: 'center' }}>
                                  <Check size={10} color="#000000" />
                                </View>
                              )}
                            </View>
                          </Pressable>
                        );
                      })}
                      <Text style={{ fontSize: 10, color: theme.textSecondary, fontStyle: 'italic', marginTop: 2 }}>
                        * Kargo ücreti alıcı ödemeli olup, kargo firması fiyat teklifleri Geliver entegrasyonu ile çekilmiştir.
                      </Text>
                    </View>
                  )}
                  {formErrors.selectedOffer && <Text style={styles.formErrorText}>{formErrors.selectedOffer}</Text>}
                </View>

                {/* Subtotal and Total preview */}
                <View style={{ gap: 6, paddingHorizontal: 4, borderTopWidth: 0.5, borderTopColor: theme.backgroundSelected, paddingTop: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: theme.textSecondary }}>Ürün Toplamı ({cart.reduce((acc, item) => acc + item.quantity, 0)} Adet):</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>{cartSubtotal.toLocaleString('tr-TR')} TL</Text>
                  </View>
                  {selectedOffer && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: theme.textSecondary }}>Kargo Ücreti ({selectedOffer.carrierName}):</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>{selectedOffer.price.toLocaleString('tr-TR')} TL</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.text }}>Kargo Dahil Toplam:</Text>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.gold }}>{cartTotal.toLocaleString('tr-TR')} TL</Text>
                  </View>
                </View>

                <View style={styles.formNavigationRow}>
                  <Pressable style={[styles.formBackBtn, { borderColor: theme.backgroundSelected }]} onPress={() => setCheckoutStep('cart')}>
                    <Text style={[styles.formBackBtnText, { color: theme.text }]}>Geri Dön</Text>
                  </Pressable>
                  <Pressable style={[styles.formNextBtn, { backgroundColor: theme.gold }]} onPress={handleCheckoutSubmit}>
                    <Text style={[styles.formNextBtnText, { color: '#000000' }]}>Devam Et</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {checkoutStep === 'payment' && (
              <View style={{ gap: 16 }}>
                {/* Saved Cards Selector Header */}
                {savedCards.length > 0 && (
                  <View style={{ flexDirection: 'row', borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9', padding: 4 }}>
                    <Pressable
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 6,
                        backgroundColor: selectedCardId !== null ? theme.gold : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        setSelectedCardId(savedCards[0].id);
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: selectedCardId !== null ? '#000000' : theme.text }}>
                        Kayıtlı Kartlarım ({savedCards.length})
                      </Text>
                    </Pressable>
                    <Pressable
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 6,
                        backgroundColor: selectedCardId === null ? theme.gold : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        setSelectedCardId(null);
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: selectedCardId === null ? '#000000' : theme.text }}>
                        Yeni Kart Kullan
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* If Saved Card selected, show saved card selector list */}
                {selectedCardId !== null && savedCards.length > 0 ? (
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary }}>KART SEÇİNİZ</Text>
                    {savedCards.map((savedCard) => {
                      const isSelected = savedCard.id === selectedCardId;
                      return (
                        <Pressable
                          key={savedCard.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: isSelected ? theme.gold : theme.backgroundSelected,
                            backgroundColor: isSelected ? (isDark ? 'rgba(9, 105, 218,0.04)' : '#FFFBF7') : theme.background,
                          }}
                          onPress={() => setSelectedCardId(savedCard.id)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <CreditCard size={20} color={isSelected ? theme.gold : theme.textSecondary} />
                            <View>
                              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }}>
                                {savedCard.cardSummary}
                              </Text>
                              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 1 }}>
                                {savedCard.cardHolder}
                              </Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            {isSelected && (
                              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: theme.gold, alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={12} color="#000000" />
                              </View>
                            )}
                            <Pressable
                              style={{ padding: 4 }}
                              onPress={(e) => {
                                e.stopPropagation();
                                deleteSavedCard(savedCard.id);
                                if (savedCards.length <= 1) {
                                  setSelectedCardId(null);
                                }
                              }}
                            >
                              <Trash2 size={16} color="#EF4444" />
                            </Pressable>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <>
                    {/* Credit Card Visual */}
                    <View style={[styles.creditCardVisual, { backgroundColor: theme.background, borderColor: theme.gold }]}>
                      <View style={styles.creditCardHeader}>
                        <Text style={[styles.creditCardLogo, { color: theme.text }]}>PRESTIGE CARD</Text>
                        <Text style={{ color: theme.gold, fontSize: 10, fontWeight: 'bold' }}>CREDIT</Text>
                      </View>
                      <Text style={[styles.creditCardNumber, { color: theme.text }]}>
                        {cardNumber ? cardNumber : '•••• •••• •••• ••••'}
                      </Text>
                      <View style={styles.creditCardFooter}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.creditCardLabel}>KART SAHİBİ</Text>
                          <Text style={[styles.creditCardText, { color: theme.text }]} numberOfLines={1}>
                            {cardHolder ? cardHolder.toUpperCase() : 'HİMMET AKAR'}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                          <Text style={styles.creditCardLabel}>GEÇERLİLİK</Text>
                          <Text style={[styles.creditCardText, { color: theme.text }]}>
                            {cardExpiry ? cardExpiry : 'MM/YY'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Kart Sahibinin Adı</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        placeholder="KART ÜZERİNDEKİ İSİM"
                        placeholderTextColor={theme.textSecondary}
                        value={cardHolder}
                        editable={!isProcessing}
                        onChangeText={(text) => {
                          setCardHolder(text);
                          if (formErrors.cardHolder) {
                            setFormErrors(prev => { const copy = { ...prev }; delete copy.cardHolder; return copy; });
                          }
                        }}
                      />
                      {formErrors.cardHolder && <Text style={styles.formErrorText}>{formErrors.cardHolder}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Kart Numarası</Text>
                      <TextInput
                        style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        maxLength={19}
                        value={cardNumber}
                        editable={!isProcessing}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/\D/g, '');
                          const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
                          setCardNumber(formatted);
                          if (formErrors.cardNumber) {
                            setFormErrors(prev => { const copy = { ...prev }; delete copy.cardNumber; return copy; });
                          }
                        }}
                      />
                      {formErrors.cardNumber && <Text style={styles.formErrorText}>{formErrors.cardNumber}</Text>}
                    </View>

                    <View style={styles.formRow}>
                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Son Kul. (AA/YY)</Text>
                        <TextInput
                          style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                          placeholder="MM/YY"
                          placeholderTextColor={theme.textSecondary}
                          maxLength={5}
                          value={cardExpiry}
                          editable={!isProcessing}
                          onChangeText={(text) => {
                            const cleaned = text.replace(/\D/g, '');
                            let formatted = cleaned;
                            if (cleaned.length > 2) {
                              formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
                            }
                            setCardExpiry(formatted);
                            if (formErrors.cardExpiry) {
                              setFormErrors(prev => { const copy = { ...prev }; delete copy.cardExpiry; return copy; });
                            }
                          }}
                        />
                        {formErrors.cardExpiry && <Text style={styles.formErrorText}>{formErrors.cardExpiry}</Text>}
                      </View>

                      <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>CVV</Text>
                        <TextInput
                          style={[styles.formInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                          placeholder="123"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numeric"
                          maxLength={3}
                          value={cardCvv}
                          editable={!isProcessing}
                          onChangeText={(text) => {
                            setCardCvv(text.replace(/\D/g, ''));
                            if (formErrors.cardCvv) {
                              setFormErrors(prev => { const copy = { ...prev }; delete copy.cardCvv; return copy; });
                            }
                          }}
                        />
                        {formErrors.cardCvv && <Text style={styles.formErrorText}>{formErrors.cardCvv}</Text>}
                      </View>
                    </View>

                    {/* Card Save Toggle Option */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingVertical: 4 }}>
                      <View style={{ flex: 1, paddingRight: 16 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Kartımı Güvenle Kaydet</Text>
                        <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 1 }}>
                          Kart bilgileri banka güvencesiyle şifrelenip token olarak saklanır.
                        </Text>
                      </View>
                      <Switch
                        value={saveCardSecurely}
                        onValueChange={setSaveCardSecurely}
                        trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: theme.gold }}
                        thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                        disabled={isProcessing}
                      />
                    </View>
                  </>
                )}

                {paymentError !== '' && (
                  <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: '#EF4444', padding: 12, borderRadius: 6 }}>
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>{paymentError}</Text>
                  </View>
                )}

                {/* Visa, MasterCard, iyzico Logos Row */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginTop: 8,
                  paddingTop: 12,
                  borderTopWidth: 0.5,
                  borderTopColor: theme.backgroundSelected,
                  flexWrap: 'wrap',
                }}>
                  {/* Visa */}
                  <View style={{ borderRadius: 4, overflow: 'hidden', backgroundColor: '#1A1F71', paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#FFFFFF', fontSize: 11 }}>
                      Vi<Text style={{ color: '#F7B600' }}>sa</Text>
                    </Text>
                  </View>

                  {/* MasterCard */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 4, backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, gap: 3 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EB001B' }} />
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#F79E1B', marginLeft: -5, opacity: 0.85 }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold', marginLeft: 2 }}>mastercard</Text>
                  </View>

                  {/* iyzico */}
                  <View style={{ borderRadius: 4, backgroundColor: '#0969da', paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: 10 }}>
                      iyzico <Text style={{ fontSize: 9, fontWeight: 'normal', opacity: 0.9 }}>ile öde</Text>
                    </Text>
                  </View>
                </View>

                {/* Legal Note */}
                <Text style={{ fontSize: 10, color: theme.textSecondary, textAlign: 'center', lineHeight: 14, marginBottom: 8 }}>
                  Ödemeleriniz iyzico güvencesiyle 256-bit SSL korumasıyla tahsil edilmektedir.
                </Text>
                
                <View style={styles.formNavigationRow}>
                  <Pressable 
                    style={[styles.formBackBtn, { borderColor: theme.backgroundSelected }, isProcessing && { opacity: 0.5 }]} 
                    onPress={() => !isProcessing && setCheckoutStep('shipping')}
                    disabled={isProcessing}
                  >
                    <Text style={[styles.formBackBtnText, { color: theme.text }]}>Geri Dön</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.formNextBtn, { backgroundColor: theme.gold }, isProcessing && { opacity: 0.8 }]} 
                    onPress={handleCheckoutSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={[styles.formNextBtnText, { color: '#FFFFFF' }]}>Ödeme Alınıyor...</Text>
                      </View>
                    ) : (
                      <Text style={[styles.formNextBtnText, { color: '#FFFFFF' }]}>
                        Öde ({cartTotal.toLocaleString('tr-TR')} TL)
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {checkoutStep === 'completed' && (
              <View style={styles.successStepContainer}>
                <View style={[styles.successIconCircle, { borderColor: theme.gold, backgroundColor: 'rgba(9, 105, 218, 0.08)' }]}>
                  <ShoppingCart size={40} color={theme.gold} />
                </View>
                <ThemedText style={styles.successTitle}>Siparişiniz Başarıyla Alındı!</ThemedText>
                <ThemedText style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                  Ödemeniz güvenle alındı. Satıcı en kısa sürede kargonuzu yola çıkaracaktır. Gelişmeleri Sohbet sekmesinden takip edebilirsiniz.
                </ThemedText>

                <View style={[styles.successOrderBox, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>SİPARİŞ NUMARANIZ</Text>
                  <Text style={{ color: theme.gold, fontSize: 20, fontWeight: '900', marginTop: 4 }}>{orderId}</Text>
                </View>

                <Pressable style={[styles.successContinueBtn, { backgroundColor: theme.gold }]} onPress={() => setCartModalVisible(false)}>
                  <Text style={[styles.successContinueBtnText, { color: '#000000' }]}>Alışverişe Devam Et</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </View>

      {/* City Picker Modal */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={styles.pickerModalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={[styles.pickerModalTitle, { color: theme.text }]}>İl Seçin</Text>
              <Pressable onPress={() => setCityModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.pickerSearchInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
              placeholder="İl ara..."
              placeholderTextColor={theme.textSecondary}
              value={citySearchQuery}
              onChangeText={setCitySearchQuery}
            />
            <FlatList
              data={Object.keys(TURKEY_CITIES).filter(city => 
                city.toLowerCase().replace('i', 'ı').includes(citySearchQuery.toLowerCase().replace('i', 'ı'))
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.pickerItem,
                    { borderBottomColor: theme.backgroundSelected },
                    pressed && { backgroundColor: theme.backgroundSelected }
                  ]}
                  onPress={() => {
                    setShippingCity(item);
                    setShippingDistrict(''); // Reset district
                    setCitySearchQuery('');
                    setCityModalVisible(false);
                    if (formErrors.shippingCity) {
                      setFormErrors(prev => { const copy = { ...prev }; delete copy.shippingCity; return copy; });
                    }
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 14 }}>{item}</Text>
                </Pressable>
              )}
              style={{ maxHeight: 300 }}
            />
          </ThemedView>
        </View>
      </Modal>

      {/* District Picker Modal */}
      <Modal
        visible={districtModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View style={styles.pickerModalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={[styles.pickerModalTitle, { color: theme.text }]}>İlçe Seçin ({shippingCity})</Text>
              <Pressable onPress={() => setDistrictModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.pickerSearchInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
              placeholder="İlçe ara..."
              placeholderTextColor={theme.textSecondary}
              value={districtSearchQuery}
              onChangeText={setDistrictSearchQuery}
            />
            <FlatList
              data={(TURKEY_CITIES[shippingCity] || []).filter(dist => 
                dist.toLowerCase().replace('i', 'ı').includes(districtSearchQuery.toLowerCase().replace('i', 'ı'))
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.pickerItem,
                    { borderBottomColor: theme.backgroundSelected },
                    pressed && { backgroundColor: theme.backgroundSelected }
                  ]}
                  onPress={() => {
                    setShippingDistrict(item);
                    setDistrictSearchQuery('');
                    setDistrictModalVisible(false);
                    if (formErrors.shippingDistrict) {
                      setFormErrors(prev => { const copy = { ...prev }; delete copy.shippingDistrict; return copy; });
                    }
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 14 }}>{item}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20, fontSize: 12 }}>
                  {shippingCity ? 'Bu ile ait ilçe bulunamadı.' : 'Lütfen önce il seçin.'}
                </Text>
              }
              style={{ maxHeight: 300 }}
            />
          </ThemedView>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
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
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
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
    marginVertical: 4,
  },
  summaryContainer: {
    gap: 6,
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
    height: 48,
    borderRadius: 6,
    gap: 6,
    marginTop: 8,
  },
  checkoutBtnText: {
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
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formNextBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  creditCardVisual: {
    height: 150,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: 'black',
    letterSpacing: 1,
  },
  creditCardNumber: {
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
    backgroundColor: 'rgba(9, 105, 218, 0.08)',
    borderWidth: 2,
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
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  successContinueBtn: {
    height: 46,
    width: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  successContinueBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  pickerSearchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
  },
});
