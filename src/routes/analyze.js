const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const pool = require('../db');
const requireAuth = require('../middleware/auth');
const { analyzeResumeAndJob } = require('../services/langchain');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const MAX_RESUME_CHARS = 50_000;
const MAX_JD_CHARS = 20_000;

async function runAnalysis(req, res, resumeText) {
  const { job_description } = req.body;
  if (!job_description || !job_description.trim()) {
    return res.status(400).json({ error: 'job_description is required' });
  }
  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ error: 'Resume text is empty — the PDF may have no extractable text' });
  }
  if (resumeText.length > MAX_RESUME_CHARS) {
    return res.status(400).json({ error: `Resume exceeds ${MAX_RESUME_CHARS} character limit` });
  }
  if (job_description.length > MAX_JD_CHARS) {
    return res.status(400).json({ error: `Job description exceeds ${MAX_JD_CHARS} character limit` });
  }

  const result = await analyzeResumeAndJob(resumeText, job_description);

  const { rows } = await pool.query(
    `INSERT INTO analyses
       (user_id, resume_text, job_description, company_name, match_score, rewritten_bullets, cover_letter, skill_gaps)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, created_at`,
    [
      req.user.userId,
      resumeText,
      job_description,
      result.company_name || 'Unknown',
      result.match_score,
      JSON.stringify(result.rewritten_bullets),
      result.cover_letter,
      JSON.stringify(result.skill_gaps),
    ]
  );

  res.json({ analysis_id: rows[0].id, created_at: rows[0].created_at, ...result });
}

function handleAnalysisError(err, res) {
  console.error('[analyze]', err);
  if (err.code === 'INSUFFICIENT_INFO') {
    return res.status(422).json({ error: err.message, code: 'INSUFFICIENT_INFO' });
  }
  const status = err.message?.startsWith('Invalid Anthropic') ? 500
    : err.message?.startsWith('Anthropic rate limit') ? 429
    : 500;
  res.status(status).json({ error: err.message || 'Analysis failed' });
}

// POST /api/analyze/text — body: { resume_text, job_description }
router.post('/text', requireAuth, async (req, res) => {
  try {
    const { resume_text } = req.body;
    if (!resume_text || !resume_text.trim()) {
      return res.status(400).json({ error: 'resume_text is required' });
    }
    await runAnalysis(req, res, resume_text);
  } catch (err) {
    handleAnalysisError(err, res);
  }
});

// POST /api/analyze/pdf — multipart: file=resume.pdf, job_description=...
router.post('/pdf', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required (field name: file)' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Uploaded file must be a PDF' });
    }
    let parsed;
    try {
      parsed = await pdfParse(req.file.buffer);
    } catch {
      return res.status(422).json({ error: 'Could not read PDF. Make sure it is not password-protected.' });
    }
    await runAnalysis(req, res, parsed.text);
  } catch (err) {
    handleAnalysisError(err, res);
  }
});

// GET /api/analyze/history — returns user's past analyses
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, company_name, match_score, rewritten_bullets, cover_letter, skill_gaps,
              job_description, LEFT(job_description, 200) AS job_description_snippet, created_at
       FROM analyses WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
