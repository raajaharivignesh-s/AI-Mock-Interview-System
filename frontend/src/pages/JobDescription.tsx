/**
 * pages/JobDescription.tsx
 * 
 * Step 1 of the interview flow. Allows the user to paste a Job Description (JD).
 * Submits the JD to the backend to initialize an interview session and store the ID.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

/**
 * JobDescription Data Entry Component
 */
export default function JobDescription() {
  const navigate = useNavigate();
  const [jdText, setJdText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const wordCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;
  const isEnabled = wordCount >= 10;

  const handleSubmit = async () => {
    if (!isEnabled) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Assuming api.submitJD is implemented below
      const data = await api.submitJD(jdText);
      if (data.session_id) {
        localStorage.setItem('sessionId', data.session_id);
      }
      navigate('/upload');
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to submit Job Description. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-glow rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-glow rounded-full blur-[120px] opacity-20 pointer-events-none" />
      
      <div className="max-w-3xl w-full z-10 animate-fade-in-up">
        
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Job Requirements</h1>
          <p className="text-lg text-dark-muted max-w-xl mx-auto">
            Paste the Job Description (JD) below. We'll use this context to generate highly targeted, realistic interview questions.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl space-y-6">
          <div className="relative">
            <textarea
              className="w-full h-64 glass-input p-6 resize-none focus:outline-none text-base leading-relaxed"
              placeholder="e.g. We are looking for a Senior React Developer with experience in Next.js, TypeScript, and modern state management..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm">
              <span className={`${wordCount < 10 && wordCount > 0 ? 'text-amber-400' : 'text-dark-muted'}`}>
                {wordCount} words
              </span>
              {wordCount < 10 && (
                <span className="text-amber-400 text-xs">(minimum 10)</span>
              )}
            </div>
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isEnabled || isSubmitting}
            className="w-full btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue to Resume Upload</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
        
        {/* Step indicator */}
        <div className="mt-8 flex justify-center items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
            <div className="w-8 h-[2px] bg-dark-border"></div>
            <div className="w-2 h-2 rounded-full bg-dark-border"></div>
            <div className="w-8 h-[2px] bg-dark-border"></div>
            <div className="w-2 h-2 rounded-full bg-dark-border"></div>
        </div>

      </div>
    </div>
  );
}
