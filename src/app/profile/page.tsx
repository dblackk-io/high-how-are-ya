'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getCurrentUser, 
  getNotifications, 
  markNotificationAsRead,
  User,
  Notification 
} from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stats' | 'notifications'>('stats')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser()
      const notificationsData = await getNotifications(20)
      
      setUser(userData)
      setNotifications(notificationsData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl text-[#ff00cc] mb-6 font-semibold">Loading your profile...</div>
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-2 border-[#ff00cc] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#ff00cc]">Your Profile</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === 'stats' 
              ? 'text-[#ff00cc] border-b-2 border-[#ff00cc]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === 'notifications' 
              ? 'text-[#ff00cc] border-b-2 border-[#ff00cc]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Notifications
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span className="ml-2 bg-[#ff00cc] text-black text-xs px-2 py-1 rounded-full">
              {notifications.filter(n => !n.is_read).length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'stats' ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#ff00cc] to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user?.session_id?.slice(-2).toUpperCase() || 'AN'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">Anonymous User</h2>
                  <p className="text-gray-400 text-sm">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff00cc]">{user?.streak_days || 0}</div>
                  <div className="text-gray-400 text-sm">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff00cc]">{user?.total_thoughts || 0}</div>
                  <div className="text-gray-400 text-sm">Thoughts Shared</div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{user?.total_boosts || 0}</div>
                <div className="text-gray-400 text-sm">Total Boosts</div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{user?.total_strikes || 0}</div>
                <div className="text-gray-400 text-sm">Total Strikes</div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{user?.total_comments || 0}</div>
                <div className="text-gray-400 text-sm">Total Comments</div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {user?.preferred_vibes?.length || 0}
                </div>
                <div className="text-gray-400 text-sm">Favorite Vibes</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/exchange/add-thought')}
                className="w-full bg-[#ff00cc] text-black py-3 rounded-xl font-bold hover:bg-[#ff33cc] transition-colors"
              >
                Share New Thought
              </button>
              <button
                onClick={() => router.push('/exchange/feed')}
                className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
              >
                Back to Feed
              </button>
              <button
                onClick={handleSignOut}
                className="w-full bg-red-900 text-white py-3 rounded-xl font-bold hover:bg-red-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No notifications yet</div>
                <div className="text-gray-500 text-sm">Interact with thoughts to get notifications!</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gradient-to-br from-gray-900 to-black border rounded-xl p-4 transition-colors ${
                    notification.is_read 
                      ? 'border-gray-800 opacity-60' 
                      : 'border-[#ff00cc]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          notification.type === 'boost' ? 'bg-green-900 text-green-300' :
                          notification.type === 'strike' ? 'bg-red-900 text-red-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {notification.type}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-white">{notification.message}</p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-[#ff00cc] text-sm hover:text-[#ff33cc] transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
} 