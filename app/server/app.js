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
// Error verbosity is deliberately NOT tied to NODE_ENV. The server container
// ships with NODE_ENV=development so certs are read from the mounted ./certs
// rather than Secrets Manager - that must not also expose internal error
// detail (cert paths, OAuth responses) to anyone who can reach the proxy.
const DEBUG_ERRORS = process.env.DEBUG_ERRORS === 'true';
const API_ENDPOINTS = {
  JPMORGAN_SANDBOX: 'https://api-sandbox.payments.jpmorgan.com',
  JPMORGAN_GATEWAY: 'https://apigatewaycat.jpmorgan.com',
};
const CERT_PATHS = {
  KEY: '../certs/jpmc.key',
  CERT: '../certs/jpmc.crt',
  DIGITAL: '../certs/digital-signature/key.key',
};

// JPMC Mock tier (PDP's hosted Mock environment): OAuth2 client-credentials.
const PDP = {
  TOKEN_URL:
    process.env.PDP_TOKEN_URL ||
    'https://id.payments.jpmorgan.com/am/oauth2/alpha/access_token',
  SCOPE: process.env.PDP_OAUTH_SCOPE || 'jpm:payments:sandbox',
  API_MOCK: 'https://api-mock.payments.jpmorgan.com',
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
    throw new Error(
      'Failed to load SSL certificates. Real (CAT) mode is the advanced "++" tier ' +
        'and needs your JPMorgan client certs (jpmc.key, jpmc.crt, ' +
        'digital-signature/key.key) in ../certs. For the offline demo you do not ' +
        'need this server at all - run the client alone (docker compose up, or ' +
        'cd app/client && pnpm start). See .env.example.'
    );
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

// --- JPMC Mock tier: OAuth2 client-credentials + Bearer proxy to api-mock ---

let cachedToken = null; // { value, expiresAt }
let inFlightToken = null; // shared by concurrent callers, cleared when settled

/**
 * Requests a fresh OAuth2 client-credentials token from PDP.
 * @returns {Promise<{value: string, expiresAt: number}>}
 */
const requestMockAccessToken = async () => {
  const clientId = process.env.PDP_CLIENT_ID;
  const clientSecret = process.env.PDP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'JPMC Mock tier not configured: set PDP_CLIENT_ID and PDP_CLIENT_SECRET ' +
        'in .env (from your PDP project). See .env.example.'
    );
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: PDP.SCOPE,
    client_id: clientId,
    client_secret: clientSecret,
  });

  // Stamp before the round trip so expiry is measured conservatively.
  const requestedAt = Date.now();
  const response = await fetch(PDP.TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    // The token endpoint echoes request detail back; log it, but keep it out of
    // the Error so it can never reach a client via DEBUG_ERRORS.
    const text = await response.text();
    console.error(`OAuth token request failed (${response.status}): ${text}`);
    throw new Error(`OAuth token request failed (${response.status})`);
  }

  const data = await response.json();
  return {
    value: data.access_token,
    expiresAt: requestedAt + Number(data.expires_in || 3600) * 1000,
  };
};

/**
 * Returns a valid Bearer token for PDP's Mock environment, reusing the cached
 * one until it is within a minute of expiry. Concurrent callers share a single
 * in-flight request instead of each hitting the token endpoint. The client
 * secret stays server-side and never reaches the browser.
 * @returns {Promise<string>} a valid access token
 */
const getMockAccessToken = async () => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.value;
  }

  if (!inFlightToken) {
    inFlightToken = requestMockAccessToken()
      .then((token) => {
        cachedToken = token;
        return token.value;
      })
      .finally(() => {
        inFlightToken = null;
      });
  }

  return inFlightToken;
};

/**
 * Proxy to PDP's Mock environment that attaches the OAuth2 Bearer token.
 * Standard TLS (no client certs) - auth is the Bearer, not mTLS.
 *
 * Built once at startup: creating one per request would allocate a fresh proxy
 * server and agent on every call. The per-request token rides on `req` instead.
 */
const mockProxy = createProxyMiddleware({
  target: PDP.API_MOCK,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.setHeader('Authorization', `Bearer ${req.pdpAccessToken}`);
    },
    proxyRes: (proxyRes) => {
      // api-mock rejected the token (revoked early, or clock skew). Drop it so
      // the next call mints a fresh one rather than reusing it until expiry.
      if (proxyRes.statusCode === 401) {
        cachedToken = null;
      }
    },
  },
});

const routeRequest = (splat) => {
  if (splat.includes('payment')) {
    return API_ENDPOINTS.JPMORGAN_SANDBOX;
  }

  if (splat.includes('tsapi')) {
    return API_ENDPOINTS.JPMORGAN_GATEWAY;
  }

  return API_ENDPOINTS.JPMORGAN_GATEWAY; // default
};

// JPMC Mock tier. Client calls arrive as /mockapi/<rest>; express strips the
// /mockapi mount, and we forward <rest> to api-mock with a Bearer token.
app.use('/mockapi', async (req, res, next) => {
  try {
    req.pdpAccessToken = await getMockAccessToken();
    mockProxy(req, res, next);
  } catch (error) {
    console.error('JPMC Mock proxy error:', error);
    res.status(500).json({
      error: 'JPMC Mock unavailable',
      message: DEBUG_ERRORS ? error.message : 'Mock tier not configured',
    });
  }
});

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
      message: DEBUG_ERRORS ? error.message : 'Proxy configuration failed',
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
      message: DEBUG_ERRORS ? error.message : 'Proxy configuration failed',
    });
  }
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: DEBUG_ERRORS ? error.message : 'Something went wrong',
  });
});

module.exports = app;
