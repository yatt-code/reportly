/**
 * Simple placeholder logger utility.
 * In a real application, this could integrate with a more robust logging library (e.g., Winston, Pino).
 */

/**
 * Logs an informational message.
 * @param {string} message - The message to log.
 * @param {object} [meta] - Optional metadata object.
 */
export function log(message, meta) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] INFO: ${message}`, meta || '');
}

/**
 * Logs an error message.
 * @param {string} message - The error message.
 * @param {Error | object} [error] - Optional error object or metadata.
 */
export function error(message, error) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`, error || '');
}

/**
 * Logs a warning message.
 * @param {string} message - The warning message.
 * @param {object} [meta] - Optional metadata object.
 */
export function warn(message, meta) {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] WARN: ${message}`, meta || '');
}

// Export as an object for potential future expansion or different log levels
const logger = {
  log,
  error,
  warn, // Add warn here
};

export default logger;