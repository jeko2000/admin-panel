import { CreatedAt, EmailAddress, Password, PasswordHash, UserId } from "../types/types";
import * as t from 'io-ts';

export const UserRendition = t.type({
  emailAddress: EmailAddress,
  password: Password
});
export type UserRendition = t.TypeOf<typeof UserRendition>;

export const User = t.strict({
  userId: UserId,
  emailAddress: EmailAddress,
  passwordHash: PasswordHash,
  createdAt: CreatedAt
});
export type User = t.TypeOf<typeof User>;

export function makeUser(userId: number, emailAddress: string, passwordHash: string, createdAt: Date) {
  return User.decode({ userId, emailAddress, passwordHash, createdAt });
}
