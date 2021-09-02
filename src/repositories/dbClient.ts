import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as pg from 'pg';
import { DatabaseError } from '../types/errors';

export interface ResultRow {
  [column: string]: any;
}

export type ResultSet<T extends ResultRow = any> = pg.QueryResult<T>;

export interface DbClient {
  query(sql: string): TE.TaskEither<DatabaseError, ResultSet>;
  queryWithParams(sql: string, params: any[]): TE.TaskEither<DatabaseError, ResultSet>;
  querySingle(sql: string): TE.TaskEither<DatabaseError, O.Option<ResultRow>>;
  querySingleWithParams(sql: string, params: any[]): TE.TaskEither<DatabaseError, O.Option<ResultRow>>;
  close(): TE.TaskEither<DatabaseError, void>
}

class PostgresDbClient implements DbClient {
  constructor(
    private readonly pool: pg.Pool
  ) { }

  query(sql: string): TE.TaskEither<DatabaseError, ResultSet> {
    return this.queryWithParams(sql, []);
  }

  queryWithParams(sql: string, params: any[]): TE.TaskEither<DatabaseError, ResultSet> {
    return pipe(
      this.getConnection(),
      TE.chain(client => TE.tryCatch(
        () => client.query(sql, params),
        e => new DatabaseError(`Unable to query ${sql} with params ${params}: ${e}`)
      ))
    )
  }

  querySingle(sql: string): TE.TaskEither<DatabaseError, O.Option<ResultRow>> {
    return this.querySingleWithParams(sql, []);
  }

  querySingleWithParams(sql: string, params: any[]): TE.TaskEither<DatabaseError, O.Option<ResultRow>> {
    return pipe(
      this.queryWithParams(sql, params),
      TE.map(resultSet => {
        if (resultSet.rowCount > 0) {
          return O.of(resultSet.rows[0]);
        }
        return O.none;
      })
    )
  }
  close(): TE.TaskEither<DatabaseError, void> {
    return TE.tryCatch(() => this.pool.end(), e => new DatabaseError(`Unable to close client ${e}`));
  }

  private getConnection(): TE.TaskEither<DatabaseError, pg.ClientBase> {
    return pipe(
      TE.tryCatch(
        () => this.pool.connect(),
        e => new DatabaseError(`Unable to connect to db ${e}`)
      )
    );
  }
}

export const dbClient = new PostgresDbClient(new pg.Pool({
  database: 'admin_panel'
}));
