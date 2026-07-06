import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHistory } from '../api';
import ScoreCard from '../components/ScoreCard';
import BulletsCard from '../components/BulletsCard';
import SkillGapsCard from '../components/SkillGapsCard';
import CoverLetterCard from '../components/CoverLetterCard';

function getFirstName() {
  try {
    const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
    return payload.firstName || '';
  } catch { return ''; }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ScoreBadge({ score }) {
  const cls = score >= 75
    ? 'bg-green-100 text-green-700'
    : score >= 50
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${cls}`}>
      {score}<span className="font-normal text-xs opacity-70">/ 100</span>
    </span>
  );
}

function Highlight({ text, query }) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 not-italic">{part}</mark>
      : part
  );
}

function getSnippetAroundMatch(fullText, query, snippetLen = 200) {
  if (!query || !fullText) return fullText?.slice(0, snippetLen) ?? '';
  const idx = fullText.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return fullText.slice(0, snippetLen);
  const start = Math.max(0, idx - 80);
  const end = Math.min(fullText.length, idx + query.length + 120);
  const slice = fullText.slice(start, end).replace(/\n/g, ' ');
  return (start > 0 ? '…' : '') + slice + (end < fullText.length ? '…' : '');
}

function AnalysisCard({ item, search }) {
  const [open, setOpen] = useState(false);
  const gapCount = item.skill_gaps?.length ?? 0;
  const bulletCount = item.rewritten_bullets?.length ?? 0;
  const companyName = item.company_name || 'Unknown';

  const matchInDescription = search &&
    !(item.company_name || '').toLowerCase().includes(search.toLowerCase()) &&
    (item.job_description || '').toLowerCase().includes(search.toLowerCase());

  const snippet = matchInDescription
    ? getSnippetAroundMatch(item.job_description, search)
    : (item.job_description_snippet || '').replace(/\n/g, ' ');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/60 transition group"
      >
        {/* Company initial avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base select-none">
          {companyName[0]?.toUpperCase() ?? '?'}
        </div>

        {/* Company name + snippet + date */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            <Highlight text={companyName} query={search} />
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {snippet
              ? <Highlight text={snippet} query={search} />
              : 'No description preview'}
          </p>
          <p className="text-xs text-gray-300 mt-0.5">{formatDate(item.created_at)}</p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <ScoreBadge score={item.match_score} />
          <span className="text-xs text-gray-400">{bulletCount} {bulletCount === 1 ? 'bullet' : 'bullets'}</span>
          <span className="text-xs text-gray-400">{gapCount} {gapCount === 1 ? 'gap' : 'gaps'}</span>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mobile stats */}
      <div className="sm:hidden flex items-center gap-3 px-6 pb-4">
        <ScoreBadge score={item.match_score} />
        <span className="text-xs text-gray-400">{bulletCount} bullets · {gapCount} {gapCount === 1 ? 'gap' : 'gaps'}</span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-100 px-6 py-6 space-y-5 bg-slate-50/50">
          <ScoreCard score={item.match_score} />
          <div className="grid md:grid-cols-2 gap-5">
            <BulletsCard bullets={item.rewritten_bullets} />
            <SkillGapsCard gaps={item.skill_gaps} />
          </div>
          <CoverLetterCard coverLetter={item.cover_letter} />
        </div>
      )}
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const firstName = getFirstName();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getHistory()
      .then(setAnalyses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return analyses;
    return analyses.filter((item) =>
      (item.company_name || '').toLowerCase().includes(q) ||
      (item.job_description || '').toLowerCase().includes(q)
    );
  }, [analyses, search]);

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Job Analyzer</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              New Analysis
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            {firstName && (
              <span className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                Welcome,&nbsp;<span className="font-semibold text-indigo-600">{firstName}</span>
              </span>
            )}
            {firstName && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm select-none">
                {firstName[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-1">History</p>
          <h1 className="text-3xl font-bold text-white mb-2">Past Analyses</h1>
          <p className="text-indigo-200 text-sm">
            Every analysis you've run is saved here. Click any entry to expand the full results.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-20 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && analyses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No analyses yet</h3>
            <p className="text-sm text-gray-400 mb-5">Run your first analysis to see results here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze a Resume
            </Link>
          </div>
        )}

        {!loading && !error && analyses.length > 0 && (
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company name or job description…"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Count line */}
            <p className="text-sm text-gray-400">
              {search
                ? `${filtered.length} of ${analyses.length} ${analyses.length === 1 ? 'analysis' : 'analyses'} match`
                : `${analyses.length} ${analyses.length === 1 ? 'analysis' : 'analyses'} — newest first`}
            </p>

            {/* No search results */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No results for "{search}"</p>
                <p className="text-xs text-gray-400">Try a different company name or keyword.</p>
              </div>
            )}

            {/* List */}
            <div className="space-y-3">
              {filtered.map((item) => (
                <AnalysisCard key={item.id} item={item} search={search} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
