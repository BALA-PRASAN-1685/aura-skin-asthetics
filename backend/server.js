import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { buildAssessmentPrompt, fallbackAssessment } from '../ai/auraAi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const envPath = path.join(__dirname, '.env');
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch {
  console.warn('backend/.env is not configured; local fallbacks remain available.');
}

const PORT = Number(process.env.PORT || 4174);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error('Request too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function geminiGenerate(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key is not configured.');

  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Gemini request failed.');
  return data;
}

async function generateImage(prompt) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) throw new Error('No image provider is configured.');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, steps: 4 }),
    },
  );

  const data = await response.json();
  if (!response.ok || !data.success || !data.result?.image) {
    const rawMessage = data.errors?.map((error) => error.message).filter(Boolean).join('; ')
      || (typeof data.error === 'string' ? data.error : '')
      || 'Image generation failed.';
    if (/nsfw|safety|blocked/i.test(rawMessage)) {
      const error = new Error('Cloudflare rejected the prompt as unsafe. Aura can provide a safer, non-graphic educational illustration prompt.');
      error.statusCode = 422;
      throw error;
    }
    const error = new Error(`Cloudflare image generation failed: ${rawMessage}`);
    error.statusCode = response.ok ? 502 : response.status;
    throw error;
  }
  return { url: `data:image/jpeg;base64,${data.result.image}` };
}

function sanitizeMatchedConditions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((condition) => condition && (condition.id || condition.title || condition.name))
    .slice(0, 3)
    .map((condition) => ({
      id: typeof condition.id === 'string' ? condition.id.slice(0, 100) : '',
      title: typeof condition.title === 'string'
        ? condition.title.slice(0, 150)
        : typeof condition.name === 'string'
          ? condition.name.slice(0, 150)
          : '',
    }));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    return sendJson(res, 200, {
      status: 'online',
      textAi: Boolean(process.env.GEMINI_API_KEY),
      imageAi: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN),
    });
  }

  try {
    if (req.method === 'POST' && req.url === '/api/ai/assess') {
      const body = await readJson(req);
      const symptoms = [
        body.symptomsText?.trim(),
        ...(Array.isArray(body.symptoms) ? body.symptoms : []),
      ].filter(Boolean).join(', ');

      if (!symptoms || symptoms.length > 1000) {
        return sendJson(res, 400, { error: 'A symptom description is required.' });
      }

      const input = {
        mode: ['face', 'skin', 'hair'].includes(body.mode) ? body.mode : 'skin',
        zone: typeof body.zone === 'string' ? body.zone.slice(0, 100) : '',
        symptoms,
        duration: typeof body.duration === 'string' ? body.duration.slice(0, 100) : '',
        age: typeof body.age === 'string' ? body.age.slice(0, 20) : '',
        gender: typeof body.gender === 'string' ? body.gender.slice(0, 30) : '',
        matchedConditions: sanitizeMatchedConditions(body.matchedConditions),
      };

      try {
        const data = await geminiGenerate(buildAssessmentPrompt(input));
        const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
        const cleaned = text?.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
        const report = JSON.parse(cleaned);
        const localFallback = fallbackAssessment(input);
        return sendJson(res, 200, {
          ...report,
          imagePrompt: localFallback.imagePrompt,
          provider: 'gemini',
          matchedConditions: input.matchedConditions,
        });
      } catch (error) {
        console.warn('Gemini text assessment unavailable; using local fallback.', error.message);
        return sendJson(res, 200, { ...fallbackAssessment(input), provider: 'local', matchedConditions: input.matchedConditions });
      }
    }

    if (req.method === 'POST' && req.url === '/api/ai/image') {
      const body = await readJson(req);
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      if (!prompt || prompt.length > 2048) {
        return sendJson(res, 400, { error: 'A valid image prompt is required and must be 2048 characters or fewer.' });
      }
      const image = await generateImage(prompt);
      return sendJson(res, 200, image);
    }

    return sendJson(res, 404, { error: 'Not found.' });
  } catch (error) {
    console.error('Aura backend error:', error.message);
    const status = error.statusCode || (error.message === 'Request too large' ? 413 : 500);
    return sendJson(res, status, { error: error.message || 'Unexpected server error.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Aura AI backend listening on port ${PORT}`);
});
