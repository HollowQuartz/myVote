// src/components/CandidateProfileContent.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  Modal,
  Pressable,
} from 'react-native'
import { getCandidateById, castVote } from '../lib/api'

export default function CandidateProfileContent({
  candidateId,
  nim,
  onVoted,
  isElectionOpen = true,
}: {
  candidateId: string
  nim?: string
  onVoted?: () => void
  isElectionOpen?: boolean
}) {
  const [candidate, setCandidate] = useState<any | null>(null)
  const [tab, setTab] = useState<'profile' | 'kampanye'>('profile')
  const [loading, setLoading] = useState(true)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getCandidateById(candidateId)
        if (!mounted) return
        setCandidate(data)
      } catch (err) {
        console.error(err)
        Alert.alert('Error', 'Gagal memuat profil kandidat.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [candidateId])

  const handleVoteNow = async () => {
    if (!nim) {
      Alert.alert('NIM tidak tersedia', 'Masukkan NIM di layar sebelumnya sebelum memilih.')
      setConfirmVisible(false)
      return
    }
    try {
      setVoting(true)
      await castVote(nim.trim(), candidateId)
      setVoting(false)
      setConfirmVisible(false)

      // ONLY notify parent to close the sheet / do cleanup
      if (onVoted) onVoted()
    } catch (err: any) {
      setVoting(false)
      setConfirmVisible(false)
      Alert.alert('Gagal memilih', err?.message || 'Terjadi kesalahan.')
    }
  }

  const openLinkSafe = (url?: string) => {
    if (!url) return
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url)
      else Alert.alert('Tautan tidak valid')
    })
  }

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  if (!candidate) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Profil tidak ditemukan.</Text>
      </View>
    )
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={
            candidate.photo_url
              ? { uri: candidate.photo_url }
              : require('../../assets/logo1.png')
          }
          style={styles.headerImage}
        />
        <Text style={styles.title}>
          {candidate.name_president} & {candidate.name_vice}
        </Text>
        <Text style={styles.subtitle}>{candidate.faculty ?? ''}</Text>

        {/* Vote Sekarang */}
        <TouchableOpacity
          style={[styles.voteNow, !isElectionOpen && styles.voteNowDisabled]}
          onPress={() => {
            if (!isElectionOpen) return
            setConfirmVisible(true)
          }}
          activeOpacity={isElectionOpen ? 0.8 : 1}
        >
          <Text style={[styles.voteNowText, !isElectionOpen && styles.voteNowTextDisabled]}>
            {isElectionOpen ? 'Vote Sekarang' : 'Pemilihan Ditutup'}
          </Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setTab('profile')}
            style={[styles.tab, tab === 'profile' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'profile' && styles.tabTextActive]}>
              Profil
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('kampanye')}
            style={[styles.tab, tab === 'kampanye' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'kampanye' && styles.tabTextActive]}>
              Kampanye
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'profile' ? (
          <>
            <Text style={styles.sectionHeader}>{candidate.name_president}</Text>
            <Text style={styles.muted}>Tempat, Tanggal Lahir</Text>
            <Text style={styles.body}>
              {candidate.president_birthplace ?? '-'}
              {candidate.president_birthdate ? `, ${candidate.president_birthdate}` : ''}
            </Text>

            <Text style={styles.sectionHeader}>Biografi</Text>
            <Text style={styles.body}>{candidate.president_bio ?? candidate.vision ?? '-'}</Text>

            <View style={{ height: 12 }} />

            <Text style={styles.sectionHeader}>{candidate.name_vice}</Text>
            <Text style={styles.muted}>Tempat, Tanggal Lahir</Text>
            <Text style={styles.body}>
              {candidate.vice_birthplace ?? '-'}
              {candidate.vice_birthdate ? `, ${candidate.vice_birthdate}` : ''}
            </Text>

            <Text style={styles.sectionHeader}>Biografi</Text>
            <Text style={styles.body}>{candidate.vice_bio ?? candidate.mission ?? '-'}</Text>

            {candidate.experience_president ? (
              <>
                <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Pengalaman (Presiden)</Text>
                <Text style={styles.body}>{candidate.experience_president}</Text>
              </>
            ) : null}

            {candidate.experience_vice ? (
              <>
                <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Pengalaman (Wakil)</Text>
                <Text style={styles.body}>{candidate.experience_vice}</Text>
              </>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.sectionHeader}>Visi</Text>
            <Text style={styles.body}>{candidate.vision ?? '-'}</Text>

            <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Misi</Text>
            <Text style={styles.body}>{candidate.mission ?? '-'}</Text>
          </>
        )}

        {/* Social links */}
        {candidate.social_links && typeof candidate.social_links === 'object' && (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeader}>Sosial</Text>
            {Object.entries(candidate.social_links).map(([k, v]) => (
              <TouchableOpacity key={k} onPress={() => openLinkSafe(String(v))}>
                <Text style={[styles.body, { color: '#3B82F6' }]}>{k}: {String(v)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.box}>
            <Text style={modalStyles.title}>Konfirmasi</Text>
            <Text style={modalStyles.message}>
              Apakah kamu yakin? Vote-mu tidak bisa diubah.
            </Text>

            <View style={modalStyles.explainRow}>
              <Text style={modalStyles.explainIcon}>i</Text>
              <Text style={modalStyles.explainText}>
                Setelah menginput vote, kamu akan mendapatkan pesan konfirmasi
              </Text>
            </View>

            <View style={modalStyles.buttonsRow}>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                style={[modalStyles.btn, modalStyles.btnOutline]}
              >
                <Text style={modalStyles.btnOutlineText}>Batal</Text>
              </Pressable>

              <Pressable
                onPress={handleVoteNow}
                style={[modalStyles.btn, modalStyles.btnPrimary]}
                disabled={voting}
              >
                <Text style={modalStyles.btnPrimaryText}>
                  {voting ? 'Memilih...' : 'Konfirmasi'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  content: { padding: 18 },
  headerImage: { width: '100%', height: 220, backgroundColor: '#E5E7EB', borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  subtitle: { color: '#6B7280', marginTop: 6, marginBottom: 12 },
  voteNow: {
    marginTop: 10,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  voteNowDisabled: { backgroundColor: '#9CA3AF' },
  voteNowText: { color: '#fff', fontWeight: '700' },
  voteNowTextDisabled: { color: '#E5E7EB' },
  tabs: { flexDirection: 'row', marginTop: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { paddingVertical: 10, paddingHorizontal: 16 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#6D28D9' },
  tabText: { color: '#6B7280', fontWeight: '700' },
  tabTextActive: { color: '#6D28D9' },
  sectionHeader: { fontWeight: '700', marginTop: 12 },
  muted: { color: '#6B7280', marginTop: 6 },
  body: { marginTop: 6, color: '#374151', lineHeight: 20 },
})

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  box: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    elevation: 8,
  },
  title: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    color: '#111827',
    marginBottom: 10,
  },
  explainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  explainIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 8,
    color: '#6B7280',
    fontWeight: '700',
  },
  explainText: {
    color: '#6B7280',
    fontSize: 12,
    flex: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6D28D9',
  },
  btnOutlineText: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: '#4F46E5',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
})
