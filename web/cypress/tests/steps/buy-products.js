const { Given } = require("@badeball/cypress-cucumber-preprocessor");

Given("the user enters the Demoblaze platform", () => {
  cy.visit("https://demoblaze.com");
});

