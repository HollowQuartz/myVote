// src/screens/HomeScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  useWindowDimensions,
  SafeAreaView as RNSafeAreaView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { getCandidates, getSettings, subscribeToSettings } from '../lib/api'
import { useNavigation } from '@react-navigation/native'
import CandidateProfileContent from '../components/CandidateProfileContent'
import { useUser } from '../contexts/UserContext'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen(_: Props) {
  const { nim } = useUser()

  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [settings, setSettings] = useState<any | null>(null)
  const [nowTick, setNowTick] = useState<number>(Date.now())
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const navigation = useNavigation<any>()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 900

  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const cands = await getCandidates()
        const s = await getSettings().catch(() => null)
        if (!mounted) return
        setCandidates(cands || [])
        setSettings(s)
      } catch (err) {
        console.error('Failed loading data', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadAll()

    const sub = subscribeToSettings((row: any) => {
      setSettings(row)
    })

    const t = setInterval(() => setNowTick(Date.now()), 1000)

    return () => {
      mounted = false
      clearInterval(t)
      try { sub.unsubscribe() } catch {}
    }
  }, [])

  const electionEnd = useMemo(() => {
    if (settings && settings.election_end_at) return new Date(settings.election_end_at)
    const d = new Date()
    d.setDate(d.getDate() + 124)
    d.setHours(d.getHours() + 4)
    d.setMinutes(d.getMinutes() + 30)
    d.setSeconds(d.getSeconds() + 29)
    return d
  }, [settings])

  const isElectionOpen = useMemo(() => {
    if (settings && typeof settings.election_open === 'boolean') return settings.election_open
    return true
  }, [settings])

  const computeCountdown = () => {
    if (!isElectionOpen) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    const now = nowTick
    const diff = Math.max(0, electionEnd.getTime() - now)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
    return { days, hours, minutes, seconds }
  }

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      c.name_president?.toLowerCase().includes(q) ||
      c.name_vice?.toLowerCase().includes(q) ||
      (c.faculty ?? '').toLowerCase().includes(q)
    )
  })

  const countdown = computeCountdown()

  const openProfile = (id: string) => {
    setSelectedCandidateId(id)
    // open modal (CandidateProfileContent will animate in)
    setModalVisible(true)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading candidates...</Text>
      </SafeAreaView>
    )
  }

  const renderCandidate = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={ item.photo_url ? { uri: item.photo_url } : require('../../assets/logo1.png') }
          style={styles.candidateImage}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.candidateName}>
            {item.name_president} & {item.name_vice}
          </Text>
          <Text style={styles.candidateSub}>{item.faculty ?? 'Kampus'}</Text>

          <TouchableOpacity onPress={() => openProfile(item.id)} style={styles.profileFullWidth}>
            <Text style={styles.profileFullWidthText}>lihat profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const ListHeader = () => (
    <>
      <View style={styles.topRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../assets/logo1.png')} style={styles.avatar} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.username}>{nim ? nim : 'Pemilih'}</Text>
            <Text style={styles.roleText}>Pemilih</Text>
          </View>
        </View>
      </View>

      <View style={[styles.countCard, !isElectionOpen && styles.countCardClosed]}>
        <Text style={[styles.countTitle, !isElectionOpen && styles.countTitleClosed]}>
          Waktu tersisa untuk pemilihan
        </Text>
        {!isElectionOpen && <Text style={styles.closedLabel}>Pemilihan Ditutup</Text>}
        <View style={styles.countRow}>
          <View style={styles.countBlock}>
            <Text style={[styles.countNumber, !isElectionOpen && styles.countNumberClosed]}>
              {countdown.days}
            </Text>
            <Text style={[styles.countLabel, !isElectionOpen && styles.countLabelClosed]}>Hari</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.countBlock}>
            <Text style={[styles.countNumber, !isElectionOpen && styles.countNumberClosed]}>
              {countdown.hours}
            </Text>
            <Text style={[styles.countLabel, !isElectionOpen && styles.countLabelClosed]}>Jam</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.countBlock}>
            <Text style={[styles.countNumber, !isElectionOpen && styles.countNumberClosed]}>
              {countdown.minutes}
            </Text>
            <Text style={[styles.countLabel, !isElectionOpen && styles.countLabelClosed]}>Menit</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.countBlock}>
            <Text style={[styles.countNumber, !isElectionOpen && styles.countNumberClosed]}>
              {countdown.seconds}
            </Text>
            <Text style={[styles.countLabel, !isElectionOpen && styles.countLabelClosed]}>Detik</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Kandidat Capresma Cawapresma</Text>
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="cari kandidat..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
    </>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCandidate}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom nav (same appearance as InfoScreen) */}
      <View style={[styles.bottomNav, isDesktop ? styles.bottomNavDesktop : styles.bottomNavMobile]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.navText, { color: '#4F46E5' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Info')}>
          <Text style={styles.navText}>Info</Text>
        </TouchableOpacity>
      </View>

      {/* Candidate modal (slide-up) */}
      {selectedCandidateId && (
        <CandidateProfileContent
          visible={modalVisible}
          candidateId={selectedCandidateId}
          nim={nim}
          isElectionOpen={isElectionOpen}
          onClose={() => {
            // close modal
            setModalVisible(false)
            // unmount after small delay so animation can run
            setTimeout(() => setSelectedCandidateId(null), 220)
          }}
          onVoted={() => {
            // close modal then navigate to Success (avoid unmount race)
            setModalVisible(false)
            setTimeout(() => {
              setSelectedCandidateId(null)
              navigation.navigate('Success')
            }, 220)
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingText: { textAlign: 'center', marginTop: 40 },
  topRow: { paddingHorizontal: 20, paddingVertical: 18 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB' },
  username: { fontSize: 16, fontWeight: '700', color: '#111827' },
  roleText: { color: '#6B7280', fontSize: 12 },
  countCard: {
    marginHorizontal: 20,
    backgroundColor: '#6D28D9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  countCardClosed: { backgroundColor: '#E5E7EB', opacity: 0.95 },
  countTitle: { color: '#fff', fontSize: 14, marginBottom: 10 },
  countTitleClosed: { color: '#374151' },
  closedLabel: { color: '#FE2D2D', fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countBlock: { alignItems: 'center', flex: 1 },
  countNumber: { color: '#fff', fontSize: 22, fontWeight: '700' },
  countNumberClosed: { color: '#6B7280' },
  countLabel: { color: '#EDE9FE', marginTop: 4, fontSize: 12 },
  countLabelClosed: { color: '#9CA3AF' },
  separator: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', height: 48, marginHorizontal: 6 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginLeft: 20, marginBottom: 10, color: '#111827' },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 12 },
  searchInput: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: 14 },

  card: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 10, padding: 13, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  candidateImage: { width: 76, height: 76, borderRadius: 8, backgroundColor: '#E5E7EB' },
  candidateName: { fontWeight: '700', fontSize: 15, color: '#111827' },
  candidateSub: { color: '#6B7280', marginTop: 4 },

  profileFullWidth: { marginTop: 12, paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: '#6D28D9', width: '100%' },
  profileFullWidthText: { color: '#6D28D9', fontWeight: '700' },

  bottomNav: {
    position: 'absolute',
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  bottomNavMobile: {
    left: 12,
    right: 12,
    bottom: 16,
  },
  bottomNavDesktop: {
    left: '50%',
    transform: [{ translateX: -250 }],
    width: 500,
    bottom: 24,
  },

  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 13, color: '#9CA3AF', fontWeight: '700' },
})
