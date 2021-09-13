import pg from 'pg';
import { DatabaseError } from '../types/errors';
import { chain, map, left, right, TaskEither, tryCatch } from 'fp-ts/TaskEither';
import { none, Option, some } from 'fp-ts/Option';
import { config } from './config';
import { pipe } from 'fp-ts/lib/function';

export type SqlDatum = boolean | number | string | Date

export interface ResultRow {
  [column: string]: SqlDatum
}

export interface ResultSet {
  rows: ResultRow[]
}

export interface SqlClient {
  query(sql: string): TaskEither<DatabaseError, ResultSet>;
  queryWithParams(sql: string, params: SqlDatum[]): TaskEither<DatabaseError, ResultSet>;
  querySingle(sql: string): TaskEither<DatabaseError, ResultRow>;
  querySingleWithParams(sql: string, params: SqlDatum[]): TaskEither<DatabaseError, ResultRow>;
  querySingleO(sql: string): TaskEither<DatabaseError, Option<ResultRow>>;
  querySingleWithParamsO(sql: string, params: SqlDatum[]): TaskEither<DatabaseError, Option<ResultRow>>;
}

class PostgresSqlClient implements SqlClient {
  constructor(
    private readonly pool: pg.Pool
  ) { }

  query(sql: string): TaskEither<DatabaseError, ResultSet> {
    return tryCatch(
      () => this.pool.query(sql),
      e => new DatabaseError(`Unable to query ${sql}: ${e}`)
    );
  }

  queryWithParams(sql: string, params: SqlDatum[]): TaskEither<DatabaseError, ResultSet> {
    return tryCatch(
      () => this.pool.query(sql, params),
      e => new DatabaseError(`Unable to query ${sql} with params ${params}: ${e}`)
    );
  }

  querySingle(sql: string): TaskEither<DatabaseError, ResultRow> {
    return pipe(
      this.query(sql),
      chain(resultSet => resultSet.rows.length > 0
        ? right(resultSet.rows[0])
        : left(new DatabaseError(`Unable to read single row for ${sql}`))
      )
    );
  }

  querySingleWithParams(sql: string, params: SqlDatum[]): TaskEither<DatabaseError, ResultRow> {
    return pipe(
      this.queryWithParams(sql, params),
      chain(resultSet => resultSet.rows.length > 0
        ? right(resultSet.rows[0])
        : left(new DatabaseError(`Unable to read single row for ${sql} with params ${params}`))
      )
    );
  }

  querySingleO(sql: string): TaskEither<DatabaseError, Option<ResultRow>> {
    return pipe(
      this.query(sql),
      map(this.resultSetToOptionRow)
    );
  }

  querySingleWithParamsO(sql: string, params: SqlDatum[]): TaskEither<DatabaseError, Option<ResultRow>> {
    return pipe(
      this.queryWithParams(sql, params),
      map(this.resultSetToOptionRow)
    );
  }

  private resultSetToOptionRow(resultSet: ResultSet): Option<ResultRow> {
    return resultSet.rows.length > 0
      ? some(resultSet.rows[0])
      : none;
  }
}

const DEFAULT_DATABASE_NAME = 'admin_panel';

const database = config.getStringOrElse('db.database', DEFAULT_DATABASE_NAME);

export const sqlClient = new PostgresSqlClient(new pg.Pool({
  database
}));
