/**
 * Custom error class for Brevo API errors
 */

export class BrevoApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'BrevoApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
