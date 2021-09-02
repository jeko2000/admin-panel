import app from './server'
import logger from './lib/logger';

const port = (process.env.PORT || 3000);
app.listen(port, () => {
  logger.info(`Server starting on port: ${port}`);
})
