import { configureStore, PayloadAction } from "@reduxjs/toolkit";
import { Action, Dispatch } from "redux";
import { batch } from "react-redux";
import orderBookReducer, {
  OrderMessage,
} from "../features/orderBook/orderBookSlice";

let deltaBatch: PayloadAction<OrderMessage>[] = [];

let timeout: any = null;

/* throttle orderBook delta updates by 100ms */
const throttleOrderBook = () => (next: Dispatch) => (action: Action) => {
  if (action.type === "orderBook/delta") {
    deltaBatch.push(action as PayloadAction<OrderMessage>);

    if (!timeout) {
      timeout = setTimeout(() => {
        const actions = deltaBatch.splice(0, deltaBatch.length);

        batch(() => actions.forEach((action) => next(action)));

        timeout = null;
      }, 100);
    }
  } else {
    return next(action);
  }
};

export const store = configureStore({
  reducer: {
    orderBook: orderBookReducer,
  },
  middleware: [throttleOrderBook],
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
