import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import bcrypt from 'bcrypt';
import { Errors } from "io-ts";
import { Password, PasswordHash } from "../types/types";
import { ValidationError } from "../types/errors";
import { flow, pipe } from "fp-ts/lib/function";

const saltRounds = 10;

export function toValidationError(errors: Errors): ValidationError {
  return new ValidationError(errors.map(err => err.message).join(','));
}

export function hashPassword(plainPassword: Password): TE.TaskEither<Error, PasswordHash> {
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

export function validatePassword(plainPassword: Password, passwordHash: PasswordHash): TE.TaskEither<Error, boolean> {
  return TE.tryCatch(
    () => bcrypt.compare(plainPassword, passwordHash),
    e => (e instanceof Error) ? e : new Error(String(e))
  );
}
