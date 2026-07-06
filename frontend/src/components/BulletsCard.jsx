export default function BulletsCard({ bullets }) {
  if (!bullets || bullets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Rewritten Resume Bullets</h3>
        </div>
        <p className="text-sm text-gray-400 italic">No bullets to rewrite.</p>
      </div>
    );
  }

  // Support both old format (plain strings) and new format ({original, rewritten})
  const isRich = typeof bullets[0] === 'object' && bullets[0] !== null && 'rewritten' in bullets[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Rewritten Resume Bullets</h3>
        </div>
        <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full">
          {bullets.length} {bullets.length === 1 ? 'bullet' : 'bullets'}
        </span>
      </div>

      <ul className="space-y-4">
        {bullets.map((bullet, i) => (
          <li key={i}>
            {isRich ? (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {/* Original */}
                <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="flex-shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-200 rounded px-1.5 py-0.5">
                    Before
                  </span>
                  <p className="text-sm text-gray-500 leading-relaxed line-through decoration-gray-300">
                    {bullet.original}
                  </p>
                </div>
                {/* Rewritten */}
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="flex-shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 rounded px-1.5 py-0.5">
                    After
                  </span>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{bullet.rewritten}</p>
                </div>
              </div>
            ) : (
              // Legacy plain-string format
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{bullet}</p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
