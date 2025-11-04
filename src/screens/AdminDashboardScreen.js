import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';

const StatCard = ({ label, value, color }) => (
  <View style={[styles.card, { borderColor: color || '#84bd00' }]}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={[styles.cardValue, { color: color || '#84bd00' }]}>{value}</Text>
  </View>
);

const AdminDashboardScreen = () => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ donations: 0, claims: null, pickedUp: 0, users: null, reviews: null });
  const [notice, setNotice] = useState('');
  const [recentDonations, setRecentDonations] = useState([]);
  const [userIdToName, setUserIdToName] = useState({});

  const load = async () => {
    setRefreshing(true);
    try {
      // Public reads: donations collection
      const donationsSnap = await getDocs(collection(db, 'donations'));
      const pickedSnap = await getDocs(query(collection(db, 'donations'), where('status', '==', 'picked_up')));

      setStats((prev) => ({
        ...prev,
        donations: donationsSnap.size,
        pickedUp: pickedSnap.size,
      }));

      // Restricted collections: , ignore permission errors
      try {
        const claimsSnap = await getDocs(collection(db, 'claims'));
        setStats((prev) => ({ ...prev, claims: claimsSnap.size }));
      } catch (e) {
        setNotice('Some stats hidden. Sign in to view restricted data.');
      }
      try {
        const profileSnap = await getDocs(collection(db, 'profiles'));
        setStats((prev) => ({ ...prev, users: profileSnap.size }));
        const map = {};
        profileSnap.docs.forEach((d) => {
          const data = d.data() || {};
          const name = data.displayName || data.fullName || data.name || data.username || data.email || d.id;
          map[d.id] = name;
        });
        setUserIdToName(map);
      } catch {}
      try {
        const reviewsSnap = await getDocs(collection(db, 'reviews'));
        setStats((prev) => ({ ...prev, reviews: reviewsSnap.size }));
      } catch {}

      const recent = await getDocs(query(collection(db, 'donations'), orderBy('createdAt', 'desc'), limit(10)));
      setRecentDonations(recent.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Admin Dashboard</Text>

      {notice ? <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>{notice}</Text> : null}
      <View style={styles.grid}>
        <StatCard label="Total Donations" value={stats.donations} />
        <StatCard label="Total Claims" value={stats.claims ?? '—'} />
        <StatCard label="Picked Up" value={stats.pickedUp} />
        <StatCard label="Profiles" value={stats.users ?? '—'} />
        <StatCard label="Reviews" value={stats.reviews ?? '—'} />
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Recent Donations</Text>
      <View style={{ gap: 12 }}>
        {recentDonations.map(item => {
          const ownerName = userIdToName[item.userId] || '—';
          return (
            <View key={item.id} style={[styles.row, { borderColor: theme.colors.border }]}>
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{item.itemName || 'Donation'}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                {ownerName} • {item.status || 'available'}
              </Text>
            </View>
          );
        })}
        {recentDonations.length === 0 && (
          <Text style={{ color: theme.colors.textSecondary }}>No donations found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flexBasis: '48%', borderWidth: 2, borderRadius: 10, padding: 12 },
  cardLabel: { fontSize: 12, fontWeight: '600', opacity: 0.7 },
  cardValue: { fontSize: 22, fontWeight: '900' },
  row: { borderWidth: 1, borderRadius: 8, padding: 12 },
  rowTitle: { fontWeight: '700', marginBottom: 4 },
});

export default AdminDashboardScreen;


