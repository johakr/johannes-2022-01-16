import { useIntl } from "react-intl";

type SpreadProps = {
  spread: number;
  spreadPercent: number;
} & React.HtmlHTMLAttributes<HTMLParagraphElement>;

export default function OrdersTable({
  className,
  spread,
  spreadPercent,
}: SpreadProps) {
  const { formatNumber } = useIntl();

  return (
    <p className={className}>
      Spread: {formatNumber(spread)} (
      {formatNumber(spreadPercent, {
        style: "percent",
        maximumFractionDigits: 2,
      })}
      )
    </p>
  );
}
