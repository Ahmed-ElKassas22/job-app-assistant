# Job App Assistant

An AI-powered job application tool that analyzes your resume against a job description and returns a match score, rewritten bullets, a cover letter, and skill gaps — all powered by Claude (Anthropic) via LangChain.js.

## Demo

![Dashboard screenshot](docs/screenshot.svg)

> Upload a PDF resume, paste a job description, and get AI-generated results in seconds.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| AI | Anthropic Claude (claude-opus-4-8) via LangChain.js |
| Auth | JWT + bcrypt |

---

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** v14 or later (running locally or via a connection string)
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

---

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd job-app-assistant
```

### 2. Configure environment variables

Copy the template and fill in your values:

```bash
cp .env .env.local   # or just edit .env directly
```

```env
ANTHROPIC_API_KEY=sk-ant-...          # Your Anthropic API key
JWT_SECRET=change-me-to-something-long # Random secret string for signing JWTs
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_app_assistant
PORT=3000
```

### 3. Create the database and tables

```bash
createdb job_app_assistant
psql job_app_assistant < schema.sql
```

> If your PostgreSQL user is not `postgres`, adjust the `DATABASE_URL` accordingly.

### 4. Install backend dependencies

```bash
npm install
```

### 5. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Running Locally

Open **two terminals**:

**Terminal 1 — Backend (port 3000):**
```bash
npm start
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite dev server proxies all `/api/*` requests to `http://localhost:3000`, so no CORS configuration is needed during development.

---

## API Reference

All protected endpoints require `Authorization: Bearer <token>` header.

### Auth

#### `POST /api/auth/register`
```json
{ "email": "you@example.com", "password": "secret123" }
```
Returns `{ token, user }`.

#### `POST /api/auth/login`
```json
{ "email": "you@example.com", "password": "secret123" }
```
Returns `{ token, user }`.

---

### Analyze

#### `POST /api/analyze/text`
```json
{
  "resume_text": "Your resume content as plain text...",
  "job_description": "The full job posting..."
}
```

#### `POST /api/analyze/pdf`
Multipart form upload:
- `file` — PDF file (max 10 MB)
- `job_description` — Job description text

Both endpoints return:
```json
{
  "analysis_id": 42,
  "match_score": 82,
  "rewritten_bullets": ["...", "...", "..."],
  "cover_letter": "Dear Hiring Manager...",
  "skill_gaps": ["Kubernetes", "CI/CD", "AWS"],
  "created_at": "2026-07-05T..."
}
```

#### `GET /api/analyze/history`
Returns the authenticated user's past analyses, newest first.

---

## Testing with curl

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Login — copy the token from the response
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Analyze text resume
curl -X POST http://localhost:3000/api/analyze/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "resume_text": "5 years Python, led team of 4, reduced API latency 40%.",
    "job_description": "Senior Backend Engineer, Python required, AWS a plus."
  }'

# 4. Analyze PDF
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/resume.pdf" \
  -F "job_description=Senior Backend Engineer..."
```

A full test script is in `curl_tests.sh`.

---

## Project Structure

```
job-app-assistant/
├── .env                    # Environment variables (never commit this)
├── schema.sql              # PostgreSQL table definitions
├── curl_tests.sh           # Manual test commands
├── src/
│   ├── app.js              # Express entry point
│   ├── db.js               # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js         # JWT verification
│   ├── routes/
│   │   ├── auth.js         # /api/auth/register, /api/auth/login
│   │   └── analyze.js      # /api/analyze/text, /api/analyze/pdf, /api/analyze/history
│   └── services/
│       └── langchain.js    # LangChain + Anthropic integration
└── frontend/
    ├── vite.config.js      # Dev server + /api proxy
    └── src/
        ├── api.js          # Fetch wrappers with auth headers
        ├── App.jsx         # Router setup
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        └── components/
            ├── ProtectedRoute.jsx
            ├── ResultsSkeleton.jsx
            ├── ScoreCard.jsx
            ├── BulletsCard.jsx
            ├── CoverLetterCard.jsx
            └── SkillGapsCard.jsx
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Invalid API key | 500 with descriptive message |
| Anthropic rate limit | 429 returned to client |
| Password-protected PDF | 422 with clear message |
| AI returns malformed JSON | Auto-strips code fences, falls back to regex extraction |
| Expired JWT | Token cleared, user redirected to login |
| Server unreachable | Frontend shows "Cannot reach server" message |
| File too large (>10 MB) | 413 from multer before hitting the AI |

---

## Production Build

```bash
cd frontend
npm run build
```

The `frontend/dist/` folder contains static assets you can serve from Express or any CDN.

To serve from Express, add to `src/app.js`:
```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
```
