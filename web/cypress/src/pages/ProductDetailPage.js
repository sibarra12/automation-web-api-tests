class ProductDetailPage {
  
  addToCart() {
    cy.get('.product-content a:contains("Add to cart")').click();
  }
  
}

module.exports = new ProductDetailPage();

