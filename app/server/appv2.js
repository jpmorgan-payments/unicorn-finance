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
 * @param {Object} httpsOpts - HTTPS options for the agent
 * @param {string} target - The target URL
 *
 * @returns {Function} Proxy middleware
 */
async function createProxyConfiguration(
  httpsOpts,
  target,
  digitalSignature = null
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

const gatherTargetUrl = (splat) => {
  switch (splat) {
    case 'payment':
      return API_ENDPOINTS.JPMORGAN_SANDBOX;
    case 'tsapi':
      return API_ENDPOINTS.JPMORGAN_GATEWAY;
    default:
      return API_ENDPOINTS.JPMORGAN_SANDBOX; // Default to sandbox for other paths
  }
};

// Catch-all route handler
app.use('/*splat', async (req, res, next) => {
  try {
    console.log('Catch-all route triggered:', req.params);
    const { splat } = req.params || [];
    let digitalSignature = null;

    const httpsOpts = await gatherHttpsOptions();
    const targetUrl = gatherTargetUrl(splat[0]);
    if (splat.join('/') === 'payment/v2/payments') {
      digitalSignature = await generateJWTJose(req.body, httpsOpts.digital);
      console.log('Digital signature generated:', digitalSignature);
    }

    const proxyMiddleware = await createProxyConfiguration(
      httpsOpts,
      targetUrl,
      digitalSignature
    );
    proxyMiddleware(req, res, next);
  } catch (error) {
    console.error('Error in catch-all route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message:
        ENV === 'development' ? error.message : 'Proxy configuration failed',
    });
  }
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
