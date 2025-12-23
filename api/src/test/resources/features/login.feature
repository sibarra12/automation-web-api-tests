@API @Login @Regression
Feature: Login to Demoblaze

  @TEST-002 @Smoke
  Scenario: Login to Demoblaze
    Given url 'https://demoblaze.com/index.html'
    When method GET
    Then status 200
