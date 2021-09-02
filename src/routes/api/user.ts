import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import logger from '../../lib/logger';
import { EmailAddress, UserId } from '../../types/types';
import { Router, Request, Response } from 'express';
import { handleError, handleMaybe, handleOK } from '../../lib/httpUtil';
import { pipe } from 'fp-ts/lib/function';
import { toValidationError } from '../../lib/fpUtil';
import { userRepository } from '../../repositories/userRepository';
import { UserRendition } from '../../entities/user';

const userRouter = Router();

userRouter.get('/:userId', getUserByUserId);
userRouter.get('/:emailAddress', getUserByEmailAddress);
userRouter.post('/', createUser);

function getUserByUserId(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  logger.info(`Attempting to get user by user id '${userId}'`);
  return pipe(
    Number(userId),
    UserId.decode,
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.findByUserId),
    TE.fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

function getUserByEmailAddress(req: Request, res: Response): Promise<void> {
  const { emailAddress } = req.params;
  logger.info(`Attempting to get user by email address '${emailAddress}'`);
  return pipe(
    EmailAddress.decode(emailAddress),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.findByEmailAddress),
    TE.fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

function createUser(req: Request, res: Response): Promise<void> {
  return pipe(
    UserRendition.decode(req.body),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.createUser),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

export default userRouter;
