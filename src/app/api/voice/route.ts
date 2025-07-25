import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Your ElevenLabs API key (store this in environment variables)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_b792bf6e04e53f77546800fe87c8012deba813d54ab79ad3';

// Voice IDs - Updated with better, more distinct voices
const VOICE_OPTIONS = {
  'rachel': '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional, warm
  'domi': 'AZnzlk1XvdvUeBnXmlld', // Domi - Confident, clear
  'bella': 'EXAVITQu4vr4xnSDxMaL', // Bella - Soft, friendly
  'antoni': 'ErXwobaYiN019PkySvjV', // Antoni - Deep, authoritative
  'thomas': 'GBv7mTt0atIp3Br8iCZE', // Thomas - Casual, relatable
  'josh': 'TxGEqnHWrfWFTfGW9XjX', // Josh - Energetic, young
  'arnold': 'VR6AewLTigWG4xSOukaG', // Arnold - Deep, powerful
  'sam': 'yoZ06aMxZJJ28mfd3POQ', // Sam - Casual, friendly
  'callum': 'N2lVS1w4EtoT3dr4eOWO', // Callum - British, sophisticated
  'serena': 'pNInz6obpgDQGcFmaJgB', // Serena - Calm, soothing
  'daniel': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Goofy, expressive
  'charlotte': 'XB0fDUnXU5powFXDhCwa', // Charlotte - Sassy, dramatic
  'emily': 'LcfcDJNUP1GQjkzn1xUU', // Emily - Sweet, bubbly
  'mike': 'VR6AewLTigWG4xSOukaG', // Mike - Casual, funny
};

// Voice styles
const VOICE_STYLES = {
  normal: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
  dramatic: { stability: 0.3, similarity_boost: 0.8, style: 0.8, use_speaker_boost: true },
  whisper: { stability: 0.7, similarity_boost: 0.6, style: 0.2, use_speaker_boost: false },
  excited: { stability: 0.2, similarity_boost: 0.9, style: 0.9, use_speaker_boost: true },
  calm: { stability: 0.8, similarity_boost: 0.7, style: 0.1, use_speaker_boost: true },
  robotic: { stability: 0.9, similarity_boost: 0.5, style: 0.0, use_speaker_boost: false },
  goofy: { stability: 0.1, similarity_boost: 0.6, style: 0.9, use_speaker_boost: false },
  sassy: { stability: 0.3, similarity_boost: 0.8, style: 0.7, use_speaker_boost: true },
  bubbly: { stability: 0.2, similarity_boost: 0.9, style: 0.8, use_speaker_boost: true },
  deadpan: { stability: 0.9, similarity_boost: 0.7, style: 0.1, use_speaker_boost: false },
  conspiracy: { stability: 0.4, similarity_boost: 0.6, style: 0.6, use_speaker_boost: false },
};

export async function POST(request: NextRequest) {
  let voice: string | undefined = undefined;
  try {
    const { text, voice: reqVoice, style } = await request.json();
    voice = reqVoice;

    console.log('Voice API called with:', { text: text.substring(0, 50) + '...', voice, style });

    if (!text || !voice) {
      return NextResponse.json({ error: 'Text and voice are required' }, { status: 400 });
    }

    const voiceId = VOICE_OPTIONS[voice as keyof typeof VOICE_OPTIONS];
    if (!voiceId) {
      return NextResponse.json({ error: 'Invalid voice selected' }, { status: 400 });
    }

    const voiceSettings = VOICE_STYLES[style as keyof typeof VOICE_STYLES] || VOICE_STYLES.normal;
    
    console.log('Using voice ID:', voiceId, 'with settings:', voiceSettings);

    // Call ElevenLabs API
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    // Return the audio data
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.data.length.toString(),
      },
    });

  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string; message?: string } }; message?: string };
    console.error('Voice synthesis error:', axiosError.response?.data || axiosError.message);

    // Return more detailed error information
    const errorMessage = axiosError.response?.data?.detail || axiosError.response?.data?.message || axiosError.message || 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Voice synthesis failed',
        details: errorMessage,
        voice,
        voiceId: voice ? VOICE_OPTIONS[voice as keyof typeof VOICE_OPTIONS] : undefined
      }, 
      { status: 500 }
    );
  }
} 