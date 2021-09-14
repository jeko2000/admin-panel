import bcrypt from 'bcrypt';
import { Either, mapLeft } from "fp-ts/Either";
import { Password, PasswordHash } from "../types/types";
import { Type } from "io-ts";
import { ValidationError } from "../types/errors";
import { chain, fromEither, TaskEither, tryCatch } from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

const saltRounds = 10;

export function hashPassword(plainPassword: Password): TaskEither<Error, PasswordHash> {
  return pipe(
    tryCatch(
      () => bcrypt.hash(plainPassword, saltRounds),
      e => (e instanceof Error) ? e : new Error(String(e))
    ),
    chain(hash => decodeTypeT(PasswordHash, hash))
  )
}

export function validatePassword(plainPassword: Password, passwordHash: PasswordHash): TaskEither<Error, boolean> {
  return tryCatch(
    () => bcrypt.compare(plainPassword, passwordHash),
    e => (e instanceof Error) ? e : new Error(String(e))
  );
}

export function decodeType<A, O, I>(type: Type<A, O, I>, i: I): Either<ValidationError, A> {
  return pipe(type.decode(i), mapLeft(errors => new ValidationError(errors.map(err => err.message).join(','))));
}

export function decodeTypeT<A, O, I>(type: Type<A, O, I>, i: I): TaskEither<ValidationError, A> {
  return pipe(decodeType(type, i), fromEither);
}
