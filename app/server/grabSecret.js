const { SECRET_NAME } = process.env;

const {
  GetSecretValueCommand,
  SecretsManagerClient,
} = require('@aws-sdk/client-secrets-manager');

const gatherHttpsOptionsAsync = async () => {
  const client = new SecretsManagerClient();
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: SECRET_NAME,
    })
  );
  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  }
};

module.exports = { gatherHttpsOptionsAsync };
