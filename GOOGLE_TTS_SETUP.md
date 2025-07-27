# Google Cloud TTS Setup Guide

## 🎯 Why Google Cloud TTS?

- **1 million free characters/month** (vs 10k from ElevenLabs)
- **$4/month for 4 million characters** (vs $5 for 30k from ElevenLabs)
- **High-quality neural voices**
- **Much better value for money**

## 🚀 Quick Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Text-to-Speech API**

### 2. Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key

### 3. Add to Environment
Add to your `.env` file:
```
GOOGLE_CLOUD_API_KEY=your_api_key_here
```

### 4. Update API Route
In `src/app/api/google-voice/route.ts`, uncomment and update:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`
}
```

### 5. Deploy to Vercel
Add the environment variable in your Vercel dashboard:
- Go to your project settings
- Add `GOOGLE_CLOUD_API_KEY` with your API key

## 🎤 Voice Options Available

The app includes these Google Cloud TTS voices:
- **Rachel** (en-US-Neural2-F) - Professional, warm
- **Domi** (en-US-Neural2-D) - Confident, clear  
- **Bella** (en-US-Neural2-C) - Soft, friendly
- **Antoni** (en-US-Neural2-A) - Deep, authoritative
- **Thomas** (en-US-Neural2-B) - Casual, relatable
- **Josh** (en-US-Neural2-E) - Energetic, young
- **Arnold** (en-US-Neural2-G) - Deep, powerful
- **Sam** (en-US-Neural2-H) - Casual, friendly
- **Callum** (en-GB-Neural2-A) - British, sophisticated
- **Serena** (en-US-Neural2-I) - Calm, soothing

## 💰 Cost Comparison

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **ElevenLabs** | 10k chars/month | $5/month for 30k chars |
| **Google Cloud TTS** | 1M chars/month | $4/month for 4M chars |
| **Value** | 100x better | 133x better |

## ✅ Benefits

1. **Never run out of characters** - 1M free is massive
2. **High quality** - Google's neural voices are excellent
3. **Cost effective** - Much better pricing than ElevenLabs
4. **Reliable** - Google's infrastructure is rock solid
5. **Easy setup** - Just need an API key

## 🔧 Current Status

The app is ready for Google Cloud TTS! Just need to:
1. Get your API key
2. Add it to environment variables
3. Deploy to Vercel

Then voice features will work perfectly with much better value! 