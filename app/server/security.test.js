const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedCatProxyRequest } = require('./security');

test('allows only CAT account-validation and FX POST routes', () => {
  assert.equal(
    isAllowedCatProxyRequest('POST', '/tsapi/v2/validations/accounts'),
    true
  );
  assert.equal(
    isAllowedCatProxyRequest('POST', '/api/fxapi/v1/rate-sheets?currency=USD'),
    true
  );
  assert.equal(
    isAllowedCatProxyRequest('GET', '/tsapi/v2/validations/accounts'),
    false
  );
  assert.equal(isAllowedCatProxyRequest('POST', '/arbitrary/path'), false);
});