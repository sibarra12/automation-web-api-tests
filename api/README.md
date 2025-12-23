# API Automation Tests

![Karate](https://img.shields.io/badge/Karate-FF6EC7?style=for-the-badge&logo=karate&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)

Automated API tests with Karate Framework for DemoBlaze platform.

## Requirements

- Java 11 or higher
- Maven 3.6 or higher

## Installation

```bash
mvn clean install
```

## Run tests

To run all tests:
```bash
mvn test
```

To run tests with a specific tag:
```bash
mvn test -Dkarate.options="--tags @Smoke"
```

To run a specific feature:
```bash
mvn test -Dkarate.options="classpath:features/login.feature"
```

## Structure

- `src/test/resources/features/` - .feature files with scenarios
- `src/test/resources/features/utils/` - Utility features
- `src/test/resources/request-bodies/` - JSON request bodies
- `src/test/java/` - Test runner
- `config.json` - Configuration file

## Reports

Karate generates HTML reports automatically after test execution. Reports are located in `target/karate-reports/`. Each feature generates its own HTML report (e.g., `features.login.html`, `features.signup.html`).

To open the HTML report:

**macOS:**
```bash
open target/karate-reports/features.login.html
```


