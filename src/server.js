const app = require('./app');
const port = Number(process.env.PORT || 10000);

const server = app.listen(port, () => {
  console.log(`API service listening on port ${port}`);
});

server.on('error', (error) => {
  console.error(`Failed to start API service on port ${port}: ${error.message}`);
  process.exitCode = 1;
});
