import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import produce from "immer";

import { useRecoilState } from "recoil";
import { orderBookState } from "../recoil/atoms";
import { Order, OrderTuple, ProductId } from "../types";

const mapOrder = ([price, size]: OrderTuple): Order => ({
    price,
    size,
});

export default function useOrderBook() {
    const [paused, setPaused] = useState(false);
    const [{ productId }, setOrderBook] = useRecoilState(orderBookState);

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(
        process.env.REACT_APP_ORDERBOOK_WS_URL as string,
        undefined,
        !paused
    );

    useEffect(() => {
        if (lastJsonMessage === null) return;

        setOrderBook(
            produce((draft) => {
                if (lastJsonMessage.feed === "book_ui_1_snapshot") {
                    draft.bids = [];
                    draft.asks = [];
                }

                // TODO: refactor
                const types: readonly ("asks" | "bids")[] = ["asks", "bids"];

                types.forEach((type) => {
                    (lastJsonMessage[type] ?? [])
                        .map(mapOrder)
                        .forEach((order: Order) => {
                            const existingIdx = draft[type].findIndex(
                                (o) => order.price === o.price
                            );

                            if (existingIdx > -1 && order.size === 0) {
                                draft[type].splice(existingIdx, 1);
                            } else if (existingIdx > -1 && order.size > 0) {
                                draft[type][existingIdx] = order;
                            } else if (order.size > 0) {
                                draft[type].push(order);
                            }
                        });

                    draft[type].sort((a, b) => {
                        return (a.price - b.price) * (type === "asks" ? 1 : -1);
                    });
                });
            })
        );
    }, [lastJsonMessage, setOrderBook]);

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

    const toggleProduct = useCallback(() => {
        setOrderBook(
            produce((draft) => {
                draft.productId =
                    draft.productId === ProductId.ETHUSD
                        ? ProductId.XBTUSD
                        : ProductId.ETHUSD;
            })
        );
    }, [setOrderBook]);

    useEffect(() => {
        function handleVisibilityChange() {
            if (document.hidden) {
                setPaused(true);
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    return { paused, setPaused, toggleProduct };
}
