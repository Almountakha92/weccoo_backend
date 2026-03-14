import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { openApiSpec } from './docs/openapi';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { apiRouter } from './routes';

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(requestIdMiddleware);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/docs.json', (_req, res) => {
  return res.status(200).json(openApiSpec);
});

app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
