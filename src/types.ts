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

export type OrderBook = {
    asks: Order[];
    bids: Order[];
    productId: ProductId;
    depth: number;
};

export type OrderMessage = {
    asks: OrderTuple[];
    bids: OrderTuple[];
};
