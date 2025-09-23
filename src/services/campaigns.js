/**
 * Campaigns Service for Brevo MCP Server
 * Handles campaign management and analytics
 */

import { CONFIG } from '../config/constants.js';
import { BrevoAnalyticsService } from './analytics.js';

export class CampaignsService {
  constructor(apiClient) {
    this.apiClient = apiClient;
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
        `/emailCampaigns?limit=${batchSize}&offset=${offset}`,
      );

      campaign = campaigns.campaigns?.find(c => c.id === args.campaignId);
      if (campaign) {
        break;
      }

      offset += batchSize;
      if (!campaigns.campaigns || campaigns.campaigns.length < batchSize) {
        break;
      }
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
        clicks: stats.clicks || 0,
        hardBounces: stats.hardBounces || 0,
        softBounces: stats.softBounces || 0,
        unsubscriptions: stats.unsubscriptions || 0,
        complaints: stats.complaints || 0,
        rates,
      },
      recipients: campaign.recipients || {},
      tags: campaign.tags || [],
      createdAt: campaign.createdAt,
      modifiedAt: campaign.modifiedAt,
    };
  }

  async getCampaignsPerformance(args = {}) {
    const limit = Math.min(args.limit || 20, 100);
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: '0',
      ...(args.status && { status: args.status }),
    });

    const response = await this.apiClient.request(`/emailCampaigns?${params}`);
    const campaigns = response.campaigns || [];

    // Filter by date if provided
    let filteredCampaigns = campaigns;
    if (args.startDate || args.endDate) {
      filteredCampaigns = campaigns.filter(campaign => {
        const modifiedDate = new Date(campaign.modifiedAt);
        if (args.startDate && modifiedDate < new Date(args.startDate)) {
          return false;
        }
        if (args.endDate && modifiedDate > new Date(args.endDate)) {
          return false;
        }
        return true;
      });
    }

    // Calculate performance metrics for each campaign
    const performanceData = filteredCampaigns.map(campaign => {
      const stats = campaign.statistics?.campaignStats?.[0] ||
                    campaign.statistics?.globalStats || {};
      const rates = BrevoAnalyticsService.calculateRates(stats);

      return {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentDate: campaign.sentDate,
        statistics: {
          sent: stats.sent || 0,
          delivered: stats.delivered || 0,
          opens: stats.uniqueOpens || 0,
          clicks: stats.uniqueClicks || 0,
          bounces: (stats.hardBounces || 0) + (stats.softBounces || 0),
          unsubscribes: stats.unsubscriptions || 0,
        },
        rates,
        score: this.calculatePerformanceScore(rates),
      };
    });

    // Sort by performance score
    performanceData.sort((a, b) => b.score - a.score);

    // Calculate aggregate statistics
    const totalStats = performanceData.reduce((acc, campaign) => {
      acc.sent += campaign.statistics.sent;
      acc.delivered += campaign.statistics.delivered;
      acc.opens += campaign.statistics.opens;
      acc.clicks += campaign.statistics.clicks;
      acc.bounces += campaign.statistics.bounces;
      acc.unsubscribes += campaign.statistics.unsubscribes;
      return acc;
    }, { sent: 0, delivered: 0, opens: 0, clicks: 0, bounces: 0, unsubscribes: 0 });

    const avgRates = BrevoAnalyticsService.calculateRates(totalStats);

    return {
      campaigns: performanceData,
      count: performanceData.length,
      aggregateStats: {
        ...totalStats,
        rates: avgRates,
      },
      topPerformers: performanceData.slice(0, 5),
      insights: this.generatePerformanceInsights(performanceData, avgRates),
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
        `/emailCampaigns/${args.campaignId}/recipients?${params}`,
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

  calculatePerformanceScore(rates) {
    // Weight different metrics to calculate overall performance
    const openWeight = 0.3;
    const clickWeight = 0.4;
    const bounceWeight = -0.2;
    const unsubWeight = -0.1;

    return (
      parseFloat(rates.openRate) * openWeight +
      parseFloat(rates.clickRate) * clickWeight +
      parseFloat(rates.bounceRate) * bounceWeight +
      parseFloat(rates.unsubscribeRate) * unsubWeight
    );
  }

  generatePerformanceInsights(campaigns, avgRates) {
    const insights = [];

    if (campaigns.length === 0) {
      return ['No campaigns found for the specified period'];
    }

    // Analyze trends
    const avgOpenRate = parseFloat(avgRates.openRate);
    const avgClickRate = parseFloat(avgRates.clickRate);

    if (avgOpenRate > 25) {
      insights.push('Campaign open rates are above industry average (25%)');
    } else if (avgOpenRate < 15) {
      insights.push('Open rates are below industry average - consider improving subject lines');
    }

    if (avgClickRate > 3) {
      insights.push('Strong click-through performance indicates engaging content');
    } else if (avgClickRate < 1) {
      insights.push('Low click rates suggest need for better CTAs and content relevance');
    }

    // Find best performing campaign
    if (campaigns.length > 0) {
      const bestCampaign = campaigns[0];
      insights.push(`Top performer: "${bestCampaign.name}" with ${bestCampaign.rates.clickRate}% CTR`);
    }

    return insights;
  }
}
