# Web Automation Tests

![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![Cucumber](https://img.shields.io/badge/Cucumber-23D96C?style=for-the-badge&logo=cucumber&logoColor=white)
![Allure](https://img.shields.io/badge/Allure-FF6EC7?style=for-the-badge&logo=allure&logoColor=white)

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

![Allure Report](https://qameta.io/wp-content/uploads/2020/10/allure-report-overview.png)

