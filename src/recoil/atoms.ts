import { atom } from "recoil";

import { ProductId, OrderBook } from "../types";

export const orderBookState = atom<OrderBook>({
    key: "orderBook",
    default: { asks: [], bids: [], productId: ProductId.ETHUSD, depth: 25 },
});
