import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { store } from "../../app/store";
import OrderBook from "./OrderBook";

test("renders order book headlines", async () => {
  render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <OrderBook />
      </IntlProvider>
    </Provider>
  );

  const headlineElement = screen.getByText("Order Book");
  expect(headlineElement).toBeInTheDocument();

  expect(screen.getAllByText("Price")).toHaveLength(2);
  expect(screen.getAllByText("Size")).toHaveLength(2);
  expect(screen.getAllByText("Total")).toHaveLength(2);
});

test("renders 50 offers with price", async () => {
  render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <OrderBook />
      </IntlProvider>
    </Provider>
  );

  const prices = await screen.findAllByText(/\$/, {}, { timeout: 5000 });

  expect(prices).toHaveLength(50);
});
