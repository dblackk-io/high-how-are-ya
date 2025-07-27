import axios from 'axios';

// Google Cloud TTS voice options
export const GOOGLE_VOICE_OPTIONS = {
  // Professional voices
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
  
  // Additional voices
  'daniel': { name: 'en-US-Neural2-J', language: 'en-US' },
  'charlotte': { name: 'en-US-Neural2-K', language: 'en-US' },
  'emily': { name: 'en-US-Neural2-L', language: 'en-US' },
  'mike': { name: 'en-US-Neural2-M', language: 'en-US' },
};

export const GOOGLE_VOICE_STYLES = {
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

class GoogleVoiceService {
  async synthesizeSpeech(
    text: string, 
    voiceName: string, 
    style: keyof typeof GOOGLE_VOICE_STYLES = 'normal'
  ): Promise<ArrayBuffer> {
    try {
      console.log('Sending to Google TTS API:', { text: text.substring(0, 50) + '...', voice: voiceName, style });
      
      const response = await axios.post(
        '/api/google-voice',
        {
          text,
          voice: voiceName,
          style
        },
        {
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
      console.error('Google TTS error:', axiosError.response?.data || axiosError.message);
      
      // Fallback to browser speech synthesis
      console.log('Falling back to browser speech synthesis...');
      this.fallbackSpeak(text, voiceName);
      
      // Don't throw error, just return empty buffer so fallback works
      return new ArrayBuffer(0);
    }
  }

  // Fallback to Web Speech API if Google TTS fails
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

export const googleVoiceService = new GoogleVoiceService(); 