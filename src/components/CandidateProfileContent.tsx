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
  Platform,
} from 'react-native'
import { getCandidateById, castVote } from '../lib/api'
import { isWeb } from '../lib/platform'

type Props = {
  candidateId: string
  nim?: string
  onVoted?: () => void
  isElectionOpen?: boolean
  onClose?: () => void
}

export default function CandidateProfileContent({
  candidateId,
  nim,
  onVoted,
  isElectionOpen = true,
  onClose,
}: Props) {
  const [candidate, setCandidate] = useState<any | null>(null)
  const [tab, setTab] = useState<'profile' | 'kampanye'>('profile')
  const [loading, setLoading] = useState(true)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [voting, setVoting] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getCandidateById(candidateId)
        if (!mounted) return
        setCandidate(data)
      } catch (err) {
        console.error('getCandidateById failed', err)
        showUserAlert('Error', 'Gagal memuat profil kandidat.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [candidateId])

  // cross-platform alert
  const showUserAlert = (title: string, message: string) => {
    try {
      if (isWeb && typeof window !== 'undefined') {
        window.alert(`${title}\n\n${message}`)
      } else {
        Alert.alert(title, message)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('showUserAlert failed', e)
    }
  }

  const handleVoteNow = async () => {
    if (!nim) {
      showUserAlert('NIM tidak tersedia', 'Masukkan NIM di layar sebelumnya sebelum memilih.')
      setConfirmVisible(false)
      return
    }
    try {
      setVoting(true)
      await castVote(nim.trim(), candidateId)
      setVoting(false)
      setConfirmVisible(false)

      if (onVoted) onVoted()
    } catch (err: any) {
      setVoting(false)
      let message = 'Terjadi kesalahan.'
      if (typeof err === 'string') message = err
      else if (err?.message) message = String(err.message)
      // eslint-disable-next-line no-console
      console.error('handleVoteNow ERROR:', err)
      showUserAlert('Gagal memilih', message)
      setConfirmVisible(false)
    }
  }

  const openLinkSafe = (url?: string) => {
    if (!url) return
    if (isWeb && typeof window !== 'undefined') {
      try {
        const newWin = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWin) {
          try {
            newWin.opener = null
          } catch {}
        }
      } catch (e) {
        Linking.openURL(url).catch(() => showUserAlert('Tautan tidak valid', 'Tautan tidak valid'))
      }
      return
    }
    Linking.canOpenURL(url)
      .then((ok) => {
        if (ok) Linking.openURL(url)
        else showUserAlert('Tautan tidak valid', 'Tautan tidak valid')
      })
      .catch(() => {
        showUserAlert('Tautan tidak valid', 'Tautan tidak valid')
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

  const ProfilePerson = ({
    title,
    name,
    birthplace,
    birthdate,
    bio,
    experience,
  }: {
    title: string
    name?: string
    birthplace?: string
    birthdate?: string
    bio?: string
    experience?: string
  }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.personName}>{name ?? title}</Text>
      <Text style={styles.muted}>
        {birthplace ?? '-'}
        {birthdate ? `, ${birthdate}` : ''}
      </Text>

      <Text style={styles.sectionHeader}>Biografi</Text>
      <Text style={styles.body}>{bio ?? '-'}</Text>

      {experience ? (
        <>
          <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Pengalaman</Text>
          <Text style={styles.body}>{experience}</Text>
        </>
      ) : null}
    </View>
  )

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        {isWeb && typeof onClose === 'function' && (
          <TouchableOpacity
            style={{ marginBottom: 12, alignSelf: 'flex-start' }}
            onPress={() => onClose()}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Text style={{ color: '#6B7280' }}>← Kembali</Text>
          </TouchableOpacity>
        )}

        {/* Header image */}
        <Image
          source={
            !imageError && candidate.photo_url
              ? { uri: candidate.photo_url }
              : require('../../assets/logo1.png')
          }
          style={styles.headerImage}
          onError={() => setImageError(true)}
        />

        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.titleLarge}>
              {candidate.name_president} & {candidate.name_vice}
            </Text>
            <Text style={styles.subtitleSmall}>{candidate.faculty ?? ''}</Text>
          </View>

          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>♡</Text>
          </View>
        </View>

        {/* Vote button */}
        <TouchableOpacity
          style={[styles.voteNowLarge, !isElectionOpen && styles.voteNowDisabled]}
          onPress={() => {
            if (!isElectionOpen) return
            setConfirmVisible(true)
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.voteNowTextLarge}>
            {isElectionOpen ? 'Vote Sekarang' : 'Pemilihan Ditutup'}
          </Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'profile' && styles.tabBtnActive]}
            onPress={() => setTab('profile')}
            accessibilityRole="button"
          >
            <Text style={[styles.tabBtnText, tab === 'profile' && styles.tabBtnTextActive]}>Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'kampanye' && styles.tabBtnActive]}
            onPress={() => setTab('kampanye')}
            accessibilityRole="button"
          >
            <Text style={[styles.tabBtnText, tab === 'kampanye' && styles.tabBtnTextActive]}>Kampanye</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {tab === 'profile' ? (
          <View style={{ paddingTop: 8 }}>
            <ProfilePerson
              title="Presiden"
              name={candidate.name_president}
              birthplace={candidate.president_birthplace}
              birthdate={candidate.president_birthdate}
              bio={candidate.president_bio}
              experience={candidate.experience_president}
            />

            <View style={styles.divider} />

            <ProfilePerson
              title="Wakil"
              name={candidate.name_vice}
              birthplace={candidate.vice_birthplace}
              birthdate={candidate.vice_birthdate}
              bio={candidate.vice_bio}
              experience={candidate.experience_vice}
            />

            <View style={{ marginTop: 14 }}>
              {/* <TouchableOpacity
                style={styles.followBtn}
                onPress={() => showUserAlert('Follow', 'Berhasil mengikuti')}
              >
                <Text style={styles.followBtnText}>Follow me</Text>
              </TouchableOpacity> */}

              {candidate.social_links && typeof candidate.social_links === 'object' && (
                <View style={{ marginTop: 12 }}>
                  {Object.entries(candidate.social_links).map(([k, v]) => (
                    <TouchableOpacity key={k} onPress={() => openLinkSafe(String(v))} style={styles.socialRow}>
                      <View style={styles.socialDot}><Text style={{ color: '#fff' }}>{k[0]?.toUpperCase()}</Text></View>
                      <Text style={[styles.body, { marginLeft: 10 }]}>{k}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={{ paddingTop: 8 }}>
            <View style={styles.mediaCard}>
              <View style={styles.mediaThumb}>
                <Text style={styles.mediaPlay}>▶</Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: '700' }}>
                  {candidate.campaign_title ?? `${candidate.name_president} & ${candidate.name_vice}`}
                </Text>
                <Text style={[styles.muted, { marginTop: 6 }]}>{candidate.campaign_subtitle ?? ''}</Text>
              </View>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Visi</Text>
            <Text style={styles.body}>{candidate.vision ?? '-'}</Text>

            <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Misi</Text>
            <Text style={styles.body}>{candidate.mission ?? '-'}</Text>
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
  content: { padding: 18, backgroundColor: '#fff' },
  headerImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  titleLarge: { fontSize: 20, fontWeight: '800', color: '#4B0082' },
  subtitleSmall: { color: '#6B7280', marginTop: 4 },
  badgeWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  badgeText: { color: '#6B7280', fontWeight: '700' },

  voteNowLarge: {
    marginTop: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  voteNowTextLarge: { color: '#fff', fontWeight: '800', fontSize: 16 },

  tabBar: {
    marginTop: 14,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#6D28D9',
  },
  tabBtnText: { color: '#6B7280', fontWeight: '700' },
  tabBtnTextActive: { color: '#6D28D9' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

  personName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sectionHeader: { fontWeight: '700', marginTop: 12, color: '#111827' },
  muted: { color: '#6B7280', marginTop: 6 },
  body: { marginTop: 6, color: '#374151', lineHeight: 20 },

  followBtn: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  followBtnText: { color: '#4F46E5', fontWeight: '700' },

  socialRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  socialDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mediaCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  mediaThumb: {
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlay: { fontSize: 36, color: '#111827', opacity: 0.9 },

  voteNowDisabled: {
    backgroundColor: '#9CA3AF',
  },
})

// Modal-specific styles (keeps modal markup unchanged)
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
