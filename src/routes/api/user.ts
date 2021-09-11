import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import logger from '../../services/logger';
import { EmailAddress } from '../../types/types';
import { Router, Request, Response } from 'express';
import { RegistrationId, User, UserId } from '../../entities/user';
import { ValidationError } from '../../types/errors';
import { handleError, handleMaybe, handleOK } from '../../util/httpUtil';
import { pipe } from 'fp-ts/lib/function';
import { toValidationError } from '../../util/fpUtil';
import { userRepository } from '../../repositories/userRepository';
import { NewUserRendition, RegistrationRendition } from '../../types/renditions';

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', getUserByUserId);
userRouter.post('/', createUser);
userRouter.put('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);
userRouter.post('/registrations', registerUser);
userRouter.post('/registrations/confirm', confirmUserRegistration);

function getAllUsers(req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to get all users`);
  return pipe(
    userRepository.findAllUsers(),
    TE.map(users => ({ users })),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

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

function createUser(req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to create new user with email address: '${req.body.emailAddress}'`);
  return pipe(
    NewUserRendition.decode(req.body),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.createUser),
    TE.map(userId => ({ userId })),
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
    TE.map(userId => ({ userId })),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function registerUser(req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to register user with email address: '${req.body.emailAddress}'`);
  return pipe(
    RegistrationRendition.decode(req.body),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.registerUser),
    TE.map(registrationId => ({ registrationId })),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function confirmUserRegistration(req: Request, res: Response): Promise<void> {
  const { registrationId } = req.body;
  logger.info(`Attempting to confirm user registration user with registration id '${registrationId}'`);
  return pipe(
    RegistrationId.decode(registrationId),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(userRepository.confirmUserRegistration),
    TE.map(userId => ({ userId })),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

export default userRouter;
