<div align="center">
  <img src="https://raw.githubusercontent.com/houtini-ai/houtini-lm/main/assets/logo.png" width="120" height="120" alt="Houtini" />
</div>

# Brevo MCP - retired

**This project is no longer maintained.**

Brevo MCP put the Brevo (formerly Sendinblue) API in front of your AI assistant: contacts, lists, campaigns, templates, analytics and transactional sends, without leaving the editor.

It did the job, but it was a thin wrapper over somebody else's API, and keeping a thin wrapper honest as that API moves is work we would rather spend elsewhere. A stale integration is worse than no integration, so we are retiring it rather than letting it drift.

## What this means for you

- **The npm package still installs.** `@houtini/brevo-mcp` is deprecated, not unpublished. Nothing you have running will break.
- **This repository is archived.** The code stays readable and every existing link keeps working, but there are no further releases, and issues and pull requests are closed.
- **Your Brevo account is untouched.** This only ever held an API key and made calls on your behalf. Revoke the key if you no longer need it.

## If you want to carry on with it

Fork it - it is MIT. Brevo publish an OpenAPI spec, so the fastest way to bring a wrapper like this back up to date is to regenerate the client from the current spec rather than patch the handlers one at a time.

## The rest of the set

The maintained Houtini MCP servers are listed at **[github.com/houtini-ai](https://github.com/houtini-ai)**.

---

Part of the [Houtini](https://houtini.com) open-source MCP set. Questions: [hello@houtini.com](mailto:hello@houtini.com).
