import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { EmailAddress } from '../types/types';
import { NewUserRendition, RegistrationRendition } from '../types/renditions';
import { RegistrationId, User, UserId } from '../entities/user';
import { sqlClient, SqlClient, ResultRow } from '../clients/sqlClient';
import { flow, pipe } from 'fp-ts/function';
import { decodeTypeT, hashPassword } from '../util/fpUtil';

export interface UserRepository {
  findAllUsers(): TE.TaskEither<Error, Array<User>>;
  findByUserId(userId: UserId): TE.TaskEither<Error, O.Option<User>>;
  findByEmailAddress(emailAddress: EmailAddress): TE.TaskEither<Error, O.Option<User>>;
  createUser(newUserRendition: NewUserRendition): TE.TaskEither<Error, UserId>;
  updateUser(user: User): TE.TaskEither<Error, User>;
  deleteUser(userId: UserId): TE.TaskEither<Error, UserId>;
  registerUser(registrationRendition: RegistrationRendition): TE.TaskEither<Error, RegistrationId>;
  confirmUserRegistration(registrationId: RegistrationId): TE.TaskEither<Error, UserId>;
}

class PostgresUserRepository implements UserRepository {
  constructor(
    readonly sqlClient: SqlClient
  ) { }

  findAllUsers(): TE.TaskEither<Error, Array<User>> {
    return pipe(
      sqlClient.query('SELECT * FROM get_all_users()'),
      TE.map(resultSet => resultSet.rows),
      TE.map(flow(A.map(resultRowToMaybeUser), A.compact))
    )
  }
  findByUserId(userId: UserId): TE.TaskEither<Error, O.Option<User>> {
    return pipe(
      sqlClient.querySingleWithParamsO(
        'SELECT * FROM get_user_by_user_id($1)', [userId]
      ),
      TE.map(O.chain(resultRowToMaybeUser))
    )
  }

  findByEmailAddress(emailAddress: EmailAddress): TE.TaskEither<Error, O.Option<User>> {
    return pipe(
      sqlClient.querySingleWithParamsO(
        'SELECT * FROM get_user_by_email_address($1)', [emailAddress]
      ),
      TE.map(O.chain(resultRowToMaybeUser))
    )
  }

  createUser(newUserRendition: NewUserRendition): TE.TaskEither<Error, UserId> {
    const { emailAddress, password } = newUserRendition;
    return pipe(
      hashPassword(password),
      TE.chain(passwordHash => sqlClient.querySingleWithParams(
        'SELECT create_user($1, $2) AS user_id', [emailAddress, passwordHash]
      )),
      TE.chain(rr => decodeTypeT(UserId, rr.user_id))
    )
  }

  updateUser(user: User): TE.TaskEither<Error, User> {
    const { emailAddress, passwordHash, userId } = user;
    return pipe(
      sqlClient.querySingleWithParams(
        "UPDATE users SET email_address = $1, password_hash = $2 WHERE user_id = $3 RETURNING *",
        [emailAddress, passwordHash, userId]
      ),
      TE.map(_ => user)
    );
  }

  deleteUser(userId: UserId): TE.TaskEither<Error, UserId> {
    return pipe(
      sqlClient.querySingleWithParams(
        "DELETE FROM users WHERE user_id = $1 RETURNING *",
        [userId]
      ),
      TE.map(_ => userId)
    )
  }
  registerUser(registrationRendition: RegistrationRendition): TE.TaskEither<Error, RegistrationId> {
    const { emailAddress, password } = registrationRendition;

    return pipe(
      hashPassword(password),
      TE.chain(passwordHash => sqlClient.querySingleWithParams(
        "SELECT create_user_registration($1, $2) AS registration_id", [emailAddress, passwordHash]
      )),
      TE.chain(rr => decodeTypeT(RegistrationId, rr.registration_id))
    )
  }

  confirmUserRegistration(registrationId: RegistrationId): TE.TaskEither<Error, UserId> {
    return pipe(
      sqlClient.querySingleWithParams(
        "SELECT confirm_user_registration($1) AS user_id", [registrationId]
      ),
      TE.chain(rr => decodeTypeT(UserId, rr.user_id))
    )
  }
}

function resultRowToMaybeUser(rr: ResultRow) {
  if (rr.role_names instanceof String) {
    const roleNames: Array<string> = rr.role_names.split(',');
    return O.fromEither(User.decode({
      userId: rr.user_id,
      emailAddress: rr.email_address,
      passwordHash: rr.password_hash,
      roleNames,
      createdAt: rr.created_at
    }));
  }
  return O.none;
}

export const userRepository = new PostgresUserRepository(sqlClient);
