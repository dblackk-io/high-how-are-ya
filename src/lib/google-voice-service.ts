import axios from 'axios';

// Google Cloud TTS voice options - Best quality available voices
export const GOOGLE_VOICE_OPTIONS = {
  // High-quality voices with natural sound
  'rachel': { name: 'en-US-Wavenet-F', language: 'en-US' },
  'callum': { name: 'en-GB-Wavenet-B', language: 'en-GB' },
  'charlotte': { name: 'en-US-Wavenet-C', language: 'en-US' },
  'daniel': { name: 'en-US-Wavenet-D', language: 'en-US' },
  'arnold': { name: 'en-US-Wavenet-G', language: 'en-US' },
  'sarah': { name: 'en-US-Wavenet-I', language: 'en-US' },
  'marcus': { name: 'en-US-Wavenet-E', language: 'en-US' },
  'emma': { name: 'en-US-Wavenet-H', language: 'en-US' },
  'james': { name: 'en-US-Wavenet-A', language: 'en-US' },
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
        '/api/voice',
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