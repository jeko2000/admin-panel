import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { DatabaseError, ValidationError } from '../types/errors';
import { EmailAddress, UserId } from '../types/types';
import { dbClient, DbClient, ResultRow } from './dbClient';
import { hashPassword } from '../lib/fpUtil';
import { makeUser, User, UserRendition } from '../entities/user';
import { pipe } from 'fp-ts/lib/function';

export interface UserRepository {
  findByUserId(userId: UserId): TE.TaskEither<Error, O.Option<User>>;
  findByEmailAddress(emailAddress: EmailAddress): TE.TaskEither<Error, O.Option<User>>;
  createUser(userRendition: UserRendition): TE.TaskEither<Error, User>;
  updateUser(user: User): TE.TaskEither<Error, User>;
  deleteUser(userId: UserId): TE.TaskEither<Error, UserId>;
}

class PostgresUserRepository implements UserRepository {
  constructor(
    readonly dbClient: DbClient
  ) { }

  findByUserId(userId: UserId): TE.TaskEither<Error, O.Option<User>> {
    return pipe(
      dbClient.querySingleWithParams(
        'SELECT * FROM users WHERE user_id = $1', [userId]
      ),
      TE.map(O.chain(resultRowToMaybeUser))
    )
  }

  findByEmailAddress(emailAddress: EmailAddress): TE.TaskEither<Error, O.Option<User>> {
    return pipe(
      dbClient.querySingleWithParams(
        'SELECT * FROM users WHERE email_address = $1',
        [emailAddress]
      ),
      TE.map(O.chain(resultRowToMaybeUser))
    )
  }

  createUser(userRendition: UserRendition): TE.TaskEither<Error, User> {
    const { emailAddress, password } = userRendition;
    return pipe(
      hashPassword(password),
      TE.chain(passwordHash => dbClient.querySingleWithParams(
        'INSERT INTO users(email_address, password_hash) VALUES($1, $2) RETURNING *',
        [emailAddress, passwordHash]
      )),
      TE.map(O.chain(resultRowToMaybeUser)),
      TE.chain(TE.fromOption(
        () => new DatabaseError(`Failed to collect User`),
      ))
    )
  }

  updateUser(user: User): TE.TaskEither<Error, User> {
    const { emailAddress, passwordHash, userId } = user;
    return pipe(
      dbClient.querySingleWithParams(
        "UPDATE users SET email_address = $1, password_hash = $2 WHERE user_id = $3 RETURNING *",
        [emailAddress, passwordHash, userId]
      ),
      TE.chain(TE.fromOption(
        () => new ValidationError(`No such user found`)
      )),
      TE.map(_ => user)
    );
  }

  deleteUser(userId: UserId): TE.TaskEither<Error, UserId> {
    return pipe(
      dbClient.querySingleWithParams(
        "DELETE FROM users WHERE user_id = $1 RETURNING *",
        [userId]
      ),
      TE.chain(TE.fromOption(
        () => new ValidationError(`No such user found`)
      )),
      TE.map(_ => userId)
    )
  }
}

function resultRowToMaybeUser(rr: ResultRow) {
  return O.fromEither(makeUser(
    rr.user_id,
    rr.email_address,
    rr.password_hash,
    rr.created_at
  ));
}

export const userRepository = new PostgresUserRepository(dbClient);
