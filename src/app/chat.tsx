import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  useColorScheme,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/services/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { MessageSquare, ArrowRight, Star } from 'lucide-react-native';

export default function ChatListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { chats } = useAppStore();

  const renderChatItem = ({ item }: { item: typeof chats[0] }) => {
    const lastMessage = item.messages[item.messages.length - 1];
    
    // Format message preview
    let messageText = 'Mesaj yok';
    if (lastMessage) {
      if (lastMessage.type === 'offer') {
        messageText = `Teklif: ${lastMessage.offerAmount} TL`;
      } else {
        messageText = lastMessage.text;
      }
    }

    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatItem,
          { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
          pressed && { opacity: 0.8 }
        ]}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Image source={{ uri: item.otherPartyAvatar }} style={styles.avatar} />
        
        <View style={styles.chatInfo}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.otherPartyName}>{item.otherPartyName}</ThemedText>
            {lastMessage && (
              <ThemedText style={styles.timestampText}>
                {new Date(lastMessage.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            )}
          </View>
          
          <ThemedText style={styles.listingTitle} numberOfLines={1}>
            Ürün: {item.listingTitle}
          </ThemedText>
          
          <ThemedText style={[styles.lastMessage, { color: lastMessage?.type === 'offer' ? theme.gold : theme.textSecondary }]} numberOfLines={1}>
            {messageText}
          </ThemedText>
        </View>

        <Image source={typeof item.listingImage === 'number' ? item.listingImage : { uri: item.listingImage }} style={styles.listingThumb} />
        <ArrowRight size={16} color={theme.gold} style={{ marginLeft: 8 }} />
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MessageSquare size={22} color="#0969da" />
          <ThemedText style={styles.headerTitle}>SOHBETLERİM</ThemedText>
        </View>
        <ThemedText style={styles.headerSubtitle}>
          Satıcılar veya alıcılar ile mesajlarınızı buradan yönetin.
        </ThemedText>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquare size={48} color={theme.textSecondary} />
          <ThemedText style={styles.emptyText}>Henüz bir sohbet başlatılmamış.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  listContainer: {
    gap: 12,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#0969da',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otherPartyName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timestampText: {
    fontSize: 10,
  },
  listingTitle: {
    fontSize: 11,
    color: '#0969da',
  },
  lastMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  listingThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginLeft: 12,
    resizeMode: 'cover',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 14,
  },
});
