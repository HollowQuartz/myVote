// src/screens/InfoScreen.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Linking,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { getSettings, subscribeToSettings } from '../lib/api' // existing helpers

type FAQItem = { id: string; q: string; a: string }

const FAQ_DEFAULT: FAQItem[] = [
  {
    id: '1',
    q: 'Bagaimana cara memilih?',
    a: 'Masukkan NIM (12 digit) pada layar NIM, lalu pilih kandidat favorit dan konfirmasi. Setelah konfirmasi, suara tidak bisa diubah.',
  },
  {
    id: '2',
    q: 'Apakah suara saya anonim?',
    a: 'Saat ini admin dapat melihat pasangan NIM -> kandidat (sesuai permintaan Anda). Jika Anda ingin anonimitas penuh, ubah kebijakan penyimpanan di database.',
  },
  {
    id: '3',
    q: 'Saya mendapatkan pesan error “NIM sudah digunakan”. Apa artinya?',
    a: 'Itu berarti NIM yang Anda masukkan sudah digunakan untuk memilih. Setiap NIM hanya boleh memilih sekali.',
  },
  {
    id: '4',
    q: 'Bagaimana jika ada masalah teknis?',
    a: 'Hubungi admin lewat tombol email di halaman ini atau kirim pesan kepada tim IT kampus. Sertakan screenshot bila perlu.',
  },
]

export default function InfoScreen() {
  const [settings, setSettings] = useState<any | null>(null)
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({})
  const navigation = useNavigation<any>()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 900

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const s = await getSettings().catch(() => null)
        if (!mounted) return
        setSettings(s)
      } catch (e) {
        console.warn('Failed loading settings', e)
      }
    }
    load()

    const sub = subscribeToSettings((row: any) => {
      setSettings(row)
    })

    // init faqOpen (all closed)
    const init: Record<string, boolean> = {}
    FAQ_DEFAULT.forEach((f) => (init[f.id] = false))
    setFaqOpen(init)

    return () => {
      mounted = false
      try {
        sub.unsubscribe()
      } catch {}
    }
  }, [])

  const toggleFAQ = (id: string) => {
    setFaqOpen((s) => ({ ...s, [id]: !s[id] }))
  }

  const openAdminEmail = () => {
    const email = settings?.admin_email ?? 'admin@example.com'
    Linking.openURL(`mailto:${email}`)
  }

  const openResults = () => {
    navigation.navigate('Results')
  }

  const electionOpen = typeof settings?.election_open === 'boolean' ? settings.election_open : null
  const electionEnd = settings?.election_end_at ? new Date(settings.election_end_at) : null

  return (
    <SafeAreaView style={styles.outer}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.container, isDesktop && styles.containerDesktop]}>
          {/* Left: Info */}
          <View style={[styles.left, isDesktop && styles.leftDesktop]}>
            <Text style={styles.title}>{settings?.election_title ?? 'Informasi Pemilu'}</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, electionOpen === false && styles.closedValue]}>
                {electionOpen === null ? 'Belum diset' : electionOpen ? 'Sedang Berlangsung' : 'Ditutup'}
              </Text>

              <Text style={[styles.label, { marginTop: 12 }]}>Waktu Berakhir</Text>
              <Text style={styles.value}>
                {electionEnd ? electionEnd.toLocaleString() : '-'}
              </Text>

              <Text style={[styles.label, { marginTop: 12 }]}>Aturan Pokok</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.body}>• Setiap NIM hanya boleh memilih sekali.</Text>
                <Text style={styles.body}>• Masukkan NIM yang benar (12 digit).</Text>
                <Text style={styles.body}>• Setelah konfirmasi, suara tidak bisa diubah.</Text>
              </View>

              <View style={{ height: 12 }} />

              <TouchableOpacity
                style={[styles.btn, !electionOpen && styles.btnDisabled]}
                onPress={openResults}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>Lihat Hasil</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnOutline]} onPress={openAdminEmail}>
                <Text style={styles.btnOutlineText}>Hubungi Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right: FAQ / Bantuan */}
          <View style={[styles.right, isDesktop && styles.rightDesktop]}>
            <Text style={styles.sectionTitle}>Bantuan & FAQ</Text>
            <View style={styles.card}>
              {FAQ_DEFAULT.map((f) => (
                <View key={f.id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => toggleFAQ(f.id)}
                    style={styles.faqQuestion}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.faqQText}>{f.q}</Text>
                    <Text style={styles.faqToggle}>{faqOpen[f.id] ? '−' : '+'}</Text>
                  </TouchableOpacity>
                  {faqOpen[f.id] && <Text style={styles.faqA}>{f.a}</Text>}
                </View>
              ))}
            </View>

            {/* Optional: quick tips */}
            <View style={[styles.card, { marginTop: 12 }]}>
              <Text style={styles.label}>Tips Singkat</Text>
              <Text style={styles.body}>• Periksa kembali NIM sebelum menekan konfirmasi.</Text>
              <Text style={styles.body}>• Screenshot halaman sukses sebagai bukti jika diperlukan.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 40 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  containerDesktop: {
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    gap: 20,
  },

  left: { flex: 1 },
  leftDesktop: { flex: 1.1 },

  right: { flex: 1 },
  rightDesktop: { flex: 0.9 },

  title: { textAlign: 'center', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },

  card: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },

  label: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  value: { fontSize: 18, color: '#111827', marginTop: 6, fontWeight: '700' },
  closedValue: { color: '#9CA3AF' },
  body: { color: '#374151', marginTop: 6, lineHeight: 20 },

  btn: {
    marginTop: 14,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { backgroundColor: '#9CA3AF' },

  btnOutline: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#6D28D9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  btnOutlineText: { color: '#6D28D9', fontWeight: '700' },

  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  faqQText: { fontWeight: '700', color: '#111827' },
  faqToggle: { fontSize: 20, color: '#6B7280', paddingHorizontal: 6 },
  faqA: { color: '#374151', marginTop: 6, lineHeight: 20 },
})
