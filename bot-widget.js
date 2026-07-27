/* Cipher Health Economist — chat widget.
   Self-contained: injects its own styles and DOM, talks to /api/chat.
   Conversation persists across pages for the browser session. */
(function () {
  'use strict';
  if (window.__cipherBot) return;
  window.__cipherBot = true;

  var BOOKING = 'https://calendar.app.google/orMtDRpkcFJMM4xY7';
  var GREETING =
    "I'm Cipher's **Health Economist** — an AI assistant grounded in peer-reviewed research on healthcare costs, prices, and employer plans.\n\nTo be clear: I'm a research assistant, not the Cipher product. The product is our claims-analytics platform — it turns your claims data into cost and savings analysis, and you can [see it in action](/demo).\n\nAsk me why healthcare costs what it does, what the evidence says employers can do about it, or what Cipher does. For personal medical questions, talk to your clinician — that's not my lane.";
  var CHIPS = [
    'Why do hospital prices vary so much?',
    "What's driving employer health costs?",
    'What does Cipher actually do?',
  ];

  var css = [
    '#cbot-launch{position:fixed;right:22px;bottom:22px;z-index:80;display:flex;align-items:center;gap:10px;background:#141F38;color:#fff;border:1.5px solid #D97706;padding:12px 18px;cursor:pointer;font-family:"Space Mono",monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;box-shadow:0 12px 32px rgba(20,31,56,.35);}',
    '#cbot-launch:hover{background:#1B2A4A;}',
    '#cbot-launch .cbot-dot{width:9px;height:9px;background:#D97706;position:relative;flex-shrink:0;}',
    '#cbot-launch .cbot-dot::after{content:"";position:absolute;inset:0;background:#D97706;animation:cbotPulse 2.2s ease-out infinite;}',
    '@keyframes cbotPulse{0%{opacity:.55;transform:scale(1);}70%,100%{opacity:0;transform:scale(2.4);}}',
    '@media (prefers-reduced-motion:reduce){#cbot-launch .cbot-dot::after{animation:none;}}',
    '#cbot-launch .cbot-l-short{display:none;}',
    '@media (max-width:760px){#cbot-launch .cbot-l-long{display:none;}#cbot-launch .cbot-l-short{display:inline;}}',
    '#cbot-panel{position:fixed;right:22px;bottom:22px;z-index:85;width:min(400px,calc(100vw - 24px));height:min(600px,calc(100vh - 48px));background:#fff;border:1px solid #E5E7EB;box-shadow:0 30px 80px rgba(20,31,56,.4);display:none;flex-direction:column;font-family:Inter,"Segoe UI",sans-serif;}',
    '#cbot-panel.open{display:flex;}',
    '.cbot-head{background:#1B2A4A;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;}',
    '.cbot-head-t{font-family:"Space Mono",monospace;font-size:12.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;}',
    '.cbot-head-s{font-size:10.5px;color:rgba(255,255,255,.55);margin-top:3px;letter-spacing:.04em;}',
    '.cbot-x{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1;padding:0 2px;}',
    '.cbot-msgs{flex:1;overflow-y:auto;padding:16px;background:#fff;position:relative;}',
    '.cbot-m{margin-bottom:12px;font-size:14.5px;line-height:1.55;max-width:88%;word-wrap:break-word;}',
    '.cbot-m.bot{color:#1B2A4A;background:#F8F9FA;border:1px solid #E5E7EB;border-left:2px solid #D97706;padding:10px 13px;}',
    '.cbot-m.user{color:#fff;background:#1B2A4A;padding:10px 13px;margin-left:auto;}',
    '.cbot-m a{color:#B8751F;text-decoration:underline;text-underline-offset:2px;}',
    '.cbot-m.bot strong{color:#141F38;}',
    '.cbot-chips{display:flex;flex-direction:column;gap:8px;margin:4px 0 12px;}',
    '.cbot-chip{background:#fff;border:1px solid #C4C8CF;color:#1B2A4A;font:inherit;font-size:13.5px;padding:9px 12px;cursor:pointer;text-align:left;}',
    '.cbot-chip:hover{border-color:#D97706;color:#B8751F;}',
    '.cbot-typing{display:inline-flex;gap:5px;padding:12px 14px;}',
    '.cbot-typing span{width:6px;height:6px;background:#9CA3AF;animation:cbotBlink 1.2s infinite;}',
    '.cbot-typing span:nth-child(2){animation-delay:.2s;}',
    '.cbot-typing span:nth-child(3){animation-delay:.4s;}',
    '@keyframes cbotBlink{0%,80%,100%{opacity:.25;}40%{opacity:1;}}',
    '.cbot-foot{border-top:1px solid #E5E7EB;flex-shrink:0;}',
    '.cbot-inrow{display:flex;gap:0;}',
    '#cbot-in{flex:1;border:0;padding:13px 14px;font:inherit;font-size:14.5px;color:#1B2A4A;resize:none;outline:none;max-height:96px;}',
    '#cbot-send{background:#D97706;border:0;color:#fff;font-weight:700;font-size:13.5px;padding:0 18px;cursor:pointer;font-family:Inter,sans-serif;}',
    '#cbot-send:disabled{background:#C4C8CF;cursor:default;}',
    '.cbot-book{display:block;text-align:center;background:#F8F9FA;border-top:1px solid #E5E7EB;color:#1B2A4A;font-size:12.5px;padding:8px;text-decoration:none;font-weight:600;}',
    '.cbot-book:hover{color:#B8751F;}',
    '.cbot-note{font-size:10px;color:#9CA3AF;text-align:center;padding:5px 8px 7px;background:#F8F9FA;}',
    '@media (max-width:520px){#cbot-panel{right:6px;bottom:6px;}}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // --- minimal safe markdown: escape everything, then bold + links + breaks
  function render(text) {
    var s = String(text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    s = s.replace(/^#{1,4}\s+(.+)$/gm, '<strong>$1</strong>'); // headers -> bold (fallback)
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]*)\)/g, function (_, label, url) {
      var ext = /^(https?:|mailto:)/.test(url);
      return '<a href="' + url + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
    });
    return s.replace(/\n/g, '<br>');
  }

  // --- state
  var history = [];
  try { history = JSON.parse(sessionStorage.getItem('cipherBotHistory') || '[]'); } catch (e) {}
  function save() { try { sessionStorage.setItem('cipherBotHistory', JSON.stringify(history.slice(-24))); } catch (e) {} }

  // --- DOM
  var launch = document.createElement('button');
  launch.id = 'cbot-launch';
  launch.setAttribute('aria-label', "Ask Cipher's AI assistant a question");
  launch.innerHTML =
    '<span class="cbot-dot" aria-hidden="true"></span>' +
    '<span class="cbot-l-long">Questions before you book a meeting? Ask our AI assistant.</span>' +
    '<span class="cbot-l-short">Ask our AI assistant</span>';

  var panel = document.createElement('div');
  panel.id = 'cbot-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Cipher Health Economist chat');
  panel.innerHTML =
    '<div class="cbot-head"><div><div class="cbot-head-t">Ask Cipher&#39;s AI</div>' +
    '<div class="cbot-head-s">Research assistant — the product is our claims-analytics platform</div></div>' +
    '<button class="cbot-x" aria-label="Close chat">×</button></div>' +
    '<div class="cbot-msgs" id="cbot-msgs"></div>' +
    '<div class="cbot-foot"><div class="cbot-inrow">' +
    '<textarea id="cbot-in" rows="1" placeholder="Ask about healthcare costs…" aria-label="Your message"></textarea>' +
    '<button id="cbot-send">Send</button></div>' +
    '<a class="cbot-book" href="' + BOOKING + '" target="_blank" rel="noopener">Book a 30-minute meeting&nbsp;&nbsp;&rarr;</a>' +
    '<div class="cbot-note">AI-generated — verify anything important. No personal health information, please.</div>' +
    '</div>';

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var msgs = panel.querySelector('#cbot-msgs');
  var input = panel.querySelector('#cbot-in');
  var sendBtn = panel.querySelector('#cbot-send');
  var busy = false;

  function add(role, text, scrollToTop) {
    var d = document.createElement('div');
    d.className = 'cbot-m ' + (role === 'user' ? 'user' : 'bot');
    d.innerHTML = render(text);
    msgs.appendChild(d);
    if (scrollToTop) {
      // long replies: show the START of the answer, not the end
      msgs.scrollTop = d.offsetTop - 10;
    } else {
      msgs.scrollTop = msgs.scrollHeight;
    }
    return d;
  }

  function addChips() {
    var wrap = document.createElement('div');
    wrap.className = 'cbot-chips';
    CHIPS.forEach(function (q) {
      var b = document.createElement('button');
      b.className = 'cbot-chip';
      b.textContent = q;
      b.addEventListener('click', function () { wrap.remove(); sendMessage(q); });
      wrap.appendChild(b);
    });
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function boot() {
    msgs.innerHTML = '';
    add('bot', GREETING);
    if (history.length) {
      history.forEach(function (m) { add(m.role, m.content); });
    } else {
      addChips();
    }
  }

  function typing() {
    var t = document.createElement('div');
    t.className = 'cbot-m bot cbot-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    return t;
  }

  function sendMessage(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    add('user', text);
    history.push({ role: 'user', content: text });
    save();
    input.value = '';
    input.style.height = 'auto';
    var t = typing();

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        t.remove();
        if (res.ok && res.d.reply) {
          add('bot', res.d.reply, true);
          history.push({ role: 'assistant', content: res.d.reply });
          save();
        } else {
          add('bot', (res.d && res.d.error) || 'Something went wrong — try again in a moment.');
        }
      })
      .catch(function () {
        t.remove();
        add('bot', "I couldn't reach the server — check your connection and try again.");
      })
      .finally(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }

  launch.addEventListener('click', function () {
    panel.classList.add('open');
    launch.style.display = 'none';
    boot();
    input.focus();
  });
  panel.querySelector('.cbot-x').addEventListener('click', function () {
    panel.classList.remove('open');
    launch.style.display = 'flex';
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
      launch.style.display = 'flex';
    }
  });
  sendBtn.addEventListener('click', function () { sendMessage(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  });
  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });
})();
