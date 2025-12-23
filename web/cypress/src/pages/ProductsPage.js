class ProductsPage {

  selectProductByName(productName) {
    cy.get('#tbodyid .card-block .card-title').contains(productName).click();
  }
  
  navigateToCart() {
    cy.get('#navbarExample ul.navbar-nav li.nav-item :contains("Cart")').click();
  }
  
}

module.exports = new ProductsPage();

