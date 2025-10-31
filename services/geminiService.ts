
import { GoogleGenAI, Modality } from "@google/genai";

// 1. Initialize the GoogleGenAI client
const apiKey = process.env.API_KEY as string;

if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
  throw new Error(
    'GEMINI_API_KEY is not configured. Please:\n' +
    '1. Copy .env.local.example to .env.local\n' +
    '2. Add your Gemini API key from https://aistudio.google.com/apikey\n' +
    '3. Restart the development server'
  );
}

const ai = new GoogleGenAI({ apiKey });

// 2. Audio Decoding Utilities (as per Gemini documentation)
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// 3. Main service function to generate and play speech
export async function generateAndPlaySpeech(text: string, audioContext: AudioContext): Promise<AudioBufferSourceNode> {
  if (!text.trim()) {
    throw new Error("Input text cannot be empty.");
  }
  if (!audioContext) {
    throw new Error("AudioContext is not available.");
  }

  // Generate speech using Gemini API
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // A pleasant voice choice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("Failed to generate audio. The API response did not contain audio data.");
  }

  // Decode the base64 audio into an AudioBuffer
  const audioBytes = decode(base64Audio);
  const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);

  // Play the audio
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
  
  return source;
}
