export function getEachInitConfig() {
  const env = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
    (process.env as any).NODE_ENV = 'development';
  });
  afterEach(() => {
    process.env = env;
  });
}
