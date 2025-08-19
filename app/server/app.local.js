const createApp = require('./appv3');

(async () => {
  const app = await createApp();
  app.listen(8082, () => {
    console.log(`
################################################
🛡️  Server listening on port: 8082 🛡️
################################################
`);
  });
})();
