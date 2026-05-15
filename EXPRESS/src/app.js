const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const { requireAuth } = require('./middlewares/authMiddleware');
const { requireCsrf } = require('./middlewares/csrfMiddleware');
const {
  isAnyProviderConfigured,
  isGeminiConfigured,
  isGroqConfigured,
} = require('./services/geminiService');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('D&D Gemini DM API is ready.');
  });

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      aiProviderConfigured: isAnyProviderConfigured(),
      geminiConfigured: isGeminiConfigured(),
      groqConfigured: isGroqConfigured(),
    });
  });

  app.get('/api/debug/egress', async (req, res) => {
    try {
      const response = await fetch('https://ipinfo.io/json', {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const detail = await response.text();

        return res.status(502).json({
          ok: false,
          error: 'Failed to resolve outbound server location.',
          detail,
        });
      }

      const data = await response.json();

      return res.json({
        ok: true,
        provider: 'ipinfo.io',
        ip: data.ip || null,
        city: data.city || null,
        region: data.region || null,
        country: data.country || null,
        loc: data.loc || null,
        timezone: data.timezone || null,
        org: data.org || null,
        hostname: data.hostname || null,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to resolve outbound server location.',
        detail: error.message || 'Unknown error.',
      });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/campaigns', requireAuth, requireCsrf, campaignRoutes);

  return app;
}

module.exports = {
  createApp,
};
