import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  phone: string
  gender?: string
  nsfw_enabled: boolean
  created_at: string
}

export interface Thought {
  id: string
  content: string
  user_id: string
  vibe_tag?: 'funny' | 'deep' | 'horny'
  nsfw_flag: boolean
  gender_target?: string
  created_at: string
  streak_count?: number
  dislike_count?: number
  is_active?: boolean
}

export interface Comment {
  id: string
  thought_id: string
  user_id: string | null
  content: string
  created_at: string
  is_active: boolean
}

export interface Interaction {
  id: string
  user_id: string
  thought_id: string
  type: 'star' | 'share' | 'tag'
  tag_value?: string
  created_at: string
}

export interface Feedback {
  id: string
  session_id: string
  rating: number
  text?: string
  created_at: string
  user_agent?: string
  ip_address?: string
}

// Anonymous session ID logic
export function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('anon_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('anon_session_id', sessionId);
  }
  return sessionId;
} 