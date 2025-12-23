class ProductsPage {

  selectProductByName(productName) {
    cy.get('#tbodyid .card-block .card-title').contains(productName).click();
  }
  
}

module.exports = new ProductsPage();

