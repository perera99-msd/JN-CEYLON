/**
 * Global error handler middleware.
 * Catches unhandled errors from route handlers and sends a consistent response.
 * In production, internal error details are hidden from clients.
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  // Log errors server-side
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && status >= 500 && { stack: err.stack })
  });
};

module.exports = errorHandler;
