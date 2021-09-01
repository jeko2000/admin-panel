import { Router } from 'express';
import userRouter from './user';

const apiRouter = Router();
apiRouter.use('/users', userRouter);
export default apiRouter;
