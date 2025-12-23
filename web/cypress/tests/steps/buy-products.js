const { Given, When } = require("@badeball/cypress-cucumber-preprocessor");
const productsPage = require("../../src/pages/ProductsPage");
const productDetailPage = require("../../src/pages/ProductDetailPage");
const cartPage = require("../../src/pages/CartPage");
const purchasePage = require("../../src/pages/PurchasePage");

Given("the user enters the Demoblaze platform", () => {
  cy.visit("https://demoblaze.com");
});

When("the user adds products to the cart", (dataTable) => {
  const products = dataTable.hashes();
  cy.wrap(products).as('addedProducts');
  
  products.forEach((row) => {
    productsPage.selectProductByName(row.productName);
    cy.setupAlertHandler();
    productDetailPage.addToCart();
    cy.verifyAlertMessage('Product added');
    cy.visit("https://demoblaze.com");
  });
});

When("the user views the cart with the products", () => {
  productsPage.navigateToCart();
  cartPage.verifyCartPageLoaded();
  
  cy.get('@addedProducts').then((products) => {
    cartPage.verifyCartHasProductsCount(products.length);
    products.forEach((product) => {
      cartPage.verifyProductInCart(product.productName);
    });
  });
});

When("the user completes the purchase form", (dataTable) => {
  cartPage.clickPlaceOrder();
  purchasePage.verifyPurchaseModalIsVisible();
  
  const formData = dataTable.hashes()[0];
  purchasePage.fillForm(formData);
  purchasePage.clickPurchase();
});
