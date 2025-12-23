import { CartPageLocators } from '../locators/CartPage.locators.js';

class CartPage {
  
  verifyCartPageLoaded() {
    cy.get(CartPageLocators.PRODUCTS_HEADING).should('be.visible');
  }
  
  verifyProductInCart(productName) {
    cy.get(CartPageLocators.PRODUCT_IN_CART).should('contain', productName);
  }
  
  verifyCartHasProductsCount(count) {
    cy.get(CartPageLocators.CART_ROWS).should('have.length', count);
  }
  
  clickPlaceOrder() {
    cy.clickElement(CartPageLocators.PLACE_ORDER_BUTTON);
  }
  
}

module.exports = new CartPage();


