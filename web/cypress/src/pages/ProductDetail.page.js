import { ProductDetailPageLocators } from '../locators/ProductDetailPage.locators.js';

class ProductDetailPage {
  
  addToCart() {
    cy.get(ProductDetailPageLocators.ADD_TO_CART_BUTTON).click();
  }
  
}

module.exports = new ProductDetailPage();

