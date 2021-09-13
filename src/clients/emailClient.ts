import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailMessage } from '../types/models';
import { config } from './config';
import { createTransport, Transporter } from 'nodemailer';
import { map, TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

export interface EmailClient {
  sendMail(message: EmailMessage): TaskEither<Error, string>
}

class DefaultEmailClient implements EmailClient {
  constructor(
    readonly transporter: Transporter<SMTPTransport.SentMessageInfo>
  ) { }

  sendMail(message: EmailMessage): TaskEither<Error, string> {
    return pipe(
      tryCatch(
        () => transporter.sendMail(message),
        e => e instanceof Error
          ? e
          : new Error('Unable to send message ${message}: $e')
      ),
      map(JSON.stringify)
    )
  }
}

const transporter = createTransport({
  host: config.getStringOrElse("emailClient.host", "smtp.example.com"),
  port: config.getNumberOrElse("emailClient.port", 597),
  secure: config.getBooleanOrElse("emailClient.secure", false),
  auth: {
    user: config.getStringOrElse("emailClient.auth.user", "username"),
    pass: config.getStringOrElse("emailClient.auth.pass", "password")
  }
});

export const emailClient: EmailClient = new DefaultEmailClient(transporter);
