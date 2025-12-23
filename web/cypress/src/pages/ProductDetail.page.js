import { ProductDetailPageLocators } from '../locators/ProductDetailPage.locators.js';

class ProductDetailPage {
  
  addToCart() {
    cy.clickElement(ProductDetailPageLocators.ADD_TO_CART_BUTTON);
  }
  
}

module.exports = new ProductDetailPage();

