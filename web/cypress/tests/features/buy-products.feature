@Regression @BuyProducts
Feature: Buy products in DemoBlaze

  @TEST-001 @Smoke
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
    Then the purchase is completed successfully with message "Thank you for your purchase!"
