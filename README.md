# Brevo API MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with the Brevo email marketing platform. This server enables AI assistants like Claude to manage contacts, send emails, and retrieve campaign analytics directly through Brevo's REST API.

![Brevo MCP Server](https://img.shields.io/badge/MCP-Compatible-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **Account Management**: Retrieve account information, plan details, and credit balance
- **Contact Operations**: Fetch, filter, and manage your Brevo contact database  
- **Email Sending**: Send transactional emails with HTML and text content
- **Campaign Analytics**: Get campaign statistics and performance metrics
- **Real-time Integration**: Direct REST API connection with proper error handling
- **Security First**: IP whitelisting support and secure API key management

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- A Brevo account with API access
- An MCP-compatible client (e.g., Claude Desktop)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/brevo-api-mcp.git
   cd brevo-api-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Get your Brevo API key**:
   - Log into your [Brevo account](https://app.brevo.com)
   - Navigate to **SMTP & API** → **API Keys**
   - Create a new API key or copy an existing one

4. **Configure IP whitelisting** (if required):
   - Go to [Brevo Security Settings](https://app.brevo.com/security/authorised_ips)
   - Add your server's IP address to the authorized list

### Configuration

#### For Claude Desktop

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
         "args": ["/absolute/path/to/brevo-api-mcp/index.js"],
         "env": {
           "BREVO_API_KEY": "your_brevo_api_key_here"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

#### For Other MCP Clients

The server follows the standard MCP protocol. Configure your client to run:
```bash
node /path/to/brevo-api-mcp/index.js
```

With the environment variable:
```bash
BREVO_API_KEY=your_brevo_api_key_here
```

## 🛠️ Available Tools

### `get_account_info`
Retrieve your Brevo account information and plan details.

**Parameters**: None

**Example**: "Show me my Brevo account information"

### `get_contacts`
Fetch contacts from your Brevo database with optional filtering.

**Parameters**:
- `limit` (number, optional): Number of contacts to retrieve (max 1000, default 50)
- `offset` (number, optional): Number of contacts to skip (default 0)
- `email` (string, optional): Filter by specific email address

**Examples**: 
- "Get my latest 20 contacts from Brevo"
- "Find the contact with email john@example.com"

### `send_email`
Send transactional emails through Brevo.

**Parameters**:
- `to` (array, required): Recipients with email and optional name
- `subject` (string, required): Email subject line
- `sender` (object, required): Sender with email and optional name
- `htmlContent` (string, optional): HTML email content
- `textContent` (string, optional): Plain text email content

**Example**: "Send a welcome email to new@customer.com"

### `get_email_campaigns`
Retrieve a list of email campaigns with basic information.

**Parameters**:
- `type` (string, optional): Campaign type - "classic" or "trigger" (default: "classic")
- `status` (string, optional): Filter by status - "draft", "sent", "archive", etc.
- `limit` (number, optional): Number of campaigns to retrieve (default 50)
- `offset` (number, optional): Number of campaigns to skip (default 0)

**Examples**:
- "List my recent email campaigns"
- "Show me all draft campaigns"

## 💬 Usage Examples

Once configured with Claude Desktop, you can use natural language:

```
You: "What's my current Brevo email credit balance?"

You: "Get the last 10 contacts added to my database"

You: "Send a thank you email to customer@example.com with the subject 'Thanks for your purchase'"

You: "Show me statistics for my email campaigns from this month"
```

## 🧪 Testing

Run the included test script to verify functionality:

```bash
npm test
```

Or test manually:
```bash
BREVO_API_KEY=your_key_here node test.js
```

## 🔧 Development

### Project Structure
```
brevo-api-mcp/
├── index.js              # Main MCP server
├── package.json          # Dependencies and scripts
├── README.md             # This file
├── examples.md           # Detailed usage examples
├── test.js              # Basic functionality test
└── claude_desktop_config.example.json  # Example configuration
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 🔒 Security

- **API Keys**: Never commit API keys to version control
- **IP Whitelisting**: Configure Brevo IP restrictions for additional security
- **Environment Variables**: Store sensitive data in environment variables
- **Error Handling**: The server provides helpful error messages without exposing sensitive data

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/brevo-api-mcp/issues)
- **Brevo API Documentation**: [Brevo Developers](https://developers.brevo.com/)
- **MCP Protocol**: [Model Context Protocol](https://modelcontextprotocol.io/)

## 🙏 Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Integrates with [Brevo's REST API](https://developers.brevo.com/reference/getting-started)
- Created for the Claude Desktop and MCP ecosystem

---

Made with ❤️ for the MCP community