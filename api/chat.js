// Cipher Health Economist — chat relay.
// Receives {messages:[{role,content}...]} from the widget, calls the Anthropic
// API with the compiled knowledge base as the system prompt, returns {reply}.
// The API key lives ONLY in the ANTHROPIC_API_KEY environment variable
// (Vercel dashboard → Settings → Environment Variables) — never in this repo.
// Uses raw Node req/res (no framework, no dependencies) so the same handler
// runs on Vercel and under the local dev server.

const { SYSTEM_PROMPT } = require('./_knowledge.js');

const MODEL = process.env.CHAT_MODEL || 'claude-haiku-4-5';
const MAX_REPLY_TOKENS = 350; // backstop; the persona targets ~80-120 words
const MAX_MESSAGE_CHARS = 1500;
const MAX_HISTORY = 24; // messages kept per request (12 exchanges)

// Per-instance rate limiting: serverless instances are ephemeral, so this is a
// burst brake, not a precise quota. Pair with a spend cap in the Anthropic console.
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 25;
const hits = new Map(); // ip -> [timestamps]

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // memory backstop
  return false;
}

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    // Vercel may have parsed the body already
    if (req.body !== undefined) {
      resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
      return;
    }
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 100_000) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    (req.socket && req.socket.remoteAddress) || 'unknown';
  if (limited(ip)) {
    return send(res, 429, {
      error: "You've sent quite a few messages — give it a few minutes, or just book the meeting: https://calendar.app.google/orMtDRpkcFJMM4xY7",
    });
  }

  let body;
  try { body = await readBody(req); } catch { return send(res, 400, { error: 'bad request' }); }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return send(res, 400, { error: 'no user message' });
  }

  // Server-side brevity reminder on every turn — models weigh the end of the
  // last message heavily, and this never reaches the visitor's history.
  messages[messages.length - 1].content +=
    '\n\n<system-reminder>Reply in under 100 words — hard limit. One idea, at most two statistics, no bullet lists, no sections, no headers. Every statistic must appear in your knowledge sections and be credited to the entry it actually comes from — when asked what a specific source says, use only that source’s entries, and if a number is not in your knowledge, say it qualitatively instead of estimating. Finish the sentence you start. Close with the booking bridge or an offer to go deeper, not both.</system-reminder>';

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return send(res, 500, { error: 'assistant is not configured yet' });

  try {
    // Models from the 4.6+ generations run "extended thinking" by default,
    // which would consume the small reply budget before any visible text.
    // Chat replies here don't need it — disable on those models.
    const thinkingOff = /sonnet-5|opus-5|opus-4-[678]|sonnet-4-6/.test(MODEL)
      ? { thinking: { type: 'disabled' } }
      : {};
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_REPLY_TOKENS,
        ...thinkingOff,
        // cache_control: the big knowledge prompt is cached between requests
        // (1h TTL suits sporadic marketing-site traffic), cutting input cost ~90%.
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral', ttl: '1h' } }],
        messages,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const type = data && data.error && data.error.type;
      if (type === 'rate_limit_error' || type === 'overloaded_error') {
        return send(res, 503, { error: "I'm getting a lot of questions right now — try again in a minute." });
      }
      console.error('anthropic error', r.status, JSON.stringify(data).slice(0, 300));
      return send(res, 502, { error: 'Something went wrong on my end — try again in a moment.' });
    }

    const reply = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
    if (!reply) return send(res, 502, { error: 'Something went wrong on my end — try again in a moment.' });
    return send(res, 200, { reply });
  } catch (e) {
    console.error('chat relay error', e && e.message);
    return send(res, 502, { error: 'Something went wrong on my end — try again in a moment.' });
  }
};
