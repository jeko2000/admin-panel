import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { DatabaseError, ValidationError } from '../types/errors';
import { EmailAddress } from '../types/types';
import { NewUserRendition } from '../types/renditions';
import { User, UserId } from '../entities/user';
import { dbClient, DbClient, ResultRow } from './dbClient';
import { flow, pipe } from 'fp-ts/lib/function';
import { hashPassword } from '../lib/fpUtil';

export interface UserRepository {
  findAllUsers(): TE.TaskEither<Error, Array<User>>;
  findByUserId(userId: UserId): TE.TaskEither<Error, O.Option<User>>;
  findByEmailAddress(emailAddress: EmailAddress): TE.TaskEither<Error, O.Option<User>>;
  createUser(newUserRendition: NewUserRendition): TE.TaskEither<Error, UserId>;
  updateUser(user: User): TE.TaskEither<Error, User>;
  deleteUser(userId: UserId): TE.TaskEither<Error, UserId>;
}

class PostgresUserRepository implements UserRepository {
  constructor(
    readonly dbClient: DbClient
  ) { }

  findAllUsers(): TE.TaskEither<Error, Array<User>> {
    return pipe(
      dbClient.query('SELECT * FROM get_all_users()'),
      TE.map(resultSet => resultSet.rows),
      TE.map(flow(A.map(resultRowToMaybeUser), A.compact))
    )
  }
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

  createUser(newUserRendition: NewUserRendition): TE.TaskEither<Error, UserId> {
    const { emailAddress, password } = newUserRendition;
    return pipe(
      hashPassword(password),
      TE.chain(passwordHash => dbClient.querySingleWithParams(
        'SELECT create_user($1, $2) AS user_id', [emailAddress, passwordHash]
      )),
      TE.chain(TE.fromOption(
        () => new DatabaseError(`Failed to collect User`),
      )),
      TE.map(rr => rr.user_id)
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
  const roleNames: Array<string> = rr.role_names.split(',');
  return O.fromEither(User.decode({
    userId: rr.user_id,
    emailAddress: rr.email_address,
    passwordHash: rr.password_hash,
    roleNames,
    createdAt: rr.created_at
  }));
}

export const userRepository = new PostgresUserRepository(dbClient);
