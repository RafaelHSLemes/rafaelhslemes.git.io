import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import imageRoutes from './routes/images.js';
import profileRoutes from './routes/profiles.js';
import { errorHandler } from './utils/error.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/profiles', profileRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ispicus';

mongoose.connect(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`API IsPicUs em http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Erro ao conectar ao MongoDB', err);
  process.exit(1);
});

