import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our waitlist table
export interface WaitlistEntry {
  id: string
  email: string
  created_at: string
  updated_at: string
}

// Function to add email to waitlist
export async function addToWaitlist(email: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([{ email }])
    .select()
    .single()

  if (error) {
    // Handle duplicate key error specifically
    if (error.code === '23505') {
      throw new Error('This email is already registered!')
    }
    throw error
  }

  return data
}

// Function to check if email already exists
export async function checkEmailExists(email: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .select('email')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw error
  }

  return !!data
}
