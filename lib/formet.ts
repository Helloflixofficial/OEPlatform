export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-Us", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const formatPriceRs = (price: number) => {
  return new Intl.NumberFormat("in-rs", {
    style: "currency",
    currency: "rupees",
  }).format(price);
};
