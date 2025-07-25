import axios from 'axios';

// ElevenLabs voice IDs for different personalities
export const VOICE_OPTIONS = {
  // Professional voices
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
  
  // Funny/Entertaining voices
  'daniel': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Goofy, expressive
  'charlotte': 'XB0fDUnXU5powFXDhCwa', // Charlotte - Sassy, dramatic
  'emily': 'LcfcDJNUP1GQjkzn1xUU', // Emily - Sweet, bubbly
  'chris': 'VR6AewLTigWG4xSOukaG', // Chris - Energetic, fun
  'mike': 'VR6AewLTigWG4xSOukaG', // Mike - Casual, funny
  'sarah': 'VR6AewLTigWG4xSOukaG', // Sarah - Playful, upbeat
};

export interface VoiceSettings {
  stability: number; // 0-1, how consistent the voice is
  similarity_boost: number; // 0-1, how similar to original voice
  style: number; // 0-1, how expressive
  use_speaker_boost: boolean; // Enhance speaker clarity
}

export const VOICE_STYLES = {
  normal: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
  dramatic: { stability: 0.3, similarity_boost: 0.8, style: 0.8, use_speaker_boost: true },
  whisper: { stability: 0.7, similarity_boost: 0.6, style: 0.2, use_speaker_boost: false },
  excited: { stability: 0.2, similarity_boost: 0.9, style: 0.9, use_speaker_boost: true },
  calm: { stability: 0.8, similarity_boost: 0.7, style: 0.1, use_speaker_boost: true },
  robotic: { stability: 0.9, similarity_boost: 0.5, style: 0.0, use_speaker_boost: false },
  
  // Funny styles
  goofy: { stability: 0.1, similarity_boost: 0.6, style: 0.9, use_speaker_boost: false },
  sassy: { stability: 0.3, similarity_boost: 0.8, style: 0.7, use_speaker_boost: true },
  bubbly: { stability: 0.2, similarity_boost: 0.9, style: 0.8, use_speaker_boost: true },
  deadpan: { stability: 0.9, similarity_boost: 0.7, style: 0.1, use_speaker_boost: false },
  conspiracy: { stability: 0.4, similarity_boost: 0.6, style: 0.6, use_speaker_boost: false },
};

class VoiceService {
  private apiKey: string | undefined;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  }
  async synthesizeSpeech(
    text: string, 
    voiceName: string, 
    style: keyof typeof VOICE_STYLES = 'normal'
  ): Promise<ArrayBuffer> {
    try {
      console.log('Sending to API:', { text: text.substring(0, 50) + '...', voice: voiceName, style });
      
      const response = await axios.post(
        '/api/voice',
        {
          text,
          voice: voiceName, // Send the voice name, not ID
          style
        },
        {
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
      console.error('Voice synthesis error:', axiosError.response?.data || axiosError.message);
      
      // Fallback to browser speech synthesis
      console.log('Falling back to browser speech synthesis...');
      this.fallbackSpeak(text, voiceName);
      
      throw new Error(`Voice synthesis failed: ${axiosError.response?.data?.detail || axiosError.message}`);
    }
  }

  async getAvailableVoices(): Promise<{ voice_id: string; name: string; category: string }[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      return response.data.voices;
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  }

  // Fallback to Web Speech API if ElevenLabs fails
  fallbackSpeak(text: string, voiceName?: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) utterance.voice = voice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceService = new VoiceService(); 