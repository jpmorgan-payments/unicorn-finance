const createApp = require('./appv3');

(async () => {
  const app = await createApp();
  app.listen(8081, () => {
    console.log(`
################################################
🛡️  Server listening on port: 8081 🛡️
################################################
`);
  });
})();
