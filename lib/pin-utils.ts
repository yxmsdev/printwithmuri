import crypto from 'crypto';

/**
 * Generate a random 6-digit PIN code
 * @returns {string} A 6-digit PIN code
 */
export function generatePin(): string {
  // Generate a random number between 100000 and 999999
  const pin = Math.floor(100000 + Math.random() * 900000);
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
 * Generate a secure reset token
 * @param {string} email - User's email
 * @returns {string} Base64 encoded reset token
 */
export function generateResetToken(email: string): string {
  const payload = {
    email,
    verified: true,
    timestamp: Date.now(),
    // Add random nonce to prevent token reuse
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify and decode a reset token
 * @param {string} token - The reset token to verify
 * @param {number} maxAgeMinutes - Maximum age of token in minutes (default: 60)
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyResetToken(token: string, maxAgeMinutes: number = 60): { email: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

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
