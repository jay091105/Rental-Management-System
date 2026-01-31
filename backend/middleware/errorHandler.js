module.exports = function (err, req, res, next) {
  console.error(err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';

  // Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: message, errors });
  }

  // Token expired
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
  }

  // Default error response
  return res.status(statusCode).json({ success: false, message });
};