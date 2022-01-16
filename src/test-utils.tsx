import { FC, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";

const AllTheProviders: FC = ({ children }) => {
  return (
    <Provider store={store}>
      <IntlProvider locale="en">{children}</IntlProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
