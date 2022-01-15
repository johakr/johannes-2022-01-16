import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { OrderTuple, Order, ProductId } from "../../types";
import { ReadyState } from "react-use-websocket";

export interface OrderBookState {
  asks: any[];
  bids: any[];
  depth: number;
  productId: string;
  paused: boolean;
  readyState: ReadyState;
}

const initialState: OrderBookState = {
  asks: [],
  bids: [],
  depth: 25,
  productId: "PI_XBTUSD",
  paused: false,
  readyState: ReadyState.UNINSTANTIATED,
};

const mapOrder = ([price, size]: OrderTuple): Order => ({
  price,
  size,
});

export const orderBookSlice = createSlice({
  name: "orderBook",
  initialState,
  reducers: {
    snapshot: (state, action: PayloadAction<{ asks: any[]; bids: any[] }>) => {
      state.asks = action.payload.asks.map(mapOrder);
      state.bids = action.payload.bids.map(mapOrder);
    },
    delta: (state, action: PayloadAction<{ asks: any[]; bids: any[] }>) => {
      const types: readonly ("asks" | "bids")[] = ["asks", "bids"];

      types.forEach((type) => {
        (action.payload[type] ?? []).map(mapOrder).forEach((order: Order) => {
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
    calculateDepth: (
      state,
      action: PayloadAction<{ sm: boolean; height: number }>
    ) => {
      state.depth = Math.min(
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
    readyStateChange: (state, action: PayloadAction<ReadyState>) => {
      state.readyState = action.payload;
    },
  },
});

export const {
  calculateDepth,
  delta,
  pause,
  readyStateChange,
  snapshot,
  toggleFeed,
  unpause,
} = orderBookSlice.actions;

export const selectOrderBook = (state: RootState) => state.orderBook;

export const selectOrderBookWithTotals = ({ orderBook }: RootState) => {
  const asks = orderBook.asks.slice(0, orderBook.depth).map((o) => ({ ...o }));
  const bids = orderBook.bids.slice(0, orderBook.depth).map((o) => ({ ...o }));

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

  return { ...orderBook, asks, bids, spread, spreadPercent };
};

export default orderBookSlice.reducer;
