import { pipe } from 'fp-ts/lib/function';
import { chain, getOrElse } from 'fp-ts/lib/Option';
import app from './server'
import { config } from './clients/config';
import logger from './clients/logger';
import { stringToInt } from './util/ioUtil';

const port = pipe(
  config.get('http.port'),
  chain(stringToInt),
  getOrElse(() => 3000)
);

app.listen(port, () => {
  logger.info(`Server starting on port: ${port}`);
})
