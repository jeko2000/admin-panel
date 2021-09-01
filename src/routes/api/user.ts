import * as TE from 'fp-ts/TaskEither';
import { Router, Request, Response } from 'express';
import { pipe } from 'fp-ts/lib/function';
import { userRepository } from '../../repositories/userRepository';
import logger from '../../lib/logger';
import { makeEmailAddress, makeUserId } from '../../types/types';
import { handleError, handleMaybe } from '../../lib/httpUtil';

const userRouter = Router();

userRouter.get('/:userId', getUserByUserId);
userRouter.get('/:emailAddress', getUserByEmailAddress);

function getUserByUserId(req: Request, res: Response) {
  const { userId } = req.params;
  logger.info(`Attempting to get user by user id '${userId}'`);
  return pipe(
    Number(userId),
    makeUserId,
    TE.fromEither,
    TE.chain(userRepository.findByUserId),
    TE.fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

function getUserByEmailAddress(req: Request, res: Response) {
  const { emailAddress } = req.params;
  logger.info(`Attempting to get user by email address '${emailAddress}'`);
  return pipe(
    makeEmailAddress(emailAddress),
    TE.fromEither,
    TE.chain(userRepository.findByEmailAddress),
    TE.fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

export default userRouter;
