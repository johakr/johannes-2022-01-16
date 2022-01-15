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
} & OrderMessage;

export default function useOrderBook() {
  const paused = useAppSelector(({ orderBook }) => orderBook.paused);
  const productId = useAppSelector(({ orderBook }) => orderBook.productId);

  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const ws = useRef<WebSocket | null>();

  const latestProductId = useRef(productId);

  useEffect(() => {
    latestProductId.current = productId;
  }, [productId]);

  useEffect(() => {
    if (paused) return;

    ws.current = new WebSocket(
      process.env.REACT_APP_ORDERBOOK_WS_URL as string
    );

    ws.current.addEventListener("open", () => {
      setOpen(true);
    });

    ws.current.addEventListener("close", () => {
      setOpen(false);
    });

    ws.current.addEventListener("message", ({ data }) => {
      /* @ts-ignore */
      const message = JSON.parse(data) as Message | null;

      if (message?.product_id !== latestProductId.current) return;

      if (message.feed === "book_ui_1_snapshot") {
        dispatch(snapshot(message));
      } else if (message.feed === "book_ui_1") {
        dispatch(delta(message));
      }
    });

    return () => {
      ws.current?.close();
    };
  }, [dispatch, paused]);

  useEffect(() => {
    if (paused || !open || ws.current?.readyState !== WebSocket.OPEN) return;

    ws.current?.send(
      JSON.stringify({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [productId],
      })
    );

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
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
      ws.current = null;
    }
  }, [paused]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        dispatch(pause());
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);
}
