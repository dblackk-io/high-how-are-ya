# 🚀 High How Are Ya

A dopamine-fueled, anonymous thought-sharing experience. Share your wildest thoughts and instantly receive random thoughts from others. Pure chaos, pure connection.

## 🧠 Concept

High How Are Ya is a mobile-first web app that creates a compulsive feedback loop of sending, receiving, and saving anonymous thoughts. It's like a cross between Omegle, Whisper, and TikTok — but with no identity, no clout-chasing, and maximum emotional impact.

## ✨ Features

- 🔐 **Anonymous Thought Sharing** - Share your wildest thoughts without fear
- 🎁 **Instant Random Thoughts** - Get random thoughts from the community
- 🔁 **Swipe Navigation** - Left/right navigation through thoughts
- ⭐ **Star System** - Save thoughts you love
- 🏷️ **Vibe Tags** - Categorize thoughts as Funny, Deep, or Horny
- 🔥 **NSFW Toggle** - Control your content preferences
- 📱 **Mobile-First Design** - Optimized for mobile experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd high-how-are-ya
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the following SQL to create the database schema:

   ```sql
   -- Create users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     phone TEXT UNIQUE NOT NULL,
     gender TEXT,
     nsfw_enabled BOOLEAN DEFAULT false,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create thoughts table
   CREATE TABLE thoughts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     content TEXT NOT NULL,
     user_id UUID REFERENCES users(id),
     vibe_tag TEXT CHECK (vibe_tag IN ('funny', 'deep', 'horny')),
     nsfw_flag BOOLEAN DEFAULT false,
     gender_target TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create interactions table
   CREATE TABLE interactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     thought_id UUID REFERENCES thoughts(id),
     type TEXT CHECK (type IN ('star', 'share', 'tag')),
     tag_value TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
   ```

5. **Run the development server**
```bash
npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Core Features

### Thought Submission
- Anonymous thought sharing with 200 character limit
- Optional vibe tagging (Funny, Deep, Horny)
- NSFW content toggle
- Real-time submission feedback

### Thought Discovery
- Random thought generation
- Swipe navigation (left/right)
- Vibe-based filtering
- NSFW content filtering

### User Engagement
- Star/save favorite thoughts
- Share thoughts to social media
- Private spark feedback system
- Thought streaks and achievements

## 🧪 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main app interface
│   └── globals.css     # Global styles
├── components/         # React components
│   └── ThoughtSubmit.tsx
└── lib/               # Utilities and config
    └── supabase.ts    # Supabase client
```

### Key Components

- **Main Interface** (`page.tsx`) - Core thought display and navigation
- **Thought Submit** (`ThoughtSubmit.tsx`) - Modal for submitting new thoughts
- **Supabase Client** (`supabase.ts`) - Database connection and types

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

Make sure to set these in your deployment environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🎨 Design Philosophy

- **Mobile-First**: Optimized for mobile experience
- **Dark Theme**: Easy on the eyes, perfect for late-night browsing
- **Smooth Animations**: Framer Motion for delightful interactions
- **Minimal UI**: Focus on content, not distractions
- **Accessibility**: WCAG compliant design

## 🔮 Roadmap

### v1.5
- [ ] Personalized "daily thought drop"
- [ ] "Midnight Mode" (unhinged time-locked content)
- [ ] Spark badges and achievements
- [ ] Optional echo/reply system

### v2.0
- [ ] AI-vibe detection + auto tagging
- [ ] PWA installable version
- [ ] Push notifications
- [ ] Native app using Capacitor

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🧠 Psychology & Addiction

This app is designed with psychological principles in mind:

- **Variable Reward Schedule**: Random thoughts create dopamine-driven behavior
- **Anonymous Validation**: Private feedback without social pressure
- **Identity Formation**: Users build personas through consumption patterns
- **Mystery & Discovery**: Never knowing what comes next

The goal is to create a genuinely addictive but positive experience that respects user freedom and expression.

---

**Built with ❤️ and chaos**
