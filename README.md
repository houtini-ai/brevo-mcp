# Enhanced Brevo MCP Server with Analytics

A comprehensive Model Context Protocol (MCP) server that provides seamless integration with the Brevo email marketing platform. This enhanced server enables AI assistants like Claude to manage contacts, send emails, and perform in-depth campaign analytics directly through Brevo's REST API.

![Brevo MCP Server](https://img.shields.io/badge/MCP-Compatible-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-yellow) ![Version](https://img.shields.io/badge/Version-2.0.0-orange)

## ✨ Features

### Core Functionality
- **Account Management**: Retrieve account information, plan details, and credit balance
- **Contact Operations**: Fetch, filter, and manage your Brevo contact database  
- **Email Sending**: Send transactional emails with HTML and text content
- **Campaign Management**: List and filter email campaigns with comprehensive statistics

### 🆕 Enhanced Analytics Features (v2.0.0)
- **Detailed Campaign Analytics**: Comprehensive performance metrics with engagement rates and insights
- **Bulk Performance Analysis**: Compare multiple campaigns with aggregate statistics and filtering
- **Contact Engagement Analytics**: Track individual contact behaviour across all campaigns
- **Performance Dashboard**: Period-based summaries with automated trend analysis
- **Campaign Recipients Analysis**: Detailed recipient engagement and filtering capabilities
- **Geographic & Device Analytics**: Breakdown by location and device types (where available)
- **Automated Insights**: Smart recommendations based on performance data and trends

### Technical Features
- **Real-time Integration**: Direct REST API connection with comprehensive error handling
- **Security First**: IP whitelisting support and secure API key management
- **Smart Rate Calculations**: Automatic computation of open rates, click rates, bounce rates
- **Flexible Date Filtering**: Time-based analysis with custom date ranges
- **Comparison Analytics**: Period-over-period performance tracking with percentage changes
- **Data Quality Handling**: Intelligent handling of privacy protection impacts (e.g., Apple Mail)

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- A Brevo account with API access
- An MCP-compatible client (e.g., Claude Desktop)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/richardbaxterseo/brevo-mcp-server.git
   cd brevo-mcp-server
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
   - Add your server's IP address to the authorised list

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
         "args": ["C:\\dev\\brevo-mcp-server\\index.js"],
         "env": {
           "BREVO_API_KEY": "your_brevo_api_key_here"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

## 🛠️ Available Tools

### Core Tools

#### `get_account_info`
Retrieve your Brevo account information and plan details.

**Parameters**: None

**Returns**: Account details including plan type, email credits, and account status.

#### `get_contacts`
Fetch contacts from your Brevo database with optional filtering.

**Parameters**:
- `limit` (number, optional): Number of contacts to retrieve (max 1000, default 50)
- `offset` (number, optional): Number of contacts to skip (default 0)
- `email` (string, optional): Filter by specific email address

**Returns**: Contact list with email addresses, names, and metadata.

#### `send_email`
Send transactional emails through Brevo.

**Parameters**:
- `to` (array, required): Recipients with email and optional name
- `subject` (string, required): Email subject line
- `sender` (object, required): Sender with email and optional name
- `htmlContent` (string, optional): HTML email content
- `textContent` (string, optional): Plain text email content

**Returns**: Email sending confirmation with message ID.

#### `get_email_campaigns`
Retrieve a list of email campaigns with optional statistics.

**Parameters**:
- `type` (string, optional): Campaign type - "classic" or "trigger" (default: "classic")
- `status` (string, optional): Filter by status - "draft", "sent", "archive", etc.
- `limit` (number, optional): Number of campaigns to retrieve (default 50)
- `offset` (number, optional): Number of campaigns to skip (default 0)
- `statistics` (string, optional): Type of statistics to include

**Returns**: Campaign list with basic metrics and metadata.

### 🆕 Analytics Tools (v2.0.0)

#### `get_campaign_analytics`
Get detailed analytics for a specific email campaign including performance metrics, geographic data, device breakdown, and temporal patterns.

**Parameters**:
- `campaignId` (number, required): Specific campaign ID for detailed analysis
- `includeGeographics` (boolean, optional): Include country/region breakdowns (default: false)
- `includeDeviceStats` (boolean, optional): Include device/browser analytics (default: false)  
- `includeTimeStats` (boolean, optional): Include hourly open patterns (default: false)

**Returns**:
- Core metrics: sent, delivered, opens, clicks, bounces, unsubscribes, complaints
- Calculated rates: open rate, click rate, bounce rate, unsubscribe rate, complaint rate
- Geographic data: opens/clicks by country (if available and requested)
- Device breakdown: opens/clicks by device type and browser (if available and requested)
- Link performance statistics and click tracking

#### `get_campaigns_performance` 
Get bulk campaign performance data with filtering and comparison capabilities.

**Parameters**:
- `startDate` (string, optional): Filter campaigns from date (YYYY-MM-DD)
- `endDate` (string, optional): Filter campaigns to date (YYYY-MM-DD)
- `status` (string, optional): Filter by campaign status
- `includeStats` (array, optional): Specify statistics types - ["globalStats", "linksStats", etc.]
- `limit` (number, optional): Number of campaigns to retrieve (default: 50)

**Returns**:
- Aggregate metrics across all filtered campaigns
- Individual campaign performance with calculated engagement rates
- Date range information and filtering criteria applied
- Summary statistics and performance trends

#### `get_contact_analytics`
Get engagement analytics for a specific contact across campaigns.

**Parameters**:
- `contactId` (number, optional): Contact ID for analysis
- `email` (string, optional): Contact email for analysis (alternative to contactId)
- `campaignLimit` (number, optional): Number of recent campaigns to analyse (default: 50)

**Returns**:
- Contact engagement summary with open/click rates across campaigns
- Campaign interaction history and engagement patterns
- Engagement level classification (Highly Engaged, Engaged, Low Engagement, etc.)
- Recommended actions based on engagement patterns

#### `get_analytics_summary`
Get performance dashboard with key metrics and trends for a specified period.

**Parameters**:
- `period` (string, optional): Time period - "7d", "30d", "90d" (default: "30d")
- `startDate` (string, optional): Custom start date (YYYY-MM-DD) - overrides period
- `endDate` (string, optional): Custom end date (YYYY-MM-DD) - overrides period
- `compareWithPrevious` (boolean, optional): Include comparison with previous period (default: false)

**Returns**:
- Key performance indicators for the specified period
- Top performing campaigns ranked by engagement metrics
- Automated insights and actionable recommendations
- Period-over-period comparisons with percentage changes (if requested)
- Trend analysis and growth/decline indicators

#### `get_campaign_recipients`
Get detailed recipient information and engagement for a specific campaign.

**Parameters**:
- `campaignId` (number, required): Campaign ID to analyse recipients for
- `notOpened` (boolean, optional): Filter to show only recipients who haven't opened (default: false)
- `notClicked` (boolean, optional): Filter to show only recipients who haven't clicked (default: false)

**Returns**:
- Total recipient count and filtering information
- Campaign-specific recipient analytics and engagement breakdown
- Lists of recipients based on specified filtering criteria
- Useful for follow-up campaigns and re-engagement strategies

## 💬 Usage Examples

### Basic Analytics Queries

```
"Show me detailed analytics for campaign #108"
"How many people signed up from my last newsletter campaign?"
"What's the engagement pattern for scott@example.com?"
"Compare performance of my last 5 campaigns"
"Summarise my email performance for the last 30 days"
```

### Advanced Analytics Queries

```
"Show me open rates by month for the last quarter"
"Which campaigns had the highest click rates this year?"
"Compare my November performance to October with percentage changes"
"Show me contacts who haven't opened my last 3 campaigns"
"What insights can you provide about my email marketing performance?"
"Which geographic regions engage most with my content?"
```

### Data-Driven Questions You Can Now Ask

✅ **Campaign Performance**: "How many people opened my Black Friday campaign and what was the conversion rate?"  
✅ **Monthly Summaries**: "Show me email metrics by month for Q1 2024 with trend analysis"  
✅ **Engagement Analysis**: "Which contacts are most engaged with my content and should I focus on?"  
✅ **Trend Analysis**: "How has my open rate changed over the last 6 months and what's driving the changes?"  
✅ **Geographic Insights**: "Where are my most engaged subscribers located geographically?"  
✅ **Device Analytics**: "What devices and browsers do my subscribers use to read emails?"  
✅ **Recipient Analysis**: "Show me who didn't open my last campaign so I can create a follow-up sequence"

## 🔧 Development

### Project Structure
```
brevo-mcp-server/
├── index.js                    # Enhanced MCP server with analytics
├── package.json               # Dependencies and scripts  
├── README.md                  # This documentation
├── ANALYTICS_GUIDE.md         # Detailed analytics examples
├── examples.md                # Usage examples and configuration
├── test.js                    # Basic functionality tests
├── test-analytics.js          # Analytics function testing
├── .env.example              # Environment variable template
└── claude_desktop_config.example.json  # Example configuration
```

### Testing

- **Basic tests**: `npm test` - Tests core functionality
- **Analytics tests**: `node test-analytics.js` - Verifies analytics functions
- **Development mode**: `npm run dev` - Runs with file watching

### Analytics Implementation Notes

The analytics functionality leverages several Brevo API endpoints:

- `GET /v3/emailCampaigns/{campaignId}` - Individual campaign detailed reports
- `GET /v3/emailCampaigns?statistics=globalStats,linksStats` - Bulk campaign data with statistics
- `GET /v3/contacts/{identifier}/campaignStats` - Contact-level engagement analytics
- Various statistics parameters for detailed breakdowns including geographic and device data

The server automatically calculates performance rates, provides intelligent insights, and handles data quality considerations such as Apple Mail Privacy Protection impact on open rate accuracy.

## 🔒 Security

### 🛡️ **Critical Security Practices**

- **API Keys**: 
  - ❌ **NEVER** commit API keys to version control or hardcode them in files
  - ✅ **ALWAYS** use environment variables: `process.env.BREVO_API_KEY`
  - ✅ Use `.env` files for local development (already in `.gitignore`)
  - ✅ Rotate API keys regularly and revoke compromised keys immediately

- **Environment Configuration**:
  - ✅ Copy `.env.example` to `.env` and add your API key
  - ✅ Keep `.env` files out of version control (check `.gitignore`)
  - ✅ Use different API keys for development, staging, and production environments

- **IP Whitelisting**: Configure Brevo IP restrictions at [security settings](https://app.brevo.com/security/authorised_ips)
- **Error Handling**: The server provides helpful error messages without exposing sensitive data
- **Rate Limiting**: Implements appropriate API rate limiting for bulk analytics requests

### 🚨 **Security Checklist**

Before deploying or sharing:
- [ ] No API keys in source code
- [ ] All backup files removed from repository
- [ ] `.env` file not committed to version control
- [ ] API keys rotated if previously exposed
- [ ] IP whitelisting configured (if required by your setup)
- [ ] Environment variables properly configured in production

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/richardbaxterseo/brevo-mcp-server/issues)
- **Brevo API Documentation**: [Brevo Developers](https://developers.brevo.com/)
- **MCP Protocol**: [Model Context Protocol](https://modelcontextprotocol.io/)

## 📈 Changelog

### v2.0.0 - Enhanced Analytics Release
- ✨ Added comprehensive analytics functionality with 5 new tools
- 🔧 Enhanced error handling and data quality management
- 📊 Automated insights and recommendations
- 🌍 Geographic and device analytics support
- 📅 Flexible date filtering and period comparisons
- 🧪 Added analytics testing suite

### v1.0.0 - Initial Release
- 🚀 Core Brevo integration with basic email and contact management
- ✉️ Transactional email sending capabilities
- 📋 Campaign listing and basic statistics

## 🙏 Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Integrates with [Brevo's REST API](https://developers.brevo.com/reference/getting-started)
- Created for the Claude Desktop and MCP ecosystem

---

Made with ❤️ for data-driven email marketing and analytics
