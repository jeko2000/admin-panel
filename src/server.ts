import apiRouter from './routes/api';
import express from 'express';
import helmet from 'helmet';

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}
app.use('/api/v1', apiRouter)
export default app;
