const { Given, When } = require("@badeball/cypress-cucumber-preprocessor");
const productsPage = require("../../src/pages/ProductsPage");
const productDetailPage = require("../../src/pages/ProductDetailPage");

Given("the user enters the Demoblaze platform", () => {
  cy.visit("https://demoblaze.com");
});

When("the user adds products to the cart", (dataTable) => {
  const products = dataTable.hashes();
  
  products.forEach((row) => {
    productsPage.selectProductByName(row.productName);
    cy.setupAlertHandler();
    productDetailPage.addToCart();
    cy.verifyAlertMessage('Product added');
    cy.visit("https://demoblaze.com");
  });
});
