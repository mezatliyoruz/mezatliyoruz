import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Listing } from '@/services/store';

export const getCategoryTagText = (item: Listing): string => {
  // 1. Canlı Mezat
  if (item.type === 'auction') {
    return 'Canlı Mezat';
  }

  // 2. Sat Kirala
  const nameLower = (item.title + ' ' + item.category).toLowerCase();
  const isRent = item.type === 'rent';
  const isRealEstate = item.isRealEstate || item.category.includes('Emlak') || nameLower.includes('emlak');
  const isVehicle = item.isVehicle || nameLower.includes('galeri') || item.category.includes('Otomobil') || item.category.includes('Araba') || item.category.includes('Araç');

  if (isRealEstate || isVehicle || isRent) {
    const typeStr = isRent ? 'Kiralık' : 'Satılık';
    const catStr = isRealEstate ? 'Emlak' : (isVehicle ? 'Otomobil' : item.category.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s&]/g, '').trim());
    return `${typeStr} / ${catStr}`;
  }

  // 3. Üreticiden Tüketiciye
  const isProducerProduct =
    item.verifiedProduct === true ||
    ['El Yapımı', 'Mutfak', 'Doğal Gıda', 'El Emeği & Sanat', 'Doğal Kozmetik', 'Tasarım Giyim', 'Bahçe & Tarım'].includes(item.category) ||
    item.category.includes('🍯') || item.category.includes('🫒') || item.category.includes('🥫') || item.category.includes('🌾') || item.category.includes('🧶') || item.category.includes('🪵') || item.category.includes('🕯️') || item.category.includes('💍') || item.category.includes('♻️');

  if (isProducerProduct) {
    const cleanCat = item.category.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s&]/g, '').trim();
    return `Üreticiden Tüketiciye - ${cleanCat}`;
  }

  // 4. Bit Pazarı
  const cleanFleaCat = item.category.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s&]/g, '').trim();
  return `Bit Pazarı - ${cleanFleaCat}`;
};

export default function CategoryBadge({ item, style, textStyle }: { item: Listing; style?: ViewStyle; textStyle?: TextStyle }) {
  const text = getCategoryTagText(item);
  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(9, 105, 218, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
