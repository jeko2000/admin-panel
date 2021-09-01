import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import StatusCodes from 'http-status-codes';
import { Router, Request, Response } from 'express';
import { pipe } from 'fp-ts/lib/function';
import { userRepository } from '../../repositories/userRepository';
import { makeEmailAddress } from '../../types/types';
import { ValidationError } from '../../types/errors';

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } = StatusCodes;

const userRouter = Router();

userRouter.get('/:rawUserId', getUserByUserId);

async function getUserByUserId(req: Request, res: Response) {
  const { rawUserId } = req.params;
  const userId = Number(rawUserId);
  if (isNaN(userId)) {
    return res.status(BAD_REQUEST).json({
      error: `Invalid userId: '${rawUserId}'`
    });
  }
  pipe(
    await userRepository.findByUserId(userId),
    O.fold(
      () => res.status(NOT_FOUND).json({
        error: `No such user with user id ${userId} found`
      }),
      user => res.status(OK).send(user)
    )
  )
}

function onError(res: Response) {
  return (error: Error) => {
    const status = error instanceof ValidationError
      ? BAD_REQUEST
      : INTERNAL_SERVER_ERROR;

    return res.status(status).json({
      error: error.message
    });
  }
}

export default userRouter;
