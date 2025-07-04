const express = require('express');
const fs = require('fs');
const https = require('https');

const {
  createProxyMiddleware,
  responseInterceptor,
} = require('http-proxy-middleware');
require('dotenv').config();
const { gatherHttpsOptionsAsync } = require('./grabSecret');
const { generateJWTJose } = require('./digitalSignature');

// Constants for better maintainability
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

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
 * Handles proxy response logging and processing
 * @param {Buffer} responseBuffer - The response buffer
 * @param {Object} proxyRes - The proxy response object
 * @param {Object} req - The request object
 * @returns {string|Buffer} Processed response
 */
const handleProxyResponse = async (responseBuffer, proxyRes, req) => {
  const { protocol, host, path: reqPath } = proxyRes.req;
  const exchange = `[${req.method}] [${proxyRes.statusCode}] ${req.path} -> ${protocol}//${host}${reqPath}`;
  console.log(exchange);

  try {
    // Check if response is JSON and parse it safely
    if (proxyRes.headers['content-type']?.includes('application/json')) {
      const data = JSON.parse(responseBuffer.toString('utf8'));
      return JSON.stringify(data);
    }
  } catch (error) {
    console.error('Error parsing JSON response:', error);
  }

  return responseBuffer;
};

/**
 * Creates a standard proxy configuration
 * @param {string} target - The target URL
 * @param {Object} httpsOpts - HTTPS options for the agent
 * @param {Object} pathRewrite - Path rewrite rules
 * @returns {Function} Proxy middleware
 */
async function createProxyConfiguration(target, httpsOpts, pathRewrite) {
  console.log('Creating proxy configuration for:', target);
  console.log('PathRewrite:', pathRewrite);

  const options = {
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    agent: new https.Agent({
      ...httpsOpts,
      timeout: 30000,
      keepAlive: true,
    }),
    pathRewrite,
    on: {
      proxyRes: responseInterceptor(handleProxyResponse),
      error: (err, req, res) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Proxy error',
            message:
              ENV === 'development' ? err.message : 'Internal server error',
          });
        }
      },
    },
  };

  return createProxyMiddleware(options);
}

/**
 * Creates a proxy configuration for digital signature requests
 * @param {string} target - The target URL
 * @param {Object} httpsOpts - HTTPS options for the agent
 * @param {string} digitalSignature - The digital signature to send
 * @returns {Function} Proxy middleware
 */
async function createProxyConfigurationForDigital(
  target,
  httpsOpts,
  digitalSignature
) {
  const options = {
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    agent: new https.Agent({
      ...httpsOpts,
      timeout: 30000,
      keepAlive: true,
    }),
    pathRewrite(requestPath, req) {
      const splat = req.params.splat || '';
      if (splat && Array.isArray(splat)) {
        return `${requestPath}/${splat.join('/')}`;
      }
      return requestPath;
    },
    on: {
      proxyReq: async (proxyReq, req) => {
        console.log('Digital proxy proxyReq called');
        if (req.body && digitalSignature) {
          proxyReq.setHeader('Content-Type', 'text/xml');
          proxyReq.setHeader(
            'Content-Length',
            Buffer.byteLength(digitalSignature)
          );
          proxyReq.write(digitalSignature);
        }
      },
      proxyRes: responseInterceptor(handleProxyResponse),
      error: (err, req, res) => {
        console.error('Digital proxy error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Digital proxy error',
            message:
              ENV === 'development' ? err.message : 'Internal server error',
          });
        }
      },
    },
  };

  return createProxyMiddleware(options);
}

// Digital signature route handler
app.use('/api/digitalSignature/*splat', async (req, res, next) => {
  try {
    const httpsOpts = await gatherHttpsOptions();
    const digitalSignature = await generateJWTJose(req.body, httpsOpts.digital);
    const proxyMiddleware = await createProxyConfigurationForDigital(
      API_ENDPOINTS.JPMORGAN_SANDBOX,
      httpsOpts,
      digitalSignature
    );
    proxyMiddleware(req, res, next);
  } catch (error) {
    console.error('Error in digital signature route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        ENV === 'development'
          ? error.message
          : 'Digital signature processing failed',
    });
  }
});

// Catch-all route handler
app.use('/:slug', async (req, res, next) => {
  try {
    const httpsOpts = await gatherHttpsOptions();
    const proxyMiddleware = await createProxyConfiguration(
      API_ENDPOINTS.JPMORGAN_GATEWAY,
      httpsOpts,
      {
        '^/api': '',
      }
    );
    proxyMiddleware(req, res, next);
  } catch (error) {
    console.error('Error in catch-all route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        ENV === 'development' ? error.message : 'Proxy configuration failed',
    });
  }s
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: ENV === 'development' ? error.message : 'Something went wrong',
  });
});

module.exports = app;
