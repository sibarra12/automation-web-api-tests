Feature: Login to Demoblaze

  Scenario: Login to Demoblaze
    Given url 'https://demoblaze.com/index.html'
    When method GET
    Then status 200
