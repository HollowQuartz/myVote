// src/lib/api.ts
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

// 🗳 Submit a vote (improved: logs and robust duplicate detection)
export const castVote = async (nim: string, candidateId: string) => {
  const normalizedNim = String(nim).trim()

  try {
    // Attempt insert
    const resp = await supabase
      .from('votes')
      .insert([{ nim: normalizedNim, candidate_id: candidateId }])
      .select()

    // Normalize client response shape
    const data = (resp as any)?.data ?? (resp as any)
    const error = (resp as any)?.error ?? (resp as any)?.error ?? null

    if (error) {
      // Log full error for debugging
      // eslint-disable-next-line no-console
      console.error('castVote SUPABASE ERROR RAW:', JSON.stringify(error, null, 2))

      const msg = String(error?.message ?? '').toLowerCase()
      const code = String(error?.code ?? '')

      if (
        code === '23505' ||
        msg.includes('duplicate') ||
        msg.includes('unique') ||
        msg.includes('already')
      ) {
        throw new Error('NIM ini sudah digunakan untuk memilih.')
      }

      // fallback: throw original error
      throw error
    }

    return data
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('castVote CATCH:', err)

    const msg = String(err?.message ?? '').toLowerCase()
    const code = String(err?.code ?? '')

    if (
      code === '23505' ||
      msg.includes('duplicate') ||
      msg.includes('unique') ||
      msg.includes('already')
    ) {
      throw new Error('NIM ini sudah digunakan untuk memilih.')
    }

    throw err
  }
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
    if (error.details?.includes('No rows')) return null
    throw error
  }

  return data
}

// 🔄 Realtime subscription to settings changes
export const subscribeToSettings = (callback: (row: any) => void) => {
  return supabase
    .channel('settings-channel')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.1' },
      (payload) => {
        callback(payload.record)
      }
    )
    .subscribe()
}
