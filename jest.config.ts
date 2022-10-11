export default {
  preset: "ts-jest/presets/js-with-babel",
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  roots: ["<rootDir>/src/"]
};
