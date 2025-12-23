INSTRUCCIONES DE EJECUCIÓN - WEB AUTOMATION TESTS
==================================================

REQUISITOS:
-----------
- Node.js (v14 o superior)
- npm

INSTALACIÓN:
------------
1. Abrir una terminal en la carpeta 'web'
2. Ejecutar el siguiente comando para instalar las dependencias:
   
   npm install

EJECUCIÓN DE TESTS:
-------------------
Para ejecutar en modo interactivo:
   npm test

Para ejecutar en modo headless y ver el reporte:
   npm run test:headless

Para ejecutar tests con un tag específico (ej: @TEST-001):
   TAGS=@TEST-001 npm run test:headless

VER REPORTES:
-------------
Los reportes de Allure se generan automáticamente después de ejecutar los tests en modo headless.
Los reportes se encuentran en: reports/allure-report/

Para abrir el reporte en macOS:
   open reports/allure-report/index.html

Para abrir el reporte en Linux:
   xdg-open reports/allure-report/index.html

Para abrir el reporte en Windows:
   start reports/allure-report/index.html

ESTRUCTURA DEL PROYECTO:
------------------------
- cypress/tests/features/  - Archivos .feature con escenarios (Cucumber)
- cypress/tests/steps/     - Step definitions
- cypress/src/pages/       - Page Objects (POM)
- cypress/src/locators/    - Locators de las páginas

TESTS IMPLEMENTADOS:
--------------------
Los tests están implementados siguiendo el patrón Page Object Model (POM) y utilizando 
Cucumber para la definición de escenarios en lenguaje Gherkin.

HERRAMIENTAS UTILIZADAS:
------------------------
- Cypress: Framework de automatización web
- Cucumber: Para BDD y definición de escenarios
- Allure Report: Para generación de reportes detallados

