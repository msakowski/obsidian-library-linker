module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': '@swc/jest',
  },
  testRegex: '/__tests__/.*\\.(test|spec)\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^mocks/(.*)$': '<rootDir>/src/__tests__/__mocks__/$1',
  },
};
