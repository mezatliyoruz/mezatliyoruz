import React, { useState, useRef, useEffect } from 'react';
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
  FlatList,
  Text,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, Message, getListingSeoUrl } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import {
  ArrowLeft,
  Send,
  Plus,
  Tag,
  Paperclip,
  Check,
  X,
  ShieldCheck,
  Image as ImageIcon,
  MapPin,
  FileText,
  ShoppingCart,
} from 'lucide-react-native';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { chats, listings, currentUser, sendMessage, sendInChatOffer, respondToOffer } = useAppStore();
  const chat = chats.find((c) => c.id === id);

  const [inputText, setInputText] = useState('');
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerError, setOfferError] = useState('');
  
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Scroll to end when messages load/change
  useEffect(() => {
    if (chat && chat.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat?.messages.length]);

  if (!chat) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={{ marginBottom: 12 }}>Sohbet bulunamadı.</ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={16} color={theme.text} />
          <ThemedText>Geri Dön</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const handleSendText = () => {
    if (inputText.trim() === '') return;
    sendMessage(chat.id, inputText, 'text');
    setInputText('');
  };

  const handleSendOffer = () => {
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      setOfferError('Lütfen geçerli bir teklif girin.');
      return;
    }

    const listing = listings.find((l) => l.id === chat.listingId);
    if (listing && listing.type === 'offer') {
      const minOffer = listing.price * 0.85;
      if (amount < minOffer) {
        setOfferError(`Teklifiniz ürün fiyatından en fazla %15 düşük olabilir. (Minimum teklif: ${minOffer} TL)`);
        return;
      }
    }

    sendInChatOffer(chat.id, amount);
    setOfferAmount('');
    setOfferError('');
    setOfferModalVisible(false);
  };

  const handleBuyOffer = (offerAmount: number) => {
    const listing = listings.find((l) => l.id === chat.listingId);
    if (!listing) return;
    
    // Add to cart with custom offer price
    const cartItem = {
      listing: {
        ...listing,
        price: offerAmount
      },
      quantity: 1
    };
    
    // Update store state directly
    useAppStore.setState({
      cart: [cartItem],
      cartModalVisible: true,
    });
  };

  const handleSendAttachment = (type: Message['type'], label: string) => {
    setAttachmentModalVisible(false);
    
    let text = `${label} paylaşıldı.`;
    let mediaUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300';
    let fileName = undefined;

    if (type === 'document') {
      fileName = 'ekspertiz_belgesi.pdf';
      text = 'Sertifika dokümanı paylaşıldı.';
    }

    sendMessage(chat.id, text, type, mediaUrl, fileName);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUser?.id;
    const isDark = scheme === 'dark';
    const myBubbleBg = isDark ? '#005C4B' : '#D9FDD3';
    const otherBubbleBg = isDark ? '#202C33' : '#FFFFFF';
    const myTextColor = isDark ? '#F1F5F9' : '#111827';
    const otherTextColor = isDark ? '#F1F5F9' : '#111827';
    const myTimeColor = isDark ? 'rgba(241, 245, 249, 0.6)' : 'rgba(17, 24, 39, 0.6)';
    const otherTimeColor = isDark ? 'rgba(241, 245, 249, 0.6)' : 'rgba(17, 24, 39, 0.6)';

    if (item.type === 'offer') {
      return (
        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
          <ThemedView
            type="backgroundElement"
            style={[
              styles.offerCard,
              { borderColor: theme.gold },
              isMe ? styles.myOfferCard : styles.otherOfferCard,
            ]}
          >
            <View style={styles.offerCardHead}>
              <Tag size={16} color={theme.gold} />
              <ThemedText style={styles.offerCardTitle}>DİREKT FİYAT TEKLİFİ</ThemedText>
            </View>
            
            <ThemedText style={styles.offerCardAmount}>{item.offerAmount?.toLocaleString('tr-TR')} TL</ThemedText>
            <ThemedText style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 12 }}>
              {isMe ? 'Alıcı olarak ilettiğiniz fiyat teklifi.' : 'Satıcıdan gelen özel fiyat teklifi.'}
            </ThemedText>

            {/* Offer Status Actions */}
            {item.offerStatus === 'pending' ? (
              isMe ? (
                <View style={styles.statusLabelContainer}>
                  <Text style={styles.pendingText}>Yanıt Bekleniyor</Text>
                </View>
              ) : (
                <View style={styles.offerActionsRow}>
                  <Pressable
                    style={[styles.offerActionBtn, styles.offerRejectBtn]}
                    onPress={() => respondToOffer(chat.id, item.id, 'rejected')}
                  >
                    <X size={14} color="#EF4444" />
                    <Text style={styles.rejectBtnText}>Reddet</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.offerActionBtn, styles.offerAcceptBtn]}
                    onPress={() => respondToOffer(chat.id, item.id, 'accepted')}
                  >
                    <Check size={14} color="#070C19" />
                    <Text style={styles.acceptBtnText}>Kabul Et</Text>
                  </Pressable>
                </View>
              )
            ) : (
              <View style={styles.statusLabelContainer}>
                {item.offerStatus === 'accepted' ? (
                  <View style={{ gap: 8, alignSelf: 'stretch' }}>
                    <View style={styles.statusLabelAccept}>
                      <Check size={12} color="#070C19" />
                      <Text style={styles.statusTextAccept}>Teklif Kabul Edildi</Text>
                    </View>
                    {/* Render Buy Button if viewer is the buyer */}
                    {currentUser?.role === 'customer' && (
                      <Pressable
                        style={{
                          backgroundColor: theme.gold,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 6,
                          flexDirection: 'row',
                          gap: 6,
                          elevation: 2,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.2,
                          shadowRadius: 1.41,
                        }}
                        onPress={() => handleBuyOffer(item.offerAmount || 0)}
                      >
                        <ShoppingCart size={14} color="#000000" />
                        <Text style={{ color: '#000000', fontSize: 12, fontWeight: 'bold' }}>
                          Teklif Fiyatıyla Satın Al
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : (
                  <View style={styles.statusLabelReject}>
                    <X size={12} color="#F8FAFC" />
                    <Text style={styles.statusTextReject}>Teklif Reddedildi</Text>
                  </View>
                )}
              </View>
            )}
          </ThemedView>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        <View
          style={[
            styles.messageBubble,
            isMe ? [styles.myBubble, { backgroundColor: myBubbleBg }] : [styles.otherBubble, { backgroundColor: otherBubbleBg }],
          ]}
        >
          {item.type === 'photo' && item.mediaUrl && (
            <Image source={{ uri: item.mediaUrl }} style={styles.msgPhoto} />
          )}

          {item.type === 'document' && (
            <View style={[styles.msgDocBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
              <FileText size={20} color={isMe ? '#D4AF37' : '#D4AF37'} />
              <Text style={[styles.msgDocName, { color: isMe ? myTextColor : otherTextColor }]} numberOfLines={1}>
                {item.fileName || 'dokuman.pdf'}
              </Text>
            </View>
          )}

          <Text style={[styles.messageText, { color: isMe ? myTextColor : otherTextColor }]}>
            {item.text}
          </Text>
          <Text style={[styles.bubbleTime, { color: isMe ? myTimeColor : otherTimeColor }]}>
            {new Date(item.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const isDark = scheme === 'dark';
  const chatBgColor = isDark ? '#0B141A' : '#E5DDD5';

  return (
    <ThemedView style={[styles.container, { backgroundColor: chatBgColor }]}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#F8FAFC" />
        </Pressable>
        
        <Image source={{ uri: chat.otherPartyAvatar }} style={styles.headerAvatar} />
        
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerName}>{chat.otherPartyName}</ThemedText>
          {!chat.fromSellerProfile && (
            <Pressable onPress={() => {
              const listing = listings.find(l => l.id === chat.listingId);
              if (listing) {
                router.push(getListingSeoUrl(listing));
              } else {
                router.push(`/product/${chat.listingId}`);
              }
            }}>
              <ThemedText style={styles.headerListing} numberOfLines={1}>
                İlan: {chat.listingTitle}
              </ThemedText>
            </Pressable>
          )}
        </View>

        {!chat.fromSellerProfile && (
          <Pressable onPress={() => {
            const listing = listings.find(l => l.id === chat.listingId);
            if (listing) {
              router.push(getListingSeoUrl(listing));
            } else {
              router.push(`/product/${chat.listingId}`);
            }
          }}>
            <Image source={typeof chat.listingImage === 'number' ? chat.listingImage : { uri: chat.listingImage }} style={styles.headerListingThumb} />
          </Pressable>
        )}
      </View>

      {/* Messages Thread */}
      <FlatList
        ref={flatListRef}
        data={chat.messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input / Action Bar */}
      <ThemedView type="backgroundElement" style={styles.inputBar}>
        <Pressable style={styles.inputActionBtn} onPress={() => setAttachmentModalVisible(true)}>
          <Plus size={20} color={theme.gold} />
        </Pressable>

        <Pressable style={styles.inputActionBtn} onPress={() => setOfferModalVisible(true)}>
          <Tag size={20} color={theme.gold} />
        </Pressable>

        <TextInput
          placeholder="Mesajınızı yazın..."
          placeholderTextColor={theme.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          style={[styles.textInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
          onSubmitEditing={handleSendText}
        />

        <Pressable style={[styles.sendBtn, { backgroundColor: theme.gold }]} onPress={handleSendText}>
          <Send size={16} color="#070C19" />
        </Pressable>
      </ThemedView>

      {/* Direct Offer Modal */}
      <Modal
        visible={offerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Direkt Fiyat Teklifi Gönder</ThemedText>
              <Pressable onPress={() => setOfferModalVisible(false)}>
                <X size={20} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={{ color: theme.textSecondary, marginBottom: 12 }}>
                Sohbet içinde alıcı/satıcıya doğrudan pazarlık fiyatınızı iletin.
              </ThemedText>

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Fiyat teklifiniz (Örn: 2900)"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={offerAmount}
                  onChangeText={setOfferAmount}
                  style={[styles.modalTextInput, { color: theme.text, borderColor: theme.gold }]}
                />
                <Text style={styles.currencyText}>TL</Text>
              </View>

              {offerError !== '' && <Text style={styles.errorText}>{offerError}</Text>}

              <Pressable style={styles.submitBtn} onPress={handleSendOffer}>
                <Check size={16} color="#070C19" />
                <Text style={styles.submitText}>Teklifi İlet</Text>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Attachment Bottom Sheet / Modal */}
      <Modal
        visible={attachmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAttachmentModalVisible(false)}>
          <ThemedView type="backgroundElement" style={styles.bottomSheet}>
            <ThemedText style={styles.bottomSheetTitle}>Medya ve Dosya Paylaş</ThemedText>
            
            <View style={styles.bottomSheetGrid}>
              <Pressable style={styles.attachmentOption} onPress={() => handleSendAttachment('photo', 'Görsel')}>
                <View style={[styles.attachmentIconCircle, { backgroundColor: '#3B82F6' }]}>
                  <ImageIcon size={20} color="#FFF" />
                </View>
                <ThemedText style={styles.attachmentLabel}>Fotoğraf</ThemedText>
              </Pressable>

              <Pressable style={styles.attachmentOption} onPress={() => handleSendAttachment('document', 'Ekspertiz Belgesi')}>
                <View style={[styles.attachmentIconCircle, { backgroundColor: '#D4AF37' }]}>
                  <FileText size={20} color="#070C19" />
                </View>
                <ThemedText style={styles.attachmentLabel}>Sertifika</ThemedText>
              </Pressable>

              <Pressable style={styles.attachmentOption} onPress={() => handleSendAttachment('location', 'Konum Bilgisi')}>
                <View style={[styles.attachmentIconCircle, { backgroundColor: '#10B981' }]}>
                  <MapPin size={20} color="#FFF" />
                </View>
                <ThemedText style={styles.attachmentLabel}>Konum</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C19',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    marginTop: Platform.OS === 'ios' ? 44 : 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerListing: {
    fontSize: 10,
    color: '#D4AF37',
    marginTop: 1,
  },
  headerListingThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageList: {
    flex: 1,
  },
  messageRow: {
    width: '100%',
    marginVertical: 4,
    flexDirection: 'row',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    position: 'relative',
  },
  myBubble: {
    borderTopRightRadius: 2,
  },
  otherBubble: {
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  bubbleTime: {
    fontSize: 8,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  msgPhoto: {
    width: 200,
    height: 140,
    borderRadius: 8,
    marginBottom: 6,
  },
  msgDocBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  msgDocName: {
    fontSize: 12,
    flex: 1,
  },
  offerCard: {
    width: 260,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  myOfferCard: {
    borderTopRightRadius: 2,
  },
  otherOfferCard: {
    borderTopLeftRadius: 2,
  },
  offerCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  offerCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  offerCardAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  offerActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  offerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: 6,
    gap: 4,
  },
  offerRejectBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  offerAcceptBtn: {
    backgroundColor: '#D4AF37',
  },
  acceptBtnText: {
    color: '#070C19',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusLabelContainer: {
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 6,
  },
  pendingText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusLabelAccept: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34D399',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusTextAccept: {
    color: '#070C19',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusLabelReject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusTextReject: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputActionBtn: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 16,
    fontSize: 14,
    marginHorizontal: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  modalTextInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  currencyText: {
    position: 'absolute',
    right: 16,
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#D4AF37',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#070C19',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -4,
  },
  bottomSheet: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomSheetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  attachmentOption: {
    alignItems: 'center',
    gap: 8,
  },
  attachmentIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentLabel: {
    fontSize: 12,
  },
});
