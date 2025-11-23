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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { getSettings, subscribeToSettings } from '../lib/api' // existing helpers

type FAQItem = { id: string; q: string; a: string }

// You can edit the FAQ content here
const FAQ_DEFAULT: FAQItem[] = [
  { id: '1', q: 'Bagaimana cara memilih?', a: 'Masukkan NIM (12 digit) pada layar NIM, lalu pilih kandidat favorit dan konfirmasi. Setelah konfirmasi, suara tidak bisa diubah.' },
  { id: '2', q: 'Apakah suara saya anonim?', a: 'Saat ini admin dapat melihat pasangan NIM -> kandidat. Jika Anda ingin anonimitas penuh, ubah kebijakan penyimpanan di database.' },
  { id: '3', q: 'NIM sudah digunakan — apa artinya?', a: 'NIM tersebut sudah dipakai untuk memilih; setiap NIM hanya boleh memilih sekali.' },
  { id: '4', q: 'Masalah teknis?', a: 'Hubungi admin lewat tombol WhatsApp di halaman ini. Sertakan screenshot bila perlu.' },
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

    const init: Record<string, boolean> = {}
    FAQ_DEFAULT.forEach((f) => (init[f.id] = false))
    setFaqOpen(init)

    return () => {
      mounted = false
      try { sub.unsubscribe() } catch {}
    }
  }, [])

  const toggleFAQ = (id: string) => setFaqOpen((s) => ({ ...s, [id]: !s[id] }))

  // --- CHANGED: openAdminWhatsapp now uses WhatsApp click-to-chat link with prefilled message ---
  const openAdminWhatsapp = () => {
    // prefer a phone number stored in settings, fallback to admin_phone or admin_whatsapp; if none, use placeholder
    const phone = settings?.admin_whatsapp || settings?.admin_phone || '6282135902354'
    // NOTE: use the exact message you asked for
    const message = 'Halo kak Ari, aku ingin bertanya mengenai voting Pemilu Capres dan Wapres BEM PLJ Periode 2025-2026'
    // wa.me expects phone in international format without plus (e.g. 62812...)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          // fallback: try api.whatsapp link
          const alt = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
          Linking.openURL(alt).catch((err) => {
            console.warn('Failed opening WhatsApp', err)
            // as last resort, open email link (previous behavior)
            const email = settings?.admin_email || 'arimasfufahh@gmail.com'
            Linking.openURL(`mailto:${email}`).catch(() => {})
          })
        } else {
          Linking.openURL(url).catch((err) => {
            console.warn('Failed opening wa link', err)
          })
        }
      })
      .catch((err) => {
        console.warn('canOpenURL error', err)
      })
  }
  // --- end change ---

  const openResults = () => navigation.navigate('Results')

  const electionOpen = typeof settings?.election_open === 'boolean' ? settings.election_open : null
  const electionEnd = settings?.election_end_at ? new Date(settings.election_end_at) : null

  return (
    <SafeAreaView style={styles.outer}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.container, isDesktop && styles.containerDesktop]}>
          {/* Left column - Info */}
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

              {/* IMPORTANT: only show "Lihat Hasil" when election is closed */}
              {electionOpen === false ? (
                <TouchableOpacity style={styles.btn} onPress={openResults} activeOpacity={0.85}>
                  <Text style={styles.btnText}>Lihat Hasil</Text>
                </TouchableOpacity>
              ) : null}

              {/* CHANGED: contact via WhatsApp click-to-chat with prefilled message */}
              <TouchableOpacity style={styles.btnOutline} onPress={openAdminWhatsapp}>
                <Text style={styles.btnOutlineText}>Hubungi Ari</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right column - FAQ */}
          <View style={[styles.right, isDesktop && styles.rightDesktop]}>
            <Text style={styles.sectionTitle}>Bantuan & FAQ</Text>
            <View style={styles.card}>
              {FAQ_DEFAULT.map((f) => (
                <View key={f.id} style={{ marginBottom: 10 }}>
                  <TouchableOpacity onPress={() => toggleFAQ(f.id)} style={styles.faqQuestion} activeOpacity={0.8}>
                    <Text style={styles.faqQText}>{f.q}</Text>
                    <Text style={styles.faqToggle}>{faqOpen[f.id] ? '−' : '+'}</Text>
                  </TouchableOpacity>
                  {faqOpen[f.id] && <Text style={styles.faqA}>{f.a}</Text>}
                </View>
              ))}
            </View>

            <View style={[styles.card, { marginTop: 12 }]}>
              <Text style={styles.label}>Tips Singkat</Text>
              <Text style={styles.body}>• Periksa kembali NIM sebelum menekan konfirmasi.</Text>
              <Text style={styles.body}>• Screenshot halaman sukses sebagai bukti jika diperlukan.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom nav (same appearance we will copy into Home) */}
      <View style={[styles.bottomNav, isDesktop ? styles.bottomNavDesktop : styles.bottomNavMobile]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.navText, { color: '#4F46E5' }]}>Home</Text>
        </TouchableOpacity>

        <View style={styles.navItem}>
          <Text style={[styles.navText, { color: '#4F46E5', fontWeight: '800' }]}>Info</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 120 }, // reserve space for nav (mobile)
  container: { paddingHorizontal: 20, paddingTop: 18, gap: 16 },
  containerDesktop: { maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 24, gap: 20 },

  left: { flex: 1 },
  leftDesktop: { flex: 1.1 },

  right: { flex: 1 },
  rightDesktop: { flex: 0.9 },

  title: { textAlign: 'center', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },

  card: { backgroundColor: '#F8FAFF', borderRadius: 12, padding: 14, marginBottom: 6 },

  label: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  value: { fontSize: 18, color: '#111827', marginTop: 6, fontWeight: '700' },
  closedValue: { color: '#9CA3AF' },
  body: { color: '#374151', marginTop: 6, lineHeight: 20 },

  btn: { marginTop: 14, backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },

  btnOutline: { marginTop: 10, borderWidth: 1.5, borderColor: '#6D28D9', paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#fff' },
  btnOutlineText: { color: '#6D28D9', fontWeight: '700' },

  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  faqQText: { fontWeight: '700', color: '#111827', flex: 1 },
  faqToggle: { fontSize: 20, color: '#6B7280', paddingHorizontal: 6 },
  faqA: { color: '#374151', marginTop: 6, lineHeight: 20 },

  bottomNav: { position: 'absolute', left: 12, right: 12, bottom: 16, height: 64, backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12, elevation: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  bottomNavMobile: { marginLeft: 12, marginRight: 12 },
  bottomNavDesktop: { left: '50%', transform: [{ translateX: -250 }], width: 500, bottom: 24 },

  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 13, color: '#9CA3AF', fontWeight: '700' },
})
