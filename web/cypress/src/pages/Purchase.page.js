import { PurchasePageLocators } from '../locators/PurchasePage.locators.js';

class PurchasePage {
  
  fillName(name) {
    cy.typeElement(PurchasePageLocators.NAME_INPUT, name);
  }
  
  fillCountry(country) {
    cy.typeElement(PurchasePageLocators.COUNTRY_INPUT, country);
  }
  
  fillCity(city) {
    cy.typeElement(PurchasePageLocators.CITY_INPUT, city);
  }
  
  fillCreditCard(card) {
    cy.typeElement(PurchasePageLocators.CARD_INPUT, card);
  }
  
  fillMonth(month) {
    cy.typeElement(PurchasePageLocators.MONTH_INPUT, month);
  }
  
  fillYear(year) {
    cy.typeElement(PurchasePageLocators.YEAR_INPUT, year);
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
    cy.clickElement(PurchasePageLocators.PURCHASE_BUTTON);
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
    cy.clickElement(PurchasePageLocators.OK_BUTTON);
  }
  
}

module.exports = new PurchasePage();

