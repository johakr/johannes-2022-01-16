import { Order } from "../types";
import "./OrdersTable.css";

import { numberIntl, currencyIntl } from "../utils/intl";

type OrdersTableProps = {
  orders: Order[];
} & React.HtmlHTMLAttributes<HTMLTableElement>;

export default function OrdersTable({ className, orders }: OrdersTableProps) {
  return (
    <table className={`OrdersTable ${className}`}>
      <thead>
        <tr>
          <th>Total</th>
          <th>Size</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr
            key={order.price}
            style={
              {
                "--gradient-width": `${order.totalPercent ?? 0}%`,
              } as React.CSSProperties
            }
          >
            <td className="total">{numberIntl.format(order.total ?? 0)}</td>
            <td className="size">{numberIntl.format(order.size)}</td>
            <td className="price">{currencyIntl.format(order.price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
