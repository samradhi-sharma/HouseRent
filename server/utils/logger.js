/**
 * Simple logger utility for consistent log formatting
 */

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error('Error details:', error);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
    }
  },
  
  request: (req) => {
    logger.debug(`${req.method} ${req.originalUrl}`, {
      body: req.method !== 'GET' ? req.body : undefined,
      params: req.params,
      query: req.query
    });
  }
};

module.exports = logger; 