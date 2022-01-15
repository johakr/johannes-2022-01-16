/// <reference types="cypress" />

describe("orderbook", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays two tables for asks and bids with 18 offers each", () => {
    cy.get(".OrderBook table").should("have.length", 2);

    cy.get(".OrderBook table").first().should("contain.text", "Price");
    cy.get(".OrderBook table").first().should("contain.text", "Price");

    cy.get(".OrdersTable.asks tbody tr").should("have.length", 18);
    cy.get(".OrdersTable.bids tbody tr").should("have.length", 18);
  });

  it("changes feed on click on toggle feed button", () => {
    cy.get(".OrdersTable.asks tbody tr").should("have.length", 18);
    cy.get(".OrdersTable.bids tbody tr").should("have.length", 18);

    cy.get(".OrderBook h2").invoke("attr", "title").should("eq", "XBTUSD");

    cy.get("button").contains("Toggle Feed").click();

    cy.get(".OrderBook h2").invoke("attr", "title").should("eq", "ETHUSD");
  });

  it("offers reconnect on visibilitychange hidden", () => {
    cy.get(".OrdersTable.asks tbody tr").should("have.length", 18);
    cy.get(".OrdersTable.bids tbody tr").should("have.length", 18);

    cy.document().then((doc) => {
      cy.stub(doc, "hidden").value(true);
    });
    cy.document().trigger("visibilitychange");

    cy.get("div").contains("Feed disconnected.").should("be.visible");
    cy.get("button").contains("Reconnect").should("be.visible");

    cy.get("button").contains("Reconnect").click();
    cy.get("div").contains("Feed disconnected.").should("not.exist");
  });
});
