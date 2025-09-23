/**
 * Email Service for Brevo MCP Server
 * Handles all email-related operations
 */

export class EmailService {
  constructor(apiClient) {
    this.apiClient = apiClient;
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
}
