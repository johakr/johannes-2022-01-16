import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  delta,
  snapshot,
  selectOrderBook,
  pause,
  readyStateChange,
  ProductId,
  OrderMessage,
} from "./orderBookSlice";

type Message = {
  product_id: ProductId;
  feed: "book_ui_1_snapshot" | "book_ui_1";
} & OrderMessage;

export default function useOrderBook() {
  const { productId, paused } = useAppSelector(selectOrderBook);
  const dispatch = useAppDispatch();

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    process.env.REACT_APP_ORDERBOOK_WS_URL as string,
    undefined,
    !paused
  );

  useEffect(() => {
    dispatch(readyStateChange(readyState));
  }, [dispatch, readyState]);

  useEffect(() => {
    const message = lastJsonMessage as Message | null;

    if (message?.product_id !== productId) return;

    if (message.feed === "book_ui_1_snapshot") {
      dispatch(snapshot(message));
    } else if (message.feed === "book_ui_1") {
      dispatch(delta(message));
    }
  }, [lastJsonMessage, dispatch, productId]);

  useEffect(() => {
    if (paused) return;

    sendJsonMessage({
      event: "subscribe",
      feed: "book_ui_1",
      product_ids: [productId],
    });

    return () => {
      sendJsonMessage({
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [productId],
      });
    };
  }, [productId, paused, sendJsonMessage]);

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
