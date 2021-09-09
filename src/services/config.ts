import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Record';
import path from 'path';
import { pipe } from 'fp-ts/lib/function';
import { readTextFileSync } from '../util/ioUtil';

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

  public static of(store: ConfigStore) {
    return new Config(store);
  }

  public static fromRetriever(retriever: ConfigRetriever) {
    return pipe(
      retriever.getConfig(),
      E.getOrElse(err => {
        console.log(`Unable to retrieve config: ${err}`);
        return {}
      }),
      Config.of
    )
  }

  public get(key: string): O.Option<string> {
    return R.lookup(key)(this.store);
  }

  public getOrElse(key: string, def: string): string {
    return pipe(this.get(key), O.getOrElse(() => def));
  }
}

export const config = Config.fromRetriever(new FileSystemConfigRetriever(DEFAULT_CONFIG_STORE_PATH));
