import * as TE  from "fp-ts/lib/TaskEither";
import * as E  from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { ValidationError } from "../types/errors";
import { PasswordHash } from "../types/types";
import bcrypt from 'bcrypt';
import { flow, pipe } from "fp-ts/lib/function";

const saltRounds = 10;
export function toValidationError(errors: Errors): ValidationError {
  return new ValidationError(errors.map(err => err.message).join(','));
}

export function hashPassword(plainPassword: string): TE.TaskEither<Error, PasswordHash> {
  return pipe(
    TE.tryCatch(
      () => bcrypt.hash(plainPassword, saltRounds),
      e => (e instanceof Error) ? e : new Error(String(e))
    ),
    TE.chain(flow(
      PasswordHash.decode,
      E.mapLeft(toValidationError),
      TE.fromEither
    ))
  )
}
