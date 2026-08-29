import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Gavel, Package, Handshake, Key, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CategoryDesignsShowcase() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const categories = [
    { name: 'Canlı Mezat', Icon: Gavel, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)' },
    { name: 'Bit Pazarı', Icon: Package, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { name: 'Üreticiden Tüketiciye', Icon: Handshake, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
    { name: 'Sat / Kirala', Icon: Key, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  ];

  // Helper separator
  const Separator = () => (
    <View style={{ height: 6, backgroundColor: isDark ? '#334155' : '#E2E8F0', marginVertical: 32, borderRadius: 3 }} />
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement || theme.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Kategori Tasarım Alternatifleri (10 Farklı Stil)</Text>
          <Text style={{ fontSize: 11, color: theme.textSecondary }}>Lütfen beğendiğiniz tasarım numarasını seçiniz</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* DESIGN 1: Neon Glassmorphism Glow */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 1: Neon Glassmorphic Glow (Modern & Canlı)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
            {categories.map((cat) => (
              <Pressable
                key={`d1_${cat.name}`}
                style={[
                  styles.d1Card,
                  { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                    borderColor: cat.color,
                    boxShadow: `0 4px 20px ${cat.color}25`
                  }
                ]}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <View style={[styles.d1IconBg, { backgroundColor: cat.bg }]}>
                  <cat.Icon size={24} color={cat.color} />
                </View>
                <Text style={[styles.d1Text, { color: theme.text }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 2: Minimalist Border Shift */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 2: Minimalist Border Shift (Sade & Şık)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
            {categories.map((cat) => (
              <Pressable
                key={`d2_${cat.name}`}
                style={[
                  styles.d2Card,
                  { 
                    borderColor: theme.backgroundSelected,
                    backgroundColor: theme.backgroundElement || theme.background 
                  }
                ]}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <cat.Icon size={22} color={theme.textSecondary} strokeWidth={1.8} />
                <Text style={[styles.d2Text, { color: theme.text }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 3: Circular Colored Bubbles */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 3: Circular Colored Bubbles (Dinamik & Yuvarlak)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid, { justifyContent: 'space-around' }]}>
            {categories.map((cat) => (
              <Pressable
                key={`d3_${cat.name}`}
                style={styles.d3Card}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <View style={[styles.d3Circle, { backgroundColor: cat.color }]}>
                  <cat.Icon size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.d3Text, { color: theme.text }]} numberOfLines={1}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 4: Flat Modern Badges (Airbnb Style) */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 4: Flat Modern Badges (Hafif & Minimalist)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
            {categories.map((cat) => (
              <Pressable
                key={`d4_${cat.name}`}
                style={[
                  styles.d4Card,
                  { backgroundColor: cat.bg }
                ]}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <cat.Icon size={18} color={cat.color} strokeWidth={2.2} />
                <Text style={[styles.d4Text, { color: cat.color }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 5: Isometric 3D Tiles */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 5: Isometric 3D Tiles (Katmanlı & Derinlikli)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
            {categories.map((cat) => (
              <Pressable
                key={`d5_${cat.name}`}
                style={[
                  styles.d5Card,
                  { 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                  }
                ]}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <View style={[styles.d5ShadowBox, { backgroundColor: cat.bg }]}>
                  <cat.Icon size={22} color={cat.color} />
                </View>
                <Text style={[styles.d5Text, { color: theme.text }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 6: Linear Gradient Borders */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 6: Gradient Border Accent (Renk Geçişli)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
            {categories.map((cat) => (
              <Pressable
                key={`d6_${cat.name}`}
                style={[
                  styles.d6Card,
                  { 
                    backgroundColor: theme.backgroundElement || theme.background,
                    borderColor: theme.gold,
                    borderWidth: 1
                  }
                ]}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <cat.Icon size={20} color={theme.gold} />
                <Text style={[styles.d6Text, { color: theme.text }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 7: Gradient Accent Card Layout */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 7: Elegant Gradient Accent Cards (Üstten Geçişli Modern Kartlar)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
            {categories.map((cat) => (
              <Pressable
                key={`d7_${cat.name}`}
                style={[
                  styles.d7Card,
                  { 
                    backgroundColor: theme.backgroundElement || theme.background,
                    borderColor: theme.backgroundSelected
                  }
                ]}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <LinearGradient
                  colors={[cat.color, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.d7GradientBar}
                />
                <View style={[styles.d7IconWrapper, { backgroundColor: cat.bg }]}>
                  <cat.Icon size={22} color={cat.color} />
                </View>
                <Text style={[styles.d7Text, { color: theme.text }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 8: Luxury Gold & Black Metallic */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 8: Luxury Gold & Black Metallic (Premium & Ağır)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
            {categories.map((cat) => (
              <Pressable
                key={`d8_${cat.name}`}
                style={styles.d8Card}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <View style={styles.d8Circle}>
                  <cat.Icon size={20} color="#D4AF37" />
                </View>
                <Text style={styles.d8Text}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Separator />

        {/* DESIGN 9: Metro Asymmetrical Tile Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 9: Metro Asymmetrical Tile Grid (Asimetrik Modlar)</Text>
          <View style={styles.d9GridContainer}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable 
                style={[styles.d9CardLarge, { backgroundColor: '#A855F7', flex: 2 }]}
                onPress={() => alert('Canlı Mezat seçildi')}
              >
                <Gavel size={32} color="#FFFFFF" style={{ alignSelf: 'center' }} />
                <Text style={styles.d9CardLargeText}>Canlı Mezatlar</Text>
              </Pressable>
              <Pressable 
                style={[styles.d9CardLarge, { backgroundColor: '#10B981', flex: 1.2 }]}
                onPress={() => alert('Bit Pazarı seçildi')}
              >
                <Package size={26} color="#FFFFFF" style={{ alignSelf: 'center' }} />
                <Text style={styles.d9CardSmallText}>Bit Pazarı</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Pressable 
                style={[styles.d9CardLarge, { backgroundColor: '#3B82F6', flex: 1.5 }]}
                onPress={() => alert('Üreticiden Tüketiciye seçildi')}
              >
                <Handshake size={26} color="#FFFFFF" style={{ alignSelf: 'center' }} />
                <Text style={styles.d9CardSmallText}>Üreticiden Doğrudan</Text>
              </Pressable>
              <Pressable 
                style={[styles.d9CardLarge, { backgroundColor: '#F59E0B', flex: 1.5 }]}
                onPress={() => alert('Sat / Kirala seçildi')}
              >
                <Key size={26} color="#FFFFFF" style={{ alignSelf: 'center' }} />
                <Text style={styles.d9CardSmallText}>Satılık / Kiralık</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Separator />

        {/* DESIGN 10: Soft Pastels Flow circles */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.gold }]}>TASARIM 10: Soft Pastels Flow (Sıcak & Sempatik)</Text>
          <View style={[styles.grid, isDesktop && styles.desktopGrid, { justifyContent: 'space-around' }]}>
            {categories.map((cat) => (
              <Pressable
                key={`d10_${cat.name}`}
                style={styles.d10Card}
                onPress={() => alert(`${cat.name} seçildi`)}
              >
                <View style={[styles.d10Circle, { backgroundColor: cat.bg }]}>
                  <cat.Icon size={22} color={cat.color} />
                </View>
                <Text style={[styles.d10Text, { color: theme.textSecondary }]}>{cat.name.split(' ')[0]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  desktopGrid: {
    flexWrap: 'nowrap',
  },

  // D1 Styles
  d1Card: {
    flex: 1,
    minWidth: 120,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  d1IconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  d1Text: {
    fontSize: 11,
    fontWeight: '700',
  },

  // D2 Styles
  d2Card: {
    flex: 1,
    minWidth: 120,
    height: 72,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  d2Text: {
    fontSize: 11,
    fontWeight: '600',
  },

  // D3 Styles
  d3Card: {
    alignItems: 'center',
    gap: 6,
    width: 80,
  },
  d3Circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  d3Text: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // D4 Styles
  d4Card: {
    flex: 1,
    minWidth: 120,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  d4Text: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  // D5 Styles
  d5Card: {
    flex: 1,
    minWidth: 120,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  d5ShadowBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  d5Text: {
    fontSize: 11,
    fontWeight: '700',
  },

  // D6 Styles
  d6Card: {
    flex: 1,
    minWidth: 120,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  d6Text: {
    fontSize: 11,
    fontWeight: '600',
  },

  // D7 Styles
  d7Card: {
    flex: 1,
    minWidth: 120,
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    paddingTop: 10,
  },
  d7GradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  d7IconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  d7Text: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  // D8 Styles
  d8Card: {
    flex: 1,
    minWidth: 120,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderColor: '#D4AF37',
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  d8Circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  d8Text: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: 'bold',
  },

  // D9 Styles
  d9GridContainer: {
    width: '100%',
  },
  d9CardLarge: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
    justifyContent: 'flex-end',
    height: 100,
  },
  d9CardLargeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  d9CardSmallText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // D10 Styles
  d10Card: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  d10Circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  d10Text: {
    fontSize: 10,
    fontWeight: '600',
  },
});
