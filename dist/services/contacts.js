/**
 * Contacts Service for Brevo MCP Server
 * Handles contact management operations
 */

import { CONFIG } from '../config/constants.js';

export class ContactsService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getContacts(args = {}) {
    const params = new URLSearchParams({
      limit: Math.min(args.limit || CONFIG.DEFAULT_LIMIT, CONFIG.MAX_BATCH_SIZE).toString(),
      offset: (args.offset || 0).toString(),
    });

    // Add email filter if provided
    if (args.email) {
      const response = await this.apiClient.request(`/contacts/${encodeURIComponent(args.email)}`);
      return {
        contacts: [response],
        count: 1,
      };
    }

    const response = await this.apiClient.request(`/contacts?${params}`);

    return {
      contacts: response.contacts || [],
      count: response.count || 0,
    };
  }

  async getContactAnalytics(args = {}) {
    // Get all contacts with their statistics
    const params = new URLSearchParams({
      limit: CONFIG.MAX_BATCH_SIZE.toString(),
      offset: '0',
    });

    if (args.email) {
      params.append('email', args.email);
    }

    const response = await this.apiClient.request(`/contacts?${params}`);
    const contacts = response.contacts || [];

    // Analyze contact engagement
    const analytics = {
      totalContacts: response.count || 0,
      engagementLevels: {
        'Highly Engaged': 0,
        'Engaged': 0,
        'Moderately Engaged': 0,
        'Low Engagement': 0,
        'Not Engaged': 0,
        'No Activity': 0,
      },
      statistics: {
        emailsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        blacklisted: 0,
      },
    };

    // Process each contact's statistics
    contacts.forEach(contact => {
      // Determine engagement level based on opens and clicks
      const opens = contact.statistics?.messagesSent || 0;
      const clicks = contact.statistics?.clicked || 0;
      const total = contact.statistics?.messagesSent || 0;

      const level = this.determineEngagementLevel(opens, clicks, total);
      analytics.engagementLevels[level]++;

      // Accumulate statistics
      analytics.statistics.emailsSent += contact.statistics?.messagesSent || 0;
      analytics.statistics.emailsOpened += contact.statistics?.opened || 0;
      analytics.statistics.emailsClicked += contact.statistics?.clicked || 0;
      if (contact.emailBlacklisted || contact.smsBlacklisted) {
        analytics.statistics.blacklisted++;
      }
    });

    return analytics;
  }

  determineEngagementLevel(opens, clicks, total) {
    if (total === 0) {
      return 'No Activity';
    }
    const openRate = opens / total;
    const clickRate = clicks / total;

    if (clickRate > 0.1) {
      return 'Highly Engaged';
    }
    if (clickRate > 0.05) {
      return 'Engaged';
    }
    if (openRate > 0.2) {
      return 'Moderately Engaged';
    }
    if (openRate > 0) {
      return 'Low Engagement';
    }
    return 'Not Engaged';
  }
}
