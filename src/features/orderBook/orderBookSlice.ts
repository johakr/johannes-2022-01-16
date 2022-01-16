import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export type OrderTuple = [price: number, size: number];

export type Order = {
  price: number;
  size: number;
  total?: number;
  totalPercent?: number;
};

export enum ProductId {
  XBTUSD = "PI_XBTUSD",
  ETHUSD = "PI_ETHUSD",
}

export type OrderMessage = {
  asks: OrderTuple[];
  bids: OrderTuple[];
  product_id: ProductId;
};

export type OrderBookState = {
  asks: Order[];
  bids: Order[];
  levels: number;
  paused: boolean;
  productId: ProductId;
};

const initialState: OrderBookState = {
  asks: [],
  bids: [],
  levels: 25,
  productId: ProductId.XBTUSD,
  paused: false,
};

const mapOrder = ([price, size]: OrderTuple): Order => ({
  price,
  size,
});

export const orderBookSlice = createSlice({
  name: "orderBook",
  initialState,
  reducers: {
    snapshot: (state, action: PayloadAction<OrderMessage>) => {
      if (action.payload.product_id !== state.productId) return;

      state.asks = action.payload.asks.map(mapOrder);
      state.bids = action.payload.bids.map(mapOrder);
    },
    delta: (state, action: PayloadAction<OrderMessage>) => {
      if (action.payload.product_id !== state.productId) return;

      (["asks", "bids"] as const).forEach((type) => {
        action.payload[type].map(mapOrder).forEach((order: Order) => {
          const existingIdx = state[type].findIndex(
            (o) => order.price === o.price
          );

          if (existingIdx > -1 && order.size === 0) {
            state[type].splice(existingIdx, 1);
          } else if (existingIdx > -1 && order.size > 0) {
            state[type][existingIdx] = order;
          } else if (order.size > 0) {
            state[type].push(order);
          }
        });

        state[type].sort((a, b) => {
          return (a.price - b.price) * (type === "asks" ? 1 : -1);
        });
      });
    },
    toggleFeed: (state) => {
      state.productId =
        state.productId === ProductId.ETHUSD
          ? ProductId.XBTUSD
          : ProductId.ETHUSD;

      state.asks = [];
      state.bids = [];
    },
    levels: (state, action: PayloadAction<{ sm: boolean; height: number }>) => {
      // number of levels is depending on screen height & mobile breakpoint (max 25).
      // 12: min spacing to bottom.
      // 28: height of one row.
      // -1: adjust for heading row.
      state.levels = Math.min(
        Math.floor(
          (action.payload.height - 12) / 28 / (action.payload.sm ? 2 : 1)
        ) - 1,
        25
      );
    },
    pause: (state) => {
      state.paused = true;
    },
    unpause: (state) => {
      state.paused = false;
    },
  },
});

export const { levels, delta, pause, snapshot, toggleFeed, unpause } =
  orderBookSlice.actions;

export const selectOrderBookWithTotals = ({
  orderBook,
}: Pick<RootState, "orderBook">) => {
  const asks = orderBook.asks.slice(0, orderBook.levels);
  const bids = orderBook.bids.slice(0, orderBook.levels);

  const totalAsk = asks.reduce((prev, cur) => prev + cur.size, 0);
  const totalBid = bids.reduce((prev, cur) => prev + cur.size, 0);

  const asksWithTotals: Required<Order>[] = [];
  const bidsWithTotals: Required<Order>[] = [];

  asks.forEach((ask, idx) => {
    const total = (asksWithTotals[idx - 1]?.total || 0) + ask.size;
    const totalPercent = (total / Math.max(totalAsk, totalBid)) * 100;

    asksWithTotals.push({ ...ask, total, totalPercent });
  });

  bids.forEach((bid, idx) => {
    const total = (bidsWithTotals[idx - 1]?.total || 0) + bid.size;
    const totalPercent = (total / Math.max(totalAsk, totalBid)) * 100;

    bidsWithTotals.push({ ...bid, total, totalPercent });
  });

  const spread = (asks[0]?.price ?? 0) - (bids[0]?.price ?? 0);
  const spreadPercent = spread / (asks[0]?.price ?? 1);

  const currency = orderBook.productId.slice(-3);

  return {
    ...orderBook,
    asks: asksWithTotals,
    bids: bidsWithTotals,
    spread,
    spreadPercent,
    currency,
  };
};

export default orderBookSlice.reducer;
