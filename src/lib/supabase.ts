import { createClient } from '@supabase/supabase-js'

// ✅ Replace with your own Supabase credentials
const SUPABASE_URL = 'https://nefmhaldrtwwqvuatmhx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZm1oYWxkcnR3d3F2dWF0bWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjMyMzMsImV4cCI6MjA3ODUzOTIzM30.m7nRApDqjYTVxAtbFTKacAZZc8il16mt3xSUntrLGNU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
