const { createProxyServer } = require('http-proxy-3');
const fs = require('fs');
const https = require('https');
const { gatherHttpsOptionsAsync } = require('./grabSecret');
const ENV = process.env.NODE_ENV || 'development';

const API_ENDPOINTS = {
  JPMORGAN_SANDBOX: 'https://api-sandbox.payments.jpmorgan.com',
  JPMORGAN_GATEWAY: 'https://apigatewaycat.jpmorgan.com',
};
const CERT_PATHS = {
  KEY: '../certs/jpmc.key',
  CERT: '../certs/jpmc.crt',
  DIGITAL: '../certs/digital-signature/key.key',
};

/**
 * Gathers HTTPS options for certificate-based authentication
 * @returns {Promise<Object>} Object containing key, cert, and digital signature
 */
const gatherHttpsOptions = async () => {
  let httpsOpts;

  try {
    if (ENV === 'development') {
      // Required for local execution
      httpsOpts = {
        KEY: fs.readFileSync(CERT_PATHS.KEY, 'utf-8'),
        CERT: fs.readFileSync(CERT_PATHS.CERT, 'utf-8'),
        DIGITAL: fs.readFileSync(CERT_PATHS.DIGITAL, 'utf-8'),
      };
    } else {
      // Required for AWS Lambda to gather secrets
      httpsOpts = await gatherHttpsOptionsAsync();
    }

    return {
      key: httpsOpts.KEY && httpsOpts.KEY.replace(/\\n/g, '\n'),
      cert: httpsOpts.CERT && httpsOpts.CERT.replace(/\\n/g, '\n'),
      digital: httpsOpts.DIGITAL && httpsOpts.DIGITAL.replace(/\\n/g, '\n'),
    };
  } catch (error) {
    console.error('Error gathering HTTPS options:', error);
    throw new Error('Failed to load SSL certificates');
  }
};

/**
 * Creates and configures the proxy server with HTTPS options
 * @returns {Promise<Object>} The configured proxy server
 */
const createApp = async () => {
  const httpsOpts = await gatherHttpsOptions();

  // Create your proxy server and set the target in the options.
  const app = createProxyServer({
    target: API_ENDPOINTS.JPMORGAN_GATEWAY,
    agent: new https.Agent({
      ...httpsOpts,
      timeout: 30000,
      keepAlive: true,
    }),
    changeOrigin: true,
  });

  return app;
};

module.exports = createApp;
