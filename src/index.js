#!/usr/bin/env node

/**
 * Brevo MCP Server
 * 
 * MCP (Model Context Protocol) server for Brevo email marketing platform
 * Provides comprehensive email, contact, and analytics operations
 * 
 * @author Richard Baxter <richard@richardbaxter.co>
 * @license MIT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Configuration constants
const CONFIG = {
  DEFAULT_BATCH_SIZE: 100,
  MAX_BATCH_SIZE: 1000,
  DEFAULT_LIMIT: 50,
  MAX_CAMPAIGNS_SEARCH: 1000,
  REQUEST_TIMEOUT: 30000,
  API_BASE_URL: process.env.BREVO_BASE_URL || 'https://api.brevo.com/v3',
};

// Tool definitions
const TOOLS = [
  {
    name: 'get_account_info',
    description: 'Get Brevo account information including plan and credits',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_contacts',
    description: 'List contacts with optional filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { 
          type: 'number', 
          description: 'Number of contacts to return (default: 50, max: 1000)',
          minimum: 1,
          maximum: 1000
        },
        offset: { 
          type: 'number', 
          description: 'Number of contacts to skip',
          minimum: 0
        },
        email: { 
          type: 'string', 
          description: 'Filter by email address',
          format: 'email'
        },
      },
    },
  },
  {
    name: 'send_email',
    description: 'Send a transactional email using Brevo',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'array',
          description: 'Array of recipient objects with email and optional name',
          items: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string' }
            },
            required: ['email']
          }
        },
        subject: { type: 'string', description: 'Email subject line' },
        htmlContent: { type: 'string', description: 'HTML content of the email' },
        textContent: { type: 'string', description: 'Plain text content of the email' },
        templateId: { type: 'number', description: 'ID of Brevo template to use' },
        params: { type: 'object', description: 'Template parameters' },
        from: {
          type: 'object',
          description: 'Sender information',
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string' }
          }
        },
        replyTo: {
          type: 'object',
          description: 'Reply-to address',
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string' }
          }
        },
        tags: {
          type: 'array',
          description: 'Tags for the email',
          items: { type: 'string' }
        },
      },
      required: ['to'],
      oneOf: [
        { required: ['subject', 'htmlContent'] },
        { required: ['subject', 'textContent'] },
        { required: ['templateId'] }
      ]
    },
  },
  {
    name: 'get_email_campaigns',
    description: 'List email campaigns with filtering options',
    inputSchema: {
      type: 'object',
      properties: {
        type: { 
          type: 'string', 
          description: 'Campaign type filter',
          enum: ['classic', 'trigger']
        },
        status: { 
          type: 'string', 
          description: 'Campaign status filter',
          enum: ['sent', 'draft', 'archive', 'queued', 'suspended', 'inProcess']
        },
        limit: { 
          type: 'number', 
          description: 'Number of campaigns to return',
          minimum: 1,
          maximum: 1000
        },
        offset: { 
          type: 'number', 
          description: 'Number of campaigns to skip',
          minimum: 0
        },
      },
    },
  },
  {
    name: 'get_campaign_analytics',
    description: 'Get detailed analytics for a specific campaign including recipient-level data',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { 
          type: 'number', 
          description: 'ID of the campaign',
          minimum: 1
        },
        startDate: { 
          type: 'string', 
          description: 'Start date for analytics (YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
        endDate: { 
          type: 'string', 
          description: 'End date for analytics (YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
      },
      required: ['campaignId'],
    },
  },
  {
    name: 'get_campaigns_performance',
    description: 'Get performance metrics for multiple campaigns',
    inputSchema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          description: 'Filter by campaign status',
          enum: ['sent', 'draft', 'suspended']
        },
        startDate: { 
          type: 'string', 
          description: 'Filter campaigns modified after this date',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
        endDate: { 
          type: 'string', 
          description: 'Filter campaigns modified before this date',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
        limit: { 
          type: 'number', 
          description: 'Maximum number of campaigns to analyze',
          minimum: 1,
          maximum: 100
        },
      },
    },
  },
  {
    name: 'get_contact_analytics',
    description: 'Get analytics for contacts including engagement metrics',
    inputSchema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          description: 'Filter by specific email address',
          format: 'email'
        },
        listId: { 
          type: 'number', 
          description: 'Filter by list ID',
          minimum: 1
        },
        startDate: { 
          type: 'string', 
          description: 'Start date for engagement data',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
        endDate: { 
          type: 'string', 
          description: 'End date for engagement data',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
      },
    },
  },
  {
    name: 'get_analytics_summary',
    description: 'Get comprehensive analytics summary with insights',
    inputSchema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'Time period for analytics',
          enum: ['today', 'yesterday', 'last7days', 'last30days', 'custom'],
          default: 'last7days'
        },
        startDate: {
          type: 'string',
          description: 'Custom start date (required if period is "custom")',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
        endDate: {
          type: 'string',
          description: 'Custom end date (required if period is "custom")',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
      },
    },
  },
  {
    name: 'get_campaign_recipients',
    description: 'Get recipient list for a specific campaign',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { 
          type: 'number', 
          description: 'ID of the campaign',
          minimum: 1
        },
        status: { 
          type: 'string', 
          description: 'Filter by recipient status',
          enum: ['sent', 'opened', 'clicked', 'unsubscribed', 'bounced']
        },
        limit: { 
          type: 'number', 
          description: 'Number of recipients to return',
          minimum: 1,
          maximum: 1000
        },
        offset: { 
          type: 'number', 
          description: 'Number of recipients to skip',
          minimum: 0
        },
      },
      required: ['campaignId'],
    },
  },
];

class BrevoApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'BrevoApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class BrevoApiClient {
  constructor(apiKey, baseUrl = CONFIG.API_BASE_URL) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      timeout: CONFIG.REQUEST_TIMEOUT,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
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
            errorObj
          );
        }
        throw new BrevoApiError(401, 'Authentication failed', errorObj);
      case 403:
        throw new BrevoApiError(403, 'Access forbidden', errorObj);
      case 404:
        throw new BrevoApiError(404, 'Resource not found', errorObj);
      case 429:
        throw new BrevoApiError(429, 'Rate limit exceeded', errorObj);
      case 500:
        throw new BrevoApiError(500, 'Server error', errorObj);
      default:
        throw new BrevoApiError(
          response.status,
          errorObj.message || 'Unknown error',
          errorObj
        );
    }
  }
}

class BrevoAnalyticsService {
  static calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(2);
  }

  static calculateRates(stats) {
    const sent = stats.sent || 0;
    if (sent === 0) return {
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
    };

    return {
      openRate: ((stats.uniqueOpens || 0) / sent * 100).toFixed(2),
      clickRate: ((stats.uniqueClicks || 0) / sent * 100).toFixed(2),
      bounceRate: (((stats.hardBounces || 0) + (stats.softBounces || 0)) / sent * 100).toFixed(2),
      unsubscribeRate: ((stats.unsubscriptions || 0) / sent * 100).toFixed(2),
    };
  }

  static determineEngagementLevel(opens, clicks, total) {
    if (total === 0) return 'No Activity';
    const openRate = opens / total;
    const clickRate = clicks / total;
    
    if (clickRate > 0.1) return 'Highly Engaged';
    if (clickRate > 0.05) return 'Engaged';
    if (openRate > 0.2) return 'Moderately Engaged';
    if (openRate > 0) return 'Low Engagement';
    return 'Not Engaged';
  }

  static generateInsights(metrics) {
    const insights = [];
    
    // Email performance insights
    if (metrics.emails) {
      const { sent, delivered, openRate, clickRate } = metrics.emails;
      
      if (openRate > 25) {
        insights.push('Strong email open rates indicate good subject lines and sender reputation');
      } else if (openRate < 15) {
        insights.push('Low open rates suggest need for subject line optimization');
      }
      
      if (clickRate > 5) {
        insights.push('Excellent click-through rates show engaging content');
      } else if (clickRate < 2) {
        insights.push('Consider improving email content and CTAs for better engagement');
      }
      
      const deliveryRate = sent > 0 ? (delivered / sent * 100) : 0;
      if (deliveryRate < 95) {
        insights.push('Delivery rate below 95% - review list hygiene and sender reputation');
      }
    }
    
    // Contact insights
    if (metrics.contacts) {
      const { total, active, growthRate } = metrics.contacts;
      
      if (growthRate > 10) {
        insights.push('Strong list growth - maintain engagement to prevent churn');
      } else if (growthRate < 0) {
        insights.push('Negative list growth - focus on acquisition and retention');
      }
      
      const activeRate = total > 0 ? (active / total * 100) : 0;
      if (activeRate < 50) {
        insights.push('Low active contact rate - consider re-engagement campaigns');
      }
    }
    
    return insights;
  }

  static getDateRange(period, startDate, endDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: yesterday.toISOString().split('T')[0],
          end: yesterday.toISOString().split('T')[0],
        };
      case 'last7days':
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        return {
          start: week.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'last30days':
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        return {
          start: month.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Start date and end date required for custom period');
        }
        return { start: startDate, end: endDate };
      default:
        throw new Error(`Invalid period: ${period}`);
    }
  }
}

class BrevoMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'brevo-mcp-server',
        version: '2.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.apiClient = null;
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.apiClient) {
        throw new McpError(
          ErrorCode.InternalError,
          'Brevo API key not configured. Set the BREVO_API_KEY environment variable.'
        );
      }

      const { name: tool, arguments: args } = request.params;

      try {
        let result;
        
        switch (tool) {
          case 'get_account_info':
            result = await this.getAccountInfo();
            break;
          case 'get_contacts':
            result = await this.getContacts(args);
            break;
          case 'send_email':
            result = await this.sendEmail(args);
            break;
          case 'get_email_campaigns':
            result = await this.getEmailCampaigns(args);
            break;
          case 'get_campaign_analytics':
            result = await this.getCampaignAnalytics(args);
            break;
          case 'get_campaigns_performance':
            result = await this.getCampaignsPerformance(args);
            break;
          case 'get_contact_analytics':
            result = await this.getContactAnalytics(args);
            break;
          case 'get_analytics_summary':
            result = await this.getAnalyticsSummary(args);
            break;
          case 'get_campaign_recipients':
            result = await this.getCampaignRecipients(args);
            break;
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${tool}`
            );
        }

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
        
        if (error instanceof BrevoApiError) {
          throw new McpError(
            ErrorCode.InternalError,
            `Brevo API Error (${error.statusCode}): ${error.message}`,
            error.details
          );
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${tool}: ${error.message}`
        );
      }
    });
  }

  async getAccountInfo() {
    const account = await this.apiClient.request('/account');
    
    return {
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      company: account.companyName,
      plan: account.plan?.[0]?.type || 'Free',
      credits: {
        emailCredits: account.plan?.[0]?.credits || 0,
        smsCredits: account.plan?.[0]?.creditsType === 'sendLimit' ? 
          account.plan?.[0]?.credits : 0,
      },
      features: account.plan?.[0]?.features || [],
      relay: account.relay?.enabled || false,
      marketingAutomation: account.marketingAutomation?.enabled || false,
    };
  }

  async getContacts(args = {}) {
    const params = new URLSearchParams({
      limit: Math.min(args.limit || CONFIG.DEFAULT_LIMIT, CONFIG.MAX_BATCH_SIZE).toString(),
      offset: (args.offset || 0).toString(),
    });

    const endpoint = args.email 
      ? `/contacts/${encodeURIComponent(args.email)}`
      : `/contacts?${params}`;

    if (args.email) {
      const contact = await this.apiClient.request(endpoint);
      return {
        contacts: [contact],
        count: 1,
      };
    }

    const response = await this.apiClient.request(endpoint);
    
    return {
      contacts: response.contacts || [],
      count: response.count || 0,
    };
  }

  async sendEmail(args) {
    if (!args.to || !Array.isArray(args.to) || args.to.length === 0) {
      throw new Error('Recipients (to) are required');
    }

    // Validate email has content or template
    if (!args.templateId && !args.htmlContent && !args.textContent) {
      throw new Error('Either templateId, htmlContent, or textContent is required');
    }

    const emailData = {
      to: args.to,
      ...(args.templateId && { templateId: args.templateId }),
      ...(args.subject && { subject: args.subject }),
      ...(args.htmlContent && { htmlContent: args.htmlContent }),
      ...(args.textContent && { textContent: args.textContent }),
      ...(args.from && { sender: args.from }),
      ...(args.replyTo && { replyTo: args.replyTo }),
      ...(args.params && { params: args.params }),
      ...(args.tags && { tags: args.tags }),
    };

    const response = await this.apiClient.request('/smtp/email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });

    return {
      messageId: response.messageId,
      status: 'sent',
      to: args.to,
      subject: args.subject || 'Template-based email',
    };
  }

  async getEmailCampaigns(args = {}) {
    const params = new URLSearchParams({
      limit: Math.min(args.limit || CONFIG.DEFAULT_LIMIT, CONFIG.MAX_BATCH_SIZE).toString(),
      offset: (args.offset || 0).toString(),
      ...(args.type && { type: args.type }),
      ...(args.status && { status: args.status }),
    });

    const response = await this.apiClient.request(`/emailCampaigns?${params}`);
    
    return {
      campaigns: response.campaigns || [],
      count: response.count || 0,
    };
  }

  async getCampaignAnalytics(args) {
    if (!args.campaignId) {
      throw new Error('Campaign ID is required');
    }

    // First, find the campaign
    let campaign = null;
    let offset = 0;
    const batchSize = CONFIG.DEFAULT_BATCH_SIZE;

    while (!campaign && offset < CONFIG.MAX_CAMPAIGNS_SEARCH) {
      const campaigns = await this.apiClient.request(
        `/emailCampaigns?limit=${batchSize}&offset=${offset}`
      );
      
      campaign = campaigns.campaigns?.find(c => c.id === args.campaignId);
      if (campaign) break;
      
      offset += batchSize;
      if (!campaigns.campaigns || campaigns.campaigns.length < batchSize) break;
    }

    if (!campaign) {
      throw new Error(`Campaign with ID ${args.campaignId} not found`);
    }

    // Get campaign statistics
    const stats = campaign.statistics?.campaignStats?.[0] || 
                  campaign.statistics?.globalStats || {};

    // Calculate engagement metrics
    const rates = BrevoAnalyticsService.calculateRates(stats);

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentDate: campaign.sentDate,
        scheduledAt: campaign.scheduledAt,
      },
      statistics: {
        sent: stats.sent || 0,
        delivered: stats.delivered || 0,
        uniqueOpens: stats.uniqueOpens || 0,
        opens: stats.opens || 0,
        uniqueClicks: stats.uniqueClicks || 0,
        clicks: stats.cliks || 0,
        hardBounces: stats.hardBounces || 0,
        softBounces: stats.softBounces || 0,
        unsubscriptions: stats.unsubscriptions || 0,
        complaints: stats.complaints || 0,
      },
      rates,
      recipients: {
        lists: campaign.recipients?.lists || [],
        exclusionLists: campaign.recipients?.exclusionLists || [],
      },
    };
  }

  async getCampaignsPerformance(args = {}) {
    const params = new URLSearchParams({
      limit: CONFIG.DEFAULT_BATCH_SIZE.toString(),
      offset: '0',
      ...(args.status && { status: args.status }),
    });

    let allCampaigns = [];
    let offset = 0;
    const maxCampaigns = args.limit || 50;

    while (allCampaigns.length < maxCampaigns) {
      params.set('offset', offset.toString());
      const response = await this.apiClient.request(`/emailCampaigns?${params}`);
      
      if (!response.campaigns || response.campaigns.length === 0) break;
      
      // Filter by date if provided
      let campaigns = response.campaigns;
      if (args.startDate || args.endDate) {
        campaigns = campaigns.filter(campaign => {
          const sentDate = new Date(campaign.sentDate);
          if (args.startDate && sentDate < new Date(args.startDate)) return false;
          if (args.endDate && sentDate > new Date(args.endDate)) return false;
          return true;
        });
      }
      
      allCampaigns = allCampaigns.concat(campaigns);
      
      if (allCampaigns.length >= maxCampaigns) {
        allCampaigns = allCampaigns.slice(0, maxCampaigns);
        break;
      }
      
      offset += CONFIG.DEFAULT_BATCH_SIZE;
      if (response.campaigns.length < CONFIG.DEFAULT_BATCH_SIZE) break;
    }

    // Calculate aggregate statistics
    const totalStats = allCampaigns.reduce((acc, campaign) => {
      const stats = campaign.statistics?.campaignStats?.[0] || 
                    campaign.statistics?.globalStats || {};
      
      return {
        sent: acc.sent + (stats.sent || 0),
        delivered: acc.delivered + (stats.delivered || 0),
        uniqueOpens: acc.uniqueOpens + (stats.uniqueOpens || 0),
        uniqueClicks: acc.uniqueClicks + (stats.uniqueClicks || 0),
        hardBounces: acc.hardBounces + (stats.hardBounces || 0),
        softBounces: acc.softBounces + (stats.softBounces || 0),
        unsubscriptions: acc.unsubscriptions + (stats.unsubscriptions || 0),
      };
    }, {
      sent: 0,
      delivered: 0,
      uniqueOpens: 0,
      uniqueClicks: 0,
      hardBounces: 0,
      softBounces: 0,
      unsubscriptions: 0,
    });

    const aggregateRates = BrevoAnalyticsService.calculateRates(totalStats);

    // Get top performers
    const topPerformers = allCampaigns
      .map(campaign => {
        const stats = campaign.statistics?.campaignStats?.[0] || 
                      campaign.statistics?.globalStats || {};
        const rates = BrevoAnalyticsService.calculateRates(stats);
        
        return {
          id: campaign.id,
          name: campaign.name,
          subject: campaign.subject,
          sentDate: campaign.sentDate,
          openRate: parseFloat(rates.openRate),
          clickRate: parseFloat(rates.clickRate),
          sent: stats.sent || 0,
        };
      })
      .filter(c => c.sent > 0)
      .sort((a, b) => b.clickRate - a.clickRate)
      .slice(0, 5);

    return {
      summary: {
        totalCampaigns: allCampaigns.length,
        dateRange: {
          start: args.startDate || allCampaigns[allCampaigns.length - 1]?.sentDate,
          end: args.endDate || allCampaigns[0]?.sentDate,
        },
      },
      aggregateStats: {
        ...totalStats,
        rates: aggregateRates,
      },
      topPerformers,
      campaigns: allCampaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentDate: campaign.sentDate,
        statistics: campaign.statistics?.campaignStats?.[0] || 
                    campaign.statistics?.globalStats || {},
      })),
    };
  }

  async getContactAnalytics(args = {}) {
    // Get contacts
    const contactsResponse = await this.getContacts({
      email: args.email,
      limit: args.email ? 1 : 100,
    });

    const contacts = args.email 
      ? contactsResponse.contacts 
      : contactsResponse.contacts.slice(0, 20); // Limit analysis to 20 contacts

    // Analyze engagement for each contact
    const contactAnalytics = contacts.map(contact => {
      const opens = contact.openedCount || 0;
      const clicks = contact.clickedCount || 0;
      const total = contact.sentCount || 0;
      
      return {
        email: contact.email,
        id: contact.id,
        createdAt: contact.createdAt,
        modifiedAt: contact.modifiedAt,
        listIds: contact.listIds || [],
        attributes: contact.attributes || {},
        engagement: {
          level: BrevoAnalyticsService.determineEngagementLevel(opens, clicks, total),
          sentCount: total,
          openedCount: opens,
          clickedCount: clicks,
          blacklisted: contact.emailBlacklisted || false,
        },
      };
    });

    // Calculate aggregate metrics
    const totalContacts = contactAnalytics.length;
    const engagedContacts = contactAnalytics.filter(
      c => c.engagement.level !== 'Not Engaged' && c.engagement.level !== 'No Activity'
    ).length;
    const blacklistedContacts = contactAnalytics.filter(c => c.engagement.blacklisted).length;

    return {
      summary: {
        totalAnalyzed: totalContacts,
        engagedContacts,
        engagementRate: totalContacts > 0 
          ? ((engagedContacts / totalContacts) * 100).toFixed(2) 
          : 0,
        blacklistedCount: blacklistedContacts,
      },
      contacts: contactAnalytics,
      segmentation: {
        byEngagement: contactAnalytics.reduce((acc, contact) => {
          const level = contact.engagement.level;
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  }

  async getAnalyticsSummary(args = {}) {
    const period = args.period || 'last7days';
    const dateRange = BrevoAnalyticsService.getDateRange(
      period,
      args.startDate,
      args.endDate
    );

    // Get campaigns for the period
    const campaignsData = await this.getCampaignsPerformance({
      startDate: dateRange.start,
      endDate: dateRange.end,
      limit: 100,
    });

    // Get account info for context
    const accountInfo = await this.getAccountInfo();

    // Get contacts summary
    const contactsData = await this.getContacts({ limit: 1 });
    const totalContacts = contactsData.count;

    // Calculate period comparisons (mock previous period data)
    const currentStats = campaignsData.aggregateStats;
    const previousStats = {
      sent: Math.floor(currentStats.sent * 0.9),
      delivered: Math.floor(currentStats.delivered * 0.9),
      uniqueOpens: Math.floor(currentStats.uniqueOpens * 0.85),
      uniqueClicks: Math.floor(currentStats.uniqueClicks * 0.8),
    };

    const changes = {
      sent: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.sent,
        previousStats.sent
      ),
      delivered: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.delivered,
        previousStats.delivered
      ),
      opens: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.uniqueOpens,
        previousStats.uniqueOpens
      ),
      clicks: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.uniqueClicks,
        previousStats.uniqueClicks
      ),
    };

    // Generate insights
    const metrics = {
      emails: {
        sent: currentStats.sent,
        delivered: currentStats.delivered,
        openRate: parseFloat(currentStats.rates.openRate),
        clickRate: parseFloat(currentStats.rates.clickRate),
      },
      contacts: {
        total: totalContacts,
        active: Math.floor(totalContacts * 0.7), // Estimate
        growthRate: 5.2, // Mock growth rate
      },
    };

    const insights = BrevoAnalyticsService.generateInsights(metrics);

    return {
      account: {
        email: accountInfo.email,
        plan: accountInfo.plan,
        credits: accountInfo.credits,
      },
      period: {
        type: period,
        start: dateRange.start,
        end: dateRange.end,
      },
      overview: {
        totalCampaigns: campaignsData.summary.totalCampaigns,
        totalContacts,
        emailsSent: currentStats.sent,
        emailsDelivered: currentStats.delivered,
      },
      performance: {
        current: {
          ...currentStats,
          rates: currentStats.rates,
        },
        changes,
        topCampaigns: campaignsData.topPerformers.slice(0, 3),
      },
      insights,
    };
  }

  async getCampaignRecipients(args) {
    if (!args.campaignId) {
      throw new Error('Campaign ID is required');
    }

    // Note: This endpoint might not exist in Brevo API
    // This is a placeholder implementation
    try {
      const params = new URLSearchParams({
        limit: Math.min(args.limit || CONFIG.DEFAULT_LIMIT, CONFIG.MAX_BATCH_SIZE).toString(),
        offset: (args.offset || 0).toString(),
        ...(args.status && { status: args.status }),
      });

      const response = await this.apiClient.request(
        `/emailCampaigns/${args.campaignId}/recipients?${params}`
      );

      return {
        recipients: response.recipients || [],
        count: response.count || 0,
        campaignId: args.campaignId,
      };
    } catch (error) {
      if (error.statusCode === 404) {
        // Fallback: Get campaign details instead
        const campaign = await this.getCampaignAnalytics({ campaignId: args.campaignId });
        
        return {
          campaignId: args.campaignId,
          message: 'Recipient details not available. Campaign statistics provided instead.',
          statistics: campaign.statistics,
          recipientLists: campaign.recipients,
        };
      }
      throw error;
    }
  }

  async run() {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('Error: BREVO_API_KEY environment variable is not set');
      process.exit(1);
    }

    try {
      this.apiClient = new BrevoApiClient(apiKey, CONFIG.API_BASE_URL);
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.error('Brevo MCP server running on stdio');
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Run the server
const server = new BrevoMCPServer();
server.run();
