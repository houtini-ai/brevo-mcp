/**
 * Brevo API Client
 * Handles all HTTP communication with Brevo API
 */

import { CONFIG } from '../config/constants.js';
import { BrevoApiError } from '../errors/brevo-error.js';

export class BrevoApiClient {
  constructor(apiKey, baseUrl = CONFIG.API_BASE_URL) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Only set Content-Type if there's a body
    const headers = {
      'Accept': 'application/json',
      'api-key': this.apiKey,
    };

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      headers,
      timeout: CONFIG.REQUEST_TIMEOUT,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {}; // Return empty object for No Content responses
      }

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {}; // Return empty object if not JSON
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new BrevoApiError(408, 'Request timeout');
      }
      if (error instanceof BrevoApiError) {
        throw error;
      }
      throw new BrevoApiError(500, `Network error: ${error.message}`);
    }
  }

  async handleErrorResponse(response) {
    const errorText = await response.text();
    let errorObj;

    try {
      errorObj = JSON.parse(errorText);
    } catch {
      errorObj = { message: errorText };
    }

    switch (response.status) {
    case 400:
      throw new BrevoApiError(400, 'Bad request', errorObj);
    case 401:
      if (errorObj.message?.includes('IP address')) {
        throw new BrevoApiError(
          401,
          'Authentication failed: Your IP address needs to be whitelisted. ' +
            'Visit https://app.brevo.com/security/authorised_ips',
          errorObj,
        );
      }
      throw new BrevoApiError(401, 'Authentication failed', errorObj);
    case 403:
      throw new BrevoApiError(403, 'Access forbidden', errorObj);
    case 404:
      // Provide more specific error messages for 404s
      if (errorObj.code === 'document_not_found' || errorObj.message?.includes('campaign')) {
        throw new BrevoApiError(404, 'Campaign not found. Please check the campaign ID.', errorObj);
      }
      throw new BrevoApiError(404, 'Resource not found', errorObj);
    case 429:
      throw new BrevoApiError(429, 'Rate limit exceeded', errorObj);
    case 500:
      throw new BrevoApiError(500, 'Server error', errorObj);
    default:
      throw new BrevoApiError(
        response.status,
        errorObj.message || 'Unknown error',
        errorObj,
      );
    }
  }
}
