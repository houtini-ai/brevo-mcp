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
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiKey = process.env.BREVO_API_KEY || null;
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
          },
          {
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
            description: "Get list of email campaigns with optional statistics",
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
                statistics: {
                  type: "string",
                  enum: ["globalStats", "linksStats", "statsByDomain", "statsByDevice", "statsByBrowser"],
                  description: "Type of statistics to include",
                },
              },
              required: [],
            },
          },
          // New Analytics Functions
          {
            name: "get_campaign_analytics",
            description: "Get detailed analytics for a specific email campaign including performance metrics, geographic data, device breakdown, and temporal patterns",
            inputSchema: {
              type: "object",
              properties: {
                campaignId: {
                  type: "number",
                  description: "Specific campaign ID for detailed analysis",
                },
                includeGeographics: {
                  type: "boolean",
                  description: "Include country/region breakdowns",
                  default: false,
                },
                includeDeviceStats: {
                  type: "boolean", 
                  description: "Include device/browser analytics",
                  default: false,
                },
                includeTimeStats: {
                  type: "boolean",
                  description: "Include hourly open patterns",
                  default: false,
                },
              },
              required: ["campaignId"],
            },
          },
          {
            name: "get_campaigns_performance",
            description: "Get bulk campaign performance data with filtering and comparison capabilities",
            inputSchema: {
              type: "object",
              properties: {
                startDate: {
                  type: "string",
                  description: "Filter campaigns from date (YYYY-MM-DD)",
                },
                endDate: {
                  type: "string", 
                  description: "Filter campaigns to date (YYYY-MM-DD)",
                },
                status: {
                  type: "string",
                  enum: ["draft", "sent", "archive", "queued", "suspended", "inProcess"],
                  description: "Filter by campaign status",
                },
                includeStats: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["globalStats", "linksStats", "statsByDomain", "statsByDevice", "statsByBrowser"]
                  },
                  description: "Specify statistics types to include",
                  default: ["globalStats"],
                },
                limit: {
                  type: "number",
                  description: "Number of campaigns to retrieve",
                  default: 50,
                },
              },
              required: [],
            },
          },
          {
            name: "get_contact_analytics",
            description: "Get engagement analytics for a specific contact across campaigns",
            inputSchema: {
              type: "object",
              properties: {
                contactId: {
                  type: "number",
                  description: "Contact ID for analysis",
                },
                email: {
                  type: "string",
                  description: "Contact email for analysis (alternative to contactId)",
                },
                campaignLimit: {
                  type: "number",
                  description: "Number of recent campaigns to analyse",
                  default: 50,
                },
              },
              required: [],
            },
          },
          {
            name: "get_analytics_summary",
            description: "Get performance dashboard with key metrics and trends for a specified period",
            inputSchema: {
              type: "object",
              properties: {
                period: {
                  type: "string",
                  enum: ["7d", "30d", "90d"],
                  description: "Time period for analysis",
                  default: "30d",
                },
                startDate: {
                  type: "string",
                  description: "Custom start date (YYYY-MM-DD) - overrides period",
                },
                endDate: {
                  type: "string",
                  description: "Custom end date (YYYY-MM-DD) - overrides period", 
                },
                compareWithPrevious: {
                  type: "boolean",
                  description: "Include comparison with previous period",
                  default: false,
                },
              },
              required: [],
            },
          },
          {
            name: "get_campaign_recipients",
            description: "Get detailed recipient information and engagement for a campaign",
            inputSchema: {
              type: "object",
              properties: {
                campaignId: {
                  type: "number",
                  description: "Campaign ID to analyse recipients for",
                },
                notOpened: {
                  type: "boolean",
                  description: "Filter recipients who haven't opened the campaign",
                  default: false,
                },
                notClicked: {
                  type: "boolean", 
                  description: "Filter recipients who haven't clicked in the campaign",
                  default: false,
                },
              },
              required: ["campaignId"],
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
          
          // New analytics methods
          case "get_campaign_analytics":
            return await this.getCampaignAnalytics(args);
          
          case "get_campaigns_performance":
            return await this.getCampaignsPerformance(args);
          
          case "get_contact_analytics":
            return await this.getContactAnalytics(args);
          
          case "get_analytics_summary":
            return await this.getAnalyticsSummary(args);
          
          case "get_campaign_recipients":
            return await this.getCampaignRecipients(args);
          
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
    if (!this.apiKey) {
      throw new Error('Brevo API key not configured. Please set BREVO_API_KEY environment variable.');
    }
    
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

  // Helper function to calculate percentage change
  calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Helper function to calculate rates
  calculateRates(stats) {
    const rates = {};
    if (stats.sent > 0) {
      rates.deliveryRate = ((stats.delivered || 0) / stats.sent * 100).toFixed(2);
      rates.openRate = ((stats.uniqueViews || 0) / stats.sent * 100).toFixed(2);
      rates.clickRate = ((stats.uniqueClicks || 0) / stats.sent * 100).toFixed(2);
      rates.bounceRate = (((stats.hardBounces || 0) + (stats.softBounces || 0)) / stats.sent * 100).toFixed(2);
      rates.unsubscribeRate = ((stats.unsubscriptions || 0) / stats.sent * 100).toFixed(2);
      rates.complaintRate = ((stats.complaints || 0) / stats.sent * 100).toFixed(2);
      
      // Additional useful rates
      if (stats.uniqueViews > 0) {
        rates.clickToOpenRate = ((stats.uniqueClicks || 0) / stats.uniqueViews * 100).toFixed(2);
      }
      
      // Apple MPP impact indicator
      if (stats.appleMppOpens) {
        rates.appleMppImpact = ((stats.appleMppOpens || 0) / (stats.uniqueViews || 1) * 100).toFixed(2);
      }
    }
    return rates;
  }

  // Helper function to get date range based on period
  getDateRange(period, startDate, endDate) {
    if (startDate && endDate) {
      return { startDate, endDate };
    }

    const now = new Date();
    const start = new Date(now);

    switch (period) {
      case "7d":
        start.setDate(now.getDate() - 7);
        break;
      case "30d":
        start.setDate(now.getDate() - 30);
        break;
      case "90d":
        start.setDate(now.getDate() - 90);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }

  // Existing methods
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

    if (args.statistics) {
      params.append('statistics', args.statistics);
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
              modifiedAt: campaign.modifiedAt,
              statistics: campaign.statistics
            })) || []
          }, null, 2)
        }
      ]
    };
  }

  // New analytics methods
  async getCampaignAnalytics(args) {
    const { campaignId } = args;
    
    // Get campaign data directly from the bulk endpoint that we know works
    let campaigns = [];
    let offset = 0;
    let found = false;
    
    // Search through campaigns to find the one we want
    while (!found && offset < 1000) {
      const params = new URLSearchParams();
      params.append('type', 'classic');
      params.append('limit', '100');
      params.append('offset', offset.toString());
      params.append('statistics', 'globalStats,linksStats,statsByDevice,statsByBrowser,statsByDomain');
      
      const result = await this.makeRequest(`/emailCampaigns?${params}`);
      
      if (!result.campaigns || result.campaigns.length === 0) {
        break;
      }
      
      const campaign = result.campaigns.find(c => c.id === campaignId);
      if (campaign) {
        found = true;
        
        const analytics = {
          campaignInfo: {
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status,
            sentDate: campaign.sentDate,
            type: campaign.type
          },
          coreMetrics: {},
          rates: {},
          lastUpdated: new Date().toISOString()
        };

        // Extract core metrics from statistics
        if (campaign.statistics?.globalStats) {
          const stats = campaign.statistics.globalStats;
          analytics.coreMetrics = {
            sent: stats.sent || 0,
            delivered: stats.delivered || 0,
            opens: stats.uniqueViews || 0,
            totalOpens: stats.trackableViews || 0,
            clicks: stats.uniqueClicks || 0,
            totalClicks: stats.clickers || 0,
            hardBounces: stats.hardBounces || 0,
            softBounces: stats.softBounces || 0,
            unsubscribes: stats.unsubscriptions || 0,
            complaints: stats.complaints || 0,
            openRate: stats.opensRate || 0,
            estimatedViews: stats.estimatedViews || 0,
            appleMppOpens: stats.appleMppOpens || 0
          };
          
          analytics.rates = this.calculateRates(stats);
        } else {
          analytics.coreMetrics = {
            sent: 0,
            delivered: 0,
            opens: 0,
            totalOpens: 0,
            clicks: 0,
            totalClicks: 0,
            hardBounces: 0,
            softBounces: 0,
            unsubscribes: 0,
            complaints: 0
          };
          analytics.warning = "No statistics available for this campaign";
        }

        // Add additional data if available
        if (campaign.statistics?.linksStats) {
          analytics.linkPerformance = campaign.statistics.linksStats;
        }
        
        if (campaign.statistics?.statsByDevice) {
          analytics.deviceStats = campaign.statistics.statsByDevice;
        }
        
        if (campaign.statistics?.statsByBrowser) {
          analytics.browserStats = campaign.statistics.statsByBrowser;
        }
        
        if (campaign.statistics?.statsByDomain) {
          analytics.geographic = campaign.statistics.statsByDomain;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(analytics, null, 2)
            }
          ]
        };
      }
      
      offset += 100;
    }
    
    if (!found) {
      throw new Error(`Campaign ${campaignId} not found in available campaigns`);
    }
  }

  async getCampaignsPerformance(args = {}) {
    const { startDate, endDate, status, includeStats = ["globalStats"], limit = 50 } = args;
    
    const campaigns = [];
    let offset = 0;
    const batchSize = Math.min(limit, 100);
    
    while (campaigns.length < limit) {
      const params = new URLSearchParams();
      params.append('type', 'classic');
      params.append('limit', batchSize.toString());
      params.append('offset', offset.toString());
      params.append('statistics', includeStats.join(','));
      
      if (status) {
        params.append('status', status);
      }
      
      const result = await this.makeRequest(`/emailCampaigns?${params}`);
      
      if (!result.campaigns || result.campaigns.length === 0) {
        break;
      }
      
      // Filter by date if specified
      let filteredCampaigns = result.campaigns;
      if (startDate || endDate) {
        filteredCampaigns = result.campaigns.filter(campaign => {
          if (!campaign.sentDate) return false;
          const sentDate = new Date(campaign.sentDate).toISOString().split('T')[0];
          
          if (startDate && sentDate < startDate) return false;
          if (endDate && sentDate > endDate) return false;
          return true;
        });
      }
      
      campaigns.push(...filteredCampaigns);
      
      if (campaigns.length >= limit || result.campaigns.length < batchSize) {
        break;
      }
      
      offset += batchSize;
    }

    // Calculate aggregate metrics
    const aggregateStats = {
      totalCampaigns: campaigns.length,
      totalSent: 0,
      totalDelivered: 0,
      totalOpens: 0,
      totalClicks: 0,
      totalBounces: 0,
      totalUnsubscribes: 0,
      totalComplaints: 0
    };

    campaigns.forEach(campaign => {
      if (campaign.statistics?.globalStats) {
        const stats = campaign.statistics.globalStats;
        aggregateStats.totalSent += stats.sent || 0;
        aggregateStats.totalDelivered += stats.delivered || 0;
        aggregateStats.totalOpens += stats.uniqueViews || 0;
        aggregateStats.totalClicks += stats.uniqueClicks || 0;
        aggregateStats.totalBounces += (stats.hardBounces || 0) + (stats.softBounces || 0);
        aggregateStats.totalUnsubscribes += stats.unsubscriptions || 0;
        aggregateStats.totalComplaints += stats.complaints || 0;
      }
    });

    // Calculate aggregate rates
    const aggregateRates = this.calculateRates(aggregateStats);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            aggregateMetrics: {
              ...aggregateStats,
              rates: aggregateRates
            },
            campaigns: campaigns.slice(0, limit).map(campaign => ({
              id: campaign.id,
              name: campaign.name,
              subject: campaign.subject,
              status: campaign.status,
              sentDate: campaign.sentDate,
              statistics: campaign.statistics,
              rates: campaign.statistics?.globalStats ? 
                this.calculateRates(campaign.statistics.globalStats) : null
            })),
            dateRange: { startDate, endDate },
            lastUpdated: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async getContactAnalytics(args = {}) {
    const { contactId, email, campaignLimit = 50 } = args;
    
    // Determine identifier
    const identifier = contactId || email;
    if (!identifier) {
      throw new Error("Either contactId or email must be provided");
    }
    
    let contactDetails = null;
    let campaignStats = null;
    let analytics = {
      contactInfo: { identifier },
      engagementSummary: {},
      campaignHistory: [],
      lastUpdated: new Date().toISOString(),
      warnings: []
    };
    
    // First, try to get contact details to verify the contact exists
    try {
      contactDetails = await this.makeRequest(`/contacts/${encodeURIComponent(identifier)}`);
      analytics.contactInfo = {
        id: contactDetails.id,
        email: contactDetails.email,
        attributes: contactDetails.attributes,
        createdAt: contactDetails.createdAt,
        modifiedAt: contactDetails.modifiedAt
      };
    } catch (error) {
      if (error.message.includes('404')) {
        throw new Error(`Contact '${identifier}' not found. Please check the email address or contact ID.`);
      }
      analytics.warnings.push(`Could not retrieve contact details: ${error.message}`);
    }
    
    // Try to get campaign statistics
    try {
      campaignStats = await this.makeRequest(`/contacts/${encodeURIComponent(identifier)}/campaignStats`);
      analytics.campaignHistory = campaignStats.campaigns || campaignStats.events || [];
    } catch (error) {
      if (error.message.includes('404')) {
        analytics.warnings.push("Campaign statistics endpoint not available for this contact");
        analytics.engagementSummary.note = "Contact exists but campaign statistics are not accessible";
      } else {
        analytics.warnings.push(`Campaign statistics error: ${error.message}`);
      }
    }

    // Calculate engagement metrics if we have campaign data
    if (analytics.campaignHistory && analytics.campaignHistory.length > 0) {
      const campaigns = analytics.campaignHistory.slice(0, campaignLimit);
      let totalEvents = campaigns.length;
      let openEvents = 0;
      let clickEvents = 0;
      let sentEvents = 0;
      
      // Count different event types
      campaigns.forEach(event => {
        switch (event.eventType || event.event) {
          case 'sent':
          case 'delivered':
            sentEvents++;
            break;
          case 'opened':
          case 'open':
            openEvents++;
            break;
          case 'clicked':
          case 'click':
            clickEvents++;
            break;
        }
      });

      analytics.engagementSummary = {
        totalEvents: totalEvents,
        sentEvents: sentEvents,
        openEvents: openEvents,
        clickEvents: clickEvents,
        engagementLevel: this.determineEngagementLevel(openEvents, clickEvents, sentEvents || totalEvents),
        lastActivityDate: campaigns[0]?.date || campaigns[0]?.sentAt || 'Unknown'
      };
      
      // Calculate rates if we have sent events
      if (sentEvents > 0) {
        analytics.engagementSummary.openRate = ((openEvents / sentEvents) * 100).toFixed(2);
        analytics.engagementSummary.clickRate = ((clickEvents / sentEvents) * 100).toFixed(2);
      }
    } else {
      analytics.engagementSummary = {
        note: "No campaign engagement data available for this contact",
        possibleReasons: [
          "Contact has not received any campaigns yet",
          "Campaign statistics retention period exceeded",
          "Contact analytics not enabled for this account tier"
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analytics, null, 2)
        }
      ]
    };
  }

  determineEngagementLevel(opens, clicks, total) {
    if (total === 0) return "No Data";
    
    const openRate = (opens / total) * 100;
    const clickRate = (clicks / total) * 100;
    
    if (clickRate > 10) return "Highly Engaged";
    if (clickRate > 5 || openRate > 30) return "Engaged";
    if (openRate > 15) return "Moderately Engaged";
    if (openRate > 5) return "Low Engagement";
    return "Disengaged";
  }

  async getAnalyticsSummary(args = {}) {
    const { period = "30d", startDate, endDate, compareWithPrevious = false } = args;
    
    const dateRange = this.getDateRange(period, startDate, endDate);
    
    // Get campaigns for the main period
    const campaignsPerformance = await this.getCampaignsPerformance({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      includeStats: ["globalStats"],
      limit: 1000
    });

    const mainPeriodData = JSON.parse(campaignsPerformance.content[0].text);
    
    let previousPeriodData = null;
    let comparison = null;

    if (compareWithPrevious) {
      // Calculate previous period dates
      const currentStart = new Date(dateRange.startDate);
      const currentEnd = new Date(dateRange.endDate);
      const periodLength = currentEnd - currentStart;
      
      const prevEnd = new Date(currentStart.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - periodLength);
      
      const previousCampaigns = await this.getCampaignsPerformance({
        startDate: prevStart.toISOString().split('T')[0],
        endDate: prevEnd.toISOString().split('T')[0],
        includeStats: ["globalStats"],
        limit: 1000
      });

      previousPeriodData = JSON.parse(previousCampaigns.content[0].text);
      
      // Calculate comparison
      const current = mainPeriodData.aggregateMetrics;
      const previous = previousPeriodData.aggregateMetrics;
      
      comparison = {
        campaignCount: {
          current: current.totalCampaigns,
          previous: previous.totalCampaigns,
          change: this.calculatePercentageChange(current.totalCampaigns, previous.totalCampaigns)
        },
        totalSent: {
          current: current.totalSent,
          previous: previous.totalSent,
          change: this.calculatePercentageChange(current.totalSent, previous.totalSent)
        },
        openRate: {
          current: parseFloat(current.rates?.openRate || 0),
          previous: parseFloat(previous.rates?.openRate || 0),
          change: this.calculatePercentageChange(
            parseFloat(current.rates?.openRate || 0),
            parseFloat(previous.rates?.openRate || 0)
          )
        },
        clickRate: {
          current: parseFloat(current.rates?.clickRate || 0),
          previous: parseFloat(previous.rates?.clickRate || 0),
          change: this.calculatePercentageChange(
            parseFloat(current.rates?.clickRate || 0),
            parseFloat(previous.rates?.clickRate || 0)
          )
        }
      };
    }

    // Find top performing campaigns
    const topCampaigns = mainPeriodData.campaigns
      .filter(c => c.statistics?.globalStats?.sent > 0)
      .sort((a, b) => {
        const aRate = parseFloat(a.rates?.clickRate || 0);
        const bRate = parseFloat(b.rates?.clickRate || 0);
        return bRate - aRate;
      })
      .slice(0, 5);

    const summary = {
      period: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        label: period
      },
      keyMetrics: mainPeriodData.aggregateMetrics,
      topPerformingCampaigns: topCampaigns,
      insights: this.generateInsights(mainPeriodData.aggregateMetrics),
      comparison: comparison,
      lastUpdated: new Date().toISOString()
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(summary, null, 2)
        }
      ]
    };
  }

  generateInsights(metrics) {
    const insights = [];
    const rates = metrics.rates || {};
    
    if (parseFloat(rates.openRate || 0) > 25) {
      insights.push("Excellent open rate performance - above industry average");
    } else if (parseFloat(rates.openRate || 0) < 15) {
      insights.push("Open rate below average - consider improving subject lines");
    }
    
    if (parseFloat(rates.clickRate || 0) > 3) {
      insights.push("Strong click-through rate indicates engaging content");
    } else if (parseFloat(rates.clickRate || 0) < 1) {
      insights.push("Low click rate - review content relevance and call-to-actions");
    }
    
    if (parseFloat(rates.bounceRate || 0) > 5) {
      insights.push("High bounce rate detected - list hygiene recommended");
    }
    
    if (parseFloat(rates.unsubscribeRate || 0) > 2) {
      insights.push("Elevated unsubscribe rate - review sending frequency and content");
    }
    
    return insights;
  }

  async getCampaignRecipients(args) {
    const { campaignId, notOpened = false, notClicked = false } = args;
    
    // Note: This endpoint might not be directly available in all Brevo API versions
    // This is a conceptual implementation
    try {
      let endpoint = `/emailCampaigns/${campaignId}/recipients`;
      const params = new URLSearchParams();
      
      if (notOpened) {
        params.append('notOpened', 'true');
      }
      if (notClicked) {
        params.append('notClicked', 'true');
      }
      
      if (params.toString()) {
        endpoint += `?${params}`;
      }
      
      const result = await this.makeRequest(endpoint);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              campaignId: campaignId,
              recipientCount: result.recipients?.length || 0,
              recipients: result.recipients || [],
              filters: { notOpened, notClicked },
              lastUpdated: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      // Fallback: return campaign basic info with explanation
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Recipient details endpoint not available",
              message: "Use the export recipients endpoint through the Brevo dashboard for detailed recipient lists",
              campaignId: campaignId
            }, null, 2)
          }
        ]
      };
    }
  }

  async run() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.error("Enhanced Brevo MCP server with analytics running on stdio");
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }
}

const server = new BrevoMCPServer();
server.run().catch(console.error);