import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { store } from "./app/store";
import App from "./App";

test("renders order book headline", () => {
  render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <App />
      </IntlProvider>
    </Provider>
  );
  const headlineElement = screen.getByText(/order book/i);
  expect(headlineElement).toBeInTheDocument();
});
