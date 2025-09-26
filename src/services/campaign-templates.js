/**
 * Campaign Templates Service for Brevo MCP Server
 * Handles campaign template operations and sharing
 */

export class CampaignTemplatesService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getSharedTemplateUrl(args) {
    if (!args.campaignId) {
      throw new Error('Campaign ID is required');
    }

    const response = await this.apiClient.request(
      `/emailCampaigns/${args.campaignId}/sharedUrl`,
      {
        method: 'GET',
      },
    );

    return {
      campaignId: args.campaignId,
      sharedUrl: response.sharedUrl || response.url || response,
      expiresAt: response.expiresAt,
      message: 'Template sharing URL retrieved successfully',
      // Additional metadata if available
      ...(response.previewUrl && { previewUrl: response.previewUrl }),
      ...(response.publicId && { publicId: response.publicId }),
    };
  }

  // Future template management methods can be added here
  // async createTemplate(args) { }
  // async updateTemplate(args) { }
  // async deleteTemplate(args) { }
  // async listTemplates(args) { }
  // async getTemplate(args) { }
}
