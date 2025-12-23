@API @Signup @Regression
Feature: User signup in DemoBlaze API

  Background:
    * def config = read('classpath:config.json')
    * url config.baseUrl
    * headers config.headers
    * def endpoint = config.endpoints.signup
    
    # Read the request body from the classpath
    * def requestBody = read('classpath:request-bodies/signup-request.json')

  @TEST-001 @Smoke
  Scenario: Signup to Demoblaze
    Given path endpoint
    And def timestamp = java.lang.System.currentTimeMillis()
    And def username = 'testuser' + timestamp
    And set requestBody.username = username
    And request requestBody
    When method POST
    Then status 200

