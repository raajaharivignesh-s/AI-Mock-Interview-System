import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, TrendingUp, HelpCircle } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import AudioRecorder from '../components/AudioRecorder';
import ScorePanel from '../components/ScorePanel';
import { api, SubmitAnswerResponse } from '../services/api';

export default function Interview() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState('Generating question...');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const audioContextRef = useRef<HTMLAudioElement | null>(null);
  const [scores, setScores] = useState({
    technical: 0,
    depth: 0,
    clarity: 0,
    confidence: 0,
  });
  const [improvement, setImprovement] = useState<string>('');
  const [showImprovement, setShowImprovement] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [latestScore, setLatestScore] = useState(0);
  const [lastTranscript, setLastTranscript] = useState<string>('');

  // Audio Playback Helper
  const playAudio = (base64String: string) => {
    if (audioContextRef.current) {
        audioContextRef.current.pause();
    }
    const audio = new Audio(`data:audio/mp3;base64,${base64String}`);
    audioContextRef.current = audio;
    audio.play().catch(e => console.error("Audio playback failed:", e));
  };

  useEffect(() => {
    // On Mount: Load the very first question mapped by the Resume upload
    const q = localStorage.getItem('firstQuestion');
    const a = localStorage.getItem('firstAudio');
    
    if (q) setCurrentQuestion(q);
    if (a) {
        // slightly delay the first audio so the page transition finishes smoothly
        setTimeout(() => playAudio(a), 800);
    }
    
    return () => {
        if (audioContextRef.current) audioContextRef.current.pause();
    };
  }, []);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setShowImprovement(false);

    try {
      const sessionId = localStorage.getItem('sessionId') || undefined;
      const response: SubmitAnswerResponse = await api.submitAnswer(audioBlob, sessionId);

      setIsProcessing(false);
      setIsThinking(true);

      setTimeout(() => {
        setScores({
          technical: response.technical,
          depth: response.depth,
          clarity: response.clarity,
          confidence: response.confidence,
        });

        setLatestScore(response.final_score);
        setShowScorePopup(true);
        setTimeout(() => setShowScorePopup(false), 3000);

        setImprovement(response.improvement);
        setShowImprovement(true);
        if (response.transcript) {
            setLastTranscript(response.transcript);
        }

        setTimeout(() => {
          setCurrentQuestion(response.next_question);
          setQuestionNumber((prev) => prev + 1);
          setIsThinking(false);
          
          if (response.audio_base64) {
             playAudio(response.audio_base64);
          }
        }, 1500);
      }, 1500);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setIsProcessing(false);
    }
  };

  const endInterview = () => {
    navigate('/report');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-glow rounded-full blur-[150px] pointer-events-none opacity-20" />
        
        {/* Header bar */}
        <header className="px-8 py-5 border-b border-dark-border flex justify-between items-center bg-dark-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
             <span className="text-white font-medium tracking-wide">Live Demo Session</span>
             <span className="text-dark-muted mx-2">|</span>
             <span className="text-dark-muted font-mono bg-white/5 px-2 py-1 rounded">00:15:34</span>
          </div>

          <button
            onClick={endInterview}
            className="btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/10 h-10 px-4 py-0"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-semibold">End Interview</span>
          </button>
        </header>

      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 z-10 w-full max-w-7xl">
        
        {/* Primary Interview Column */}
        <div className="flex-1 flex flex-col space-y-8 min-w-0">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 animate-fade-in-up">
            <span className="text-sm text-dark-muted font-medium whitespace-nowrap">Q-{questionNumber}</span>
            <div className="w-full h-1.5 bg-dark-bg border border-dark-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-700 ease-out"
                style={{ width: `${Math.min((questionNumber / 10) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm text-dark-muted font-medium whitespace-nowrap">{Math.min(questionNumber, 10)} / 10</span>
          </div>

          {/* Core HR Interaction Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-transparent to-white/5 rounded-3xl border border-white/5 relative group">
              <QuestionCard
                question={currentQuestion}
                isThinking={isThinking}
              />
          </div>

          {/* Action / Recording Area */}
          <div className="glass-panel p-6 rounded-3xl flex justify-center animate-fade-in-up border-t border-white/10">
            <AudioRecorder onRecordingComplete={handleRecordingComplete} isProcessing={isProcessing} />
          </div>
          
           {/* Improvement Tip Ribbon */}
           <div className={`transition-all duration-500 overflow-hidden ${showImprovement ? 'h-auto opacity-100 mt-4' : 'h-0 opacity-0'}`}>
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-4">
                 <div className="p-2 bg-primary/20 rounded-lg shrink-0 mt-0.5">
                    <TrendingUp className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Growth Opportunity</h4>
                    <p className="text-sm text-blue-200 leading-relaxed">{improvement}</p>
                 </div>
              </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-6 flex flex-col">
          <ScorePanel
            technical={scores.technical}
            depth={scores.depth}
            clarity={scores.clarity}
            confidence={scores.confidence}
          />

          <div className="glass-panel p-6 rounded-2xl flex-1 max-h-[400px]">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6 text-dark-muted">
                    <HelpCircle className="w-5 h-5" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Interview Tips</h3>
                </div>
                
                <ul className="space-y-4 text-sm text-dark-muted flex-1 overflow-y-auto pr-2">
                {[
                    { title: "Pause before answering", desc: "It's perfectly fine to take 2-3 seconds to collect your thoughts." },
                    { title: "Use the STAR method", desc: "Situation, Task, Action, Result for behavioral questions." },
                    { title: "Be precise", desc: "Focus on specific technical terms and examples from your pasted JD." },
                    { title: "Speak clearly", desc: "Our AI evaluates confidence based on pacing and tone." }
                ].map((tip, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <strong className="block text-white mb-1 font-medium">{tip.title}</strong>
                        <span className="text-slate-400">{tip.desc}</span>
                    </li>
                ))}
                </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating score popup */}
      {showScorePopup && (
        <div className="fixed top-24 right-8 p-6 rounded-2xl bg-dark-surface border border-dark-border shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-fade-in-up z-50 flex items-center gap-6 max-w-sm">
           <div className="flex-1">
               <p className="text-xs font-semibold text-dark-muted uppercase tracking-wider mb-1">Answer Transcribed</p>
               <h4 className="text-sm font-medium text-white italic line-clamp-2">"{lastTranscript}"</h4>
           </div>
           <div className="w-16 h-16 shrink-0 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{latestScore}</span>
           </div>
        </div>
      )}
    </div>
  );
}
