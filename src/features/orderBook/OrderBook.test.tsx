import "@testing-library/react/dont-cleanup-after-each";
import {
  render,
  screen,
  waitForElementToBeRemoved,
  fireEvent,
  waitFor,
} from "../../test-utils";

import WS from "jest-websocket-mock";

import OrderBook from "./OrderBook";
import { ProductId } from "./orderBookSlice";

let ws = new WS("ws://localhost:3000", { jsonProtocol: true });

it("connects to WS server", async () => {
  render(<OrderBook />);

  await ws.connected;
});

it("sends subscribe event", async () => {
  await expect(ws).toReceiveMessage({
    event: "subscribe",
    feed: "book_ui_1",
    product_ids: [ProductId.XBTUSD],
  });
});

it("reacts to snapshot events", async () => {
  ws.send({
    feed: "book_ui_1_snapshot",
    product_id: ProductId.XBTUSD,
    asks: [
      [3, 10],
      [4, 10],
    ],
    bids: [
      [2, 10],
      [1, 10],
    ],
  });

  const prices = await screen.findAllByText(/\$/);

  expect(prices).toHaveLength(4);
});

it("reacts to delta events", async () => {
  const ask = await screen.findByText("$3.00");

  ws.send({
    feed: "book_ui_1",
    product_id: ProductId.XBTUSD,
    asks: [[3, 0]],
    bids: [[2, 0]],
  });

  await waitForElementToBeRemoved(ask);

  const prices = await screen.findAllByText(/\$/);

  expect(prices).toHaveLength(2);
});

it("shows reconnect notification on WS close", async () => {
  ws.close();

  const notification = await screen.findByText("Feed disconnected.");

  expect(notification).toBeInTheDocument();

  WS.clean();
  ws = new WS("ws://localhost:3000", { jsonProtocol: true });
});

it("reconnects on click on reconnect button", async () => {
  const reconnect = await screen.findByText("Reconnect");

  expect(reconnect).toBeInTheDocument();

  fireEvent.click(reconnect);

  await ws.connected;

  await waitFor(() => {
    expect(screen.queryByText("Feed disconnected.")).not.toBeInTheDocument();
  });
});
