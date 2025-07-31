import type { Order } from "@/api/order";

export default function orderTotalPricePerPartName(
  orders: Order[]
): Array<{ partName: number; totalPrice: number }> {
  const pricePerPartName: Record<number, number> = {};
  for (const order of orders) {
    if (!(order.nm_id in pricePerPartName)) {
      pricePerPartName[order.nm_id] = Number.parseFloat(order.total_price) || 0;
    } else {
      pricePerPartName[order.nm_id] +=
        Number.parseFloat(order.total_price) || 0;
    }
  }

  // Sort in descending order
  const sortedPrices = (
    Object.keys(pricePerPartName) as unknown as number[]
  ).map((partName) => ({
    partName,
    totalPrice: pricePerPartName[partName],
  }));
  sortedPrices.sort((left, right) => right.totalPrice - left.totalPrice);

  return sortedPrices;
}
