import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${env.port}`);
});

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}. Closing server...`);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
