import * as c from './codecs';
import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import { withMessage } from 'io-ts-types/lib/withMessage'

export const NumericId = withMessage(
  t.union([c.PositiveInt, tt.IntFromString], 'NumericId'),
  input => `Unable to parse numeric id from: ${input}`
)
export type NumericId = t.TypeOf<typeof NumericId>;

export const EmailAddress = withMessage(
  c.Email,
  input => `Unable to parse email address from: ${input}`
)
export type EmailAddress = t.TypeOf<typeof EmailAddress>;

export const Password = withMessage(
  t.intersection([c.StringMin8, c.NonEmptyString50], 'Password'),
  () => `Passwords must have between 8 and 50 characters in length`
)
export type Password = t.TypeOf<typeof Password>;

export const PasswordHash = withMessage(
  c.BcryptHash,
  () => `Unable to validate provided password hash`
)
export type PasswordHash = t.TypeOf<typeof PasswordHash>;

export const Timestamp = withMessage(
  t.union([tt.date, tt.DateFromNumber, tt.DateFromISOString], 'Timestamp'),
  input => `Unable to parse timestamp from: ${input}`
)
export type Timestamp = t.TypeOf<typeof Timestamp>;
