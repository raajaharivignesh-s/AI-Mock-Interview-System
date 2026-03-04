interface ScorePanelProps {
  technical: number;
  depth: number;
  clarity: number;
  confidence: number;
}

export default function ScorePanel({ technical, depth, clarity, confidence }: ScorePanelProps) {
  const scores = [
    { label: 'Technical Accuracy', value: technical, color: 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]' },
    { label: 'Response Depth', value: depth, color: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]' },
    { label: 'Clarity & Structure', value: clarity, color: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]' },
    { label: 'Confidence & Tone', value: confidence, color: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl w-full">
      <h3 className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-6">Live Evaluation Metrics</h3>

      <div className="space-y-6">
        {scores.map((score) => (
          <div key={score.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white font-medium">{score.label}</span>
              <span className="text-sm text-dark-muted font-semibold">{score.value}%</span>
            </div>
            <div className="relative h-1.5 bg-dark-bg border border-dark-border rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full ${score.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${score.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-dark-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-dark-muted font-medium uppercase tracking-wide">Overall Rating</span>
          <span className="text-2xl font-bold text-white drop-shadow-lg">
            {Math.round((technical + depth + clarity + confidence) / 4)}/100
          </span>
        </div>
      </div>
    </div>
  );
}
