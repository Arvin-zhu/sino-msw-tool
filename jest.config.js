module.exports = {
  verbose: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2|svg)$': 'jest-transform-stub',
  },
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['/swaggerParseMock/', 'MswUi.tsx', 'upload.tsx', 'drag.tsx'],
  collectCoverage: true, // 是否显示覆盖率报告
  coverageThreshold: {
    global: {
      statements: 70, // 保证每个语句执行率
      functions: 70, // 保证函数执行率
      lines: 70, // 保证行数执行率
      branches: 60, // 保证分支执行率
    },
  },
};
