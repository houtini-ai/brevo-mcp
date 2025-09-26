/**
 * Campaign Delivery Service for Brevo MCP Server
 * Handles campaign sending, testing, and status management
 */

export class CampaignDeliveryService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async sendCampaignNow(args) {
    if (!args.campaignId) {
      throw new Error('Campaign ID is required');
    }

    // The sendNow endpoint doesn't require a body
    await this.apiClient.request(`/emailCampaigns/${args.campaignId}/sendNow`, {
      method: 'POST',
      // No body needed
    });

    return {
      campaignId: args.campaignId,
      status: 'sent',
      message: 'Campaign has been sent successfully',
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Send a test email for a campaign
   * Purpose: Test a campaign before sending to actual recipients
   * 
   * Best practice: Omit emailTo to send to your pre-configured test list
   * The emailTo parameter is optional and should only be used for edge cases
   * 
   * @param {Object} args
   * @param {number} args.campaignId - ID of the campaign to test
   * @param {string|array} [args.emailTo] - Optional: Override test list with specific emails
   */
  async sendTestEmail(args) {
    if (!args.campaignId) {
      throw new Error('Campaign ID is required');
    }

    // emailTo is optional - if not provided, sends to entire test list
    let testData = {};
    let recipientMessage = 'test list';
    
    if (args.emailTo) {
      // Ensure emailTo is always an array
      const recipients = Array.isArray(args.emailTo) ? args.emailTo : [args.emailTo];
      testData = { emailTo: recipients };
      recipientMessage = `${recipients.length} recipient(s)`;
    }
    // If emailTo is not provided, send empty object to trigger test list send

    await this.apiClient.request(`/emailCampaigns/${args.campaignId}/sendTest`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });

    return {
      campaignId: args.campaignId,
      testRecipients: args.emailTo || 'test list',
      status: 'test_sent',
      message: `Test email sent to ${recipientMessage}`,
      sentAt: new Date().toISOString(),
    };
  }

  async updateCampaignStatus(args) {
    if (!args.campaignId) {
      throw new Error('Campaign ID is required');
    }
    if (!args.status) {
      throw new Error('Status is required');
    }

    // Validate status values
    const validStatuses = ['suspended', 'archive', 'darchive', 'sent', 'queued', 'replicate'];
    if (!validStatuses.includes(args.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const statusData = {
      status: args.status,
    };

    await this.apiClient.request(`/emailCampaigns/${args.campaignId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });

    // Provide human-readable status descriptions
    const statusDescriptions = {
      suspended: 'Campaign has been paused',
      archive: 'Campaign has been archived',
      darchive: 'Campaign has been unarchived',
      sent: 'Campaign has been marked as sent',
      queued: 'Campaign has been queued for sending',
      replicate: 'Campaign has been replicated',
    };

    return {
      campaignId: args.campaignId,
      status: args.status,
      message: statusDescriptions[args.status] || 'Campaign status updated',
      updatedAt: new Date().toISOString(),
    };
  }
}
