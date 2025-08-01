import type { Order } from "@/api/order";

function getTotalPricePerPartName(orders: Order[]) {
  const pricePerPartName: Record<number, number> = {};
  for (const order of orders) {
    if (!(order.nm_id in pricePerPartName)) {
      pricePerPartName[order.nm_id] = Number.parseFloat(order.total_price) || 0;
    } else {
      pricePerPartName[order.nm_id] +=
        Number.parseFloat(order.total_price) || 0;
    }
  }

  return pricePerPartName;
}

export default function orderTotalPricePerPartName(
  orders: Order[]
): Array<{ partName: number; totalPrice: number }> {
  const pricePerPartName = getTotalPricePerPartName(orders);

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

export function compareOrderTotalPrices(
  previousOrders: Order[],
  currentOrders: Order[]
) {
  const previousTotalPrices = getTotalPricePerPartName(previousOrders);
  const currentTotalPrices = getTotalPricePerPartName(currentOrders);

  const partNames: Set<number> = new Set([
    ...(Object.keys(previousTotalPrices) as unknown as number[]),
    ...(Object.keys(currentTotalPrices) as unknown as number[]),
  ]);

  const totalPriceChanges: Array<{
    partName: number;
    previousTotalPrice: number;
    currentTotalPrice: number;
    change: number;
  }> = [];
  for (const partName of partNames) {
    if (partName in previousTotalPrices && partName in currentTotalPrices) {
      totalPriceChanges.push({
        partName,
        previousTotalPrice: previousTotalPrices[partName],
        currentTotalPrice: currentTotalPrices[partName],
        change:
          (currentTotalPrices[partName] - previousTotalPrices[partName]) /
            previousTotalPrices[partName] || 0,
      });
    }
  }

  totalPriceChanges.sort((left, right) => right.change - left.change);

  return totalPriceChanges;
}
