import { EmailAddress, makeEmailAddress, makePasswordHash, makeUuid, Password, PasswordHash, Uuid } from "../types/types";
import * as E from 'fp-ts/Either';
import { ValidationError } from "../types/errors";
import { pipe } from "fp-ts/lib/function";

export interface UserRendition {
  emailAddress: EmailAddress,
  password: Password
}

export class User {
  protected constructor(
    readonly userId: Uuid,
    readonly emailAddress: EmailAddress,
    readonly passwordHash: PasswordHash,
    readonly createdAt: Date = new Date()
  ) { }

  public static of(
    userId: Uuid,
    emailAddress: EmailAddress,
    passwordHash: PasswordHash,
    createdAt: Date = new Date()
  ): E.Either<ValidationError, User> {
    return pipe(
      E.Do,
      E.bind('userId', () => makeUuid(userId)),
      E.bind('emailAddress', () => makeEmailAddress(emailAddress)),
      E.bind('passwordHash', () => makePasswordHash(passwordHash)),
      E.map(({ userId, emailAddress, passwordHash }) => new User(
        userId, emailAddress, passwordHash, createdAt
      ))
    );
  }
}
