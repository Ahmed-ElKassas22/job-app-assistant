const TIERS = [
  {
    key: 'critical',
    label: 'Must-Have',
    description: 'Deal-breakers — required by the job',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    pillBg: 'bg-red-50 border-red-200 text-red-800',
    dot: 'bg-red-400',
    headerBg: 'bg-red-50/60',
    headerBorder: 'border-red-100',
    labelColor: 'text-red-700',
  },
  {
    key: 'important',
    label: 'Recommended',
    description: 'Strongly preferred — would strengthen your application',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    pillBg: 'bg-amber-50 border-amber-200 text-amber-800',
    dot: 'bg-amber-400',
    headerBg: 'bg-amber-50/60',
    headerBorder: 'border-amber-100',
    labelColor: 'text-amber-700',
  },
  {
    key: 'nice-to-have',
    label: 'Nice to Have',
    description: 'Bonus — mentioned but not core requirements',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    ),
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-50',
    pillBg: 'bg-blue-50 border-blue-200 text-blue-800',
    dot: 'bg-blue-300',
    headerBg: 'bg-blue-50/40',
    headerBorder: 'border-blue-100',
    labelColor: 'text-blue-600',
  },
];

export default function SkillGapsCard({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-800">No skill gaps found</p>
        <p className="text-xs text-gray-400 mt-1">Your skills are well-aligned with this role.</p>
      </div>
    );
  }

  // Support legacy plain-string format from old history entries
  const isLegacy = typeof gaps[0] === 'string';
  if (isLegacy) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Skill Gaps</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {gaps.map((g, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {g}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const totalGaps = gaps.length;
  const criticalCount = gaps.filter((g) => g.importance === 'critical').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Skill Gaps</h3>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {criticalCount} critical
            </span>
          )}
          <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {totalGaps} total
          </span>
        </div>
      </div>

      {/* Tiers */}
      <div className="divide-y divide-gray-100">
        {TIERS.map((tier) => {
          const items = gaps.filter((g) => g.importance === tier.key);
          if (items.length === 0) return null;
          return (
            <div key={tier.key} className="px-6 py-4">
              {/* Tier header */}
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${tier.headerBorder}`}>
                <div className={`w-6 h-6 rounded-md ${tier.iconBg} flex items-center justify-center`}>
                  <svg className={`w-3.5 h-3.5 ${tier.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tier.icon}
                  </svg>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${tier.labelColor}`}>
                  {tier.label}
                </span>
                <span className="ml-auto text-xs text-gray-400">{tier.description}</span>
              </div>

              {/* Pills */}
              <div className="flex flex-wrap gap-2">
                {items.map((g, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-1.5 rounded-full ${tier.pillBg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tier.dot}`} />
                    {g.skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
