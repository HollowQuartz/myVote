import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getCandidates, getVoteCounts, subscribeToVotes } from '../lib/api'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'
import useBackToHome from '../hooks/useBackToHome'


export default function ResultsScreen() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Results'>>()
    useBackToHome(navigation)

  const loadResults = async () => {
    try {
      const candidates = await getCandidates()
      const votes = await getVoteCounts()

      const counts: Record<string, number> = {}
      votes.forEach((v: any) => {
        counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1
      })

      const combined = candidates.map((c: any) => ({
        id: c.id,
        name: `${c.name_president} & ${c.name_vice}`,
        votes: counts[c.id] || 0,
      }))

      setData(combined)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadResults()
    const sub = subscribeToVotes(() => loadResults())
    return () => sub.unsubscribe()
  }, [])

  const totalVotes = useMemo(
    () => data.reduce((sum, c) => sum + c.votes, 0),
    [data]
  )

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          Memuat hasil...
        </Text>
      </SafeAreaView>
    )

  if (!data.length)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          Belum ada suara.
        </Text>
      </SafeAreaView>
    )

  // Sort descending
  const sorted = [...data].sort((a, b) => b.votes - a.votes)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Total Suara */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Suara Terhitung</Text>
          <Text style={styles.totalValue}>
            {totalVotes.toLocaleString('id-ID')}
          </Text>
        </View>

        {/* Candidate list */}
        {sorted.map((item, index) => {
          const percentage =
            totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0

          const barColors = [
            '#22C55E', // green
            '#6366F1', // indigo
            '#8B5CF6', // purple
            '#A855F7', // violet
            '#FACC15', // yellow
            '#EC4899', // pink
            '#3B82F6', // blue
          ]
          const color = barColors[index % barColors.length]

          return (
            <View key={item.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.candidateName}>{item.name}</Text>
                <Text style={styles.percentageText}>{percentage}%</Text>
              </View>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${percentage}%`, backgroundColor: color },
                  ]}
                />
              </View>

              <Text style={styles.voteText}>
                Suara: {item.votes.toLocaleString('id-ID')}
              </Text>
            </View>
          )
        })}
      </ScrollView>

      {/* Bottom nav bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navText, { color: '#4F46E5' }]}>Bagan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            alert('Belum tersedia: Favorit belum diimplementasikan.')
          }
        >
          <Text style={styles.navText}>Favorit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  backBtnText: { color: '#fff', fontWeight: '600' },

  totalCard: {
    backgroundColor: '#312E81',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  totalLabel: { color: '#E0E7FF', fontSize: 14, fontWeight: '600' },
  totalValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  candidateName: { fontWeight: '700', fontSize: 15, color: '#111827' },
  percentageText: { fontWeight: '700', color: '#4F46E5' },
  progressBg: {
    backgroundColor: '#DDD6FE',
    borderRadius: 6,
    height: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  voteText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },

  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
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
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 13, color: '#9CA3AF', fontWeight: '700' },
})
