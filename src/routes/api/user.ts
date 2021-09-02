import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import logger from '../../lib/logger';
import { EmailAddress, UserId } from '../../types/types';
import { Router, Request, Response } from 'express';
import { User, UserRendition } from '../../entities/user';
import { ValidationError } from '../../types/errors';
import { handleError, handleMaybe, handleOK } from '../../lib/httpUtil';
import { pipe } from 'fp-ts/lib/function';
import { toValidationError } from '../../lib/fpUtil';
import { userRepository } from '../../repositories/userRepository';

const userRouter = Router();

userRouter.get('/:userId', getUserByUserId);
userRouter.get('/:emailAddress', getUserByEmailAddress);
userRouter.post('/', createUser);
userRouter.put('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);

function getUserByUserId(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  logger.info(`Attempting to get user by user id: '${userId}'`);
  return pipe(
    UserId.decode(userId),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.findByUserId),
    TE.fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

function getUserByEmailAddress(req: Request, res: Response): Promise<void> {
  const { emailAddress } = req.params;
  logger.info(`Attempting to get user by email address: '${emailAddress}'`);
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
  logger.info(`Attempting to create new user with email address: '${req.body.emailAddress}'`);
  return pipe(
    UserRendition.decode(req.body),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.createUser),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function updateUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  logger.info(`Attempting to update user with user id: '${userId}'`);
  return pipe(
    E.Do,
    E.bind('userId', () => UserId.decode(userId)),
    E.bind('user', () => User.decode(req.body)),
    E.mapLeft(toValidationError),
    E.filterOrElse(
      ({ userId, user }) => userId === user.userId,
      () => new ValidationError(`UserId in path and in body fail to match`)
    ),
    E.map(({ user }) => user),
    TE.fromEither,
    TE.chain(userRepository.updateUser),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function deleteUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  logger.info(`Attempting to delete user with user id: '${userId}'`);
  return pipe(
    UserId.decode(userId),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.deleteUser),
    TE.map(userId => ({userId})),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

export default userRouter;
