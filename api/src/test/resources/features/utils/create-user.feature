@API @Utils @CreateUser
Feature: Utility to create a user in DemoBlaze API

  Background:
    * def config = read('classpath:config.json')
    * url config.baseUrl
    * headers config.headers
    * def endpoint = config.endpoints.signup
    * def requestBody = read('classpath:request-bodies/signup-request.json')

  Scenario: Create a user
    Given path endpoint
    And def timestamp = java.lang.System.currentTimeMillis()
    And def username = 'testuser' + timestamp
    And set requestBody.username = username
    And request requestBody
    When method POST
    Then status 200
    And def createdUsername = username
    And def createdUserRequestBody = requestBody
    And print 'User created successfully with username: ', createdUsername

