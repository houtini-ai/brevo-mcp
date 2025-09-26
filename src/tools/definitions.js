/**
 * Tool definitions for Brevo MCP Server
 * Defines all available tools and their schemas
 */

export const TOOLS = [
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
          maximum: 1000,
        },
        offset: {
          type: 'number',
          description: 'Number of contacts to skip',
          minimum: 0,
        },
        email: {
          type: 'string',
          description: 'Filter by email address',
          format: 'email',
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
              name: { type: 'string' },
            },
            required: ['email'],
          },
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
            name: { type: 'string' },
          },
        },
        replyTo: {
          type: 'object',
          description: 'Reply-to address',
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
          },
        },
        tags: {
          type: 'array',
          description: 'Tags for the email',
          items: { type: 'string' },
        },
      },
      required: ['to'],
      oneOf: [
        { required: ['subject', 'htmlContent'] },
        { required: ['subject', 'textContent'] },
        { required: ['templateId'] },
      ],
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
          enum: ['classic', 'trigger'],
        },
        status: {
          type: 'string',
          description: 'Campaign status filter',
          enum: ['sent', 'draft', 'archive', 'queued', 'suspended', 'inProcess'],
        },
        limit: {
          type: 'number',
          description: 'Number of campaigns to return',
          minimum: 1,
          maximum: 1000,
        },
        offset: {
          type: 'number',
          description: 'Number of campaigns to skip',
          minimum: 0,
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
          minimum: 1,
        },
        startDate: {
          type: 'string',
          description: 'Start date for analytics (YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date for analytics (YYYY-MM-DD)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
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
          enum: ['sent', 'draft', 'suspended'],
        },
        startDate: {
          type: 'string',
          description: 'Filter campaigns modified after this date',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'Filter campaigns modified before this date',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of campaigns to analyze',
          minimum: 1,
          maximum: 100,
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
          format: 'email',
        },
        listId: {
          type: 'number',
          description: 'Filter by list ID',
          minimum: 1,
        },
        startDate: {
          type: 'string',
          description: 'Start date for engagement data',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'End date for engagement data',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
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
          default: 'last7days',
        },
        startDate: {
          type: 'string',
          description: 'Custom start date (required if period is "custom")',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        endDate: {
          type: 'string',
          description: 'Custom end date (required if period is "custom")',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
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
          minimum: 1,
        },
        status: {
          type: 'string',
          description: 'Filter by recipient status',
          enum: ['sent', 'opened', 'clicked', 'unsubscribed', 'bounced'],
        },
        limit: {
          type: 'number',
          description: 'Number of recipients to return',
          minimum: 1,
          maximum: 1000,
        },
        offset: {
          type: 'number',
          description: 'Number of recipients to skip',
          minimum: 0,
        },
      },
      required: ['campaignId'],
    },
  },
  // ============= NEW CAMPAIGN MANAGEMENT TOOLS =============
  {
    name: 'create_email_campaign',
    description: 'Create a new email campaign in Brevo',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Internal campaign name',
        },
        subject: {
          type: 'string',
          description: 'Email subject line',
        },
        sender: {
          type: 'object',
          description: 'Sender information (optional - defaults to verified sender from account)',
          properties: {
            name: { type: 'string', description: 'Sender name' },
            email: { type: 'string', format: 'email', description: 'Sender email (must be verified)' },
            id: { type: 'number', description: 'Sender ID (alternative to email)' },
          },
        },
        htmlContent: {
          type: 'string',
          description: 'HTML content of the email',
        },
        htmlUrl: {
          type: 'string',
          description: 'URL to fetch HTML content from',
        },
        templateId: {
          type: 'number',
          description: 'ID of existing Brevo template to use',
        },
        listIds: {
          type: 'array',
          description: 'List IDs to send campaign to',
          items: { type: 'number' },
        },
        exclusionListIds: {
          type: 'array',
          description: 'List IDs to exclude from campaign',
          items: { type: 'number' },
        },
        segmentIds: {
          type: 'array',
          description: 'Segment IDs to target',
          items: { type: 'number' },
        },
        type: {
          type: 'string',
          description: 'Campaign type',
          enum: ['classic', 'trigger'],
          default: 'classic',
        },
        tag: {
          type: 'string',
          description: 'Campaign tag for organization',
        },
        replyTo: {
          type: 'string',
          format: 'email',
          description: 'Reply-to email address',
        },
        scheduledAt: {
          type: 'string',
          description: 'ISO 8601 datetime to schedule campaign',
        },
        abTesting: {
          type: 'boolean',
          description: 'Enable A/B testing',
          default: false,
        },
        sendAtBestTime: {
          type: 'boolean',
          description: 'Enable send time optimization',
          default: false,
        },
        utmCampaign: {
          type: 'string',
          description: 'UTM campaign parameter for tracking',
        },
        params: {
          type: 'object',
          description: 'Template parameters if using templateId',
        },
      },
      required: ['name', 'subject'], // sender is now optional - auto-detects from account
    },
  },
  {
    name: 'update_email_campaign',
    description: 'Update an existing email campaign',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'number',
          description: 'ID of the campaign to update',
          minimum: 1,
        },
        name: {
          type: 'string',
          description: 'Internal campaign name',
        },
        subject: {
          type: 'string',
          description: 'Email subject line',
        },
        sender: {
          type: 'object',
          description: 'Sender information',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        },
        htmlContent: {
          type: 'string',
          description: 'HTML content of the email',
        },
        htmlUrl: {
          type: 'string',
          description: 'URL to fetch HTML content from',
        },
        templateId: {
          type: 'number',
          description: 'ID of existing Brevo template',
        },
        recipients: {
          type: 'object',
          description: 'Recipients configuration',
          properties: {
            listIds: { type: 'array', items: { type: 'number' } },
            exclusionListIds: { type: 'array', items: { type: 'number' } },
            segmentIds: { type: 'array', items: { type: 'number' } },
          },
        },
        scheduledAt: {
          type: 'string',
          description: 'ISO 8601 datetime to reschedule campaign',
        },
        sendAtBestTime: {
          type: 'boolean',
          description: 'Enable send time optimization',
        },
        utmCampaign: {
          type: 'string',
          description: 'UTM campaign parameter',
        },
      },
      required: ['campaignId'],
    },
  },
  {
    name: 'send_campaign_now',
    description: 'Send an email campaign immediately',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'number',
          description: 'ID of the campaign to send',
          minimum: 1,
        },
      },
      required: ['campaignId'],
    },
  },
  {
    name: 'send_test_email',
    description: 'Send a test version of a campaign to your pre-configured Brevo test list for review before sending to actual recipients',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'number',
          description: 'ID of the campaign to test',
          minimum: 1,
        },
        emailTo: {
          oneOf: [
            { type: 'string', format: 'email' },
            { type: 'array', items: { type: 'string', format: 'email' } },
          ],
          description: 'Optional: Override test list with specific emails. Normally omit this to use your pre-configured test list.',
        },
      },
      required: ['campaignId'],
    },
  },
  {
    name: 'update_campaign_status',
    description: 'Update campaign status (pause, resume, archive)',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'number',
          description: 'ID of the campaign',
          minimum: 1,
        },
        status: {
          type: 'string',
          description: 'New campaign status',
          enum: ['suspended', 'archive', 'darchive', 'sent', 'queued', 'replicate'],
        },
      },
      required: ['campaignId', 'status'],
    },
  },
  {
    name: 'get_shared_template_url',
    description: 'Get a shareable URL for a campaign template',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'number',
          description: 'ID of the campaign',
          minimum: 1,
        },
      },
      required: ['campaignId'],
    },
  },
];
