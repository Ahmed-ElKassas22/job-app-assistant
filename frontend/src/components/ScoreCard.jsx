export default function ScoreCard({ score }) {
  const isStrong = score >= 75;
  const isMid = score >= 50 && score < 75;

  const accent = isStrong ? {
    ring: '#22c55e', bg: 'bg-green-50', border: 'border-green-100',
    badge: 'bg-green-100 text-green-700', label: 'Strong Match',
    text: 'text-green-700', tip: 'Your resume is a strong fit. Apply with confidence.',
  } : isMid ? {
    ring: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-700', label: 'Moderate Match',
    text: 'text-amber-700', tip: 'Some gaps exist — review the skill gaps and rewritten bullets below.',
  } : {
    ring: '#ef4444', bg: 'bg-red-50', border: 'border-red-100',
    badge: 'bg-red-100 text-red-700', label: 'Low Match',
    text: 'text-red-700', tip: 'Significant gaps found — focus on bridging the skills listed below before applying.',
  };

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6`}>
      {/* Gauge */}
      <div className="relative flex-shrink-0 w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="9" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={accent.ring}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${accent.text}`}>{score}</span>
          <span className="text-xs text-gray-400 font-medium">/ 100</span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Match Score</p>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${accent.badge} mb-3`}>
          {accent.label}
        </span>
        <p className="text-sm text-gray-600 leading-relaxed">{accent.tip}</p>

        {/* Score bar */}
        <div className="mt-4 h-2 rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, backgroundColor: accent.ring }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span><span>50</span><span>100</span>
        </div>
      </div>
    </div>
  );
}
