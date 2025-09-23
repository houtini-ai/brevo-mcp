/**
 * Brevo MCP Server
 * Main server class that handles MCP protocol communication
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { CONFIG } from '../config/constants.js';
import { BrevoApiClient } from '../api/brevo-client.js';
import { BrevoService } from '../services/brevo-service.js';
import { TOOLS } from '../tools/definitions.js';

export class BrevoMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'brevo-mcp-server',
        version: '2.1.1',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.apiClient = null;
    this.brevoService = null;

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.brevoService) {
        throw new McpError(
          ErrorCode.InternalError,
          'Server not initialized. Please check API key configuration.',
        );
      }

      const { name: toolName, arguments: args } = request.params;

      try {
        let result;
        switch (toolName) {
        case 'get_account_info':
          result = await this.brevoService.getAccountInfo();
          break;

        case 'get_contacts':
          result = await this.brevoService.getContacts(args);
          break;

        case 'send_email':
          result = await this.brevoService.sendEmail(args);
          break;

        case 'get_email_campaigns':
          result = await this.brevoService.getEmailCampaigns(args);
          break;

        case 'get_campaign_analytics':
          result = await this.brevoService.getCampaignAnalytics(args);
          break;

        case 'get_campaigns_performance':
          result = await this.brevoService.getCampaignsPerformance(args);
          break;

        case 'get_contact_analytics':
          result = await this.brevoService.getContactAnalytics(args);
          break;

        case 'get_analytics_summary':
          result = await this.brevoService.getAnalyticsSummary(args);
          break;

        case 'get_campaign_recipients':
          result = await this.brevoService.getCampaignRecipients(args);
          break;

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`,
          );
        }

        // Return the result wrapped in the MCP response format
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        // Handle specific error types
        if (error.statusCode === 401) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Authentication failed. Please check your API key.',
          );
        }

        if (error.statusCode === 429) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Rate limit exceeded. Please try again later.',
          );
        }

        throw new McpError(
          ErrorCode.InternalError,
          error.message || 'An error occurred while processing your request',
        );
      }
    });
  }

  async run() {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('Error: BREVO_API_KEY environment variable is not set');
      process.exit(1);
    }

    try {
      this.apiClient = new BrevoApiClient(apiKey, CONFIG.API_BASE_URL);
      this.brevoService = new BrevoService(this.apiClient);

      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.error('Brevo MCP server running on stdio');
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}
