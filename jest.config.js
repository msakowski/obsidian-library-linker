module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': '@swc/jest',
  },
  testRegex: '/__tests__/.*\\.(test|spec)\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^mocks/(.*)$': '<rootDir>/__mocks__/$1',
  },
};
