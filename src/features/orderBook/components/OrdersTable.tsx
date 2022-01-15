import { Order } from "../orderBookSlice";
import "./OrdersTable.css";

import { useIntl } from "react-intl";

type OrdersTableProps = {
  currency: string;
  orders: Order[];
} & React.HtmlHTMLAttributes<HTMLTableElement>;

export default function OrdersTable({
  className,
  currency,
  orders,
}: OrdersTableProps) {
  const { formatNumber } = useIntl();

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
            <td className="total">{formatNumber(order.total ?? 0)}</td>
            <td className="size">{formatNumber(order.size)}</td>
            <td className="price">
              {formatNumber(order.price, {
                currency: currency,
                style: "currency",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
