/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'https://api.myback.app/'
  },
  collectCoverageFrom: [
    'src/{!(test-server),}/**'
  ]
}
