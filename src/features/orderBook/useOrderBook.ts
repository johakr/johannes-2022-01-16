import { useEffect, useRef, useState } from "react";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  delta,
  snapshot,
  pause,
  ProductId,
  OrderMessage,
} from "./orderBookSlice";

type Message = {
  product_id: ProductId;
  feed: "book_ui_1_snapshot" | "book_ui_1";
  event?: "subscribed" | "unsubscribed";
} & OrderMessage;

export default function useOrderBook() {
  const paused = useAppSelector(({ orderBook }) => orderBook.paused);
  const productId = useAppSelector(({ orderBook }) => orderBook.productId);

  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const ws = useRef<WebSocket | null>();

  useEffect(() => {
    if (paused) return;

    ws.current = new WebSocket(
      process.env.REACT_APP_ORDERBOOK_WS_URL as string
    );

    const { current } = ws;

    current.addEventListener("open", () => setOpen(true));
    current.addEventListener("close", () => {
      if (ws.current === current) {
        setOpen(false);
        dispatch(pause());
      }
    });

    current.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data) as Message;

      if (message.feed === "book_ui_1_snapshot") {
        dispatch(snapshot(message));
      } else if (message.feed === "book_ui_1" && !message.event) {
        dispatch(delta(message));
      }
    });

    return () => current.close();
  }, [dispatch, paused]);

  useEffect(() => {
    if (paused || !open || ws.current?.readyState !== WebSocket.OPEN) return;

    ws.current.send(
      JSON.stringify({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [productId],
      })
    );

    const { current } = ws;

    return () => {
      if (current.readyState === WebSocket.OPEN) {
        ws.current?.send(
          JSON.stringify({
            event: "unsubscribe",
            feed: "book_ui_1",
            product_ids: [productId],
          })
        );
      }
    };
  }, [productId, paused, open]);

  useEffect(() => {
    if (paused) {
      ws.current?.close();
    }
  }, [paused]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        ws.current?.close();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);
}
