import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import { withMessage } from 'io-ts-types';
import { EmailAddress, NumericId, PasswordHash, Timestamp, Uuid } from "../types/types";
import { RoleName } from './role';

export const UserId = withMessage(
  NumericId,
  input => `Unable to parse user id from: ${input}`
)
export type UserId = t.TypeOf<typeof UserId>;

export const User = t.type({
  userId: UserId,
  emailAddress: EmailAddress,
  passwordHash: PasswordHash,
  roleNames: tt.nonEmptyArray(RoleName),
  createdAt: Timestamp,
}, 'User');
export type User = t.TypeOf<typeof User>;

export const RegistrationId = withMessage(
  Uuid,
  input => `Unable to parse user id from: ${input}`
)
export type RegistrationId = t.TypeOf<typeof RegistrationId>;
