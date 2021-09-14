import { LoginRendition } from '../../types/renditions';
import { Router, Request, Response } from 'express';
import { User } from '../../entities/user';
import { ValidationError } from '../../types/errors';
import { bind, chain, Do, fold, fromOption, left, right, TaskEither } from 'fp-ts/TaskEither';
import { decodeTypeT, validatePassword } from '../../util/fpUtil';
import { handleError, handleOK } from '../../util/httpUtil';
import { pipe } from 'fp-ts/function';
import { userRepository } from '../../repositories/userRepository';

const authRouter = Router();
authRouter.post('/login', loginUser);

function loginUser(req: Request, res: Response): Promise<void> {
  return pipe(
    decodeTypeT(LoginRendition, req.body),
    chain(authenticate),
    fold(handleError(res), handleOK(res)),
    invoke => invoke()
  )
}

function authenticate(loginRendition: LoginRendition): TaskEither<Error, User> {
  const { emailAddress } = loginRendition;
  return pipe(
    Do,
    bind('user', () => pipe(
      userRepository.findByEmailAddress(emailAddress),
      chain(fromOption(
        () => new ValidationError(`No such user`)
      ))
    )),
    bind('isValid', (({ user }) => validatePassword(
      loginRendition.password,
      user.passwordHash))
    ),
    chain(({ user, isValid }) => isValid
      ? right(user)
      : left(new Error('Invalid password'))
    )
  )
}

export default authRouter;
