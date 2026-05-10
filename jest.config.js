/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],
  modulePathIgnorePatterns: [
    "<rootDir>/.next",
    "<rootDir>/coverage",
    "<rootDir>/dist",
    "<rootDir>/node_modules",
  ],
  collectCoverageFrom: ["__tests__/**/*.test.js"],
  coverageDirectory: "coverage",
  reporters: ["default"],
};
