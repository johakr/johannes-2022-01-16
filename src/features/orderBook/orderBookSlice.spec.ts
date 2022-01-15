import { ProductId } from "../../types";
import orderBookReducer, {
  OrderBookState,
  calculateDepth,
  pause,
  readyStateChange,
  snapshot,
  toggleFeed,
  unpause,
} from "./orderBookSlice";

describe("counter reducer", () => {
  const initialState: OrderBookState = {
    asks: [],
    bids: [],
    depth: 25,
    productId: "PI_XBTUSD",
    paused: false,
    readyState: -1,
  };

  it.each([
    { height: 600, expected: 9 },
    { height: 1000, expected: 16 },
  ])(
    "should handle calculateDepth on mobile with height $height",
    ({ height, expected }) => {
      let actual = orderBookReducer(
        initialState,
        calculateDepth({ sm: true, height })
      );
      expect(actual.depth).toEqual(expected);
    }
  );

  it.each([
    { height: 600, expected: 20 },
    { height: 1000, expected: 25 },
  ])(
    "should handle calculateDepth on desktop with height $height",
    ({ height, expected }) => {
      let actual = orderBookReducer(
        initialState,
        calculateDepth({ sm: false, height })
      );
      expect(actual.depth).toEqual(expected);
    }
  );

  it("should handle pause", () => {
    const actual = orderBookReducer(initialState, pause());
    expect(actual.paused).toEqual(true);
  });

  it("should handle readyStateChange", () => {
    const actual = orderBookReducer(initialState, readyStateChange(1));
    expect(actual.readyState).toEqual(1);
  });

  it("should handle snapshot", () => {
    const actual = orderBookReducer(
      initialState,
      snapshot({
        asks: [
          [42908, 10],
          [42909, 12500],
        ],
        bids: [
          [42875, 6521],
          [42872, 9800],
        ],
      })
    );

    expect(actual.asks).toEqual([
      { price: 42908, size: 10 },
      { price: 42909, size: 12500 },
    ]);
    expect(actual.bids).toEqual([
      { price: 42875, size: 6521 },
      { price: 42872, size: 9800 },
    ]);
  });

  it("should handle toggleFeed", () => {
    let actual = orderBookReducer(initialState, toggleFeed());
    expect(actual.productId).toEqual(ProductId.ETHUSD);
    expect(actual.asks).toHaveLength(0);
    expect(actual.bids).toHaveLength(0);

    actual = orderBookReducer(actual, toggleFeed());
    expect(actual.productId).toEqual(ProductId.XBTUSD);
    expect(actual.asks).toHaveLength(0);
    expect(actual.bids).toHaveLength(0);
  });

  it("should handle unpause", () => {
    const actual = orderBookReducer(initialState, unpause());
    expect(actual.paused).toEqual(false);
  });
});
