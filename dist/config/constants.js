/**
 * Configuration constants for Brevo MCP Server
 */

export const CONFIG = {
  DEFAULT_BATCH_SIZE: 100,
  MAX_BATCH_SIZE: 1000,
  DEFAULT_LIMIT: 50,
  MAX_CAMPAIGNS_SEARCH: 1000,
  REQUEST_TIMEOUT: 30000,
  API_BASE_URL: process.env.BREVO_BASE_URL || 'https://api.brevo.com/v3',
};
