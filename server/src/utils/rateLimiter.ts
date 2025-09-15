import rateLimit from 'express-rate-limit';

// Rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  // Custom key generator for production environments behind proxies
  keyGenerator: (req) => {
    // In production, use the real IP from proxy headers
    if (process.env.NODE_ENV === 'production') {
      return req.ip || req.socket.remoteAddress || 'unknown';
    }
    // In development, use the connection IP
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Skip failed requests (don't count them against the limit)
  skipFailedRequests: true,
  // Skip successful requests (only count errors)
  skipSuccessfulRequests: false
});