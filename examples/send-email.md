# Sending Emails with Brevo MCP

## Basic Email

To send a simple email, ask Claude:

```
"Send an email to john@example.com with subject 'Hello' and message 'This is a test email'"
```

## Using Templates

If you have templates set up in Brevo:

```
"Send email using template ID 3 to sarah@example.com with params {name: 'Sarah', product: 'Premium Plan'}"
```

## Multiple Recipients

```
"Send an email to john@example.com and jane@example.com with subject 'Team Update' and the HTML content '<h1>Weekly Update</h1><p>Great work everyone!</p>'"
```

## With Custom From Address

```
"Send an email from noreply@mycompany.com to customer@example.com with subject 'Order Confirmation' and message 'Your order has been confirmed'"
```

## With Tags for Analytics

```
"Send an email to list@example.com with subject 'Newsletter' and content 'Monthly news...' with tags ['newsletter', 'september-2025']"
```
