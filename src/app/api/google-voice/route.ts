import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Google Cloud TTS voice options
const GOOGLE_VOICE_OPTIONS = {
  'rachel': { name: 'en-US-Neural2-F', language: 'en-US' },
  'domi': { name: 'en-US-Neural2-D', language: 'en-US' },
  'bella': { name: 'en-US-Neural2-C', language: 'en-US' },
  'antoni': { name: 'en-US-Neural2-A', language: 'en-US' },
  'thomas': { name: 'en-US-Neural2-B', language: 'en-US' },
  'josh': { name: 'en-US-Neural2-E', language: 'en-US' },
  'arnold': { name: 'en-US-Neural2-G', language: 'en-US' },
  'sam': { name: 'en-US-Neural2-H', language: 'en-US' },
  'callum': { name: 'en-GB-Neural2-A', language: 'en-GB' },
  'serena': { name: 'en-US-Neural2-I', language: 'en-US' },
  'daniel': { name: 'en-US-Neural2-J', language: 'en-US' },
  'charlotte': { name: 'en-US-Neural2-K', language: 'en-US' },
  'emily': { name: 'en-US-Neural2-L', language: 'en-US' },
  'mike': { name: 'en-US-Neural2-M', language: 'en-US' },
};

const GOOGLE_VOICE_STYLES = {
  normal: { speakingRate: 1.0, pitch: 0.0, volumeGainDb: 0.0 },
  dramatic: { speakingRate: 0.8, pitch: 2.0, volumeGainDb: 2.0 },
  whisper: { speakingRate: 0.7, pitch: -2.0, volumeGainDb: -5.0 },
  excited: { speakingRate: 1.2, pitch: 3.0, volumeGainDb: 3.0 },
  calm: { speakingRate: 0.9, pitch: -1.0, volumeGainDb: -1.0 },
  robotic: { speakingRate: 0.8, pitch: 0.0, volumeGainDb: 0.0 },
  goofy: { speakingRate: 1.1, pitch: 4.0, volumeGainDb: 2.0 },
  sassy: { speakingRate: 1.0, pitch: 1.0, volumeGainDb: 1.0 },
  bubbly: { speakingRate: 1.1, pitch: 2.0, volumeGainDb: 2.0 },
  deadpan: { speakingRate: 0.8, pitch: -3.0, volumeGainDb: -2.0 },
  conspiracy: { speakingRate: 0.7, pitch: -1.0, volumeGainDb: -1.0 },
};

export async function POST(request: NextRequest) {
  let voice: string | undefined = undefined;
  try {
    const { text, voice: reqVoice, style } = await request.json();
    voice = reqVoice;

    console.log('Google TTS API called with:', { text: text.substring(0, 50) + '...', voice, style });

    if (!text || !voice) {
      return NextResponse.json({ error: 'Text and voice are required' }, { status: 400 });
    }

    const voiceConfig = GOOGLE_VOICE_OPTIONS[voice as keyof typeof GOOGLE_VOICE_OPTIONS];
    if (!voiceConfig) {
      return NextResponse.json({ error: 'Invalid voice selected' }, { status: 400 });
    }

    const styleConfig = GOOGLE_VOICE_STYLES[style as keyof typeof GOOGLE_VOICE_STYLES] || GOOGLE_VOICE_STYLES.normal;
    
    console.log('Using Google voice:', voiceConfig.name, 'with style:', styleConfig);

    // Call Google Cloud TTS API
    const response = await axios.post(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
      {
        input: { text },
        voice: {
          languageCode: voiceConfig.language,
          name: voiceConfig.name
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: styleConfig.speakingRate,
          pitch: styleConfig.pitch,
          volumeGainDb: styleConfig.volumeGainDb
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`
        }
      }
    );

    // Convert base64 audio content to ArrayBuffer
    const audioContent = response.data.audioContent;
    const audioBuffer = Buffer.from(audioContent, 'base64');

    // Return the audio data
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });

  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string; message?: string } }; message?: string };
    console.error('Google TTS error:', axiosError.response?.data || axiosError.message);

    return NextResponse.json(
      { 
        error: 'Google TTS failed',
        details: axiosError.response?.data?.detail || axiosError.response?.data?.message || axiosError.message || 'Unknown error',
        voice
      }, 
      { status: 500 }
    );
  }
} 