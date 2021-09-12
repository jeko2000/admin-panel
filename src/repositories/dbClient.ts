import * as O from 'fp-ts/Option';
import * as pg from 'pg';
import { DatabaseError } from '../types/errors';
import { pipe } from 'fp-ts/lib/function';
import { chain, map, TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

export interface ResultRow {
  [column: string]: any;
}

export type ResultSet<T extends ResultRow = any> = pg.QueryResult<T>;

export interface DbClient {
  query(sql: string): TaskEither<DatabaseError, ResultSet>;
  queryWithParams(sql: string, params: any[]): TaskEither<DatabaseError, ResultSet>;
  querySingle(sql: string): TaskEither<DatabaseError, O.Option<ResultRow>>;
  querySingleWithParams(sql: string, params: any[]): TaskEither<DatabaseError, O.Option<ResultRow>>;
  close(): TaskEither<DatabaseError, void>
}

class PostgresDbClient implements DbClient {
  constructor(
    private readonly pool: pg.Pool
  ) { }

  query(sql: string): TaskEither<DatabaseError, ResultSet> {
    return this.queryWithParams(sql, []);
  }

  queryWithParams(sql: string, params: any[]): TaskEither<DatabaseError, ResultSet> {
    return pipe(
      this.getConnection(),
      chain(client => tryCatch(
        () => client.query(sql, params),
        e => new DatabaseError(`Unable to query ${sql} with params ${params}: ${e}`)
      ))
    )
  }

  querySingle(sql: string): TaskEither<DatabaseError, O.Option<ResultRow>> {
    return this.querySingleWithParams(sql, []);
  }

  querySingleWithParams(sql: string, params: any[]): TaskEither<DatabaseError, O.Option<ResultRow>> {
    return pipe(
      this.queryWithParams(sql, params),
      map(resultSet => {
        if (resultSet.rowCount > 0) {
          return O.of(resultSet.rows[0]);
        }
        return O.none;
      })
    )
  }
  close(): TaskEither<DatabaseError, void> {
    return tryCatch(() => this.pool.end(), e => new DatabaseError(`Unable to close client ${e}`));
  }

  private getConnection(): TaskEither<DatabaseError, pg.ClientBase> {
    return pipe(
      tryCatch(
        () => this.pool.connect(),
        e => new DatabaseError(`Unable to connect to db ${e}`)
      )
    );
  }
}

export const dbClient = new PostgresDbClient(new pg.Pool({
  database: 'admin_panel'
}));
