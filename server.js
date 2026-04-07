require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── Static Files ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/design-system', express.static(path.join(__dirname, 'design-system')));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── OpenRouter AI Route ─────────────────────────────────────────────────────
app.post('/api/ai', async (req, res) => {
  const defaultModel = process.env.MODEL_PRIMARY || 'deepseek/deepseek-v3-2';
  const { messages, model = defaultModel } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `http://localhost:${PORT}`,
        'X-Title': 'Project Startup 1'
      },
      body: JSON.stringify({ model, messages })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenRouter error:', error);
    res.status(500).json({ error: 'Failed to reach OpenRouter API.' });
  }
});

// ─── Dev: Figma Export Trigger ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/figma-export', async (req, res) => {
    const { execFile } = require('child_process');
    execFile('node', ['design-system/scripts/figma-export.js'], { cwd: __dirname }, (err, stdout, stderr) => {
      if (err) {
        console.error('Figma export error:', stderr);
        return res.status(500).json({ success: false, error: stderr || err.message });
      }
      // Extract variable count from stdout
      const match = stdout.match(/(\d+) variables pushed/);
      res.json({ success: true, variablesCount: match ? parseInt(match[1]) : null, log: stdout });
    });
  });
}

// ─── Catch-all: Serve Frontend ───────────────────────────────────────────────
app.get('*', (req, res) => {
  const requestPath = req.path;
  if (requestPath === '/showcase' || requestPath === '/showcase.html') {
    return res.sendFile(path.join(__dirname, 'public', 'showcase.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   OpenRouter key: ${process.env.OPENROUTER_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
  console.log(`   Design System:  http://localhost:${PORT}/showcase.html\n`);
});
