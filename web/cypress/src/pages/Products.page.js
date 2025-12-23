import { ProductsPageLocators } from '../locators/ProductsPage.locators.js';

class ProductsPage {

  selectProductByName(productName) {
    cy.get(ProductsPageLocators.PRODUCT_CARD_TITLE).contains(productName).click();
  }
  
  navigateToCart() {
    cy.get(ProductsPageLocators.CART_LINK).click();
  }
  
}

module.exports = new ProductsPage();

