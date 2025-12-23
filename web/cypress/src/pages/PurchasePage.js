import { PurchasePageLocators } from '../locators/PurchasePage.locators.js';

class PurchasePage {
  
  fillName(name) {
    cy.get(PurchasePageLocators.NAME_INPUT).type(name);
  }
  
  fillCountry(country) {
    cy.get(PurchasePageLocators.COUNTRY_INPUT).type(country);
  }
  
  fillCity(city) {
    cy.get(PurchasePageLocators.CITY_INPUT).type(city);
  }
  
  fillCreditCard(card) {
    cy.get(PurchasePageLocators.CARD_INPUT).type(card);
  }
  
  fillMonth(month) {
    cy.get(PurchasePageLocators.MONTH_INPUT).type(month);
  }
  
  fillYear(year) {
    cy.get(PurchasePageLocators.YEAR_INPUT).type(year);
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
    cy.get(PurchasePageLocators.PURCHASE_BUTTON).contains('Purchase').click();
  }
  
  verifyPurchaseModalIsVisible() {
    cy.get(PurchasePageLocators.ORDER_MODAL).should('be.visible');
  }
  
  verifyPurchaseCompleted(purchaseFormData) {
    cy.get(PurchasePageLocators.SUCCESS_INFO_PARAGRAPH).invoke('text').then((successInfo) => {
      expect(successInfo).to.include(`Card Number: ${purchaseFormData.card}`);
      expect(successInfo).to.include(`Name: ${purchaseFormData.name}`);
    });
  }
  
  verifyPurchaseSuccessMessage(expectedMessage) {
    cy.get(PurchasePageLocators.SUCCESS_MESSAGE_HEADING).should('contain', expectedMessage);
  }
  
  clickOkButton() {
    cy.get(PurchasePageLocators.OK_BUTTON).click();
  }
  
}

module.exports = new PurchasePage();

