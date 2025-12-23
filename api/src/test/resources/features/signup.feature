Feature: User signup in DemoBlaze API

  Background:
    * def config = read('classpath:config.json')
    * url config.baseUrl
    * headers config.headers

  Scenario: Signup to Demoblaze
    Given path config.endpoints.signup
    And def timestamp = java.lang.System.currentTimeMillis()
    And def username = 'testuser' + timestamp
    And def userData = { username: '#(username)', password: 'cGFzc3dvcmQx' }
    And request userData
    When method POST
    Then status 200

