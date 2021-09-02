import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';
import { dbClient, DbClient, ResultRow } from './dbClient';
import { UserId } from '../types/types';
import { makeUser, User } from '../entities/user';
import { EmailAddress } from '../types/types';

export interface UserRepository {
  findByUserId(userId: number): TE.TaskEither<Error, O.Option<User>>;
  findByEmailAddress(emailAddress: string): TE.TaskEither<Error, O.Option<User>>;
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
