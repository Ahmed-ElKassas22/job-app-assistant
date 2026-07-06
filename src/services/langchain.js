const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are an expert career coach and resume analyst.
Analyze the provided resume against the job description and respond with ONLY valid JSON (no markdown, no explanation):

{
  "company_name": "<company or organization name extracted from the job description; use 'Unknown' if not mentioned>",
  "match_score": <integer 0-100>,
  "rewritten_bullets": [
    {
      "original": "<exact sentence or bullet copied verbatim from the resume>",
      "rewritten": "<improved version tailored to the job description>"
    }
  ],
  "cover_letter": "<full professional cover letter>",
  "skill_gaps": [
    { "skill": "<skill name>", "importance": "critical" | "important" | "nice-to-have" }
  ]
}

If the job description is too vague, too short, or lacks enough detail about responsibilities, required skills, or qualifications to perform a meaningful analysis, respond with ONLY this JSON instead:
{ "insufficient_info": true, "reason": "<one sentence explaining what is missing or unclear>" }

Rules:
- company_name: extract only the actual company/organization name (e.g. "Google", "Acme Corp"). Do not include job title, department, or location. Use "Unknown" if genuinely absent.
- rewritten_bullets: only include a bullet if it is genuinely weak, vague, or misaligned with the job — and your rewrite makes a meaningful, substantive improvement. Do NOT rewrite bullets that are already strong, specific, and relevant. It is perfectly acceptable to return an empty array [] if all bullets are already well-written for this role. Never rewrite just to make minor wording changes — the rewritten version must be clearly better and more targeted to the job.
- skill_gaps: list every skill, technology, or qualification the job requires that is absent or insufficiently demonstrated in the resume. Assign each an importance level:
    "critical"     — explicitly required, likely a deal-breaker if missing
    "important"    — strongly preferred, would significantly strengthen the application
    "nice-to-have" — mentioned or implied but not a core requirement
  Return an empty array [] if there are no gaps.
- match_score: holistic 0–100 score reflecting how well the resume matches the job.`;

function extractJson(raw) {
  const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new SyntaxError('Model did not return valid JSON');
  }
}

function validateResult(obj) {
  if (typeof obj.company_name !== 'string' || !obj.company_name.trim()) {
    obj.company_name = 'Unknown';
  }
  if (typeof obj.match_score !== 'number' || obj.match_score < 0 || obj.match_score > 100) {
    throw new TypeError('Invalid match_score in model response');
  }
  if (!Array.isArray(obj.rewritten_bullets)) {
    throw new TypeError('Invalid rewritten_bullets in model response');
  }
  for (const b of obj.rewritten_bullets) {
    if (typeof b !== 'object' || typeof b.original !== 'string' || typeof b.rewritten !== 'string') {
      throw new TypeError('Each rewritten_bullet must have original and rewritten fields');
    }
  }
  if (typeof obj.cover_letter !== 'string' || !obj.cover_letter.trim()) {
    throw new TypeError('Invalid cover_letter in model response');
  }
  if (!Array.isArray(obj.skill_gaps)) {
    throw new TypeError('Invalid skill_gaps in model response');
  }
  const validImportance = ['critical', 'important', 'nice-to-have'];
  for (const g of obj.skill_gaps) {
    if (typeof g === 'object' && g !== null) {
      if (typeof g.skill !== 'string' || !validImportance.includes(g.importance)) {
        throw new TypeError('Each skill_gap object must have skill and importance fields');
      }
    }
  }
}

async function analyzeResumeAndJob(resumeText, jobDescription) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let message;
  try {
    message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
    });
  } catch (err) {
    const msg = err?.message || '';
    if (msg.includes('401') || msg.includes('authentication')) {
      throw new Error('Invalid Anthropic API key. Check your ANTHROPIC_API_KEY in .env');
    }
    if (msg.includes('429') || msg.includes('rate')) {
      throw new Error('Anthropic rate limit reached. Please wait a moment and try again.');
    }
    throw new Error(`AI service error: ${msg}`);
  }

  const raw = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  if (!raw.trim()) {
    throw new Error('AI returned an empty response. Please try again.');
  }

  let parsed;
  try {
    parsed = extractJson(raw);
  } catch {
    throw new Error('AI returned an unexpected format. Please try again.');
  }

  if (parsed.insufficient_info === true) {
    const err = new Error(parsed.reason || 'The job description does not contain enough detail for a meaningful analysis.');
    err.code = 'INSUFFICIENT_INFO';
    throw err;
  }

  validateResult(parsed);
  return parsed;
}

module.exports = { analyzeResumeAndJob };
