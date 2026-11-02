const isAllowedCatProxyRequest = (method, originalUrl) => {
  let pathname = String(originalUrl || '').split('?')[0];
  if (pathname.startsWith('/api/')) pathname = pathname.slice(4);

  return (
    method === 'POST' &&
    (pathname === '/tsapi/v2/validations/accounts' ||
      pathname === '/fxapi/v1/rate-sheets')
  );
};

module.exports = {
  isAllowedCatProxyRequest,
};