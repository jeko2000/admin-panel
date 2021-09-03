import authRouter from './auth';
import userRouter from './user';
import { Router } from 'express';

const apiRouter = Router();
apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
