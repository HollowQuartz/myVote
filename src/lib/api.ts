import { supabase } from './supabase'

// 🧠 Fetch all candidates
export const getCandidates = async () => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export const getCandidateById = async (id: string) => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// 🗳 Submit a vote
export const castVote = async (nim: string, candidateId: string) => {
  const { error } = await supabase.from('votes').insert([{ nim, candidate_id: candidateId }])
  if (error) {
    // Handle duplicate votes gracefully
    if (error.message.includes('duplicate key')) {
      throw new Error('NIM ini sudah digunakan untuk memilih.')
    }
    throw error
  }
  return true
}

// 📊 Real-time subscription (optional)
export const subscribeToVotes = (callback: () => void) => {
  return supabase
    .channel('realtime-votes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, callback)
    .subscribe()
}

// ✅ Count votes for each candidate
export const getVoteCounts = async () => {
  const { data, error } = await supabase
    .from('votes')
    .select('candidate_id', { count: 'exact' })
  if (error) throw error
  return data
}

// ⚙️ Get current election settings (open status + end date)
export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    // If no row found, return null instead of throwing
    if (error.details?.includes('No rows')) return null
    throw error
  }

  return data // { id: 1, election_open: true/false, election_end_at: '2025-06-01T12:00:00Z', ... }
}

// 🔄 Realtime subscription to settings changes
export const subscribeToSettings = (callback: (row: any) => void) => {
  return supabase
    .channel('settings-channel')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.1' },
      (payload) => {
        // callback receives the new row (record)
        callback(payload.record)
      }
    )
    .subscribe()
}

