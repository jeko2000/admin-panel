import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import StatusCodes from 'http-status-codes';
import { Response } from 'express';
import { ValidationError } from '../types/errors';
import { pipe } from 'fp-ts/lib/function';

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } = StatusCodes;

type ResponseSpec = {
  status: number,
  body: any
}

export function respond(res: Response) {
  return (spec: ResponseSpec): T.Task<void> => {
    res.status(spec.status).json(spec.body);
    return T.never;
  }
}

export function handleError(res: Response) {
  return (error: Error): T.Task<void> => respond(res)({
    status: (error instanceof ValidationError
      ? BAD_REQUEST
      : INTERNAL_SERVER_ERROR),
    body: { error: error.message }
  });
}

export function handleNotFound(res: Response) {
  return (): T.Task<void> => respond(res)({
    status: NOT_FOUND,
    body: { error: 'No such resource found' }
  });
}

export function handleOK(res: Response) {
  return (body: Record<string, any>): T.Task<void> => respond(res)({
    status: OK,
    body
  })
}

export function handleMaybe(res: Response) {
  return (maybe: O.Option<any>): T.Task<void> => {
    return pipe(
      maybe,
      O.fold(
        handleNotFound(res),
        handleOK(res)
      )
    );
  }
}
