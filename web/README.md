# Web Automation Tests

Automated tests with Cypress and Cucumber for DemoBlaze platform.

## Requirements

- Node.js (v14 or higher)
- npm

## Installation

```bash
npm install
```

## Run tests

To run in interactive mode:
```bash
npm test
```

To run in headless mode and view the report:
```bash
npm run test:headless
```

To run tests with a specific tag:
```bash
TAGS=@TEST-001 npm run test:headless
```

## Structure

- `cypress/tests/features/` - .feature files with scenarios
- `cypress/tests/steps/` - Step definitions
- `cypress/src/pages/` - Page objects
- `cypress/src/locators/` - Page locators

## Reports

We use Allure Report for test results. Reports are automatically generated and opened after running tests in headless mode.

