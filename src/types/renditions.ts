import * as t from 'io-ts';
import { EmailAddress, Password } from './types';

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

export const RegistrationRendition = t.type({
  emailAddress: EmailAddress,
  password: Password
}, 'RegistrationRendition');
export type RegistrationRendition = t.TypeOf<typeof RegistrationRendition>;
