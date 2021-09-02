import { withMessage } from 'io-ts-types/lib/withMessage'
import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import * as c from './codecs';

export const UserId = withMessage(
  c.PositiveInt,
  input => `Unable to parse user id from: ${input}`
)
export type UserId = t.TypeOf<typeof UserId>;

export const EmailAddress = withMessage(
  c.EmailAddress,
  input => `Unable to parse email address from: ${input}`
)
export type EmailAddress = t.TypeOf<typeof EmailAddress>;

export const Password = withMessage(
  t.intersection([c.StringMin8, c.NonEmptyString50]),
  () => `Passwords must have between 8 and 50 characters in length`
)
export type Password = t.TypeOf<typeof Password>;

export const PasswordHash = withMessage(
  c.BcryptHash,
  () => `Unable to validate provided password hash`
)
export type PasswordHash = t.TypeOf<typeof PasswordHash>;

export const CreatedAt = withMessage(
  tt.date,
  input => `Unable to parse createdAt from: ${input}`
)
export type CreatedAt = t.TypeOf<typeof CreatedAt>;
