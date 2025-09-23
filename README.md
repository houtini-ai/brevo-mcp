# Brevo MCP Server

MCP (Model Context Protocol) server for Brevo email marketing platform with comprehensive analytics support.

## Installation

### Quick Start

1. **Install via npm:**
   ```bash
   npm install -g @houtini/brevo-mcp
   ```

2. **Configure Claude Desktop:**
   Add this to your `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "brevo": {
         "command": "npx",
         "args": ["-y", "@houtini/brevo-mcp"],
         "env": {
           "BREVO_API_KEY": "your-brevo-api-key-here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/houtini-ai/brevo-mcp.git
   cd brevo-mcp
   npm install
   npm run build
   ```

2. Add to Claude Desktop config:
   ```json
   {
     "mcpServers": {
       "brevo": {
         "command": "node",
         "args": ["C:/path/to/brevo-mcp/dist/index.js"],
         "env": {
           "BREVO_API_KEY": "your-brevo-api-key-here"
         }
       }
     }
   }
   ```

## Configuration

### Environment Variables

- `BREVO_API_KEY` - Your Brevo API key (required for API operations)
- `BREVO_BASE_URL` - Custom API base URL (optional, defaults to https://api.brevo.com/v3)

### Getting Your API Key

1. Log in to your [Brevo account](https://app.brevo.com)
2. Go to Settings → API Keys
3. Create a new API key or copy an existing one
4. **Important**: You may need to whitelist your IP address in Brevo's security settings

## Available Tools

### Account Management
- `get_account_info` - Get account information and plan details

### Contact Management
- `get_contacts` - List and search contacts
- `get_contact_analytics` - Analyze contact engagement

### Email Operations
- `send_email` - Send transactional emails
- `get_email_campaigns` - List email campaigns

### Analytics Tools
- `get_campaign_analytics` - Detailed campaign performance metrics
- `get_campaigns_performance` - Bulk campaign analysis
- `get_analytics_summary` - Dashboard overview with insights
- `get_campaign_recipients` - Recipient-level campaign data

## Usage Examples

### Without API Key
The server will start successfully even without an API key. You'll receive a helpful error message when trying to use API operations:

```
User: "Get my Brevo account info"
Assistant: "I need a Brevo API key to access your account. Please add your API key to the Claude Desktop configuration."
```

### With API Key
Once configured, you can use natural language:

```
User: "Show me my email campaign performance for last month"
Assistant: [Displays campaign metrics, open rates, click rates, and insights]
```

## Troubleshooting

### Server Won't Start
- Ensure Node.js 18+ is installed
- Check the logs at: `%APPDATA%\Claude\logs\mcp-server-brevo.log`

### API Key Issues
- The server starts without an API key but will prompt you when needed
- Add the key to your Claude config and restart Claude Desktop
- Ensure your IP is whitelisted in Brevo if you get authentication errors

### Common Errors
- **401 Unauthorized**: Check API key and IP whitelist in Brevo
- **429 Rate Limited**: You've exceeded Brevo's API rate limits
- **404 Not Found**: The resource doesn't exist or endpoint is incorrect

## Development

### Building from Source
```bash
npm install
npm run build
npm test
```

### Running Tests
```bash
# Test without API key
npm test

# Test with API key
BREVO_API_KEY=your-key npm test
```

## License

MIT © Houtini Ltd

## Support

- Issues: [GitHub Issues](https://github.com/houtini-ai/brevo-mcp/issues)
- Email: brevo@houtini.ai
- Documentation: [Brevo API Docs](https://developers.brevo.com/reference)
