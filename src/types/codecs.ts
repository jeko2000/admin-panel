import * as t from 'io-ts';
import validator from 'validator';

/*
 * PositiveNumber codec
 */
export interface PositiveNumberBrand {
  readonly PositiveNumber: unique symbol
}
export const PositiveNumber = t.brand(
  t.number,
  (n: number): n is t.Branded<number, PositiveNumberBrand> => n > 0,
  'PositiveNumber'
)
export type PositiveNumber = t.TypeOf<typeof PositiveNumber>;

/*
 * PositiveInt codec
 */
export const PositiveInt = t.intersection([t.Int, PositiveNumber], 'PositiveInt')
export type PositiveInt = t.TypeOf<typeof PositiveInt>;

/*
 * EmailAddress codec
 */
export interface EmailAddressBrand {
  readonly EmailAddress: unique symbol
}
export const EmailAddress = t.brand(
  t.string,
  (s: string): s is t.Branded<string, EmailAddressBrand> => validator.isEmail(s),
  'EmailAddress'
)
export type EmailAddress = t.TypeOf<typeof EmailAddress>;

/*
 * NonEmptyString50 codec
 */
export interface NonEmptyString50Brand {
  readonly NonEmptyString50: unique symbol
}
export const NonEmptyString50 = t.brand(
  t.string,
  (s: string): s is t.Branded<string, NonEmptyString50Brand> => s.length <= 50,
  'NonEmptyString50'
)
export type NonEmptyString50 = t.TypeOf<typeof NonEmptyString50>;

/*
 * StringMin8 codec
 */
export interface StringMin8Brand {
  readonly StringMin8: unique symbol
}
export const StringMin8 = t.brand(
  t.string,
  (s: string): s is t.Branded<string, StringMin8Brand> => s.length >= 8,
  'StringMin8'
)
export type StringMin8 = t.TypeOf<typeof StringMin8>;

/*
 * StringMin8 codec
 */
//https://en.wikipedia.org/wiki/Bcrypt
const bcryptHashRegex = /^[$]2[abxy]?[$](?:0[4-9]|[12][0-9]|3[01])[$][./0-9a-zA-Z]{53}$/;
export interface BcryptHashBrand {
  readonly BcryptHash: unique symbol
}
export const BcryptHash = t.brand(
  t.string,
  (s: string): s is t.Branded<string, BcryptHashBrand> => bcryptHashRegex.test(s),
  'BcryptHash'
)
export type BcryptHashBcryptHash = t.TypeOf<typeof BcryptHash>;
