import apiRouter from './routes/api';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './lib/logger';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

if (process.env.NODE_ENV === 'production') {
  logger.info('Enabling helmet security');
  app.use(helmet());
}
app.use('/api/v1', apiRouter)
export default app;
