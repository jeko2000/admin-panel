import logger from '../../clients/logger';
import { NewUserRendition, RegistrationRendition } from '../../types/renditions';
import { RegistrationId, User, UserId } from '../../entities/user';
import { Router, Request, Response } from 'express';
import { ValidationError } from '../../types/errors';
import { decodeTypeT } from '../../util/fpUtil';
import { bind, chain, Do, filterOrElse, fold, map } from 'fp-ts/lib/TaskEither';
import { handleError, handleMaybe, handleOK } from '../../util/httpUtil';
import { pipe } from 'fp-ts/lib/function';
import { userRepository } from '../../repositories/userRepository';

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:userId', getUserByUserId);
userRouter.post('/', createUser);
userRouter.put('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);
userRouter.post('/registrations', registerUser);
userRouter.post('/registrations/confirm', confirmUserRegistration);

function getAllUsers(_req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to get all users`);
  return pipe(
    userRepository.findAllUsers(),
    map(users => ({ users })),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function getUserByUserId(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  logger.info(`Attempting to get user by user id: '${userId}'`);
  return pipe(
    decodeTypeT(UserId, userId),
    chain(userRepository.findByUserId),
    fold(handleError(res), handleMaybe(res)),
    invoke => invoke()
  )
}

function createUser(req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to create new user with email address: '${req.body.emailAddress}'`);
  return pipe(
    decodeTypeT(NewUserRendition, req.body),
    chain(userRepository.createUser),
    map(userId => ({ userId })),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function updateUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  logger.info(`Attempting to update user with user id: '${userId}'`);
  return pipe(
    Do,
    bind('userId', () => decodeTypeT(UserId, userId)),
    bind('user', () => decodeTypeT(User, req.body)),
    filterOrElse(
      ({ userId, user }) => userId === user.userId,
      () => new ValidationError(`UserId in path and in body fail to match`)
    ),
    map(({ user }) => user),
    chain(userRepository.updateUser),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function deleteUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  logger.info(`Attempting to delete user with user id: '${userId}'`);
  return pipe(
    decodeTypeT(UserId, userId),
    chain(userRepository.deleteUser),
    map(userId => ({ userId })),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function registerUser(req: Request, res: Response): Promise<void> {
  logger.info(`Attempting to register user with email address: '${req.body.emailAddress}'`);
  return pipe(
    decodeTypeT(RegistrationRendition, req.body),
    chain(userRepository.registerUser),
    map(registrationId => ({ registrationId })),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function confirmUserRegistration(req: Request, res: Response): Promise<void> {
  const { registrationId } = req.body;
  logger.info(`Attempting to confirm user registration user with registration id '${registrationId}'`);
  return pipe(
    decodeTypeT(RegistrationId, registrationId),
    chain(userRepository.confirmUserRegistration),
    map(userId => ({ userId })),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

export default userRouter;
