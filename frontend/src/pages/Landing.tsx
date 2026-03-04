import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in-up z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-border bg-white/5 backdrop-blur-sm text-primary text-sm mb-4 font-medium tracking-wide">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Interview Coaching</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
          Master Your Next <br />
          <span className="text-gradient">
            Technical Interview
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-dark-muted max-w-2xl mx-auto leading-relaxed">
          Experience hyper-realistic, voice-based interview practice tailored to your Job Description and Resume.
        </p>

        <div className="pt-8 flex justify-center">
          <button
            onClick={() => navigate('/jd')}
            className="btn-primary text-lg px-8 py-4 group"
          >
            <span>Start Practice Interview</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-3xl mx-auto">
          {[
            { title: 'Tailored to JD', desc: 'Questions generated specifically for the role you want.' },
            { title: 'Human-Like Voice', desc: 'Natural conversation with realistic HR avatars.' },
            { title: 'Actionable Insights', desc: 'Detailed scoring on clarity, depth, and confidence.' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl text-left"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-dark-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
