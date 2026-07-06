function Pulse({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function SkeletonCard({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {children}
    </div>
  );
}

export default function ResultsSkeleton({ step }) {
  const steps = ['Uploading resume…', 'Parsing PDF…', 'Analyzing with AI…'];
  const label = steps[Math.min(step, steps.length - 1)];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
        <span className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {label}
        </span>
      </div>

      {/* Step pills */}
      <div className="flex gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-indigo-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Score skeleton */}
        <SkeletonCard>
          <Pulse className="h-3 w-24 mb-6" />
          <div className="flex flex-col items-center">
            <Pulse className="w-28 h-28 rounded-full" />
            <Pulse className="h-4 w-24 mt-4" />
          </div>
        </SkeletonCard>

        {/* Skill gaps skeleton */}
        <SkeletonCard>
          <Pulse className="h-3 w-24 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[80, 100, 64, 88, 72].map((w) => (
              <Pulse key={w} className={`h-7 rounded-full`} style={{ width: `${w}px` }} />
            ))}
          </div>
        </SkeletonCard>

        {/* Bullets skeleton */}
        <SkeletonCard>
          <Pulse className="h-3 w-40 mb-5" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Pulse className="w-6 h-6 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Pulse className="h-3 w-full" />
                  <Pulse className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Cover letter skeleton */}
        <SkeletonCard>
          <Pulse className="h-3 w-28 mb-5" />
          <div className="space-y-2">
            {[100, 95, 88, 100, 72, 90, 65].map((w, i) => (
              <Pulse key={i} className="h-3" style={{ width: `${w}%` }} />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
