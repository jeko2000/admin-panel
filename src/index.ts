import app from './server'
import { config } from './clients/config';
import logger from './clients/logger';

const port = config.getNumberOrElse('http.port', 3000);

app.listen(port, () => {
  logger.info(`Server starting on port: ${port}`);
})
