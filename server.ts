/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Enable CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Live website status auditor & HTTP check endpoint
  app.post('/api/verify-website', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'URL is required' });
      }

      let testUrl = url.trim();
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = 'https://' + testUrl;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const resp = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 DataScrafing-Auditor/1.0',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeoutId);

        const ok = resp.status >= 200 && resp.status < 400;
        return res.json({
          url: testUrl,
          status: ok ? 'active' : 'dead',
          httpCode: resp.status,
          statusText: resp.statusText,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        return res.json({
          url: testUrl,
          status: 'dead',
          httpCode: 0,
          error: fetchErr.name === 'AbortError' ? 'Connection timed out (6s)' : (fetchErr.message || 'DNS or Connection Failed'),
        });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Verification Error' });
    }
  });

  // Proxy endpoint for TeamoRouter Chat Completions to prevent CORS blocks in browser
  app.post('/api/teamorouter/chat', async (req, res) => {
    try {
      const { apiKey, baseUrl, payload } = req.body;
      const cleanKey = (apiKey || process.env.TEAMOROUTER_API_KEY || '').trim();
      if (!cleanKey) {
        return res.status(400).json({ error: { message: 'API key TeamoRouter tidak boleh kosong. Silakan simpan di Pengaturan.' } });
      }

      let targetUrl = (baseUrl || 'https://api.teamorouter.com').replace(/\/+$/, '');
      if (!targetUrl.endsWith('/v1')) {
        targetUrl += '/v1';
      }
      targetUrl += '/chat/completions';

      console.log(`[TeamoRouter Proxy] POST ${targetUrl} (model: ${payload?.model || 'unknown'})`);

      let response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
          'x-api-key': cleanKey,
        },
        body: JSON.stringify(payload),
      });

      let data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = data?.error?.message || `TeamoRouter HTTP ${response.status}: ${response.statusText}`;
        console.error(`[TeamoRouter Proxy Error] ${response.status}:`, errorMsg);

        // Auto-heal if model is temporarily unavailable (e.g. upstream 503)
        if (response.status === 503 || errorMsg.toLowerCase().includes('unavailable') || errorMsg.toLowerCase().includes('not found')) {
          const fallbackCandidates = ['gemini-3.8-flash', 'gpt-5.4-mini', 'deepseek-v4.1-flash', 'claude-haiku-5.5'];
          const nextModel = fallbackCandidates.find(m => m !== payload?.model) || 'gemini-3.8-flash';
          console.log(`[TeamoRouter Proxy] Model '${payload?.model}' unavailable. Auto-retrying with active fallback model '${nextModel}'...`);

          const fallbackPayload = { ...payload, model: nextModel };
          const retryResp = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cleanKey}`,
              'x-api-key': cleanKey,
            },
            body: JSON.stringify(fallbackPayload),
          });

          if (retryResp.ok) {
            const retryData = await retryResp.json().catch(() => null);
            if (retryData) {
              console.log(`[TeamoRouter Proxy] Fallback to '${nextModel}' succeeded!`);
              return res.json(retryData);
            }
          }
        }

        return res.status(response.status).json({ error: { message: errorMsg } });
      }

      console.log(`[TeamoRouter Proxy] Response 200 OK (${data?.choices?.[0]?.message?.content?.length || 0} chars)`);
      return res.json(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Internal Server Proxy Error';
      console.error('TeamoRouter chat proxy error:', msg);
      return res.status(500).json({ error: { message: `Proxy Error: ${msg}` } });
    }
  });

  // Proxy endpoint for testing TeamoRouter connection
  app.post('/api/teamorouter/test', async (req, res) => {
    try {
      const { apiKey, baseUrl, model } = req.body;
      if (!apiKey || !apiKey.trim()) {
        return res.status(400).json({ error: { message: 'API key TeamoRouter tidak boleh kosong.' } });
      }

      const cleanKey = apiKey.trim();
      let rootV1 = (baseUrl || 'https://api.teamorouter.com').replace(/\/+$/, '');
      if (!rootV1.endsWith('/v1')) {
        rootV1 += '/v1';
      }

      const modelToUse = model || 'gemini-3.8-flash';

      // 1. Try checking /v1/models first (lightweight, validates auth credential without consuming completion tokens)
      try {
        const modelsResp = await fetch(`${rootV1}/models`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${cleanKey}`,
            'x-api-key': cleanKey,
          },
        });

        if (modelsResp.ok) {
          const modelsData = await modelsResp.json().catch(() => null);
          return res.json({
            success: true,
            message: 'Koneksi ke TeamoRouter (api.teamorouter.com) berhasil terverifikasi!',
            modelUsed: modelToUse,
            availableModelsCount: Array.isArray(modelsData?.data) ? modelsData.data.length : undefined,
          });
        } else if (modelsResp.status === 401 || modelsResp.status === 403) {
          const errData = await modelsResp.json().catch(() => null);
          const errorMsg = errData?.error?.message || 'API Key TeamoRouter tidak valid atau unauthorized (401).';
          return res.status(modelsResp.status).json({ error: { message: errorMsg } });
        }
      } catch (e) {
        // If /models failed, proceed to test via chat completion below
      }

      // 2. Chat completion test
      const chatUrl = `${rootV1}/chat/completions`;
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
          'x-api-key': cleanKey,
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            {
              role: 'user',
              content: 'Ping test',
            },
          ],
          max_tokens: 10,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMsg = data?.error?.message || `TeamoRouter HTTP ${response.status}: ${response.statusText}`;
        return res.status(response.status).json({ error: { message: errorMsg } });
      }

      return res.json({
        success: true,
        message: 'Koneksi ke TeamoRouter (api.teamorouter.com) berhasil terverifikasi!',
        modelUsed: data?.model || modelToUse,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to TeamoRouter';
      console.error('TeamoRouter test proxy error:', msg);
      return res.status(500).json({ error: { message: `Koneksi gagal: ${msg}` } });
    }
  });

  // Vite development middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
