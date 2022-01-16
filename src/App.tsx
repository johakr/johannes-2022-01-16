import { useEffect } from "react";

import { useAppDispatch } from "./app/hooks";

import OrderBook from "./features/orderBook/OrderBook";
import { setPrefersReducedMotion } from "./features/ui/uiSlice";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      dispatch(setPrefersReducedMotion(!!mediaQuery?.matches));
    };

    mediaQuery.addEventListener("change", handleChange);

    handleChange();

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [dispatch]);

  return <OrderBook />;
}

export default App;
