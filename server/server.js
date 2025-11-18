const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TTS API Proxy' });
});

// OpenAI TTS Endpoint
app.post('/api/tts/openai', async (req, res) => {
  const { text, voice = 'alloy', model = 'tts-1' } = req.body;

  // Validation
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (text.length > 4096) {
    return res.status(400).json({ error: 'Text too long (max 4096 characters)' });
  }

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  // Allowed voices
  const allowedVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  if (!allowedVoices.includes(voice)) {
    return res.status(400).json({ error: 'Invalid voice' });
  }

  // Allowed models
  const allowedModels = ['tts-1', 'tts-1-hd'];
  if (!allowedModels.includes(model)) {
    return res.status(400).json({ error: 'Invalid model' });
  }

  try {
    console.log(`[TTS] Generating speech: ${text.substring(0, 50)}... | Voice: ${voice} | Model: ${model}`);

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: model,
        input: text,
        voice: voice,
        response_format: 'mp3',
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 30000, // 30s timeout
      }
    );

    // Log usage
    const audioSize = response.data.length;
    console.log(`[TTS] Success: ${audioSize} bytes | Characters: ${text.length}`);

    // Return audio
    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', audioSize);
    res.send(response.data);

  } catch (error) {
    console.error('[TTS] Error:', error.message);

    if (error.response) {
      // OpenAI API error
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'OpenAI API error';

      if (status === 401) {
        return res.status(500).json({ error: 'Invalid API key' });
      } else if (status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      } else if (status === 400) {
        return res.status(400).json({ error: message });
      } else {
        return res.status(500).json({ error: 'OpenAI API error' });
      }
    } else if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout' });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ TTS API Server running on port ${PORT}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'NOT SET'}`);
});
