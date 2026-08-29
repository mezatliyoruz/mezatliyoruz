import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Text, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { X, Truck, Check, Circle } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { CargoService, TrackingStatus } from '@/services/cargo';
import { ThemedView } from './themed-view';

interface CargoTrackingModalProps {
  visible: boolean;
  onClose: () => void;
  trackingNumber: string;
  carrierName?: string;
}

export default function CargoTrackingModal({ visible, onClose, trackingNumber, carrierName = 'Kargo Firması' }: CargoTrackingModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrackingStatus | null>(null);

  useEffect(() => {
    if (visible && trackingNumber) {
      setLoading(true);
      CargoService.getTrackingStatus(trackingNumber, carrierName)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, trackingNumber, carrierName]);

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'preparing': return 0;
      case 'shipped':
      case 'in_transit': return 1;
      case 'delivering': return 2;
      case 'delivered': return 3;
      default: return 1;
    }
  };

  const getStepProgressWidth = (index: number) => {
    switch (index) {
      case 0: return '15%';
      case 1: return '45%';
      case 2: return '75%';
      case 3: return '100%';
      default: return '15%';
    }
  };

  // Resolve Carrier Logo Helper
  const getCarrierLogo = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('yurt') || lowerName.includes('yurtiçi')) {
      return 'https://seeklogo.com/images/Y/yurtici-kargo-logo-106FEA554A-seeklogo.com.png';
    } else if (lowerName.includes('aras')) {
      return 'https://seeklogo.com/images/A/aras-kargo-logo-A27715F79D-seeklogo.com.png';
    } else if (lowerName.includes('mng')) {
      return 'https://seeklogo.com/images/M/mng-kargo-logo-97593D64AD-seeklogo.com.png';
    } else if (lowerName.includes('ptt')) {
      return 'https://seeklogo.com/images/P/ptt-logo-263A2946FA-seeklogo.com.png';
    } else if (lowerName.includes('sürat') || lowerName.includes('surat')) {
      return 'https://seeklogo.com/images/S/surat-kargo-logo-FC07C0FBE2-seeklogo.com.png';
    }
    return '';
  };

  const currentStepIndex = data ? getStatusStepIndex(data.status) : 0;
  const progressWidth = getStepProgressWidth(currentStepIndex);
  const logoUrl = data ? getCarrierLogo(data.carrierName) : '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ThemedView type="backgroundElement" style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Truck size={20} color={theme.gold} />
              <Text style={[styles.title, { color: theme.text }]}>Kargo Takip</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.gold} />
              <Text style={{ color: theme.textSecondary, marginTop: 12, fontSize: 13 }}>Kargo detayları sorgulanıyor...</Text>
            </View>
          ) : data ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
              {/* Carrier & Info Card */}
              <View style={[styles.carrierCard, { borderBottomColor: theme.backgroundSelected }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={styles.logoContainer}>
                    {logoUrl ? (
                      <Image source={{ uri: logoUrl }} style={styles.logoImage} />
                    ) : (
                      <Truck size={20} color="#94A3B8" />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.carrierName, { color: theme.text }]}>{data.carrierName}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Takip No: {data.trackingNumber}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: data.status === 'delivered' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(9, 105, 218, 0.12)' }]}>
                  <Text style={[styles.statusBadgeText, { color: data.status === 'delivered' ? '#10B981' : theme.gold }]}>
                    {data.status === 'delivered' ? 'Teslim Edildi' : 'Kargoda'}
                  </Text>
                </View>
              </View>

              {/* Progress Slider */}
              <View style={styles.progressContainer}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.textSecondary, marginBottom: 8 }}>SEVKİYAT DURUMU</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 16 }}>{data.statusText}</Text>
                
                {/* Horizontal Progress Track */}
                <View style={styles.trackContainer}>
                  {/* Gray Background Line */}
                  <View style={[styles.trackBg, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
                  {/* Green Active Line */}
                  <View style={[styles.trackActive, { width: progressWidth, backgroundColor: '#10B981' }]} />
                  
                  {/* Step Nodes */}
                  <View style={styles.nodesWrapper}>
                    {['Kabul', 'Yolda', 'Dağıtım', 'Teslim'].map((label, stepIdx) => {
                      const isActive = currentStepIndex >= stepIdx;
                      return (
                        <View key={stepIdx} style={styles.nodeItem}>
                          <View style={[
                            styles.nodeCircle, 
                            { 
                              backgroundColor: isActive ? '#10B981' : (isDark ? '#0F172A' : '#FFFFFF'),
                              borderColor: isActive ? '#10B981' : (isDark ? '#1E293B' : '#CBD5E1')
                            }
                          ]}>
                            {isActive && <Check size={10} color="#FFFFFF" />}
                          </View>
                          <Text style={[styles.nodeLabel, { color: isActive ? theme.text : theme.textSecondary }]}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Event Timeline History */}
              <View style={styles.historyContainer}>
                <Text style={[styles.historyHeader, { color: theme.text }]}>Gönderi Geçmişi</Text>
                
                <View style={{ marginTop: 12 }}>
                  {data.events.map((event, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === data.events.length - 1;
                    return (
                      <View key={idx} style={styles.timelineRow}>
                        {/* Vertical line and dots column */}
                        <View style={styles.timelineIndicators}>
                          {!isLast && <View style={[styles.timelineLine, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />}
                          <View style={[
                            styles.timelineDot, 
                            { 
                              backgroundColor: isFirst ? '#10B981' : (isDark ? '#1E293B' : '#E2E8F0'),
                              borderColor: isFirst ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              borderWidth: isFirst ? 4 : 0
                            }
                          ]}>
                            {!isFirst && <Circle size={6} color={isDark ? '#475569' : '#94A3B8'} fill={isDark ? '#475569' : '#94A3B8'} />}
                          </View>
                        </View>

                        {/* Description content column */}
                        <View style={styles.timelineContent}>
                          <Text style={[
                            styles.timelineDesc, 
                            { 
                              color: isFirst ? '#10B981' : theme.text,
                              fontWeight: isFirst ? 'bold' : '600'
                            }
                          ]}>
                            {event.description}
                          </Text>
                          <Text style={[styles.timelineDate, { color: theme.textSecondary }]}>{event.dateTime}</Text>
                          {event.city && <Text style={[styles.timelineCity, { color: theme.textSecondary }]}>{event.city}</Text>}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Hata</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Kargo takip verilerine erişilemedi.</Text>
            </View>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '85%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrierCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  carrierName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  trackContainer: {
    height: 40,
    position: 'relative',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  trackBg: {
    height: 4,
    width: '100%',
    borderRadius: 2,
  },
  trackActive: {
    height: 4,
    position: 'absolute',
    left: 0,
    borderRadius: 2,
  },
  nodesWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeItem: {
    alignItems: 'center',
    width: 50,
  },
  nodeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },
  historyContainer: {
    marginTop: 10,
  },
  historyHeader: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 65,
  },
  timelineIndicators: {
    width: 24,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 8,
    bottom: -15,
    width: 2,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    zIndex: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 16,
  },
  timelineDesc: {
    fontSize: 13,
  },
  timelineDate: {
    fontSize: 11,
    marginTop: 2,
  },
  timelineCity: {
    fontSize: 11,
    marginTop: 1,
  },
});
