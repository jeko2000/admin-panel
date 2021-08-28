import * as E from 'fp-ts/Either'
import { flow } from 'fp-ts/lib/function'
import validator = require('validator')
import { ValidationError } from './errors'

export type NonEmptyString = string
export const makeNonEmptyString = E.fromPredicate(
  (s: string) => s !== null && s !== undefined && s.length > 0,
  (s: string) => new ValidationError(`Value ${s} has no content`)
)

export type NonEmptyString50 = string
export const makeNonEmptyString50 = flow(
  makeNonEmptyString,
  E.chain(E.fromPredicate(
    (s: string) => s.length <= 50,
    (s: string) => new ValidationError(`Value of length ${s.length} is too long`)
  ))
)

export type Uuid = string
export const makeUuid = flow(
  makeNonEmptyString,
  E.chain(E.fromPredicate(
    validator.default.isUUID,
    (s: string) => new ValidationError(`Value ${s} is not a valid UUID`)
  ))
)

export type EmailAddress = string
export const makeEmailAddress = flow(
  makeNonEmptyString,
  E.chain(E.fromPredicate(
    validator.default.isEmail,
    (s: string) => new ValidationError(`Value ${s} is not a valid email address`)
  ))
)

export type Password = string
export const makePassword = flow(
  makeNonEmptyString,
  E.chain(E.fromPredicate(
    (s: string) => s.length > 8,
    (s: string) => new ValidationError(`Password of length ${s.length} is too short`)
  )),
  E.chain(E.fromPredicate(
    (s: string) => s.length < 64,
    (s: string) => new ValidationError(`Password of length ${s.length} is too long`)
  ))
)

export type PasswordHash = string
export const makePasswordHash = flow(
  makeNonEmptyString,
  E.chain(E.fromPredicate(
    // TODO: Improve password hash refinement
    (s: string) => s.length === 60,
    (s: string) => new ValidationError(`Value ${s} does not appear to be a password hash`)
  ))
)
