import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Home, TrendingUp, Award } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, ReportData } from '../services/api';

export default function Report() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId') || undefined;
      const data = await api.generateReport(sessionId);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const content = `
AI Mock Interview Report
========================

Overall Score: ${reportData?.overall_score}/100

Performance Breakdown:
- Technical: ${reportData?.technical}/100
- Depth: ${reportData?.depth}/100
- Clarity: ${reportData?.clarity}/100
- Confidence: ${reportData?.confidence}/100

Strengths:
${reportData?.strengths.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${reportData?.improvements.map(i => `- ${i}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-glow rounded-full blur-[120px] opacity-20" />
        <div className="text-center space-y-6 z-10 animate-fade-in-up">
          <div className="relative w-16 h-16 mx-auto">
             <div className="absolute inset-0 border-4 border-dark-border rounded-full" />
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
          <p className="text-white text-lg font-medium tracking-wide">Synthesizing Final Report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
        <div className="text-center space-y-6 z-10 glass-panel p-12 rounded-3xl animate-fade-in-up">
          <p className="text-red-400 text-lg font-medium">Failed to load interview report</p>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { skill: 'Technical', score: reportData.technical },
    { skill: 'Depth', score: reportData.depth },
    { skill: 'Clarity', score: reportData.clarity },
    { skill: 'Confidence', score: reportData.confidence },
  ];

  const barData = reportData.skills_analysis || radarData.map(d => ({ skill: d.skill, score: d.score }));

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-glow rounded-full blur-[150px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-glow rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <div className="container mx-auto max-w-6xl space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">Interview Report</h1>
            <p className="text-lg text-dark-muted font-medium">Comprehensive review of your performance</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export PDF</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-primary flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {[
            { label: 'Overall Score', value: reportData.overall_score, icon: Award, color: 'text-white border-white/20', bg: 'bg-white/10' },
            { label: 'Technical', value: reportData.technical, icon: TrendingUp, color: 'text-primary border-primary/30', bg: 'bg-primary/10' },
            { label: 'Communication', value: reportData.clarity, icon: TrendingUp, color: 'text-cyan-400 border-cyan-400/30', bg: 'bg-cyan-500/10' },
            { label: 'Confidence', value: reportData.confidence, icon: TrendingUp, color: 'text-emerald-400 border-emerald-400/30', bg: 'bg-emerald-500/10' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-dark-muted font-semibold uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">{stat.value}<span className="text-xl text-dark-muted font-medium">/100</span></p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white tracking-wide mb-8 uppercase text-center md:text-left">Skills Consistency</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569' }} />
                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white tracking-wide mb-8 uppercase text-center md:text-left">Detailed Breakdown</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="score" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    </defs>
                </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="glass-card p-8 rounded-3xl border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-bold text-emerald-400 tracking-wide uppercase mb-6 flex items-center gap-3">
              <Award className="w-5 h-5" />
              Key Strengths
            </h3>
            <ul className="space-y-4">
              {(reportData.strengths || [
                'Clear communication style',
                'Good technical knowledge',
                'Confident delivery',
              ]).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-4 text-slate-300">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</div>
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-8 rounded-3xl border-l-4 border-l-amber-500">
            <h3 className="text-lg font-bold text-amber-400 tracking-wide uppercase mb-6 flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              Focus Areas
            </h3>
            <ul className="space-y-4">
              {(reportData.improvements || [
                'Provide more specific examples',
                'Expand on technical details',
                'Structure answers more clearly',
              ]).map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-4 text-slate-300">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">→</div>
                  <span className="leading-relaxed">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
