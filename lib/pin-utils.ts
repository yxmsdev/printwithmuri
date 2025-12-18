import crypto from 'crypto';

// Secret key for signing reset tokens - MUST be set in production
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || 'development-secret-change-in-production';

/**
 * Generate a random 6-digit PIN code using cryptographically secure randomness
 * @returns {string} A 6-digit PIN code
 */
export function generatePin(): string {
  // Use crypto.randomInt for cryptographically secure random numbers
  const pin = crypto.randomInt(100000, 1000000);
  return pin.toString();
}

/**
 * Hash a PIN code using SHA-256
 * @param {string} pin - The PIN code to hash
 * @returns {string} The hashed PIN
 */
export function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

/**
 * Verify a PIN code against a hash
 * @param {string} pin - The PIN code to verify
 * @param {string} hash - The hash to compare against
 * @returns {boolean} True if the PIN matches the hash
 */
export function verifyPin(pin: string, hash: string): boolean {
  const inputHash = hashPin(pin);
  return inputHash === hash;
}

/**
 * Generate an expiration timestamp
 * @param {number} minutes - Number of minutes until expiration (default: 10)
 * @returns {Date} The expiration timestamp
 */
export function getExpirationTime(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Create HMAC signature for data
 * @param {string} data - Data to sign
 * @returns {string} HMAC signature
 */
function createSignature(data: string): string {
  return crypto.createHmac('sha256', RESET_TOKEN_SECRET).update(data).digest('hex');
}

/**
 * Generate a secure, signed reset token
 * @param {string} email - User's email
 * @returns {string} Signed reset token (base64 encoded payload + signature)
 */
export function generateResetToken(email: string): string {
  const payload = {
    email: email.toLowerCase().trim(),
    verified: true,
    timestamp: Date.now(),
    // Add random nonce to prevent token reuse
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const payloadString = JSON.stringify(payload);
  const signature = createSignature(payloadString);

  // Combine payload and signature
  const token = {
    payload: payloadString,
    signature,
  };

  return Buffer.from(JSON.stringify(token)).toString('base64');
}

/**
 * Verify and decode a signed reset token
 * @param {string} token - The reset token to verify
 * @param {number} maxAgeMinutes - Maximum age of token in minutes (default: 60)
 * @returns {Object|null} Decoded payload or null if invalid/tampered
 */
export function verifyResetToken(token: string, maxAgeMinutes: number = 60): { email: string; timestamp: number } | null {
  try {
    // Decode the token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenData = JSON.parse(decoded);

    // Check token structure
    if (!tokenData.payload || !tokenData.signature) {
      return null;
    }

    // Verify signature - this prevents token forgery
    const expectedSignature = createSignature(tokenData.payload);
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(tokenData.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValidSignature) {
      console.warn('Reset token signature verification failed - possible forgery attempt');
      return null;
    }

    // Parse the verified payload
    const payload = JSON.parse(tokenData.payload);

    // Check if token has required fields
    if (!payload.email || !payload.timestamp || !payload.verified) {
      return null;
    }

    // Check if token is expired (default 60 minutes)
    const tokenAge = Date.now() - payload.timestamp;
    const maxAge = maxAgeMinutes * 60 * 1000;

    if (tokenAge > maxAge) {
      return null;
    }

    return {
      email: payload.email,
      timestamp: payload.timestamp,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Format a PIN code for display (e.g., "123 456")
 * @param {string} pin - The PIN code
 * @returns {string} Formatted PIN code
 */
export function formatPin(pin: string): string {
  if (pin.length === 6) {
    return `${pin.slice(0, 3)} ${pin.slice(3)}`;
  }
  return pin;
}
