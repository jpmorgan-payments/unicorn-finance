const bodyParser = require('body-parser');
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
const { gatherAccessToken } = require('./oAuthHandler');

const app = express();
app.use(bodyParser.json());
const env = process.env.NODE_ENV;

const gatherHttpsOptions = async () => {
  let httpsOpts;
  if (env === 'development') {
    // Required for local execution
    httpsOpts = {
      KEY: fs.readFileSync('../certs/jpmc.key', 'utf-8'),
      CERT: fs.readFileSync('../certs/jpmc.crt', 'utf-8'),
      DIGITAL: fs.readFileSync('../certs/digital-signature/key.key', 'utf-8'),
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
};

const handleProxyResponse = async (responseBuffer, proxyRes, req) => {
  const exchange = `[${req.method}] [${proxyRes.statusCode}] ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`;
  console.log(exchange);
  if (proxyRes.headers['content-type'] === 'application/json') {
    const data = JSON.parse(responseBuffer.toString('utf8'));
    return JSON.stringify(data);
  }
  return responseBuffer;
};

async function createProxyConfiguration(target, httpsOpts, pathRewrite) {
  console.log('Creating proxy configuration for:', target);
  console.log('PathRewrite:', pathRewrite);
  const options = {
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    agent: new https.Agent(httpsOpts),
    pathRewrite,
    on: {
      proxyRes: responseInterceptor(handleProxyResponse),
      error: (err, req, res) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Proxy error' });
        }
      },
    },
  };
  const middleware = createProxyMiddleware(options);
  return middleware;
}

async function createProxyConfigurationForDigital(
  target,
  httpsOpts,
  digitalSignature
) {
  const options = {
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    agent: new https.Agent(httpsOpts),
    pathRewrite(path, req) {
      const splat = req.params.splat || '';
      if (splat) {
        return path + splat.join('/');
      }
    },
    on: {
      proxyReq: async (proxyReq, req) => {
        console.log('Digital proxy proxyReq called');
        if (req.body) {
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
          res.status(500).json({ error: 'Digital proxy error' });
        }
      },
    },
  };
  return createProxyMiddleware(options);
}

async function createProxyConfigurationForSandbox(target, accessToken) {
  const options = {
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    pathRewrite: {
      '^/api/sandbox/digitalSignature': '',
      '^/api/sandbox': '',
    },
    on: {
      proxyReq: async (proxyReq, req) => {
        proxyReq.setHeader('Authorization', `bearer ${accessToken}`);
        if (
          req.body &&
          req.method === 'POST' &&
          req.path.includes('/tsapi/v1/payments')
        ) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          // stream the content
          proxyReq.write(bodyData);
          proxyReq.end();
        }
      },
      proxyRes: responseInterceptor(handleProxyResponse),
    },
  };
  return createProxyMiddleware(options);
}

app.use('/api/digitalSignature/*splat', async (req, res, next) => {
  try {
    const httpsOpts = await gatherHttpsOptions();
    const digitalSignature = await generateJWTJose(req.body, httpsOpts.digital);
    const func = await createProxyConfigurationForDigital(
      'https://api-sandbox.payments.jpmorgan.com',
      httpsOpts,
      digitalSignature
    );
    func(req, res, next);
  } catch (error) {
    console.error('Error in digital signature route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api/sandbox/{*splat}', async (req, res, next) => {
  try {
    const accessToken = await gatherAccessToken();
    if (accessToken) {
      const func = await createProxyConfigurationForSandbox(
        'https://api-mock-akm-ptpoc.payments.jpmorgan.com',
        accessToken
      );
      func(req, res, next);
    } else {
      res.status(401).json({ error: 'Unable to obtain access token' });
    }
  } catch (error) {
    console.error('Error in sandbox route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/:slug', async (req, res, next) => {
  try {
    const httpsOpts = await gatherHttpsOptions();
    const func = await createProxyConfiguration(
      'https://apigatewaycat.jpmorgan.com',
      httpsOpts,
      {
        '^/api': '',
      }
    );
    func(req, res, next);
  } catch (error) {
    console.error('Error in catch-all route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
