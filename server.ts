import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createDatabase } from './server/db.ts';
import { seedDatabase } from './server/seed.ts';
import { createApp } from './server/app.ts';

async function startServer() {
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  const db = createDatabase();
  seedDatabase(db, { allowDevAccounts: !isProd });

  const app = createApp(db, { allowDevAccounts: !isProd });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SDAS Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SDAS server:', err);
  process.exit(1);
});
