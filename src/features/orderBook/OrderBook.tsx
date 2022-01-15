import "./OrderBook.css";

import useOrderBook from "./useOrderBook";

import { useEffect, useRef } from "react";

import { numberIntl, percentIntl } from "../../utils/intl";

import Button from "../../components/Button";
import Notification from "../../components/Notification";
import OrdersTable from "./components/OrdersTable";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  selectOrderBookWithTotals,
  toggleFeed,
  calculateDepth,
  unpause,
} from "./orderBookSlice";

export default function OrderBook() {
  useOrderBook();

  const { asks, bids, spread, spreadPercent, paused } = useAppSelector(
    selectOrderBookWithTotals
  );
  const dispatch = useAppDispatch();

  const ordersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("ResizeObserver" in window)) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect;
        const sm = window.matchMedia("(max-width: 767px)").matches;

        dispatch(calculateDepth({ sm, height }));
      }
    });

    if (ordersRef.current) {
      resizeObserver.observe(ordersRef.current);
    }
  }, [dispatch]);

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
        <Button disabled={paused} onClick={() => dispatch(toggleFeed())}>
          Toggle Feed
        </Button>
      </div>
      {paused && (
        <Notification>
          <span>Feed disconnected.</span>
          <Button onClick={() => dispatch(unpause())}>Reconnect</Button>
        </Notification>
      )}
    </>
  );
}
