import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

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
  // Check if we have valid Supabase configuration
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    throw new Error('Supabase configuration is missing. Please check your environment variables.')
  }

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
  // Check if we have valid Supabase configuration
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    return false // Return false during build time when env vars aren't available
  }

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
