import { flow } from 'fp-ts/function';
import { TaskEither, tryCatch, chain, fromEither } from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import fs from 'fs';

export function bufferToString(buffer: Buffer): E.Either<Error, string> {
  return E.tryCatch(
    () => buffer.toString('utf8'),
    e => e instanceof Error ? e : new Error(`${e}`)
  )
}

export function readFile(path: string): TaskEither<Error, Buffer> {
  return tryCatch(
    () => new Promise((resolve, reject) => {
      fs.readFile(path, (err, buff) => {
        if (err) reject(err);
        else resolve(buff);
      });
    }),
    e => e instanceof Error ? e : new Error(`${e}`)
  )
}

export const readTextFile = flow(
  readFile,
  chain(buff => fromEither(bufferToString(buff)))
)

export function readFileSync(path: string): E.Either<Error, Buffer> {
  return E.tryCatch(
    () => fs.readFileSync(path),
    e => e instanceof Error ? e : new Error(`${e}`)
  )
}

export const readTextFileSync: (path: string) => E.Either<Error, string> = flow(
  readFileSync,
  E.chain(bufferToString)
)

export function stringToNumber(str: string): O.Option<number> {
  const num = Number(str);
  return isNaN(num) ? O.none : O.some(num);
}

export function stringToBoolean(str: string): O.Option<boolean> {
  const lower = str.toLocaleLowerCase();
  if (lower === 'true') {
    return O.some(true);
  }
  if (lower === 'false') {
    return O.some(false);
  }
  return O.none;
}
