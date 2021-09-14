import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Record';
import path from 'path';
import { pipe } from 'fp-ts/function';
import { readTextFileSync, stringToBoolean, stringToNumber } from '../util/ioUtil';

const DEFAULT_CONFIG_STORE_PATH = path.resolve(__dirname, '..', '..', 'config/config.json');

export interface ConfigStore {
  readonly [key: string]: string
}

export interface ConfigRetriever {
  getConfig(): E.Either<Error, ConfigStore>
}

export class FileSystemConfigRetriever implements ConfigRetriever {
  constructor(
    readonly configPath: string
  ) { }

  getConfig(): E.Either<Error, ConfigStore> {
    return pipe(
      readTextFileSync(this.configPath),
      E.chain(str => E.tryCatch(
        () => JSON.parse(str),
        E.toError)),
      E.filterOrElse(
        json => json instanceof Object && !(json instanceof Array),
        () => new Error('Not an object')
      )
    )
  }
}

export class Config {
  private constructor(
    readonly store: ConfigStore
  ) { }

  public static of(store: ConfigStore): Config {
    return new Config(store);
  }

  public static fromRetriever(retriever: ConfigRetriever): Config {
    return pipe(
      retriever.getConfig(),
      E.getOrElse(err => {
        console.log(`Unable to retrieve config: ${err}`);
        return {}
      }),
      Config.of
    )
  }

  public getString(key: string): O.Option<string> {
    return R.lookup(key)(this.store);
  }

  public getStringOrElse(key: string, def: string): string {
    return pipe(this.getString(key), O.getOrElse(() => def));
  }

  public getNumber(key: string): O.Option<number> {
    return pipe(this.getString(key), O.chain(stringToNumber))
  }

  public getNumberOrElse(key: string, def: number): number {
    return pipe(this.getNumber(key), O.getOrElse(() => def));
  }

  public getBoolean(key: string): O.Option<boolean> {
    return pipe(this.getString(key), O.chain(stringToBoolean))
  }
  public getBooleanOrElse(key: string, def: boolean): boolean {
    return pipe(this.getBoolean(key), O.getOrElse(() => def));
  }

}

export const config = Config.fromRetriever(new FileSystemConfigRetriever(DEFAULT_CONFIG_STORE_PATH));
