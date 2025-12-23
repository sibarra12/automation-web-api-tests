Feature: Buy products in DemoBlaze

  Scenario: Buy a product in DemoBlaze
    Given the user enters the Demoblaze platform
    When the user adds products to the cart
      | productName        |
      | Samsung galaxy s6  |
      | Nokia lumia 1520   |
    And the user views the cart with the products
