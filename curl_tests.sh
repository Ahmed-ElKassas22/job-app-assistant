#!/usr/bin/env bash
# ── Job App Assistant — curl test commands ─────────────────────────────────────
# Set BASE_URL if your server runs on a different port.
BASE_URL="http://localhost:3000"

echo "=== 1. Health check ==="
curl -s "$BASE_URL/health" | jq .

echo ""
echo "=== 2. Register ==="
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq .

echo ""
echo "=== 3. Login (copy the token into TOKEN below) ==="
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq .

# ── Set your token here after running login ────────────────────────────────────
TOKEN="paste_your_jwt_token_here"

echo ""
echo "=== 4. Analyze text resume ==="
curl -s -X POST "$BASE_URL/api/analyze/text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "resume_text": "Software Engineer with 5 years of experience in Python, Django, and REST APIs. Led a team of 4 engineers to deliver a microservices migration. Reduced API latency by 40%. BS in Computer Science.",
    "job_description": "We are looking for a Senior Backend Engineer proficient in Python and cloud infrastructure (AWS). Experience with microservices, CI/CD pipelines, and team leadership required. Kubernetes experience is a plus."
  }' | jq .

echo ""
echo "=== 5. Analyze PDF resume ==="
echo "(Replace resume.pdf with a real PDF path)"
# curl -s -X POST "$BASE_URL/api/analyze/pdf" \
#   -H "Authorization: Bearer $TOKEN" \
#   -F "file=@/path/to/resume.pdf" \
#   -F "job_description=We are looking for a Senior Backend Engineer..." | jq .

echo ""
echo "=== 6. Fetch analysis history ==="
curl -s "$BASE_URL/api/analyze/history" \
  -H "Authorization: Bearer $TOKEN" | jq .
