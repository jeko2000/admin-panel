import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { Router, Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../types/errors';
import { handleError, handleOK } from '../../lib/httpUtil';
import { pipe } from 'fp-ts/lib/function';
import { toValidationError, validatePassword } from '../../lib/fpUtil';
import { userRepository } from '../../repositories/userRepository';
import { LoginRendition } from '../../types/renditions';
import { User } from '../../entities/user';

const authRouter = Router();
authRouter.post('/login', loginUser);

function loginUser(req: Request, res: Response): Promise<void> {
  return pipe(
    LoginRendition.decode(req.body),
    E.mapLeft(toValidationError),
    TE.fromEither,
    TE.chain(authenticate),
    TE.fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function authenticate(loginRendition: LoginRendition): TE.TaskEither<Error, User> {
  const { emailAddress } = loginRendition;
  return pipe(
    TE.Do,
    TE.bind('user', () => pipe(
      userRepository.findByEmailAddress(emailAddress),
      TE.chain(TE.fromOption(
        () => new ValidationError(`No such user`)
      ))
    )),
    TE.bind('isValid', (({ user }) => validatePassword(
      loginRendition.password,
      user.passwordHash))
    ),
    TE.chain(({ user, isValid }) => isValid
      ? TE.right(user)
      : TE.left(new Error('Invalid password'))
    )
  )
}

export default authRouter;
