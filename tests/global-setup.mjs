import { startExampleServer } from './serve-examples.mjs';

export default async function globalSetup() {
  const server = await startExampleServer();
  const address = server.address();
  process.env.DESIGN_ON_TEST_URL = `http://${address.address}:${address.port}`;

  return async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  };
}
