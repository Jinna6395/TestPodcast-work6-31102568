
import React, { useState, useRef, useCallback } from 'react';
import { generateAndPlaySpeech } from './services/geminiService';
import { PlayIcon, SpeakerWaveIcon, SpinnerIcon, ErrorIcon } from './components/icons';

const SCRIPT_CONTENT = `
🎙️ **Podcast Script: การใช้เทคโนโลยีอย่างปลอดภัย**

> สวัสดีครับ/ค่ะน้อง ๆ ม.2 ทุกคน 👋
> วันนี้เรามาคุยกันเรื่องสำคัญมาก ๆ ในชีวิตประจำวัน —
> นั่นก็คือ **"การใช้เทคโนโลยีอย่างปลอดภัย"**
>
> สมัยนี้เราใช้มือถือ เล่นเน็ต เล่นเกม แชทกับเพื่อน แทบทั้งวันเลยใช่มั้ย? แต่รู้มั้ยว่า ถ้าไม่ระวัง อาจเกิดปัญหาตามมาได้แบบไม่รู้ตัวเลยนะ!

> ✋ อย่างแรกเลย —
> **อย่าเปิดเผยข้อมูลส่วนตัวบนออนไลน์เด็ดขาด!**
> ไม่ว่าจะเป็นชื่อเต็ม ที่อยู่ เบอร์โทร หรือรหัสผ่าน
> เพราะคนไม่หวังดีอาจเอาไปใช้ในทางที่ไม่ดีได้

> 🕵️‍♀️ อย่างที่สอง —
> **อย่าคลิกลิงก์แปลก ๆ ที่ส่งมาทางแชทหรืออีเมล**
> บางทีมันอาจเป็นไวรัส หรือหลอกให้เรากรอกข้อมูลสำคัญก็ได้

> 💬 อีกเรื่องสำคัญคือ —
> **การใช้คำพูดที่สุภาพและเคารพผู้อื่น**
> โลกออนไลน์ก็คือสังคมเหมือนกัน เราควรมีมารยาท และไม่กลั่นแกล้งกันนะ

> 🚨 และถ้าน้อง ๆ เจอสิ่งไม่เหมาะสม
> อย่างภาพลามก คำหยาบ หรือการคุกคาม
> ให้รีบแจ้งคุณครูหรือพ่อแม่ทันทีเลย อย่าเก็บไว้คนเดียว

> 🎯 สุดท้ายนี้ อย่าลืมนะครับ/ค่ะ
> **"ใช้เทคโนโลยีอย่างปลอดภัย เริ่มต้นที่ตัวเรา"**
> แล้วเราจะใช้อินเทอร์เน็ตได้ทั้งสนุกและปลอดภัยไปพร้อมกัน! 😊
`;

const formatLine = (line: string) => {
  const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-indigo-400">$1</strong>');
  return <p dangerouslySetInnerHTML={{ __html: bolded }} />;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlayPodcast = useCallback(async () => {
    if (isLoading || isPlaying) return;

    setIsLoading(true);
    setError(null);

    // Initialize AudioContext on user interaction
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    try {
      const textToSpeak = SCRIPT_CONTENT.replace(/\*\*|🎙️|>/g, '').trim();
      const source = await generateAndPlaySpeech(textToSpeak, audioContextRef.current);
      audioSourceRef.current = source;
      
      setIsPlaying(true);
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isPlaying]);
  
  const scriptLines = SCRIPT_CONTENT.trim().split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') {
      return <div key={index} className="h-4"></div>; // Spacer for empty lines
    }
    if (trimmedLine.startsWith('>')) {
      return <div key={index} className="pl-4 border-l-4 border-slate-600 text-slate-300 italic">{formatLine(trimmedLine.substring(1).trim())}</div>;
    }
    return <div key={index}>{formatLine(trimmedLine)}</div>;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4 font-sans">
      <main className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-900/20 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-indigo-400 mb-6">
              Thai Podcast: Digital Safety
            </h1>
            <div className="space-y-4 text-lg leading-relaxed text-slate-300">
              {scriptLines}
            </div>
          </div>
          <div className="bg-slate-900/50 p-6 border-t border-slate-700">
            {error && (
              <div className="mb-4 flex items-center justify-center text-red-400 bg-red-900/50 p-3 rounded-lg">
                <ErrorIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="flex justify-center">
              <button
                onClick={handlePlayPodcast}
                disabled={isLoading || isPlaying}
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
              >
                {isLoading ? (
                  <>
                    <SpinnerIcon className="h-6 w-6 mr-3" />
                    Generating...
                  </>
                ) : isPlaying ? (
                  <>
                    <SpeakerWaveIcon className="h-6 w-6 mr-3" />
                    Playing...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-6 w-6 mr-3" />
                    Play Podcast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <footer className="text-center mt-6 text-slate-500 text-sm">
          <p>Powered by Gemini 2.5 Flash TTS</p>
        </footer>
      </main>
    </div>
  );
}
