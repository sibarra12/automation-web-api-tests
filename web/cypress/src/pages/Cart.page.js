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
  
  verifyTotalIsSumOfProducts() {
    let sum = 0;
    
    cy.get(CartPageLocators.PRODUCT_PRICE).each(($price) => {
      const priceText = $price.text().trim();
      const price = parseInt(priceText);
      sum += price;
    }).then(() => {
      cy.get(CartPageLocators.TOTAL_PRICE).invoke('text').then((totalText) => {
        const total = parseInt(totalText.trim());
        expect(total).to.equal(sum);
      });
    });
  }
  
}

module.exports = new CartPage();


