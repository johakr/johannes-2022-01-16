import orderBookReducer, {
  OrderBookState,
  ProductId,
  calculateDepth,
  delta,
  pause,
  readyStateChange,
  selectOrderBookWithTotals,
  snapshot,
  toggleFeed,
  unpause,
} from "./orderBookSlice";

const initialState: OrderBookState = {
  asks: [],
  bids: [],
  depth: 25,
  productId: "PI_XBTUSD",
  paused: false,
  readyState: -1,
};

const initialStateWithOffers: OrderBookState = {
  ...initialState,
  asks: [
    { price: 10, size: 10 },
    { price: 11, size: 20 },
    { price: 12, size: 30 },
  ],
  bids: [
    { price: 9, size: 20 },
    { price: 8, size: 30 },
    { price: 7, size: 40 },
  ],
};

describe("orderBook reducer", () => {
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

  describe("should handle delta", () => {
    it("remove orders with size 0", () => {
      const actual = orderBookReducer(
        initialStateWithOffers,
        delta({
          asks: [[11, 0]],
          bids: [
            [7, 0],
            [6, 0],
          ],
        })
      );

      expect(actual.asks).toHaveLength(2);
      expect(actual.bids).toHaveLength(2);

      expect(actual.asks).not.toContain(initialStateWithOffers.asks[1]);
      expect(actual.bids).not.toContain(initialStateWithOffers.bids[2]);
    });

    it("update existing orders with new size", () => {
      const actual = orderBookReducer(
        initialStateWithOffers,
        delta({
          asks: [[11, 100]],
          bids: [[7, 200]],
        })
      );

      expect(actual.asks).toHaveLength(3);
      expect(actual.bids).toHaveLength(3);

      expect(actual.asks[1].size).toBe(100);
      expect(actual.bids[2].size).toBe(200);
    });

    it("inserts new orders at correct position", () => {
      const actual = orderBookReducer(
        initialStateWithOffers,
        delta({
          asks: [[11.5, 100]],
          bids: [[6, 100]],
        })
      );

      expect(actual.asks).toHaveLength(4);
      expect(actual.bids).toHaveLength(4);

      expect(actual.asks[2].price).toBe(11.5);
      expect(actual.bids[3].price).toBe(6);
    });
  });

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
          [2, 10],
          [3, 20],
        ],
        bids: [
          [6, 20],
          [5, 30],
        ],
      })
    );

    expect(actual.asks).toEqual([
      { price: 2, size: 10 },
      { price: 3, size: 20 },
    ]);
    expect(actual.bids).toEqual([
      { price: 6, size: 20 },
      { price: 5, size: 30 },
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

describe("orderBook selectors", () => {
  describe("selectOrderBookWithTotals", () => {
    it("does not break for empty asks / bids arrays", () => {
      const actual = selectOrderBookWithTotals({
        orderBook: initialState,
      });

      expect(actual.spread).toBe(0);
      expect(actual.spreadPercent).toBe(0);
    });

    const actual = selectOrderBookWithTotals({
      orderBook: initialStateWithOffers,
    });

    it("should calculate absolute and relative totals correctly", () => {
      expect(actual.bids[0].total).toBe(20);
      expect(actual.bids[1].total).toBe(50);
      expect(actual.bids[2].total).toBe(90);

      expect(actual.asks[0].total).toBe(10);
      expect(actual.asks[1].total).toBe(30);
      expect(actual.asks[2].total).toBe(60);

      expect(actual.bids[0].totalPercent).toBeCloseTo(22.22, 2);
      expect(actual.bids[1].totalPercent).toBeCloseTo(55.56, 2);
      expect(actual.bids[2].totalPercent).toBeCloseTo(100, 2);

      expect(actual.asks[0].totalPercent).toBeCloseTo(11.11, 2);
      expect(actual.asks[1].totalPercent).toBeCloseTo(33.33, 2);
      expect(actual.asks[2].totalPercent).toBeCloseTo(66.67, 2);
    });

    it("should calculate spread correctly", () => {
      expect(actual.spread).toBeCloseTo(1, 4);
      expect(actual.spreadPercent).toBeCloseTo(0.1, 4);
    });

    it("should calculate currency correctly", () => {
      expect(actual.currency).toBe("USD");
    });
  });
});
