import app from './api/index';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const port = 3000;

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

// Start server locally when not running as a Vercel serverless function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
