class ProductDetailPage {
  
  addToCart() {
    cy.get('.col-sm-12 > .btn').click();
  }
  
}

module.exports = new ProductDetailPage();

