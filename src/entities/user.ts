import * as t from 'io-ts';
import { CreatedAt, EmailAddress, Password, PasswordHash, UserId } from "../types/types";

export const LoginRendition = t.type({
  emailAddress: EmailAddress,
  password: Password
}, 'LoginRendition');
export type LoginRendition = t.TypeOf<typeof LoginRendition>;

export const NewUserRendition = t.type({
  emailAddress: EmailAddress,
  password: Password
}, 'NewUserRendition');
export type NewUserRendition = t.TypeOf<typeof NewUserRendition>;

export const User = t.strict({
  userId: UserId,
  emailAddress: EmailAddress,
  passwordHash: PasswordHash,
  createdAt: CreatedAt
}, 'User');
export type User = t.TypeOf<typeof User>;

export function makeUser(userId: number, emailAddress: string, passwordHash: string, createdAt: Date) {
  return User.decode({ userId, emailAddress, passwordHash, createdAt });
}
