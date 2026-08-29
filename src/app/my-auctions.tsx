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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, getListingSeoUrl } from '@/services/store';
import { Colors } from '@/constants/theme';
import { ArrowLeft, Gavel, Clock, Trophy, Ban, ChevronRight, ShieldAlert } from 'lucide-react-native';
import GlobalHeader from '@/components/global-header';

export default function MyAuctionsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const { currentUser, listings, addToCart, setCartModalVisible, setCheckoutStep } = useAppStore();
  const [activeSegment, setActiveSegment] = useState<'participated' | 'live'>('participated');

  if (!currentUser) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ShieldAlert size={48} color={theme.gold} />
        <Text style={{ color: theme.text, fontSize: 16, marginTop: 12, fontWeight: 'bold' }}>Giriş Yapmalısınız</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>Katıldığınız mezatları görmek için giriş yapın.</Text>
        <Pressable 
          style={{ backgroundColor: theme.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 }}
          onPress={() => router.push('/')}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Ana Sayfaya Git</Text>
        </Pressable>
      </View>
    );
  }

  // Filter listings where the user placed a bid
  const participatedAuctions = listings.filter(l => 
    l.type === 'auction' && 
    (l.bids?.some(bid => bid.bidderId === currentUser.id) || 
     l.autoBids?.some(ab => ab.bidderId === currentUser.id))
  );

  const liveAuctions = listings.filter(l => 
    l.type === 'auction' && 
    (l.endTime ? (l.endTime > Date.now()) : true) && 
    l.auctionStatus !== 'won' && 
    l.auctionStatus !== 'purchased'
  );

  const listingsToRender = activeSegment === 'participated' ? participatedAuctions : liveAuctions;

  const handlePayWinner = (listing: any) => {
    // Add item to cart and open cart modal
    addToCart(listing);
    setCheckoutStep('cart');
    setCartModalVisible(true);
  };

  const getAuctionTimeRemaining = (listing: any) => {
    if (!listing.endTime) return 'Süre Belirtilmedi';
    const now = Date.now();
    const diff = listing.endTime - now;
    if (diff <= 0) return 'Süre Doldu';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}sa ${mins}dk`;
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {isDesktop ? null : <GlobalHeader />}

      {/* Header for Back navigation */}
      <View style={[styles.pageHeader, { borderBottomColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement || theme.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Katıldığım Mezatlar (Mezatlarım)</Text>
      </View>

      {/* Segment Switcher */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, gap: 10, maxWidth: 600, alignSelf: 'center', width: '100%' }}>
        <Pressable 
          style={{
            flex: 1,
            height: 38,
            borderRadius: 8,
            backgroundColor: activeSegment === 'participated' ? theme.gold : (scheme === 'dark' ? '#111A30' : '#F1F5F9'),
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: activeSegment === 'participated' ? theme.gold : (scheme === 'dark' ? '#1F2E54' : '#E2E8F0'),
          }}
          onPress={() => setActiveSegment('participated')}
        >
          <Text style={{ color: activeSegment === 'participated' ? '#FFFFFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
            Katıldıklarım ({participatedAuctions.length})
          </Text>
        </Pressable>
        <Pressable 
          style={{
            flex: 1,
            height: 38,
            borderRadius: 8,
            backgroundColor: activeSegment === 'live' ? theme.gold : (scheme === 'dark' ? '#111A30' : '#F1F5F9'),
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: activeSegment === 'live' ? theme.gold : (scheme === 'dark' ? '#1F2E54' : '#E2E8F0'),
          }}
          onPress={() => setActiveSegment('live')}
        >
          <Text style={{ color: activeSegment === 'live' ? '#FFFFFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
            Tüm Canlı Mezatlar ({liveAuctions.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {listingsToRender.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Gavel size={48} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 12 }}>
              {activeSegment === 'participated' ? 'Henüz pey verdiğiniz bir mezat bulunmamaktadır.' : 'Aktif canlı mezat bulunmamaktadır.'}
            </Text>
            <Pressable 
              style={{ borderColor: theme.gold, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 16 }}
              onPress={() => router.push('/auctions' as any)}
            >
              <Text style={{ color: theme.gold, fontWeight: 'bold' }}>Canlı Mezatları İncele</Text>
            </Pressable>
          </View>
        ) : (
          listingsToRender.map((listing) => {
            const isWinner = listing.auctionWinnerId === currentUser.id;
            const isHighest = listing.lastBidderId === currentUser.id;
            const hasEnded = listing.endTime ? (listing.endTime <= Date.now()) : false;
            
            // Get user's highest bid in this auction
            const userBids = listing.bids?.filter(b => b.bidderId === currentUser.id) || [];
            const userMaxBid = userBids.reduce((max, b) => b.amount > max ? b.amount : max, 0);

            return (
              <Pressable 
                key={listing.id} 
                style={[styles.auctionCard, { backgroundColor: theme.backgroundElement || theme.background, borderColor: theme.backgroundSelected }]}
                onPress={() => router.push(`/product/${listing.id}` as any)}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Image 
                    source={typeof listing.photos[0] === 'number' ? listing.photos[0] : { uri: listing.photos[0] }} 
                    style={styles.productImage} 
                  />
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={1}>{listing.title}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 3 }}>
                        Son Teklif: <Text style={{ color: theme.text, fontWeight: '700' }}>{listing.price.toLocaleString('tr-TR')} TL</Text>
                      </Text>
                      {userMaxBid > 0 && (
                        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                          Sizin En Yüksek Peyiniz: <Text style={{ color: theme.gold, fontWeight: '700' }}>{userMaxBid.toLocaleString('tr-TR')} TL</Text>
                        </Text>
                      )}
                    </View>

                    {/* Status Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      {hasEnded ? (
                        isWinner ? (
                          <View style={[styles.statusBadge, { backgroundColor: '#10B98115' }]}>
                            <Trophy size={12} color="#10B981" />
                            <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>Kazandınız</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusBadge, { backgroundColor: '#EF444415' }]}>
                            <Ban size={12} color="#EF4444" />
                            <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>Kaybettiniz</Text>
                          </View>
                        )
                      ) : (
                        userMaxBid > 0 ? (
                          isHighest ? (
                            <View style={[styles.statusBadge, { backgroundColor: '#10B98115' }]}>
                              <Trophy size={12} color="#10B981" />
                              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>En Yüksek Pey Sizde</Text>
                            </View>
                          ) : (
                            <View style={[styles.statusBadge, { backgroundColor: '#EF444415' }]}>
                              <ShieldAlert size={12} color="#EF4444" />
                              <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>Peyiniz Geçildi!</Text>
                            </View>
                          )
                        ) : (
                          <View style={[styles.statusBadge, { backgroundColor: 'rgba(9, 105, 218, 0.12)' }]}>
                            <Gavel size={12} color={theme.gold} />
                            <Text style={{ color: theme.gold, fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>Teklif Vermediniz (Katıl)</Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                </View>

                {/* Footer action bar */}
                <View style={[styles.cardFooter, { borderTopColor: theme.backgroundSelected }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={12} color={theme.textSecondary} />
                    <Text style={{ color: theme.textSecondary, fontSize: 11, marginLeft: 4 }}>
                      {getAuctionTimeRemaining(listing)}
                    </Text>
                  </View>

                  {hasEnded && isWinner && listing.auctionStatus !== 'purchased' ? (
                    <Pressable 
                      style={styles.payBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handlePayWinner(listing);
                      }}
                    >
                      <Trophy size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.payBtnText}>Siparişi Tamamla</Text>
                    </Pressable>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: theme.gold, fontSize: 11, fontWeight: 'bold' }}>Detayları Gör</Text>
                      <ChevronRight size={14} color={theme.gold} />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
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
  container: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  auctionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  payBtn: {
    backgroundColor: '#0969da',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
