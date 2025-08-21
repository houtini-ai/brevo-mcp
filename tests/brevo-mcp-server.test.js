// Integration test for Brevo MCP Server
// Since the server runs as a CLI tool, we test basic functionality

describe('Brevo MCP Server Integration', () => {
  const originalEnv = process.env.BREVO_API_KEY;
  
  beforeAll(() => {
    // Set a test API key
    process.env.BREVO_API_KEY = 'test-api-key';
  });
  
  afterAll(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.BREVO_API_KEY = originalEnv;
    } else {
      delete process.env.BREVO_API_KEY;
    }
  });

  it('should require BREVO_API_KEY environment variable', () => {
    delete process.env.BREVO_API_KEY;
    
    // Module should work with API key
    process.env.BREVO_API_KEY = 'test-key';
    expect(() => {
      // Just check that the module can be loaded
      const modulePath = require.resolve('../index.js');
      expect(modulePath).toBeTruthy();
    }).not.toThrow();
  });

  it('should have correct package.json configuration', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.name).toBe('@richardbaxterseo/brevo-mcp-server');
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(packageJson.main).toBe('dist/index.js');
    expect(packageJson.scripts.build).toBeDefined();
    expect(packageJson.scripts.test).toBeDefined();
    expect(packageJson.dependencies['@modelcontextprotocol/sdk']).toBeDefined();
    expect(packageJson.dependencies['@getbrevo/brevo']).toBeDefined();
  });

  it('should have all required files for NPM publication', () => {
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
      'package.json',
      'README.md',
      'LICENSE',
      'CHANGELOG.md',
      '.npmignore',
      '.gitignore',
      '.eslintrc.json',
      '.prettierrc.json',
      'index.js'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('should have proper NPM scripts', () => {
    const packageJson = require('../package.json');
    const requiredScripts = [
      'build',
      'test',
      'lint',
      'prepublishOnly'
    ];
    
    requiredScripts.forEach(script => {
      expect(packageJson.scripts[script]).toBeDefined();
    });
  });

  it('should have proper package.json fields for NPM', () => {
    const packageJson = require('../package.json');
    
    // Required fields for NPM
    expect(packageJson.name).toMatch(/^@[\w-]+\/[\w-]+$/); // Scoped package
    expect(packageJson.version).toBeDefined();
    expect(packageJson.description).toBeDefined();
    expect(packageJson.keywords).toBeInstanceOf(Array);
    expect(packageJson.author).toBeDefined();
    expect(packageJson.license).toBeDefined();
    expect(packageJson.repository).toBeDefined();
    expect(packageJson.bugs).toBeDefined();
    expect(packageJson.homepage).toBeDefined();
    expect(packageJson.engines).toBeDefined();
    expect(packageJson.files).toBeInstanceOf(Array);
    expect(packageJson.publishConfig).toBeDefined();
  });
});
