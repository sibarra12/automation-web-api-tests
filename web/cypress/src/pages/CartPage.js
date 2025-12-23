class CartPage {
  
  verifyCartPageLoaded() {
    cy.get('#page-wrapper h2:contains("Products")').should('be.visible');
  }
  
  verifyProductInCart(productName) {
    cy.get('#tbodyid tr td').contains(productName).should('be.visible');
  }
  
  verifyCartHasProductsCount(count) {
    cy.get('#tbodyid tr').should('have.length', count);
  }
  
}

module.exports = new CartPage();


