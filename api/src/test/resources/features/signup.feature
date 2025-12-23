@API @Signup @Regression
Feature: User signup in DemoBlaze API

  Background:
    * def config = read('classpath:config.json')
    * url config.baseUrl
    * headers config.headers
    * def endpoint = config.endpoints.signup
    
    # READ THE REQUEST BODY FROM THE CLASSPATH
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
    And match response != { errorMessage: '#present' }
    And print 'User created successfully with username: ', username

  @TEST-003 @Regression
  Scenario: Signup with existing user should fail
    # FIRST, CREATE A USER USING THE UTILITY FEATURE
    * def createUserResult = call read('classpath:features/utils/create-user.feature')
    * def existingUsername = createUserResult.createdUsername
    
    # NOW TRY TO CREATE THE SAME USER AGAIN
    Given path endpoint
    And set requestBody.username = existingUsername
    And request requestBody
    When method POST
    Then status 200
    And match response.errorMessage == 'This user already exist.'
    And print 'Expected error received for existing user: ', existingUsername
