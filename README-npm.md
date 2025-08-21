# Brevo MCP Server

[![npm version](https://badge.fury.io/js/@richardbaxterseo%2Fbrevo-mcp-server.svg)](https://www.npmjs.com/package/@richardbaxterseo/brevo-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@richardbaxterseo/brevo-mcp-server.svg)](https://nodejs.org)

MCP (Model Context Protocol) server for integrating Brevo (formerly Sendinblue) email marketing services with Claude and other AI assistants.

## Features

- ✅ **Account Management** - Get account information and credits
- 📧 **Email Operations** - Send transactional emails with templates
- 👥 **Contact Management** - List and search contacts
- 📊 **Campaign Analytics** - Comprehensive campaign performance metrics
- 📈 **Performance Insights** - AI-ready analytics summaries
- 🔄 **Real-time Data** - Live statistics from Brevo API
- 🛡️ **Error Handling** - Detailed error messages and troubleshooting

## Installation

### NPM (Recommended)
```bash
npm install -g @richardbaxterseo/brevo-mcp-server
```

### Local Development
```bash
git clone https://github.com/richardbaxterseo/brevo-mcp-server.git
cd brevo-mcp-server
npm install
npm run build
```

## Configuration

### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "brevo": {
      "command": "npx",
      "args": ["@richardbaxterseo/brevo-mcp-server"],
      "env": {
        "BREVO_API_KEY": "your-brevo-api-key-here"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BREVO_API_KEY` | Your Brevo API key | ✅ Yes |
| `BREVO_BASE_URL` | Custom API endpoint | ❌ No (defaults to `https://api.brevo.com/v3`) |

## API Reference

### Account Operations

#### `get_account_info`
Retrieves account information including plan details and credits.

**Returns:**
```json
{
  "email": "user@example.com",
  "company": "Company Name",
  "plan": "Business",
  "credits": {
    "emailCredits": 1000000,
    "smsCredits": 5000
  }
}
```

### Email Operations

#### `send_email`
Sends a transactional email.

**Parameters:**
- `to` (array, required): Recipient email addresses
- `subject` (string, required): Email subject
- `htmlContent` (string): HTML content
- `textContent` (string): Plain text content
- `templateId` (number): Brevo template ID
- `params` (object): Template parameters
- `from` (object): Sender details
- `replyTo` (object): Reply-to address
- `tags` (array): Email tags

**Example:**
```javascript
{
  "to": [{"email": "recipient@example.com", "name": "John Doe"}],
  "subject": "Welcome!",
  "templateId": 1,
  "params": {
    "firstName": "John",
    "activationLink": "https://example.com/activate"
  }
}
```

### Contact Operations

#### `get_contacts`
Lists contacts with pagination and filtering.

**Parameters:**
- `limit` (number): Results per page (default: 50, max: 1000)
- `offset` (number): Pagination offset
- `email` (string): Filter by email address

### Campaign Analytics

#### `get_campaign_analytics`
Detailed analytics for a specific campaign.

**Parameters:**
- `campaignId` (number, required): Campaign ID
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

#### `get_campaigns_performance`
Performance metrics for multiple campaigns.

**Parameters:**
- `status` (string): Filter by status (sent/draft/suspended)
- `startDate` (string): Start date filter
- `endDate` (string): End date filter
- `limit` (number): Results limit

#### `get_analytics_summary`
Comprehensive analytics overview with AI-ready insights.

**Parameters:**
- `period` (string): Time period (today/yesterday/last7days/last30days/custom)
- `startDate` (string): Custom start date
- `endDate` (string): Custom end date

## Usage Examples

### Basic Email Send
```javascript
// Claude query example
"Send an email to john@example.com with template ID 5, including their name as John"
```

### Campaign Analytics
```javascript
// Claude query example
"Get analytics for campaign 12345 from the last 30 days"
```

### Performance Summary
```javascript
// Claude query example
"Show me email performance summary for the last 7 days"
```

## Error Handling

Common errors and solutions:

### Authentication Error (401)
```
Error: Authentication failed: Your IP address needs to be whitelisted
```
**Solution:** Add your IP address at https://app.brevo.com/security/authorised_ips

### Rate Limiting
The server automatically handles pagination for large datasets. No action required.

### Missing API Key
```
Error: Brevo API key not configured
```
**Solution:** Set the `BREVO_API_KEY` environment variable

## Troubleshooting

### Server won't start
1. Check Node.js version: `node --version` (requires 18+)
2. Verify API key is set correctly
3. Check network connectivity to api.brevo.com

### No data returned
1. Verify your Brevo account has data
2. Check date ranges in queries
3. Ensure proper permissions for API key

### Claude doesn't recognise commands
1. Restart Claude Desktop after configuration
2. Check logs: `View → Developer → Console`
3. Verify server appears in MCP menu

## Development

### Running Tests
```bash
npm test
npm run test:coverage
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Building
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

## Changelog

### v2.1.0
- Added comprehensive analytics endpoints
- Improved error handling with detailed messages
- Added campaign performance tracking
- Enhanced documentation

### v2.0.0
- Complete rewrite for MCP protocol
- Added contact analytics
- Improved pagination handling

### v1.0.0
- Initial release
- Basic email and contact operations

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- 🐛 [Report bugs](https://github.com/richardbaxterseo/brevo-mcp-server/issues)
- 💡 [Request features](https://github.com/richardbaxterseo/brevo-mcp-server/issues)
- 📧 [Email support](mailto:richard@richardbaxter.co)

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [Brevo API](https://developers.brevo.com)

---

Made with ❤️ by [Richard Baxter](https://richardbaxter.co)
