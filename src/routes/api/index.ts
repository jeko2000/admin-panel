import authRouter from './auth';
import roleRouter from './role';
import userRouter from './user';
import { Router } from 'express';

const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/roles', roleRouter);
apiRouter.use('/users', userRouter);

export default apiRouter;
