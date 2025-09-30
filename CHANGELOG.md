# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.5] - 2025-09-30

### Security
- Fixed critical CVE-2025-7783 in form-data dependency (CVSS 9.4)
- Upgraded @getbrevo/brevo from 2.2.0 to 3.0.1 to resolve deprecated request package vulnerabilities
- Added npm overrides to force form-data@4.0.4 across entire dependency tree
- Resolved moderate severity vulnerabilities in request and tough-cookie packages
- All security audits now pass with zero vulnerabilities

### Changed
- Updated @getbrevo/brevo dependency to 3.0.1 (major version bump)
- Removed 35 deprecated packages from dependency tree

## [3.0.0] - 2025-09-23

### Changed
- **BREAKING**: Complete refactoring from monolithic to modular architecture
- **BREAKING**: Package renamed from `@richardbaxterseo/brevo-mcp-server` to `@houtini/brevo-mcp`
- **BREAKING**: Repository moved to Houtini organisation (github.com/houtini-ai/brevo-mcp)
- Improved code organisation with clear separation of concerns
- Enhanced maintainability with focused modules

### Fixed
- Critical bug: Fixed typo in statistics (`stats.cliks` → `stats.clicks`)

### Added
- Modular architecture with separated services, API client, and tool definitions
- Improved build system for handling modular structure
- Better error handling and input validation
- Contributors field in package.json

### Project Structure
- Split 1,130-line monolithic file into 12 focused modules
- Organised into logical directories: api, config, errors, services, tools, server
- Largest module now only 264 lines (tool definitions)

## [2.1.1] - 2024-08-21

### Fixed
- Server now starts successfully without BREVO_API_KEY environment variable
- API key validation moved from startup to runtime (when tools are called)
- Improved error handling to work properly with Claude Desktop MCP protocol
- Fixed dist/index.js to match source implementation

### Changed
- API key is now optional at startup, required only when making API calls
- Better error messages when API key is missing during tool execution
- Removed process.exit() calls that were breaking MCP protocol

## [2.1.0] - 2024-01-14

### Added
- Comprehensive test suite with Jest
- ESLint configuration for code quality
- Prettier configuration for code formatting
- Build script for distribution
- Jest configuration with coverage thresholds
- Proper NPM package structure with dist directory
- Improved error handling and validation
- Better structured project with scripts directory

### Changed
- Updated package.json with proper NPM publishing configuration
- Enhanced README with badges and comprehensive documentation
- Improved error messages for better debugging
- Refactored build process to use ES modules

### Fixed
- Missing build script referenced in package.json
- Proper file structure for NPM distribution
- Test configuration for ES modules

## [2.0.0] - 2024-01-01

### Added
- Comprehensive analytics functionality
- Campaign performance tracking
- Contact analytics
- Enhanced error handling for IP whitelisting

### Changed
- Major refactor of API structure
- Improved response formats

## [1.0.0] - 2023-12-01

### Added
- Initial release
- Basic Brevo API integration
- Email sending functionality
- Contact management
- Campaign listing
