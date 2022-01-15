const locale = "en-US";

export const numberIntl = new Intl.NumberFormat(locale);

export const percentIntl = new Intl.NumberFormat(locale, {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const currencyIntl = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
