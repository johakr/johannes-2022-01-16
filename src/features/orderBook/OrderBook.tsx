import "./OrderBook.css";

import { useEffect, useRef } from "react";

import useOrderBook from "./useOrderBook";

import OrdersTable from "./components/OrdersTable";
import Spread from "./components/Spread";

import Button from "../../components/Button";
import Notification from "../../components/Notification";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  levels,
  selectOrderBookWithTotals,
  toggleFeed,
  unpause,
} from "./orderBookSlice";

export default function OrderBook() {
  useOrderBook();

  const { asks, bids, currency, spread, spreadPercent, paused, productId } =
    useAppSelector(selectOrderBookWithTotals);

  const dispatch = useAppDispatch();

  const ordersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("ResizeObserver" in window)) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect;
        const sm = window.matchMedia("(max-width: 767px)").matches;

        dispatch(levels({ sm, height }));
      }
    });

    if (ordersRef.current) {
      resizeObserver.observe(ordersRef.current);
    }
  }, [dispatch]);

  return (
    <>
      <section className="OrderBook">
        <header>
          <h2 title={productId.replace("PI_", "")}>Order Book</h2>
          <Spread spread={spread} spreadPercent={spreadPercent} />
        </header>
        <main className="orders" ref={ordersRef}>
          <OrdersTable className="bids" orders={bids} currency={currency} />
          {spread > 0 && (
            <Spread
              className="inner"
              spread={spread}
              spreadPercent={spreadPercent}
            />
          )}
          <OrdersTable className="asks" orders={asks} currency={currency} />
        </main>
        <footer>
          <Button
            disabled={paused}
            onClick={() => dispatch(toggleFeed())}
            type="button"
          >
            Toggle Feed
          </Button>
        </footer>
      </section>
      {paused && (
        <Notification>
          <span>Feed disconnected.</span>
          <Button type="button" onClick={() => dispatch(unpause())}>
            Reconnect
          </Button>
        </Notification>
      )}
    </>
  );
}
