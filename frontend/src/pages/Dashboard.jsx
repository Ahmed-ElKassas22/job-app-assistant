import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { analyzePdf } from '../api';
import ScoreCard from '../components/ScoreCard';
import BulletsCard from '../components/BulletsCard';
import CoverLetterCard from '../components/CoverLetterCard';
import SkillGapsCard from '../components/SkillGapsCard';
import ResultsSkeleton from '../components/ResultsSkeleton';

const STEP_DELAYS = [0, 1200, 3500];

function getFirstName() {
  try {
    const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
    return payload.firstName || '';
  } catch { return ''; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const resultsRef = useRef(null);
  const firstName = getFirstName();

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const timers = STEP_DELAYS.slice(1).map((delay, i) =>
      setTimeout(() => setLoadingStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  function handleFile(f) {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files are supported.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File is too large. Maximum size is 10 MB.'); return; }
    setFile(f);
    setError('');
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setError('Please upload your resume PDF.');
    if (!jobDescription.trim()) return setError('Please enter a job description.');
    setError('');
    setWarning('');
    setResult(null);
    setLoading(true);
    try {
      const data = await analyzePdf(file, jobDescription);
      setResult(data);
    } catch (err) {
      if (err.code === 'INSUFFICIENT_INFO') {
        setWarning(err.message);
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="Job Analyzer AI" className="h-16 w-16 object-contain" />
            <span className="font-bold text-gray-900 tracking-tight">Job Analyzer AI</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link
              to="/history"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </Link>
            {firstName && (
              <span className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                Welcome,&nbsp;<span className="font-semibold text-indigo-600">{firstName}</span>
              </span>
            )}
            <div className="w-px h-5 bg-gray-200" />
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

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-1">{getGreeting()}</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            {firstName ? `${firstName}, ready to land your next role?` : 'Ready to land your next role?'}
          </h1>
          <p className="text-indigo-200 text-sm max-w-lg">
            Upload your resume and paste a job description — our AI will score the match, rewrite your bullets, generate a cover letter, and surface your skill gaps.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ── Upload card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
            <h2 className="font-semibold text-gray-900">Upload your resume & job description</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Drop zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF)</label>
                <div
                  onClick={() => !loading && fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); if (!loading) setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`relative h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                    ${loading ? 'pointer-events-none opacity-50' : ''}
                    ${dragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : ''}
                    ${file ? 'border-green-400 bg-green-50' : !dragging ? 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40' : ''}`}
                >
                  <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])} />

                  {file ? (
                    <div className="flex flex-col items-center gap-2 px-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800 break-all">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      {!loading && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="text-xs text-gray-400 hover:text-red-500 underline transition">
                          Remove file
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center px-6">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-1">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        Drop your resume here or{' '}
                        <span className="text-indigo-600 font-semibold">browse</span>
                      </p>
                      <p className="text-xs text-gray-400">PDF only · max 10 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job description */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                  placeholder="Paste the full job description here — the more detail, the better the analysis."
                  className="flex-1 min-h-[12rem] border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60"
                />
              </div>
            </div>

            {/* Insufficient info warning */}
            {warning && (
              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Not enough information</p>
                    <p className="text-sm text-amber-700 mt-0.5">{warning}</p>
                    <p className="text-xs text-amber-600 mt-1.5">Try adding more detail — required skills, responsibilities, qualifications, or technologies.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setWarning('')} className="flex-shrink-0 text-amber-400 hover:text-amber-600 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
                <button type="button" onClick={() => setError('')} className="flex-shrink-0 text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Submit */}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-8 py-3 rounded-xl text-sm transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing your application…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div ref={resultsRef}>
            <ResultsSkeleton step={loadingStep} />
          </div>
        )}

        {/* ── Results ── */}
        {!loading && result && (
          <div ref={resultsRef} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
              <h2 className="font-semibold text-gray-900 text-lg">Your AI Analysis</h2>
            </div>

            {/* Score — full width */}
            <ScoreCard score={result.match_score} />

            {/* Bullets + Skill Gaps — side by side */}
            <div className="grid md:grid-cols-2 gap-5">
              <BulletsCard bullets={result.rewritten_bullets} />
              <SkillGapsCard gaps={result.skill_gaps} />
            </div>

            {/* Cover letter — full width */}
            <CoverLetterCard coverLetter={result.cover_letter} />
          </div>
        )}
      </main>
    </div>
  );
}
