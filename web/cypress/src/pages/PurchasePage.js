class PurchasePage {
  
  fillName(name) {
    cy.get('#name').type(name);
  }
  
  fillCountry(country) {
    cy.get('#country').type(country);
  }
  
  fillCity(city) {
    cy.get('#city').type(city);
  }
  
  fillCreditCard(card) {
    cy.get('#card').type(card);
  }
  
  fillMonth(month) {
    cy.get('#month').type(month);
  }
  
  fillYear(year) {
    cy.get('#year').type(year);
  }
  
  fillForm(formData) {
    if (formData.name) this.fillName(formData.name);
    if (formData.country) this.fillCountry(formData.country);
    if (formData.city) this.fillCity(formData.city);
    if (formData.card) this.fillCreditCard(formData.card);
    if (formData.month) this.fillMonth(formData.month);
    if (formData.year) this.fillYear(formData.year);
  }
  
  clickPurchase() {
    cy.get('button').contains('Purchase').click();
  }
  
  verifyPurchaseModalIsVisible() {
    cy.get('#orderModal').should('be.visible');
  }
  
}

module.exports = new PurchasePage();

