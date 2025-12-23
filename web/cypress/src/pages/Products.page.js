import { ProductsPageLocators } from '../locators/ProductsPage.locators.js';

class ProductsPage {

  selectProductByName(productName) {
    cy.clickElementContains(ProductsPageLocators.PRODUCT_CARD_TITLE, productName);
  }
  
  navigateToCart() {
    cy.clickElement(ProductsPageLocators.CART_LINK);
  }
  
}

module.exports = new ProductsPage();

