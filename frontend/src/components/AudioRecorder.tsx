import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

/**
 * Props for the AudioRecorder component.
 */
interface AudioRecorderProps {
  /** Callback fired when the user successfully finishes an audio recording session. */
  onRecordingComplete: (blob: Blob) => Promise<void>;
  /** Disables the record button while the backend is processing the previous audio. */
  isProcessing: boolean;
}

/**
 * AudioRecorder Component
 * 
 * Manages the microphone permission, captures audio streams, visualizes audio 
 * frequency data, and returns the final WAV blob upon completion.
 */
export default function AudioRecorder({ onRecordingComplete, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach((track) => track.stop());
        await onRecordingComplete(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      analyzeAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleToggle = () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="flex justify-center">
        <button
          onClick={handleToggle}
          disabled={isProcessing}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse-slow'
              : 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:bg-primary/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {isRecording && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex justify-center items-center gap-1.5 h-12">
            {[...Array(24)].map((_, i) => {
              const height = Math.random() * audioLevel * 100 + 10;
              return (
                <div
                  key={i}
                  className="w-1.5 bg-primary/80 rounded-full transition-all duration-75"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 text-red-400">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <p className="text-sm font-medium uppercase tracking-widest">Recording Response</p>
          </div>
        </div>
      )}

      {(!isRecording && !isProcessing) && (
        <p className="text-center text-sm text-dark-muted font-medium py-2">
          Click microphone to begin your answer
        </p>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-primary animate-pulse py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-sm font-medium tracking-wide">Transcribing & Analyzing...</p>
        </div>
      )}
    </div>
  );
}
