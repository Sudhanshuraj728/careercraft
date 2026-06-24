import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Animated, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { companiesAPI } from '../../api/api';
import { COLORS } from '../../utils/constants';

const INDUSTRIES = ['All', 'Technology', 'Finance', 'Consulting', 'Retail', 'Healthcare'];

function ScaleButton({ onPress, children, style, activeOpacity = 0.95 }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 150,
      friction: 5,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 5,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CompaniesScreen({ navigation }: any) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCompanies = useCallback(async (pageNum = 1, q = '', replace = true) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const industry = activeIndustry !== 'All' ? activeIndustry : undefined;
      const res = await companiesAPI.getAll(pageNum, 20, q || undefined);
      if (res.data.success) {
        const list: any[] = res.data.data;
        const filtered = industry ? list.filter((c: any) => c.industry?.includes(industry)) : list;
        setCompanies(prev => replace ? filtered : [...prev, ...filtered]);
        setHasMore(pageNum < res.data.pagination.pages);
        setPage(pageNum);
      }
    } catch {}
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, [activeIndustry]);

  useEffect(() => { fetchCompanies(1, searchQ, true); }, [activeIndustry]);

  const handleSearch = (q: string) => {
    setSearchQ(q);
    fetchCompanies(1, q, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchCompanies(page + 1, searchQ, false);
  };

  const renderCompany = ({ item }: { item: any }) => (
    <View style={styles.cardWrapper}>
      <ScaleButton onPress={() => navigation.navigate('CompanyDetail', { slug: item.slug, name: item.name })}>
        <View style={styles.card}>
          {/* Glass gradient background */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.035)', 'rgba(255, 255, 255, 0.005)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Embedded soft blue radial glow blurred behind the card contents */}
          <View style={[styles.cardInternalGlow, { backgroundColor: '#00D9FF' }]} />
          <View style={styles.cardLeft}>
            <LinearGradient
              colors={['rgba(108, 99, 255, 0.15)', 'rgba(255, 101, 132, 0.05)']}
              style={styles.logoBox}
            >
              <Text style={{ fontSize: 24 }}>🏢</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.companyIndustry} numberOfLines={1}>{item.industry}</Text>
              <View style={styles.tagsRow}>
                {item.location && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>📍 {item.location}</Text>
                  </View>
                )}
                {item.size && (
                  <LinearGradient
                    colors={['rgba(108, 99, 255, 0.12)', 'rgba(108, 99, 255, 0.03)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tagSize}
                  >
                    <Text style={styles.tagTextSize}>{item.size}</Text>
                  </LinearGradient>
                )}
              </View>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      </ScaleButton>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background blobs (extremely smooth, hardware-accelerated linear gradients) */}
      <LinearGradient
        colors={['rgba(108, 99, 255, 0.1)', 'transparent']}
        style={[styles.blob, { top: -80, right: -80, width: 300, height: 300 }]}
      />
      <LinearGradient
        colors={['rgba(255, 101, 132, 0.06)', 'transparent']}
        style={[styles.blob2, { bottom: 100, left: -100, width: 250, height: 250 }]}
      />

      {/* Centered Premium Subtle Logo Watermark */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.bgWatermark}
        resizeMode="contain"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Companies</Text>
        <Text style={styles.subtitle}>Find your perfect workplace</Text>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tech & creative companies..."
            placeholderTextColor="#6B6882"
            value={searchQ}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Industry Filter */}
      <View style={{ height: 48, marginBottom: 14 }}>
        <FlatList
          horizontal
          data={INDUSTRIES}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item }) => {
            const isActive = activeIndustry === item;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveIndustry(item)}
                style={styles.filterChipWrapper}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#6C63FF', '#FF6584']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.filterChipActive}
                  >
                    <Text style={styles.filterChipTextActive}>{item}</Text>
                  </LinearGradient>
                ) : (
                  <LinearGradient
                    colors={['rgba(30, 27, 46, 0.7)', 'rgba(18, 16, 30, 0.7)']}
                    style={styles.filterChip}
                  >
                    <Text style={styles.filterChipText}>{item}</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading curated list...</Text>
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(i) => i.slug}
          renderItem={renderCompany}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchCompanies(1, searchQ, true); }}
              tintColor="#6C63FF"
              colors={['#6C63FF']}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#6C63FF" style={{ margin: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No companies matched your filter</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07060A' },
  bgWatermark: {
    position: 'absolute',
    width: 340,
    height: 340,
    top: '28%',
    alignSelf: 'center',
    opacity: 0.15, // watermark logo - visible but non-intrusive
    zIndex: 0,
  },
  blob: { position: 'absolute', borderRadius: 150 },
  blob2: { position: 'absolute', borderRadius: 125 },

  header: { paddingHorizontal: 22, paddingTop: 64, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: '#A8A6C0', marginTop: 4, marginBottom: 18, fontWeight: '500' },
  searchWrapper: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },

  filterList: { height: 40 },
  filterChipWrapper: {
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  filterChip: {
    paddingHorizontal: 18,
    height: '100%',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    paddingHorizontal: 18,
    height: '100%',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: { fontSize: 13, color: '#A8A6C0', fontWeight: '700' },
  filterChipTextActive: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  cardWrapper: {
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    padding: 16,
  },
  cardInternalGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.035, // extremely subtle low opacity solid overlay for smooth native rendering
    top: -20,
    right: -20,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  companyIndustry: { fontSize: 12, color: '#A8A6C0', marginTop: 2, fontWeight: '500' },
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  tagSize: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.08)',
  },
  tagText: { fontSize: 11, color: '#6B6882', fontWeight: '600' },
  tagTextSize: { fontSize: 11, color: '#8C84FF', fontWeight: '700' },
  arrow: { fontSize: 22, color: '#6B6882', fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#A8A6C0', marginTop: 12, fontWeight: '600' },
  emptyText: { color: '#6B6882', fontSize: 15, fontWeight: '600' },
});

