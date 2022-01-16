import { PayloadAction } from "@reduxjs/toolkit";
import { Middleware } from "redux";
import { batch } from "react-redux";
import { OrderMessage } from "../features/orderBook/orderBookSlice";

let deltaBatch: PayloadAction<OrderMessage>[] = [];
let timeout: any = null;

// Throttles / batches orderBook delta updates by 100ms.
// If prefers-reduced-motion is enabled, by 1000ms.
export const throttleOrderBook: Middleware = (store) => (next) => (action) => {
  if (action.type === "orderBook/delta") {
    deltaBatch.push(action as PayloadAction<OrderMessage>);

    if (!timeout) {
      const { prefersReducedMotion } = store.getState().ui;

      timeout = setTimeout(
        () => {
          const actions = deltaBatch.splice(0, deltaBatch.length);

          batch(() => actions.forEach((action) => next(action)));

          timeout = null;
        },
        prefersReducedMotion ? 1000 : 100
      );
    }
  } else {
    return next(action);
  }
};
