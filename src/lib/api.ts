// src/lib/api.ts
import { supabase } from './supabase'

/**
 * Validate that a NIM exists in students table.
 */
export const validateNim = async (nim: string) => {
  if (!nim) return false
  const { data, error } = await supabase
    .from('students')
    .select('nim')
    .eq('nim', nim)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('validateNim error', error)
    throw error
  }
  return !!data
}

/** Fetch all candidates */
export const getCandidates = async () => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

/** Fetch single candidate by id */
export const getCandidateById = async (id: string) => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

/** Submit a vote — Option A: verify student exists then insert (prevent duplicates) */
export const castVote = async (nim: string, candidateId: string) => {
  if (!nim) throw new Error('NIM kosong')

  // 1) ensure student exists
  const exists = await validateNim(nim)
  if (!exists) {
    throw new Error('NIM tidak terdaftar.')
  }

  // 2) check duplicate (same nim already voted)
  const { data: existing, error: checkErr } = await supabase
    .from('votes')
    .select('id')
    .eq('nim', nim)
    .limit(1)

  if (checkErr) {
    console.error('castVote checkErr', checkErr)
    throw checkErr
  }
  if (existing && (existing as any[]).length > 0) {
    throw new Error('NIM ini sudah digunakan untuk memilih.')
  }

  // 3) insert
  const { error } = await supabase
    .from('votes')
    .insert([{ nim, candidate_id: candidateId }])

  if (error) {
    // relay supabase error
    throw error
  }

  return true
}

/** Get vote counts (returns rows of votes or aggregate depending on use) */
export const getVoteCounts = async () => {
  // We'll return raw votes rows (caller can aggregate)
  const { data, error } = await supabase
    .from('votes')
    .select('candidate_id') // you can extend to counts via RPC if preferred

  if (error) throw error
  return data ?? []
}

/** Realtime vote subscription (INSERT) */
export const subscribeToVotes = (callback: () => void) => {
  return supabase
    .channel('realtime-votes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, callback)
    .subscribe()
}

/** Settings helpers (single row) */
export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export const subscribeToSettings = (callback: (row: any) => void) => {
  return supabase
    .channel('realtime-settings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
      // payload.record contains the updated row for update/insert events
      callback(payload.record)
    })
    .subscribe()
}
