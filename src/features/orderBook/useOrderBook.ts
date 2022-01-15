import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  delta,
  snapshot,
  selectOrderBook,
  pause,
  readyStateChange,
} from "./orderBookSlice";

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
    if (lastJsonMessage?.product_id !== productId) return;

    if (lastJsonMessage.feed === "book_ui_1_snapshot") {
      dispatch(snapshot(lastJsonMessage));
    } else if (lastJsonMessage.feed === "book_ui_1") {
      dispatch(delta(lastJsonMessage));
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
