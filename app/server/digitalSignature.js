const header = {
  alg: 'RS256',
};

const generateJWTJose = async (body, key) => {
  const jose = await import('jose');
  const privateKey = await jose.importPKCS8(key, 'RS256');
  const signature = await new jose.SignJWT(body)
    .setProtectedHeader(header)
    .sign(privateKey);
  return signature;
};

module.exports = { generateJWTJose };
