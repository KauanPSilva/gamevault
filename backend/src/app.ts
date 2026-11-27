import express from 'express'
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';
import healthRouter from './routes/health.routes.js';

import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';


const app = express();


app.use(helmet());

app.use(
    cors({
        origin: env.FRONTEND_URL,
    })
);

app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;