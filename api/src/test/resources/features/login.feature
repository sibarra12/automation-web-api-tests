@API @Login @Regression
Feature: Login to Demoblaze

  Background:
    * def config = read('classpath:config.json')
    * url config.baseUrl
    * headers config.headers
    * def loginRequestBody = read('classpath:request-bodies/login-request.json')
    * def endpoint = config.endpoints.login
  @TEST-003 @Smoke
  Scenario: Login to Demoblaze
    # FIRST, CREATE A USER USING THE UTILITY FEATURE
    * call read('classpath:features/utils/create-user.feature')
    
    # SET THE LOGIN REQUEST BODY WITH THE VALUES FROM THE CREATED USER
    * set loginRequestBody.username = createdUserRequestBody.username
    * set loginRequestBody.password = createdUserRequestBody.password
    
    # NOW PERFORM LOGIN WITH THE CREATED USER
    Given path endpoint
    And request loginRequestBody
    When method POST
    Then status 200
    And print 'Login successful for user: ', loginRequestBody.username

  @TEST-004 @Regression
  Scenario: Login with incorrect credentials should fail
    # SET THE LOGIN REQUEST BODY WITH INCORRECT CREDENTIALS
    * set loginRequestBody.username = 'sarasa'
    * set loginRequestBody.password = 'sarasa'
    
    # NOW PERFORM LOGIN WITH INCORRECT CREDENTIALS
    Given path endpoint
    And request loginRequestBody
    When method POST
    Then status 200
    And match response.errorMessage == 'Wrong password.'
    And print 'Expected error received for incorrect credentials'
