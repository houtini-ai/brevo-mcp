# Brevo MCP Server Examples

This file contains examples of how to use the Brevo MCP Server with various MCP clients.

## Claude Desktop Configuration

1. Locate your Claude Desktop configuration file:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the Brevo server configuration:

```json
{
  "mcpServers": {
    "brevo": {
      "command": "node",
      "args": ["C:\\dev\\brevo-mcp-server\\index.js"],
      "env": {
        "BREVO_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

3. Restart Claude Desktop

## Usage Examples

Once configured, you can use natural language with Claude to interact with Brevo:

### Account Information
"Can you show me my Brevo account details?"

### Contact Management
- "Get my latest 20 contacts from Brevo"
- "Find the contact with email john@example.com"
- "Show me all contacts created in the last month"

### Email Campaigns
- "List my recent email campaigns"
- "Show me the statistics for campaign ID 12345"
- "Get all draft campaigns"

### Sending Emails
"Send a welcome email to new@customer.com with the subject 'Welcome to our service' and include a nice HTML message"

## Direct MCP Protocol Usage

If you're building your own MCP client, here are example requests:

### List Available Tools
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

### Get Account Info
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_account_info",
    "arguments": {}
  }
}
```

### Get Contacts
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_contacts",
    "arguments": {
      "limit": 10,
      "offset": 0
    }
  }
}
```

### Send Email
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "send_email",
    "arguments": {
      "to": [{"email": "recipient@example.com", "name": "John Doe"}],
      "subject": "Test Email",
      "htmlContent": "<h1>Hello!</h1><p>This is a test email.</p>",
      "sender": {"email": "sender@example.com", "name": "Your Company"}
    }
  }
}
```

## Environment Variables

The server requires the following environment variable:

- `BREVO_API_KEY`: Your Brevo API key (required)

You can get your API key from:
1. Log into your Brevo account
2. Go to **SMTP & API** → **API Keys**
3. Create a new key or use an existing one

## Troubleshooting

### Common Issues

1. **"Brevo API key not configured" error**
   - Ensure `BREVO_API_KEY` is set in your environment
   - Verify the API key is valid and active

2. **Server not starting**
   - Check that Node.js is installed (version 18+)
   - Verify all dependencies are installed (`npm install`)
   - Check the server path in your configuration

3. **API errors**
   - Verify your Brevo account is active
   - Check API rate limits
   - Ensure the API key has the necessary permissions

### Testing

Run the included test script to verify basic functionality:
```bash
node test.js
```

This will test server startup and tool listing without requiring a real API key.