require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function extractCompanyName(jobDescription) {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    messages: [{
      role: 'user',
      content: `Extract only the company or organization name from this job description. Reply with ONLY the company name (e.g. "Google", "Acme Corp"). If no company name is mentioned, reply with only the word: Unknown\n\nJob description:\n${jobDescription.slice(0, 3000)}`,
    }],
  });
  const name = msg.content.find((b) => b.type === 'text')?.text?.trim() || 'Unknown';
  return name.replace(/^["']|["']$/g, '').trim() || 'Unknown';
}

async function main() {
  const { rows } = await pool.query(
    `SELECT id, job_description FROM analyses WHERE company_name = 'Unknown' ORDER BY id`
  );
  console.log(`Found ${rows.length} analyses to backfill.`);

  for (const row of rows) {
    try {
      const name = await extractCompanyName(row.job_description);
      await pool.query('UPDATE analyses SET company_name = $1 WHERE id = $2', [name, row.id]);
      console.log(`  [${row.id}] → ${name}`);
    } catch (err) {
      console.error(`  [${row.id}] failed: ${err.message}`);
    }
  }

  console.log('Done.');
  await pool.end();
}

main();
