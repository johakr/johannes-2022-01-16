import "./OrderBook.css";

import useOrderBook from "../hooks/useOrderBook";

import { useEffect, useRef } from "react";

import { useRecoilValue, useSetRecoilState } from "recoil";
import { orderBookState } from "../recoil/atoms";
import { filteredOrderBookState } from "../recoil/selectors";

import produce from "immer";

import { numberIntl, percentIntl } from "../utils/intl";

import Button from "./Button";
import Notification from "./Notification";
import OrdersTable from "./OrdersTable";

export default function OrderBook() {
  const { paused, setPaused, toggleProduct } = useOrderBook();

  const { asks, bids, spread, spreadPercent } = useRecoilValue(
    filteredOrderBookState
  );

  const setOrderBookState = useSetRecoilState(orderBookState);

  const ordersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("ResizeObserver" in window)) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect;
        const sm = window.matchMedia("(max-width: 600px)").matches;

        setOrderBookState(
          produce((draft) => {
            draft.depth = Math.min(
              Math.floor((height - 12) / 28 / (sm ? 2 : 1)) - 1,
              25
            );
          })
        );
      }
    });

    if (ordersRef.current) {
      resizeObserver.observe(ordersRef.current);
    }
  }, [setOrderBookState]);

  return (
    <>
      <div className="OrderBook">
        <header>
          <h2>Order Book</h2>
          <p>
            Spread: {numberIntl.format(spread)} (
            {percentIntl.format(spreadPercent)})
          </p>
        </header>
        <div className="orders" ref={ordersRef}>
          <OrdersTable className="bids" orders={bids} />
          <p className="inner">
            Spread: {numberIntl.format(spread)} (
            {percentIntl.format(spreadPercent)})
          </p>
          <OrdersTable className="asks" orders={asks} />
        </div>
        <Button disabled={paused} onClick={toggleProduct}>
          Toggle Feed
        </Button>
      </div>
      {paused && (
        <Notification>
          <span>Order Book Feed is disconnected.</span>
          <Button onClick={() => setPaused(false)}>Reconnect</Button>
        </Notification>
      )}
    </>
  );
}
