import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  session_id: string
  created_at: string
  last_active: string
  preferred_vibes: string[]
  total_thoughts: number
  total_boosts: number
  total_strikes: number
  total_comments: number
  streak_days: number
  last_thought_date?: string
}

export interface Thought {
  id: string
  content: string
  user_id: string
  vibe_tag?: 'funny' | 'deep' | 'horny' | 'weird' | 'relationships' | 'nsfw'
  nsfw_flag: boolean
  gender_target?: string
  created_at: string
  streak_count?: number
  dislike_count?: number
  is_active?: boolean
}

export interface UserThoughtStats {
  id: string
  user_id: string
  thought_id: string
  boost_count: number
  strike_count: number
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  thought_id: string
  type: 'boost' | 'strike' | 'comment'
  message: string
  is_read: boolean
  created_at: string
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

// User system helper functions
export async function getCurrentUser() {
  // First try to get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (authUser) {
    // User is authenticated, get their profile
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching authenticated user:', error);
      return null;
    }
    
    return data;
  }
  
  // Fallback to session-based user
  const sessionId = getSessionId();
  if (!sessionId) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('session_id', sessionId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching session user:', error);
    return null;
  }
  
  return data;
}

export async function createOrUpdateUser() {
  // First try to get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (authUser) {
    // User is authenticated, create/update their profile
    const { data, error } = await supabase
      .from('users')
      .upsert([
        {
          id: authUser.id,
          session_id: authUser.user_metadata?.anonymous_id || `auth_${authUser.id}`,
          last_active: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating/updating authenticated user:', error);
      return null;
    }
    
    return data;
  }
  
  // Fallback to session-based user
  const sessionId = getSessionId();
  if (!sessionId) return null;
  
  const { data, error } = await supabase
    .rpc('get_or_create_user', { session_id_param: sessionId });
    
  if (error) {
    console.error('Error creating/updating session user:', error);
    return null;
  }
  
  return data;
}

export async function updateThoughtStats(thoughtId: string, actionType: 'boost' | 'strike' | 'comment' | 'view') {
  const { error } = await supabase
    .rpc('update_thought_stats', { 
      thought_id_param: thoughtId, 
      action_type: actionType 
    });
    
  if (error) {
    console.error('Error updating thought stats:', error);
  }
}

export async function createNotification(thoughtId: string, type: 'boost' | 'strike' | 'comment', message: string) {
  const { error } = await supabase
    .rpc('create_notification', { 
      thought_id_param: thoughtId, 
      notification_type: type, 
      message_param: message 
    });
    
  if (error) {
    console.error('Error creating notification:', error);
  }
}

export async function getUserThoughtStats(thoughtId: string) {
  const sessionId = getSessionId();
  if (!sessionId) return null;
  
  const { data, error } = await supabase
    .from('user_thought_stats')
    .select('*')
    .eq('thought_id', thoughtId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching thought stats:', error);
    return null;
  }
  
  return data;
}

export async function getNotifications(limit = 10) {
  const sessionId = getSessionId();
  if (!sessionId) return [];
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  
  return data || [];
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
    
  if (error) {
    console.error('Error marking notification as read:', error);
  }
} 