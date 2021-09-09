import apiRouter from './routes/api';
import express from 'express';
import helmet from 'helmet';
import logger from './services/logger';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

if (process.env.NODE_ENV === 'production') {
  logger.info('Enabling helmet security');
  app.use(helmet());
}
app.use('/api/v1', apiRouter)
export default app;
