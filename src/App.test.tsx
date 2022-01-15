import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders order book headline", () => {
  render(<App />);
  const headlineElement = screen.getByText(/order book/i);
  expect(headlineElement).toBeInTheDocument();
});
