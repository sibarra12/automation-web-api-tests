INSTRUCCIONES DE EJECUCIÓN - API AUTOMATION TESTS
==================================================

REQUISITOS:
-----------
- Java 11 o superior
- Maven 3.6 o superior

INSTALACIÓN:
------------
1. Abrir una terminal en la carpeta 'api'
2. Ejecutar el siguiente comando para instalar las dependencias:
   
   mvn clean install

EJECUCIÓN DE TESTS:
-------------------
Para ejecutar todos los tests:
   mvn test

Para ejecutar tests con un tag específico (ej: Smoke):
   mvn test -Dtags="@Regression"

Para ejecutar un feature específico:
   mvn test -Dkarate.options="classpath:features/login.feature"

VER REPORTES:
-------------
Los reportes HTML se generan automáticamente después de la ejecución de los tests.
Se encuentran en: target/karate-reports/

Para abrir el reporte en macOS:
   open target/karate-reports/features.login.html

Para abrir el reporte en Linux:
   xdg-open target/karate-reports/features.login.html

Para abrir el reporte en Windows:
   start target/karate-reports/features.login.html

ESTRUCTURA DEL PROYECTO:
------------------------
- src/test/resources/features/        - Archivos .feature con escenarios
- src/test/resources/features/utils/  - Features utilitarias reutilizables
- src/test/resources/request-bodies/ - Cuerpos de request JSON
- src/test/java/                      - Test runner
- config.json                         - Archivo de configuración centralizado

TESTS IMPLEMENTADOS:
--------------------
1. Signup (Registro):
   - TEST-001: Crear un nuevo usuario
   - TEST-002: Intentar crear un usuario ya existente

2. Login (Inicio de sesión):
   - TEST-003: Login con credenciales correctas
   - TEST-004: Login con credenciales incorrectas

