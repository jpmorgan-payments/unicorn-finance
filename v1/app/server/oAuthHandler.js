const axios = require('axios');

const { ACCESS_TOKEN_URL, ACCESS_TOKEN_USERNAME, ACCESS_TOKEN_SECRET } = process.env;

const gatherAccessToken = async () => {
  const config = {
    method: 'get',
    url: ACCESS_TOKEN_URL,
    headers: {
      username: ACCESS_TOKEN_USERNAME,
      secret: ACCESS_TOKEN_SECRET,
    },
  };
  try {
    const response = await axios.request(config);
    return response.data.accessToken;
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

module.exports = { gatherAccessToken };
