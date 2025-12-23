Feature: Buy products in DemoBlaze

  Scenario: Buy a product in DemoBlaze
    Given the user enters the Demoblaze platform
    When the user adds products to the cart
      | productName        |
      | Samsung galaxy s6  |
      | Nokia lumia 1520   |
    And the user views the cart with the products
    And the user completes the purchase form
      | name       | country  | city   | card             | month | year |
      | Juan Pérez | Colombia | Bogotá | 1234567890123456 | 12    | 2025 |
