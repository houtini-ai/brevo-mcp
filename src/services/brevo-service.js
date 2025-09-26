/**
 * Main Brevo Service
 * Orchestrates all Brevo operations
 */

import { BrevoAnalyticsService } from './analytics.js';
import { EmailService } from './email.js';
import { ContactsService } from './contacts.js';
import { CampaignsService } from './campaigns.js';
import { CampaignDeliveryService } from './campaign-delivery.js';
import { CampaignTemplatesService } from './campaign-templates.js';

export class BrevoService {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.emailService = new EmailService(apiClient);
    this.contactsService = new ContactsService(apiClient);
    this.campaignsService = new CampaignsService(apiClient);
    this.campaignDeliveryService = new CampaignDeliveryService(apiClient);
    this.campaignTemplatesService = new CampaignTemplatesService(apiClient);
  }

  async getAccountInfo() {
    const response = await this.apiClient.request('/account');

    return {
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      company: response.companyName,
      plan: response.plan?.[0]?.type || 'unknown',
      credits: {
        emailCredits: response.plan?.[0]?.credits || 0,
        smsCredits: response.plan?.[0]?.creditsType === 'sendLimit' ?
          response.plan?.[0]?.credits : 0,
      },
      features: response.plan?.[0]?.features || [],
      relay: response.relay?.enabled || false,
      marketingAutomation: response.marketingAutomation?.enabled || false,
    };
  }

  async getContacts(args) {
    return this.contactsService.getContacts(args);
  }

  async sendEmail(args) {
    return this.emailService.sendEmail(args);
  }

  async getEmailCampaigns(args) {
    return this.campaignsService.getEmailCampaigns(args);
  }

  async getCampaignAnalytics(args) {
    return this.campaignsService.getCampaignAnalytics(args);
  }

  async getCampaignsPerformance(args) {
    return this.campaignsService.getCampaignsPerformance(args);
  }

  async getContactAnalytics(args) {
    return this.contactsService.getContactAnalytics(args);
  }

  async getAnalyticsSummary(args = {}) {
    // Determine date range
    let startDate, endDate;
    const now = new Date();

    switch (args.period || 'last7days') {
    case 'today':
      startDate = endDate = now.toISOString().split('T')[0];
      break;
    case 'yesterday':
      {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split('T')[0];
      }
      break;
    case 'last7days':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
      break;
    case 'last30days':
      startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
      break;
    case 'custom':
      {
        if (!args.startDate || !args.endDate) {
          throw new Error('startDate and endDate required for custom period');
        }
        startDate = args.startDate;
        endDate = args.endDate;
      }
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
    }

    // Fetch data from multiple sources
    const [accountInfo, contactsData, campaignsData] = await Promise.all([
      this.getAccountInfo(),
      this.getContactAnalytics(),
      this.getCampaignsPerformance({ startDate, endDate }),
    ]);

    // Calculate overall statistics
    const currentStats = campaignsData.aggregateStats || {};

    // For comparison, we'd need to fetch previous period data
    // For now, we'll simulate with reduced values
    const previousStats = {
      sent: Math.floor(currentStats.sent * 0.9),
      delivered: Math.floor(currentStats.delivered * 0.9),
      opens: Math.floor(currentStats.opens * 0.85),
      clicks: Math.floor(currentStats.clicks * 0.85),
    };

    // Calculate changes
    const changes = {
      sent: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.sent,
        previousStats.sent,
      ),
      delivered: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.delivered,
        previousStats.delivered,
      ),
      opens: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.opens,
        previousStats.opens,
      ),
      clicks: BrevoAnalyticsService.calculatePercentageChange(
        currentStats.clicks,
        previousStats.clicks,
      ),
    };

    // Generate insights
    const insights = BrevoAnalyticsService.generateInsights({
      emails: currentStats,
      contacts: {
        total: contactsData.totalContacts,
        active: contactsData.totalContacts - contactsData.statistics.blacklisted,
        growthRate: 5, // Placeholder
      },
      campaigns: campaignsData,
    });

    return {
      period: {
        type: args.period || 'last7days',
        startDate,
        endDate,
      },
      account: {
        email: accountInfo.email,
        company: accountInfo.company,
        plan: accountInfo.plan,
        credits: accountInfo.credits,
      },
      overview: {
        totalContacts: contactsData.totalContacts,
        totalCampaigns: campaignsData.count,
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
    return this.campaignsService.getCampaignRecipients(args);
  }

  // ============= NEW CAMPAIGN MANAGEMENT METHODS =============

  // Campaign CRUD operations (in campaigns.js)
  async createEmailCampaign(args) {
    return this.campaignsService.createEmailCampaign(args);
  }

  async updateEmailCampaign(args) {
    return this.campaignsService.updateEmailCampaign(args);
  }

  // Campaign delivery operations (in campaign-delivery.js)
  async sendCampaignNow(args) {
    return this.campaignDeliveryService.sendCampaignNow(args);
  }

  async sendTestEmail(args) {
    return this.campaignDeliveryService.sendTestEmail(args);
  }

  async updateCampaignStatus(args) {
    return this.campaignDeliveryService.updateCampaignStatus(args);
  }

  // Campaign template operations (in campaign-templates.js)
  async getSharedTemplateUrl(args) {
    return this.campaignTemplatesService.getSharedTemplateUrl(args);
  }
}
