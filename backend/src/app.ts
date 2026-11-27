import express from 'express'
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';

import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

import healthRouter from './routes/health.routes.js';
import { authRouter } from './modules/auth/routes/auth.routes.js';
import { gameRouter } from './modules/games/routes/game.routes.js';
import { categoryRouter } from './modules/categories/routes/category.routes.js';


const app = express();


app.use(helmet());

app.use(
    cors({
        origin: env.FRONTEND_URL,
    })
);

app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/games', gameRouter);
app.use('/categories', categoryRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;