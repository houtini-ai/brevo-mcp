#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

class BrevoMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "brevo-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiKey = null;
    this.baseUrl = 'https://api.brevo.com/v3';
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_account_info",
            description: "Get Brevo account information and plan details",
            inputSchema: {
              type: "object",
              properties: {},
              required: [],
            },
          },          {
            name: "get_contacts",
            description: "Retrieve contacts from Brevo with optional filtering",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Number of contacts to retrieve (max 1000)",
                  default: 50,
                },
                offset: {
                  type: "number", 
                  description: "Number of contacts to skip",
                  default: 0,
                },
                email: {
                  type: "string",
                  description: "Filter by specific email address",
                },
              },
              required: [],
            },
          },
          {
            name: "send_email",
            description: "Send a transactional email via Brevo",
            inputSchema: {
              type: "object",
              properties: {
                to: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      email: { type: "string" },
                      name: { type: "string" }
                    },
                    required: ["email"]
                  },
                  description: "Recipients of the email",
                },
                subject: {
                  type: "string",
                  description: "Email subject line",
                },
                htmlContent: {
                  type: "string",
                  description: "HTML content of the email",
                },
                textContent: {
                  type: "string",
                  description: "Plain text content of the email",
                },
                sender: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    name: { type: "string" }
                  },
                  required: ["email"],
                  description: "Sender information",
                },
              },
              required: ["to", "subject", "sender"],
            },
          },
          {
            name: "get_email_campaigns",
            description: "Get list of email campaigns with statistics",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["classic", "trigger"],
                  description: "Type of campaigns to retrieve",
                  default: "classic",
                },
                status: {
                  type: "string",
                  enum: ["draft", "sent", "archive", "queued", "suspended", "inProcess"],
                  description: "Filter by campaign status",
                },
                limit: {
                  type: "number",
                  description: "Number of campaigns to retrieve (max 1000)",
                  default: 50,
                },
                offset: {
                  type: "number",
                  description: "Number of campaigns to skip",
                  default: 0,
                },
              },
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.apiKey) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Brevo API key not configured. Please set BREVO_API_KEY environment variable."
        );
      }

      try {
        switch (name) {
          case "get_account_info":
            return await this.getAccountInfo();
          
          case "get_contacts":
            return await this.getContacts(args);
          
          case "send_email":
            return await this.sendEmail(args);
          
          case "get_email_campaigns":
            return await this.getEmailCampaigns(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Brevo API error: ${error.message}`
        );
      }
    });
  }
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorObj;
      try {
        errorObj = JSON.parse(errorText);
      } catch {
        errorObj = { message: errorText };
      }
      
      if (response.status === 401 && errorObj.message?.includes('IP address')) {
        throw new Error(`Authentication failed: Your IP address needs to be whitelisted in Brevo. Please visit https://app.brevo.com/security/authorised_ips to add your current IP address. Error: ${errorObj.message}`);
      }
      
      throw new Error(`HTTP ${response.status}: ${errorObj.message || errorText}`);
    }

    return await response.json();
  }

  async getAccountInfo() {
    const result = await this.makeRequest('/account');
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            companyName: result.companyName,
            plan: result.plan,
            credits: result.credits,
            marketingAutomation: result.marketingAutomation
          }, null, 2)
        }
      ]
    };
  }

  async getContacts(args = {}) {
    const params = new URLSearchParams();
    params.append('limit', (args.limit || 50).toString());
    params.append('offset', (args.offset || 0).toString());
    
    if (args.email) {
      params.append('email', args.email);
    }
    
    const result = await this.makeRequest(`/contacts?${params}`);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            count: result.count,
            contacts: result.contacts?.map(contact => ({
              id: contact.id,
              email: contact.email,
              attributes: contact.attributes,
              emailBlacklisted: contact.emailBlacklisted,
              smsBlacklisted: contact.smsBlacklisted,
              createdAt: contact.createdAt,
              modifiedAt: contact.modifiedAt
            })) || []
          }, null, 2)
        }
      ]
    };
  }
  async sendEmail(args) {
    const emailData = {
      to: args.to,
      subject: args.subject,
      sender: args.sender,
    };
    
    if (args.htmlContent) {
      emailData.htmlContent = args.htmlContent;
    }
    
    if (args.textContent) {
      emailData.textContent = args.textContent;
    }
    
    const result = await this.makeRequest('/smtp/email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            messageId: result.messageId,
            status: "sent"
          }, null, 2)
        }
      ]
    };
  }

  async getEmailCampaigns(args = {}) {
    const params = new URLSearchParams();
    params.append('type', args.type || 'classic');
    params.append('limit', (args.limit || 50).toString());
    params.append('offset', (args.offset || 0).toString());
    
    if (args.status) {
      params.append('status', args.status);
    }
    
    const result = await this.makeRequest(`/emailCampaigns?${params}`);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            count: result.count,
            campaigns: result.campaigns?.map(campaign => ({
              id: campaign.id,
              name: campaign.name,
              subject: campaign.subject,
              type: campaign.type,
              status: campaign.status,
              scheduledAt: campaign.scheduledAt,
              sentDate: campaign.sentDate,
              createdAt: campaign.createdAt,
              modifiedAt: campaign.modifiedAt
            })) || []
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    // Store API key
    this.apiKey = process.env.BREVO_API_KEY;

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Brevo MCP server running on stdio");
  }
}

const server = new BrevoMCPServer();
server.run().catch(console.error);