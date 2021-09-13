import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import { NonEmptyString } from 'io-ts-types';
import { EmailAddress } from './types';

export const EmailMessage = t.type({
  from: EmailAddress,
  to: tt.nonEmptyArray(EmailAddress),
  cc: t.array(EmailAddress),
  bcc: t.array(EmailAddress),
  subject: NonEmptyString,
  text: NonEmptyString,
  html: NonEmptyString
}, 'EmailMessage');
export type EmailMessage = t.TypeOf<typeof EmailMessage>;
