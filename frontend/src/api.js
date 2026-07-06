const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status}). Please try again.`);
  }

  if (res.status === 401) {
    if (window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error(data.error || 'Invalid email or password.');
  }

  if (res.status === 429) {
    throw new Error(data.error || 'Too many requests. Please wait a moment and try again.');
  }

  if (!res.ok) {
    const err = new Error(data.error || `Unexpected error (${res.status})`);
    if (data.code) err.code = data.code;
    throw err;
  }

  return data;
}

async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot reach the server. Make sure the backend is running on port 3000.');
    }
    throw err;
  }
}

export async function register(email, password, firstName, lastName) {
  return request(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
  });
}

export async function login(email, password) {
  return request(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function analyzeText(resumeText, jobDescription) {
  return request(`${BASE}/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  });
}

export async function analyzePdf(file, jobDescription) {
  const form = new FormData();
  form.append('file', file);
  form.append('job_description', jobDescription);
  return request(`${BASE}/analyze/pdf`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
}

export async function getHistory() {
  return request(`${BASE}/analyze/history`, {
    headers: authHeaders(),
  });
}
