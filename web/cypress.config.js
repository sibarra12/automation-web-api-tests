const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/tests/features/**/*.feature",
    setupNodeEvents(on, config) {
      addCucumberPreprocessorPlugin(on, config);
      on("file:preprocessor", createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );
      return config;
    },
  },
  cucumberPreprocessor: {
    stepDefinitions: [
      "cypress/tests/steps/**/*.js",
      "cypress/tests/steps/**/*.ts"
    ]
  }
});
