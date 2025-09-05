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
const jsonParser = express.json();

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

function createProxyConfigurationDigital(target, httpsOpts, digitalSignature) {
  console.log('Creating proxy configuration for:', target);

  const options = {
    target,
    changeOrigin: true,
    selfHandleResponse: true,

    agent: new https.Agent({
      ...httpsOpts,
      timeout: 30000,
      keepAlive: true,
    }),
    on: {
      proxyRes: responseInterceptor(handleProxyResponse),
      proxyReq: (proxyReq, req) => {
        console.log('Digital proxy proxyReq called');
        console.log('Setting headers for digital signature request');
        console.log('Request body:', req.body);
        console.log('Digital Signature:', digitalSignature);
        if (req.body && digitalSignature) {
          // Clear any existing headers that might interfere
          proxyReq.removeHeader('content-length');
          proxyReq.removeHeader('content-type');

          // Set the correct headers
          proxyReq.setHeader('Content-Type', 'text/xml');
          proxyReq.setHeader(
            'Content-Length',
            Buffer.byteLength(digitalSignature)
          );

          // Write the body and end the request
          proxyReq.write(digitalSignature);
          proxyReq.end();
        }
      },
    },
  };
  return createProxyMiddleware(options);
}

function createProxyConfiguration(target, httpsOpts) {
  console.log('Creating proxy configuration for:', target);

  const options = {
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    agent: new https.Agent({
      ...httpsOpts,
      timeout: 30000,
      keepAlive: true,
    }),
    on: {
      proxyRes: responseInterceptor(
        async (responseBuffer, proxyRes, req, res) => {
          const response = responseBuffer.toString('utf8'); // convert buffer to string
          return response; // manipulate response and return the result
        }
      ),
    },
  };
  return createProxyMiddleware(options);
}

const routeRequest = (splat) => {
  if (splat.includes('payment')) {
    return API_ENDPOINTS.JPMORGAN_SANDBOX;
  }

  if (splat.includes('tsapi')) {
    return API_ENDPOINTS.JPMORGAN_GATEWAY;
  }

  return API_ENDPOINTS.JPMORGAN_GATEWAY; // default
};

app.use('/digitalSignature/:splat', jsonParser, async (req, res, next) => {
  try {
    const httpsOpts = await gatherHttpsOptions();
    let digitalSignature;
    const target = routeRequest(req.params.splat) + '/' + req.params.splat;

    digitalSignature = await generateJWTJose(req.body, httpsOpts.digital);

    const proxyMiddleware = createProxyConfigurationDigital(
      target,
      httpsOpts,
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

// Catch-all route handler
app.use('/:splat', async (req, res, next) => {
  try {
    const httpsOpts = await gatherHttpsOptions();
    const target = routeRequest(req.params.splat) + '/' + req.params.splat;
    const proxyMiddleware = createProxyConfiguration(target, httpsOpts);
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
