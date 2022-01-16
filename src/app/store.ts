import { configureStore } from "@reduxjs/toolkit";

import orderBookReducer from "../features/orderBook/orderBookSlice";
import uiReducer from "../features/ui/uiSlice";

import { throttleOrderBook } from "./middlewares";

export const store = configureStore({
  reducer: {
    orderBook: orderBookReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(throttleOrderBook),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
