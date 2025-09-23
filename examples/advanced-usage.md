# Advanced Examples

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
