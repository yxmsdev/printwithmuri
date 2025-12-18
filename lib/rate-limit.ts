/**
 * Simple in-memory rate limiter
 * Note: This works for single-server deployments. For multi-server,
 * consider using Redis-based solutions like Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID, or combination)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowSeconds,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client identifier from request (IP-based)
 * @param request - Next.js request object
 * @returns Client identifier string
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback - use a hash of user-agent + some request info
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `unknown-${userAgent.slice(0, 50)}`;
}

// Pre-configured rate limiters for common use cases
export const RATE_LIMITS = {
  // Strict: 5 requests per minute (for password reset, PIN requests)
  STRICT: { limit: 5, windowSeconds: 60 },

  // Standard: 30 requests per minute (for general API endpoints)
  STANDARD: { limit: 30, windowSeconds: 60 },

  // Relaxed: 100 requests per minute (for read-heavy endpoints)
  RELAXED: { limit: 100, windowSeconds: 60 },

  // Auth: 10 attempts per 15 minutes (for login/signup)
  AUTH: { limit: 10, windowSeconds: 900 },
} as const;
