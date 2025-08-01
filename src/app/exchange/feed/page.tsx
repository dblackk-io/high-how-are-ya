"use client"

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Comment, getSessionId, updateThoughtStats, createNotification, createOrUpdateUser } from '@/lib/supabase'
import { googleVoiceService } from '@/lib/google-voice-service'
import ThoughtSubmit from '@/components/ThoughtSubmit'
import ReportModal from '@/components/ReportModal'


interface Thought {
  id: string
  content: string
  user_id: string | null
  vibe_tag?: string
  nsfw_flag: boolean
  created_at: string
  streak_count?: number
  dislike_count?: number
  is_active?: boolean
  amplified_by?: string[]
  amplify_count?: number
  // New recommendation system fields
  views?: number
  boost_rate?: number
  strike_rate?: number
  comment_rate?: number
  avg_time_spent?: number
  completion_rate?: number
  topic_tags?: string[]
  sentiment_score?: number
  complexity_level?: number
}

interface UserInteraction {
  thought_id: string
  action: 'boost' | 'strike' | 'comment' | 'view'
  time_spent?: number
  completion_rate?: number
  timestamp: Date
}

interface UserProfile {
  id: string
  preferred_vibes: string[]
  engagement_history: UserInteraction[]
  similarity_scores: { user_id: string; similarity: number }[]
  total_views: number
  total_boosts: number
  total_strikes: number
  total_comments: number
  streak_days: number
  last_activity: string
  created_at: string
}

function FeedPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const topics = useMemo(() => {
    return searchParams.get('topics')?.split(',') || []
  }, [searchParams])


  
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showIntroModal, setShowIntroModal] = useState(true)
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Force intro modal to show (remove this line after testing)
  useEffect(() => {
    setShowIntroModal(true)
  }, [])

  const [showComments, setShowComments] = useState(false);
  const [showUserStats, setShowUserStats] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Recommendation system state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [thoughtMetrics, setThoughtMetrics] = useState<{ [thoughtId: string]: { views: number; boosts: number; strikes: number; comments: number } }>({});
  const [viewStartTime, setViewStartTime] = useState<number>(0);
  const [currentThoughtId, setCurrentThoughtId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('sophia');
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Generate deterministic random values for animations to prevent hydration mismatch
  const animationValues = useMemo(() => {
    const values = {
      orbs: Array.from({ length: 8 }, (_, i) => ({
        width: 100 + (i * 23.7) % 200,
        height: 100 + (i * 31.4) % 200,
        left: (i * 12.5) % 100,
        top: (i * 18.3) % 100,
        duration: 4 + (i * 0.8) % 3
      })),
      particles: Array.from({ length: 20 }, (_, i) => ({
        left: (i * 5.2) % 100,
        top: (i * 7.8) % 100,
        duration: 2 + (i * 0.3) % 2
      })),
      thoughtParticles: Array.from({ length: 6 }, (_, i) => ({
        left: (i * 16.7) % 100,
        top: (i * 14.3) % 100,
        duration: 3 + (i * 0.4) % 2
      })),
      cardParticles: Array.from({ length: 3 }, (_, i) => ({
        left: 20 + i * 30,
        top: 10 + i * 20,
        duration: 4 + i
      }))
    };
    return values;
  }, []);



  // Prevent background scrolling when comments are open
  useEffect(() => {
    if (showComments) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showComments]);

  // Start tracking view time when current thought changes
  useEffect(() => {
    console.log('effect fired');
    const currentThought = getCurrentThought();
    if (!currentThought) return;
    if (currentThought.id === currentThoughtId) return; // ✅ prevents loop
    setViewStartTime(Date.now());
    setCurrentThoughtId(currentThought.id);
  }, [currentIndex, thoughts, currentThoughtId]);





  // Recommendation system functions
  const initializeUserProfile = () => {
    // Get or create persistent user ID
    let userId = localStorage.getItem('high-how-are-ya-user-id');
    if (!userId) {
      userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('high-how-are-ya-user-id', userId);
    }

    const profile: UserProfile = {
      id: userId,
      preferred_vibes: [],
      engagement_history: [],
      similarity_scores: [],
      total_views: 0,
      total_boosts: 0,
      total_strikes: 0,
      total_comments: 0,
      streak_days: 0,
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    setUserProfile(profile);
    return profile;
  };

  const trackUserInteraction = async (thoughtId: string, action: 'boost' | 'strike' | 'comment' | 'view', timeSpent?: number, completionRate?: number) => {
    // Initialize user profile if it doesn't exist
    if (!userProfile) {
      initializeUserProfile();
      return; // Return this time, next interaction will work
    }

    // Check if user already interacted with this thought (prevent duplicates)
    const existingInteraction = userProfile.engagement_history.find(i => i.thought_id === thoughtId && i.action === action);
    if (existingInteraction) {
      return;
    }

    const interaction: UserInteraction = {
      thought_id: thoughtId,
      action,
      time_spent: timeSpent,
      completion_rate: completionRate,
      timestamp: new Date()
    };

    const updatedProfile = {
      ...userProfile,
      engagement_history: [...userProfile.engagement_history, interaction],
      total_views: action === 'view' ? userProfile.total_views + 1 : userProfile.total_views,
      total_boosts: action === 'boost' ? userProfile.total_boosts + 1 : userProfile.total_boosts,
      total_strikes: action === 'strike' ? userProfile.total_strikes + 1 : userProfile.total_strikes,
      total_comments: action === 'comment' ? userProfile.total_comments + 1 : userProfile.total_comments,
      last_activity: new Date().toISOString()
    };

    setUserProfile(updatedProfile);
    
    // Update thought metrics immediately for real-time counter updates
    const currentMetrics = thoughtMetrics[thoughtId] || { views: 0, boosts: 0, strikes: 0, comments: 0 };
    const updatedMetrics = {
      ...currentMetrics,
      views: action === 'view' ? currentMetrics.views + 1 : currentMetrics.views,
      boosts: action === 'boost' ? currentMetrics.boosts + 1 : currentMetrics.boosts,
      strikes: action === 'strike' ? currentMetrics.strikes + 1 : currentMetrics.strikes,
      comments: action === 'comment' ? currentMetrics.comments + 1 : currentMetrics.comments
    };
    
    setThoughtMetrics(prev => ({
      ...prev,
      [thoughtId]: updatedMetrics
    }));

    // Save to localStorage
    localStorage.setItem('high-how-are-ya-user-profile', JSON.stringify(updatedProfile));
    
    // Save interaction to database
    try {
      // Get the current authenticated user or session
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userId = authUser?.id || null;
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('interactions')
        .insert([
          {
            thought_id: thoughtId,
            user_id: userId, // Use authenticated user ID if available
            session_id: sessionId, // Fallback to session ID
            action,
            time_spent: timeSpent,
            completion_rate: completionRate
          }
        ]);

      if (error) {
        console.error('Database interaction error:', error);
      }
    } catch (err) {
      console.error('Interaction saving error:', err);
    }
    
    // Check if user has seen 10 thoughts and show feedback modal
    const viewInteractions = updatedProfile.engagement_history.filter(i => i.action === 'view');
    if (viewInteractions.length === 10 && !localStorage.getItem('feedback-shown')) {
      setTimeout(() => setShowFeedbackModal(true), 1000); // Show after 1 second
      localStorage.setItem('feedback-shown', 'true');
    }
    

  };







  const calculateRecommendationScore = (thought: Thought): number => {
    if (!userProfile) return 0.5;
    
    let score = 0;
    const sessionId = getSessionId();
    
    // Base score
    score += 0.2;
    
    // Exclude user's own thoughts (they shouldn't see their own thoughts in feed)
    if (thought.user_id === userProfile.id) {
      return 0;
    }
    
    // Exclude thoughts the user has already amplified
    if (thought.amplified_by?.includes(sessionId || '')) {
      return 0;
    }
    
    // Exclude thoughts the user has already seen/interacted with
    const userInteractions = userProfile.engagement_history;
    const userViewedThoughts = userInteractions.filter(i => i.action === 'view').map(i => i.thought_id);
    const userBoostedThoughts = userInteractions.filter(i => i.action === 'boost').map(i => i.thought_id);
    const userStruckThoughts = userInteractions.filter(i => i.action === 'strike').map(i => i.thought_id);
    
    // Don't show thoughts the user has already seen
    if (userViewedThoughts.includes(thought.id)) {
      return 0;
    }
    
    // PERSONALIZATION (70% weight)
    
    // Personality matching (15% weight)
    const personality = localStorage.getItem('high-how-are-ya-personality');
    if (personality && thought.vibe_tag === personality) {
      score += 0.15;
    }
    
    // User behavior learning (15% weight)
    if (userBoostedThoughts.length > 0) {
      const boostedThoughts = thoughts.filter(t => userBoostedThoughts.includes(t.id));
      const boostedVibes = boostedThoughts.map(t => t.vibe_tag).filter(Boolean);
      if (boostedVibes.includes(thought.vibe_tag)) {
        score += 0.15;
      }
    }
    
    // If user has struck similar thoughts, decrease score
    if (userStruckThoughts.length > 0) {
      const struckThoughts = thoughts.filter(t => userStruckThoughts.includes(t.id));
      const struckVibes = struckThoughts.map(t => t.vibe_tag).filter(Boolean);
      if (struckVibes.includes(thought.vibe_tag)) {
        score -= 0.1;
      }
    }
    
    // Amplification boost (thoughts amplified by others get higher score)
    const amplificationBoost = Math.min((thought.amplify_count || 0) * 0.1, 0.3);
    score += amplificationBoost;
    
    return Math.min(1, Math.max(0, score));
  };

  const sortThoughtsByRecommendation = (thoughts: Thought[]): Thought[] => {
    
    const scoredThoughts = thoughts.map(thought => {
      const score = calculateRecommendationScore(thought);
      
      // Add user-specific randomization to prevent same order for everyone
      const userSeed = userProfile?.id ? parseInt(userProfile.id.split('-').pop() || '0', 36) : 0;
      const thoughtSeed = parseInt(thought.id.split('-').pop() || '0', 36);
      const randomFactor = ((userSeed + thoughtSeed) % 1000) / 10000; // Small random factor
      
      const finalScore = score + randomFactor;
      

      
      return { thought, score: finalScore };
    });
    
    // Filter out thoughts with zero score (user's own thoughts)
    const filteredThoughts = scoredThoughts.filter(item => item.score > 0);
    
    // Shuffle the top 10 thoughts to add more variety
    const sorted = filteredThoughts
      .sort((a, b) => b.score - a.score)
      .map(item => item.thought);
    
    // Shuffle first 10 thoughts for variety while keeping high-scoring thoughts near top
    if (sorted.length > 10) {
      const topThoughts = sorted.slice(0, 10);
      const remainingThoughts = sorted.slice(10);
      
      // Fisher-Yates shuffle for top thoughts
      for (let i = topThoughts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topThoughts[i], topThoughts[j]] = [topThoughts[j], topThoughts[i]];
      }
      
      return [...topThoughts, ...remainingThoughts];
    }
    

    
    return sorted;
  };



  // Text-to-Speech and Animation Functions
  const speakThought = async () => {
    const currentThought = getCurrentThought();
    if (!currentThought) return;

    // Stop any currently playing audio
    stopSpeaking();
    
    try {
      // Cancel any existing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Synthesize speech using Google Cloud TTS
      const audioBuffer = await googleVoiceService.synthesizeSpeech(
        currentThought.content,
        selectedVoice
      );

      // Create audio element and play
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      // Store the current audio for stopping later
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
        // Fallback to Web Speech API
        googleVoiceService.fallbackSpeak(currentThought.content);
      };

      await audio.play();
      
    } catch (err) {
      console.error('Voice error:', err);
      setCurrentAudio(null);
      
      // Fallback to Web Speech API
      googleVoiceService.fallbackSpeak(currentThought.content);
    }
  };

  const stopSpeaking = () => {
    // Stop Google Cloud TTS audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    // Stop Web Speech API
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };



  const fetchThoughtStats = async (thoughtId: string) => {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select('action')
        .eq('thought_id', thoughtId);

      if (error) {
        return { views: 0, boosts: 0, strikes: 0, comments: 0 };
      }

      const stats = {
        views: data.filter(i => i.action === 'view').length,
        boosts: data.filter(i => i.action === 'boost').length,
        strikes: data.filter(i => i.action === 'strike').length,
        comments: data.filter(i => i.action === 'comment').length
      };

      setThoughtMetrics(prev => ({
        ...prev,
        [thoughtId]: stats
      }));

      return stats;
    } catch (err) {
      console.error('Fetch stats error:', err);
      return { views: 0, boosts: 0, strikes: 0, comments: 0 };
    }
  };

  const fetchThoughts = async (pageNum = 0) => {
    if (pageNum === 0) {
      setIsLoading(true)
      setThoughts([])
    }

    try {
      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Handle NSFW filtering based on age selection
      const searchParams = new URLSearchParams(window.location.search)
      const ageGroup = searchParams.get('age')
      if (ageGroup === 'under18') {
        query = query.eq('nsfw_flag', false)
      }

      const { data: rawData, error } = await query

      if (error) {
        throw error
      }

      // No topic filtering - show all thoughts like TikTok FYP
      const data = rawData

      if (pageNum === 0) {
        // Initialize user profile for tracking interactions
        if (!userProfile) {
          initializeUserProfile();
        }
        
        // Sort thoughts by topic-based recommendation score
        const sortedThoughts = sortThoughtsByRecommendation(data || []);
        
        // Fetch stats for each thought
        for (const thought of sortedThoughts) {
          await fetchThoughtStats(thought.id);
        }
        
        setThoughts(sortedThoughts);
      } else {
        const newThoughts = data || [];
        const sortedNewThoughts = sortThoughtsByRecommendation(newThoughts);
        
        // Fetch stats for new thoughts
        for (const thought of sortedNewThoughts) {
          await fetchThoughtStats(thought.id);
        }
        
        setThoughts(prev => [...prev, ...sortedNewThoughts]);
      }

      setHasMore(false) // No more pagination since we load all thoughts at once
      setPage(pageNum)

    } catch (error) {
      console.error('Error fetching thoughts:', error)
      // Show sample data as fallback
      if (pageNum === 0) {
        const sampleThoughts = [
          {
            id: '1',
            content: 'Sometimes I wonder if we\'re all just characters in someone else\'s simulation, and they\'re watching us figure out the rules.',
            user_id: null,
            vibe_tag: 'deep',
            nsfw_flag: false,
            created_at: new Date().toISOString(),
            streak_count: 42,
            dislike_count: 3,
            is_active: true
          },
          {
            id: '2',
            content: 'I\'m not lazy, I\'m just conserving energy for when I actually need it.',
            user_id: null,
            vibe_tag: 'funny',
            nsfw_flag: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            streak_count: 28,
            dislike_count: 1,
            is_active: true
          },
          {
            id: '3',
            content: 'The most intimate moments aren\'t always physical - sometimes they\'re just two souls connecting.',
            user_id: null,
            vibe_tag: 'relationships',
            nsfw_flag: false,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            streak_count: 15,
            dislike_count: 0,
            is_active: true
          },
          {
            id: '4',
            content: 'What if clouds are just cotton candy that got too high and forgot how to come down?',
            user_id: null,
            vibe_tag: 'weird',
            nsfw_flag: false,
            created_at: new Date(Date.now() - 10800000).toISOString(),
            streak_count: 33,
            dislike_count: 2,
            is_active: true
          }
        ]
        setThoughts(sampleThoughts)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchThoughts()
  }, [topics])





  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchThoughts(page + 1)
    }
  }

  const nextThought = () => {
    console.log('nextThought clicked');
    // Track view completion for current thought
    const currentThought = thoughts[currentIndex];
    if (currentThought && viewStartTime > 0) {
      const timeSpent = Date.now() - viewStartTime;
      const completionRate = timeSpent > 3000 ? 1 : timeSpent / 3000; // 3 seconds = full completion
      trackUserInteraction(currentThought.id, 'view', timeSpent, completionRate);
    }
    
    if (currentIndex < thoughts.length - 1) {
      setCurrentIndex(currentIndex + 1)
      // Start tracking view time for next thought
      setViewStartTime(Date.now());
      setCurrentThoughtId(thoughts[currentIndex + 1]?.id || null);
    } else if (hasMore) {
      // Load more thoughts and move to next
      loadMore()
      setCurrentIndex(currentIndex + 1)
      setViewStartTime(Date.now());
      setCurrentThoughtId(thoughts[currentIndex + 1]?.id || null);
    } else {
      // No more thoughts, refresh the feed to get new content
      setTimeout(() => {
        fetchThoughts(0);
        setCurrentIndex(0);
      }, 50);
      setViewStartTime(Date.now());
    }
  }



  const getCurrentThought = () => {
    const thought = thoughts[currentIndex] || null
    if (!thought) return null
    return thought
  }

  const getTopicDisplay = () => {
    if (topics.length === 0) return 'Live feed'
    return topics.join(', ')
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const handleSubmitThought = async (thought: string, vibe: string, nsfw: boolean) => {
    try {
      // Create or update user profile first
      const user = await createOrUpdateUser();
      if (!user) {
        throw new Error('Failed to create user profile');
      }
      
      const { error } = await supabase
        .from('thoughts')
        .insert([
          {
            content: thought,
            user_id: user.id, // Link thought to the user who created it
            vibe_tag: vibe || 'deep', // Default to deep if no vibe selected
            nsfw_flag: nsfw,
            is_active: true,
            streak_count: 0,
            dislike_count: 0
          }
        ]);

      if (error) {
        throw error;
      }

      // Refresh thoughts to include the new one
      await fetchThoughts(0);
      setCurrentIndex(0);
      
    } catch (error) {
      console.error('Error submitting thought:', error);
      throw error;
    }
  };

  // Fetch comments for a specific thought
  const fetchComments = async (thoughtId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('thought_id', thoughtId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        // Set empty array if table doesn't exist yet
        setComments([]);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Set empty array if table doesn't exist yet
      setComments([]);
    }
  };

  // Submit a new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !getCurrentThought()) return;

    setIsSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            thought_id: getCurrentThought()!.id,
            user_id: null, // Always null for anonymous comments
            content: newComment.trim(),
            is_active: true
          }
        ]);

      if (error) {
        console.error('Error submitting comment:', error);
        // Show user-friendly message
        alert('Comments feature is being set up. Your interaction has been tracked!');
        // Still track the interaction even if comment fails
        trackUserInteraction(getCurrentThought()!.id, 'comment');
        setNewComment('');
        return;
      }

      // Track the comment interaction
      trackUserInteraction(getCurrentThought()!.id, 'comment');
      
      // Update user stats and create notification
      await updateThoughtStats(getCurrentThought()!.id, 'comment');
      
      // Only create notification if the thought has an owner
      if (getCurrentThought()!.user_id) {
        await createNotification(
          getCurrentThought()!.id, 
          'comment', 
          `Someone commented on your thought: "${getCurrentThought()!.content.slice(0, 50)}${getCurrentThought()!.content.length > 50 ? '...' : ''}"`
        );
      }
      
      // Refresh comments
      await fetchComments(getCurrentThought()!.id);
      
      // Clear the input
      setNewComment('');
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Show user-friendly message
      alert('Comments feature is being set up. Your interaction has been tracked!');
      // Still track the interaction even if comment fails
      trackUserInteraction(getCurrentThought()!.id, 'comment');
      setNewComment('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Load comments when comments panel is opened
  const handleOpenComments = () => {
    const currentThought = getCurrentThought();
    if (currentThought) {
      fetchComments(currentThought.id);
      setShowComments(true);
    }
  };

  // Amplify a thought
  const handleAmplify = async () => {
    const currentThought = getCurrentThought();
    if (!currentThought) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      // Check if user already amplified this thought
      if (currentThought.amplified_by?.includes(sessionId)) {
        return; // Already amplified
      }

      // Update the thought with new amplify data
      const newAmplifiedBy = [...(currentThought.amplified_by || []), sessionId];
      const newAmplifyCount = (currentThought.amplify_count || 0) + 1;

      const { error } = await supabase
        .from('thoughts')
        .update({
          amplified_by: newAmplifiedBy,
          amplify_count: newAmplifyCount
        })
        .eq('id', currentThought.id);

      if (error) {
        console.error('Error amplifying thought:', error);
        return;
      }

      // Track the interaction
      trackUserInteraction(currentThought.id, 'comment'); // Using comment as closest action type

      // Update local state
      setThoughts(prevThoughts => 
        prevThoughts.map(thought => 
          thought.id === currentThought.id 
            ? { ...thought, amplified_by: newAmplifiedBy, amplify_count: newAmplifyCount }
            : thought
        )
      );

      // Don't call nextThought() here to avoid double tracking
      // nextThought() will be called by the swipe gesture or navigation

    } catch (error) {
      console.error('Error amplifying thought:', error);
    }
  };



  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackRating) return;
    
    setIsSubmittingFeedback(true);
    try {
      // Save feedback to database
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            session_id: getSessionId(),
            rating: feedbackRating,
            text: feedbackText || null,
            user_agent: navigator.userAgent
          }
        ]);

      if (error) {
        console.error('Error submitting feedback:', error);
        // Fallback to localStorage if database fails
        const feedback = {
          rating: feedbackRating,
          text: feedbackText,
          timestamp: new Date().toISOString(),
          sessionId: getSessionId()
        };
        
        const existingFeedback = JSON.parse(localStorage.getItem('user-feedback') || '[]');
        existingFeedback.push(feedback);
        localStorage.setItem('user-feedback', JSON.stringify(existingFeedback));
      }
      
      // Close modal
      setShowFeedbackModal(false);
      setFeedbackRating(null);
      setFeedbackText('');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  


  // Force intro modal to show (temporarily disabled localStorage check)
  useEffect(() => {
    // const hasSeenIntro = localStorage.getItem('high-how-are-ya-intro-seen');
    // if (hasSeenIntro === 'true') {
    //   setShowIntroModal(false);
    // }
    setShowIntroModal(true);
  }, []);

  const handleCloseIntroModal = () => {
    setShowIntroModal(false);
    localStorage.setItem('high-how-are-ya-intro-seen', 'true');
  };

  // Handle escape key to close intro modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showIntroModal) {
        handleCloseIntroModal();
      }
    };

    if (showIntroModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showIntroModal]);

  // Auto-close intro modal after 30 seconds as fallback
  useEffect(() => {
    if (showIntroModal) {
      const timer = setTimeout(() => {
        console.log('Auto-closing intro modal after timeout');
        handleCloseIntroModal();
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [showIntroModal]);

  const currentThought = getCurrentThought();

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-[#ff00cc]/10"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 0, 204, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 0, 204, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>
        
        {/* Floating Orbs */}
        {animationValues.orbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-xl animate-pulse"
            style={{
              width: `${orb.width}px`,
              height: `${orb.height}px`,
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              background: `radial-gradient(circle, rgba(255, 0, 204, 0.1) 0%, transparent 70%)`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${orb.duration}s`
            }}
          />
        ))}
        
        {/* Animated Lines */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#ff00cc] to-transparent opacity-30"
            style={{
              width: '100%',
              top: `${20 + i * 15}%`,
              animation: `lineFloat ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1}s`
            }}
          />
        ))}
        
        {/* Particle System */}
        <div className="absolute inset-0 overflow-hidden">
          {animationValues.particles.map((particle, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-[#ff00cc] rounded-full animate-ping"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>


      </div>
      
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black neon-title uppercase tracking-tight" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
              What&apos;s Everyone Thinking
            </h1>
            <p className="text-lg text-gray-400 mt-2 hidden sm:block">
              {getTopicDisplay()}
            </p>
          </div>
          <button
            onClick={() => router.push('/exchange/topics')}
            className="neon-btn text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-lg uppercase tracking-wider"
            style={{
              background: 'transparent',
              borderColor: '#666',
              color: '#666',
              boxShadow: '0 0 20px #666'
            }}
          >
            Change Topics
          </button>
        </div>
      </div>

      {/* Intro Modal */}
      {showIntroModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" 
          style={{ animation: 'fadeIn 0.3s ease-out' }}
          onClick={handleCloseIntroModal}
        >
          <div 
            className="bg-black/90 border border-gray-800 rounded-3xl p-8 max-w-md mx-4 relative" 
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button for emergency */}
            <button
              onClick={handleCloseIntroModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
              style={{ zIndex: 60 }}
            >
              ×
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Welcome to Thought Flow</h2>
              
              <div className="space-y-6 text-gray-300 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Boost</div>
                    <div className="text-sm">Save, repost, and like thoughts you love</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Strike</div>
                                            <div className="text-sm">Remove thoughts you don&apos;t want to see</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 border border-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Comment</div>
                    <div className="text-sm">Share your thoughts and join the conversation</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center">
                    <div className="relative w-5 h-5">
                      {/* Person 1 */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      {/* Person 2 */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      {/* Connection line */}
                      <div className="absolute left-0.75 top-1/2 transform -translate-y-1/2 w-3.5 h-0.5 bg-gradient-to-r from-purple-400 to-purple-300"></div>
                    </div>
                  </div>
                  <div>
                                            <div className="font-semibold text-white">Ditto</div>
                                            <div className="text-sm">That&apos;s what you were thinking</div>
                  </div>
                </div>
                

              </div>
              
              <button
                onClick={handleCloseIntroModal}
                className="mt-8 px-8 py-3 bg-[#ff00cc] text-black font-bold rounded-full hover:bg-[#ff33cc] transition-all duration-300 hover:scale-105"
              >
                Let&apos;s Go! 🚀
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Thought Stats Modal */}
                      {showUserStats && currentThought && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-black/90 border border-gray-800 rounded-3xl p-8 max-w-md mx-4 animate-slideUp">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Thought Stats</h2>
              
              {/* Thought Content Preview */}
              <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                                  <p className="text-sm text-gray-300 italic">&quot;{currentThought?.content.substring(0, 100)}...&quot;</p>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 text-center">
                                          <div className="text-2xl font-bold text-green-400">{currentThought?.streak_count || 0}</div>
                    <div className="text-sm text-gray-400">Boosts</div>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 text-center">
                                          <div className="text-2xl font-bold text-red-400">{currentThought?.dislike_count || 0}</div>
                    <div className="text-sm text-gray-400">Strikes</div>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl font-bold text-blue-400">{comments.length}</div>
                    <div className="text-sm text-gray-400">Comments</div>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl font-bold text-purple-400">{currentThought?.amplify_count || 0}</div>
                    <div className="text-sm text-gray-400">Dittos</div>
                  </div>
                </div>
                
                {/* Total Interactions */}
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 text-center">
                  <div className="text-2xl font-bold text-[#ff00cc]">
                    {(currentThought?.streak_count || 0) + (currentThought?.dislike_count || 0) + comments.length}
                  </div>
                  <div className="text-sm text-gray-400">Total Interactions</div>
                </div>
              </div>
              
              <button
                onClick={() => setShowUserStats(false)}
                className="mt-6 px-8 py-3 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-black/90 border border-gray-800 rounded-3xl p-8 max-w-md mx-4 animate-slideUp">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">How&apos;s it going?</h2>
              <p className="text-gray-300 mb-6">You&apos;ve seen 10 thoughts! We&apos;d love to hear your feedback.</p>
              
              {/* Rating */}
              <div className="mb-6">
                <p className="text-white font-semibold mb-3">Rate your experience:</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        feedbackRating && feedbackRating >= star
                          ? 'bg-[#ff00cc] text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Text Feedback */}
              <div className="mb-6">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think (optional)..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
              </div>
              
              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackRating(null);
                    setFeedbackText('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition-all duration-300"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackRating || isSubmittingFeedback}
                  className="flex-1 px-6 py-3 bg-[#ff00cc] text-white font-bold rounded-full hover:bg-[#ff33cc] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingFeedback ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        thoughtId={currentThought?.id || ''}
        thoughtContent={currentThought?.content || ''}
      />

      {/* Story-Style Feed Container */}
      <div className="w-full h-screen relative overflow-hidden">
        
        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-3">
          {/* Profile Button - Only show for authenticated users */}
          {isAuthenticated && (
            <div className="group">
              <button
                onClick={() => router.push('/profile')}
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center shadow-2xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 relative border border-gray-700"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none" style={{
                  boxShadow: "0 0 15px rgba(255, 0, 204, 0.3)"
                }}>
                  Your Profile
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              </button>
            </div>
          )}
          
          {/* Sign Up Button - Only show for unauthenticated users */}
          {!isAuthenticated && (
            <div className="group">
              <button
                onClick={() => router.push('/signup')}
                className="w-12 h-12 bg-[#ff00cc] rounded-full flex items-center justify-center shadow-2xl hover:bg-[#ff33cc] transition-all duration-300 transform hover:scale-110 relative"
                style={{
                  boxShadow: "0 0 30px rgba(255, 0, 204, 0.6)"
                }}
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none" style={{
                  boxShadow: "0 0 15px rgba(255, 0, 204, 0.3)"
                }}>
                  Sign Up
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              </button>
            </div>
          )}

          {/* Plus Button */}
          <div className="group">
            <button
              onClick={() => router.push('/exchange/add-thought')}
              className="w-16 h-16 bg-[#ff00cc] rounded-full flex items-center justify-center shadow-2xl hover:bg-[#ff33cc] transition-all duration-300 transform hover:scale-110 relative"
              style={{
                boxShadow: "0 0 30px rgba(255, 0, 204, 0.6)"
              }}
            >
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none" style={{
                boxShadow: "0 0 15px rgba(255, 0, 204, 0.3)"
              }}>
                Add a thought
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            </button>
          </div>
        </div>

        {isLoading && thoughts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-3xl text-[#ff00cc] mb-6 font-semibold">Loading your thoughts...</div>
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 border-2 border-[#ff00cc] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-gray-400">Finding thoughts that match your vibe</div>
            </div>
          </div>
        ) : thoughts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-3xl text-gray-400 mb-6">No thoughts found</div>
              <button
                onClick={() => router.push('/seed')}
                className="neon-btn text-lg px-8 py-4 font-bold rounded-lg uppercase tracking-wider"
                style={{
                  background: 'transparent',
                  borderColor: '#ff00cc',
                  color: '#ff00cc',
                  boxShadow: '0 0 20px #ff00cc'
                }}
              >
                Populate Database
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-full">


            {/* Current Thought Story */}
            {currentThought && (
              <div className="h-full flex items-center justify-center relative animate-fadeIn">
                {/* Background Gradient with Animation */}
                <div 
                  className="absolute inset-0 opacity-20 animate-pulse"
                  style={{
                    background: `linear-gradient(45deg, ${
                      currentThought?.vibe_tag === 'deep' ? '#3b82f6' :
                      currentThought?.vibe_tag === 'funny' ? '#f59e0b' :
                      currentThought?.vibe_tag === 'weird' ? '#8b5cf6' :
                      currentThought?.vibe_tag === 'relationships' ? '#ec4899' :
                      currentThought?.vibe_tag === 'nsfw' ? '#dc2626' :
                      '#ef4444'
                    }, transparent)`
                  }}
                />
                
                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {animationValues.thoughtParticles.map((particle, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
                      style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: `${particle.duration}s`
                      }}
                    />
                  ))}
                </div>
                
                {/* Enhanced Thought Card */}
                <div className="relative z-10 w-full max-w-sm sm:max-w-lg mx-2 sm:mx-8 animate-slideUp">
                  <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-[#ff00cc] rounded-3xl p-3 sm:p-6 shadow-2xl relative overflow-hidden" style={{
                    boxShadow: '0 0 40px rgba(255, 0, 204, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff00cc]/5 via-transparent to-purple-600/5 animate-pulse rounded-3xl"></div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {animationValues.cardParticles.map((particle, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-[#ff00cc]/30 rounded-full animate-float"
                          style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${particle.duration}s`
                          }}
                        />
                      ))}
                    </div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#ff00cc] via-purple-600 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg relative overflow-hidden" style={{
                              boxShadow: '0 0 20px rgba(255, 0, 204, 0.3)'
                            }}>
                              {currentThought?.user_id
                                ? currentThought.user_id.slice(0, 2).toUpperCase()
                                : 'AI'}
                              {/* Freaky AI effects */}
                              {!currentThought?.user_id && (
                                <>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{
                                    animation: 'scan 2s ease-in-out infinite'
                                  }}></div>
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff00cc]/30 to-transparent" style={{
                                    animation: 'glitch 0.3s ease-in-out infinite'
                                  }}></div>
                                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff00cc]/20 via-transparent to-[#ff00cc]/20" style={{
                                    animation: 'pulse 1.5s ease-in-out infinite'
                                  }}></div>
                                </>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                          </div>
                          <div>
                            <div className="text-white font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                              {currentThought?.user_id ? `Anonymous_${currentThought?.user_id.slice(-4)}` : 'Anonymous'}
                            </div>
                            <div className="text-gray-400 text-sm flex items-center space-x-2">
                              <span>@{currentThought?.user_id ? `anon_${currentThought?.user_id.slice(-6)}` : 'anonymous'}</span>
                              <span className="w-1 h-1 bg-[#ff00cc] rounded-full"></span>
                              <span className="text-[#ff00cc] font-medium">Verified Thought</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-[#ff00cc] p-2 rounded-xl hover:bg-[#ff00cc]/10 transition-all duration-300">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </button>
                      </div>
                    </div>



                    {/* Thought Content */}
                    <div className="mb-6 relative z-10">

                      
                      <p className="text-lg sm:text-2xl text-white leading-relaxed font-light transition-all duration-500" style={{ 
                        fontFamily: 'Inter, sans-serif',
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
                        transform: 'scale(1)',
                        filter: 'none'
                      }}>
                        {currentThought?.content}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="text-gray-400 text-sm mb-6 relative z-10 flex items-center space-x-2">
                      <span>{formatTimeAgo(currentThought?.created_at || '')}</span>
                      <span className="w-1 h-1 bg-[#ff00cc] rounded-full"></span>
                      <span className="text-[#ff00cc]">Live</span>
                    </div>



                    {/* Action Icons */}
                    <div className="border-t border-gray-800/50 pt-6 relative z-10">
                      <div className="flex justify-center items-center space-x-8">
                        {/* Strike */}
                        <button
                          onClick={() => {
                            console.log('Strike clicked, currentThought:', currentThought);
                            if (currentThought) {
                              trackUserInteraction(currentThought.id, 'strike');
                              nextThought();
                            }
                          }}
                          className="flex flex-col items-center space-y-2 text-white hover:text-red-400 transition-colors p-4 rounded-xl hover:bg-gray-800/50 font-medium"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          <span className="text-sm">Strike</span>
                        </button>

                        {/* Ditto - That's what you were thinking */}
                        <button
                          onClick={() => {
                            console.log('Ditto clicked, currentThought:', currentThought);
                            handleAmplify();
                            nextThought();
                          }}
                          className="flex flex-col items-center space-y-2 text-white hover:text-purple-400 transition-colors p-4 rounded-xl hover:bg-gray-800/50 font-medium group relative"
                        >
                          <div className="relative w-8 h-8">
                            {/* Ditto icon - two circles connected by line with dots */}
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {/* Left circle */}
                              <circle cx="6" cy="12" r="2" fill="currentColor"/>
                              {/* Right circle */}
                              <circle cx="18" cy="12" r="2" fill="currentColor"/>
                              {/* Connecting line */}
                              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
                              {/* Left dot extending from left circle */}
                              <circle cx="4" cy="12" r="0.5" fill="currentColor"/>
                              {/* Right dot extending from right circle */}
                              <circle cx="20" cy="12" r="0.5" fill="currentColor"/>
                            </svg>
                            {/* Ditto pulse effect */}
                            <div className="absolute inset-0 bg-purple-400/30 rounded-full animate-ping"></div>
                          </div>
                          <span className="text-sm">Ditto</span>
                        </button>

                        {/* Boost */}
                        <button
                          onClick={async () => {
                            console.log('Boost clicked, currentThought:', currentThought);
                            if (currentThought) {
                              // Track for recommendation system
                              trackUserInteraction(currentThought.id, 'boost');
                              
                              // Update user stats and create notification
                              await updateThoughtStats(currentThought.id, 'boost');
                              
                              // Only create notification if the thought has an owner
                              if (currentThought.user_id) {
                                await createNotification(
                                  currentThought.id, 
                                  'boost', 
                                  `Someone boosted your thought: "${currentThought.content.slice(0, 50)}${currentThought.content.length > 50 ? '...' : ''}"`
                                );
                              }
                              
                              nextThought();
                            }
                          }}
                          className="flex flex-col items-center space-y-2 text-white hover:text-green-400 transition-colors p-4 rounded-xl hover:bg-gray-800/50 font-medium"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                          </svg>
                          <span className="text-sm">Boost</span>
                        </button>

                        {/* Report */}
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="flex flex-col items-center space-y-2 text-white hover:text-red-400 transition-colors p-4 rounded-xl hover:bg-gray-800/50 font-medium"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                          </svg>
                          <span className="text-sm">Report</span>
                        </button>
                      </div>

                      {/* Secondary Actions */}
                      <div className="flex justify-center items-center space-x-6 mt-4 pt-4 border-t border-gray-800/30">
                        {/* Comment */}
                        <button
                          onClick={handleOpenComments}
                          className="flex items-center space-x-2 text-gray-400 hover:text-[#ff00cc] transition-colors p-2 rounded-lg hover:bg-gray-800/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                          <span className="text-xs">Comment</span>
                        </button>



                        {/* Voice Selection */}
                        <button
                          onClick={() => setShowVoicePanel(!showVoicePanel)}
                          className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-[#ff00cc] hover:bg-gray-800/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                          </svg>
                          <span className="text-xs">Voices</span>
                        </button>

                        {/* Speak Button */}
                        <button
                          onClick={speakThought}
                          className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-[#ff00cc] hover:bg-gray-800/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                          </svg>
                          <span className="text-xs">Speak</span>
                        </button>

                        {/* Stats */}
                        <button
                          onClick={() => setShowUserStats(true)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-[#ff00cc] transition-colors p-2 rounded-lg hover:bg-gray-800/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-xs">Stats</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Hint */}
                <div className="absolute bottom-32 left-4 sm:left-8 text-gray-500 text-sm animate-pulse">
                  ← Swipe or use buttons below
                </div>
                
                {/* Next Button */}
                <button
                  onClick={nextThought}
                  className="absolute bottom-32 right-4 sm:right-8 bg-[#ff00cc] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-[#ff33cc] transition-all duration-300 shadow-lg text-sm sm:text-base"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TikTok-Style Comments Section */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={(e) => {
          // Close when clicking the backdrop
          if (e.target === e.currentTarget) {
            setShowComments(false);
          }
        }}>
          <div className="w-full bg-black/95 border-t border-gray-800 rounded-t-3xl animate-slideUp h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
              <h3 className="text-xl font-bold text-white">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ overscrollBehavior: 'contain' }}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#ff00cc] to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {comment.user_id ? comment.user_id.slice(-2).toUpperCase() : 'AN'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="text-white font-semibold">
                          {comment.user_id ? `Anonymous_${comment.user_id.slice(-4)}` : 'Anonymous'}
                        </span>
                        <span className="text-gray-400 text-sm">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-800 flex-shrink-0">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#ff00cc] to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userProfile?.id ? userProfile.id.slice(-2).toUpperCase() : 'AN'}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    placeholder="Add a comment..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff00cc] transition-colors"
                    disabled={isSubmittingComment}
                  />
                  <button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-[#ff00cc] rounded-full flex items-center justify-center hover:bg-[#ff33cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TikTok-Style Voice Panel - Coming Soon */}
      {showVoicePanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowVoicePanel(false);
          }
        }}>
          <div className="w-full bg-black/95 border-t border-gray-800 rounded-t-3xl animate-slideUp h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
              <h3 className="text-xl font-bold text-white">Voice Effects</h3>
              <button
                onClick={() => setShowVoicePanel(false)}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                              <div className="text-center text-gray-400 py-8">
                  <h3 className="text-xl font-bold text-white mb-4">Character Voice</h3>
                
                {/* Voice Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedVoice('sophia')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'sophia'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div className="font-semibold text-sm">Sophia</div>
                    <div className="text-xs opacity-75">British Female</div>
                  </button>

                  <button
                    onClick={() => setSelectedVoice('daniel')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'daniel'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <div className="font-semibold text-sm">Daniel</div>
                    <div className="text-xs opacity-75">Professional Male</div>
                  </button>

                  <button
                    onClick={() => setSelectedVoice('luna')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'luna'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <div className="font-semibold text-sm">Luna</div>
                    <div className="text-xs opacity-75">US Female</div>
                  </button>

                  <button
                    onClick={() => setSelectedVoice('leo')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'leo'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <div className="font-semibold text-sm">Leo</div>
                    <div className="text-xs opacity-75">US Male</div>
                  </button>

                  <button
                    onClick={() => setSelectedVoice('maya')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'maya'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div className="font-semibold text-sm">Maya</div>
                    <div className="text-xs opacity-75">US Male</div>
                  </button>

                  <button
                    onClick={() => setSelectedVoice('max')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'max'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div className="font-semibold text-sm">Max</div>
                    <div className="text-xs opacity-75">US Female</div>
                  </button>

                  <button
                    onClick={() => setSelectedVoice('zoe')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'zoe'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Z</span>
                    </div>
                    <div className="font-semibold text-sm">Zoe</div>
                    <div className="text-xs opacity-75">US Female</div>
                  </button>

                  <button
                    onClick={() => setSelectedVoice('finn')}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedVoice === 'finn'
                        ? 'bg-[#ff00cc] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <div className="font-semibold text-sm">Finn</div>
                    <div className="text-xs opacity-75">US Male</div>
                  </button>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowVoicePanel(false)}
                  className="w-full bg-[#ff00cc] text-white py-3 rounded-lg font-semibold hover:bg-[#ff00cc]/80 transition-colors mt-6"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Submit Thought Modal */}
      <ThoughtSubmit
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmitThought}
      />

      <style jsx global>{`
        body {
          background: #000 !important;
          font-family: 'Inter', sans-serif !important;
        }
        
        @keyframes electricPulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 0, 204, 0.5);
            border-color: rgba(255, 0, 204, 0.8);
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 0, 204, 1), 0 0 80px rgba(255, 0, 204, 0.6);
            border-color: rgba(255, 0, 204, 1);
          }
        }
        
        @keyframes particleFloat {
          0% { 
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          100% { 
            transform: translateY(-20px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes lightningFlash {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        .epic-animation {
          animation: electricPulse 0.5s ease-in-out infinite;
        }
        
        .particle {
          animation: particleFloat 1s ease-out forwards;
        }
        
                .lightning {
          animation: lightningFlash 0.3s ease-in-out infinite;
        }
      `}
      </style>
      
      <style jsx global>{`
        .neon-title {
          color: #ff00cc;
          text-shadow:
            0 0 20px #ff00cc,
            0 0 40px #ff00cc,
            0 0 80px #ff00cc,
            0 0 160px #ff00cc;
        }
        .neon-btn {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .neon-btn:active {
          transform: scale(0.97);
        }
        .neon-chatbox {
          box-shadow: 0 0 20px #ff00cc;
        }
        .neon-glow {
          box-shadow: 0 0 20px #ff00cc;
        }
      `}
      </style>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedPageContent />
    </Suspense>
  )
} 