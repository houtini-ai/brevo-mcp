#!/usr/bin/env node

/**
 * Brevo MCP Server - Main Entry Point
 *
 * MCP (Model Context Protocol) server for Brevo email marketing platform
 * Provides comprehensive email, contact, and analytics operations
 *
 * @author Houtini Ltd
 * @license MIT
 */

import { BrevoMCPServer } from './server/mcp-server.js';

// Run the server
const server = new BrevoMCPServer();
server.run();
