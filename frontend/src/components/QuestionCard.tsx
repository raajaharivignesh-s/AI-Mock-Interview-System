// Removed UserCircle import
/**
 * Props for the QuestionCard component.
 */
interface QuestionCardProps {
  /** The text of the AI interviewer's most recent question */
  question: string;
  /** Toggles the loading animation if the AI is currently generating a response */
  isThinking?: boolean;
}

/**
 * QuestionCard Component
 * 
 * Displays the AI avatar, interviewer metadata, and the current question text.
 * Switches to a "Thinking" animation state when awaiting the backend response.
 */
export default function QuestionCard({ question, isThinking }: QuestionCardProps) {
  return (
    <div className="flex flex-col h-full justify-center space-y-8 animate-fade-in-up">
      {/* Interviewer Avatar Area */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-dark-border shadow-[0_0_40px_rgba(59,130,246,0.15)] flex items-center justify-center overflow-hidden">
             {/* Professional SVG digital avatar fixed alignment */}
             <svg className="w-20 h-20 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
             </svg>
            
            {/* Thinking pulsing overlay */}
            {isThinking && (
              <div className="absolute inset-0 bg-primary/20 animate-pulse mix-blend-overlay" />
            )}
          </div>
          <div className={`absolute bottom-1 right-2 w-6 h-6 rounded-full border-4 border-dark-bg transition-colors duration-500 ${isThinking ? 'bg-amber-400' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'}`} />
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-white tracking-tight">Prashanna</h3>
          <p className="text-sm text-dark-muted font-medium">Senior Engineering Manager</p>
        </div>
      </div>

      {/* Structured Prompt Display (Subtitle Style) */}
      <div className="max-w-3xl mx-auto w-full text-center mt-12 min-h-[120px] flex items-center justify-center">
        {isThinking ? (
          <div className="flex items-center gap-3 text-dark-muted px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-sm tracking-widest uppercase font-semibold">Analyzing profile</span>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : (
          <h2 className="text-2xl md:text-4xl text-white font-medium leading-relaxed tracking-tight animate-fade-in drop-shadow-lg">
            "{question}"
          </h2>
        )}
      </div>
    </div>
  );
}
