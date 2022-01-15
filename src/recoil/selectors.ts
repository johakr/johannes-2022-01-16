import { selector } from "recoil";
import { orderBookState } from "./atoms";

export const filteredOrderBookState = selector({
  key: "filteredOrderBookState",
  get: ({ get }) => {
    const orderBook = get(orderBookState);

    const asks = orderBook.asks
      .slice(0, orderBook.depth)
      .map((o) => ({ ...o }));

    const bids = orderBook.bids
      .slice(0, orderBook.depth)
      .map((o) => ({ ...o }));

    const totalAsk = asks.reduce((prev, cur) => prev + cur.size, 0);
    const totalBid = bids.reduce((prev, cur) => prev + cur.size, 0);

    asks.forEach((ask, idx) => {
      ask.total = (asks[idx - 1]?.total || 0) + ask.size;
      ask.totalPercent = (ask.total / Math.max(totalAsk, totalBid)) * 100;
    });

    bids.forEach((bid, idx) => {
      bid.total = (bids[idx - 1]?.total || 0) + bid.size;
      bid.totalPercent = (bid.total / Math.max(totalAsk, totalBid)) * 100;
    });

    const spread = (asks[0]?.price ?? 0) - (bids[0]?.price ?? 0);
    const spreadPercent = spread / (asks[0]?.price ?? 1);

    return { asks, bids, spread, spreadPercent };
  },
});
