import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';
import { dbClient, DbClient, ResultRow } from './dbClient';
import { makeUser, User, UserRendition } from '../entities/user';
import { hashPassword } from '../lib/fpUtil';
import { DatabaseError } from '../types/errors';

export interface UserRepository {
  findByUserId(userId: number): TE.TaskEither<Error, O.Option<User>>;
  findByEmailAddress(emailAddress: string): TE.TaskEither<Error, O.Option<User>>;
  createUser(userRendition: UserRendition): TE.TaskEither<Error, User>;
}

class PostgresUserRepository implements UserRepository {
  constructor(
    readonly dbClient: DbClient
  ) { }

  findByUserId(userId: number): TE.TaskEither<Error, O.Option<User>> {
    return pipe(
      dbClient.querySingleWithParams(
        'SELECT * FROM users WHERE user_id = $1', [userId]
      ),
      TE.map(O.chain(resultRowToMaybeUser))
    )
  }

  findByEmailAddress(emailAddress: string): TE.TaskEither<Error, O.Option<User>> {
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
