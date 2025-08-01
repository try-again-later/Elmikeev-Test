import type { Order } from "@/api/order";

function getCountPerPartName(orders: Order[]) {
  const countPerPartName: Record<number, number> = {};
  for (const order of orders) {
    if (!(order.nm_id in countPerPartName)) {
      countPerPartName[order.nm_id] = 1;
    } else {
      countPerPartName[order.nm_id] += 1;
    }
  }

  return countPerPartName;
}

export default function orderCountPerPartName(
  orders: Order[]
): Array<{ partName: number; count: number }> {
  const countPerPartName = getCountPerPartName(orders);

  // Sort in descending order
  const sortedCounts = (
    Object.keys(countPerPartName) as unknown as number[]
  ).map((partName) => ({
    partName,
    count: countPerPartName[partName],
  }));
  sortedCounts.sort((left, right) => right.count - left.count);

  return sortedCounts;
}

export function compareOrderCounts(
  previousOrders: Order[],
  currentOrders: Order[]
) {
  const previousOrderCounts = getCountPerPartName(previousOrders);
  const currentOrderCounts = getCountPerPartName(currentOrders);

  const partNames: Set<number> = new Set([
    ...(Object.keys(previousOrderCounts) as unknown as number[]),
    ...(Object.keys(currentOrderCounts) as unknown as number[]),
  ]);

  const orderCountChanges: Array<{
    partName: number;
    previousOrderCount: number;
    currentOrderCount: number;
    change: number;
  }> = [];
  for (const partName of partNames) {
    if (partName in previousOrderCounts && partName in currentOrderCounts) {
      orderCountChanges.push({
        partName,
        previousOrderCount: previousOrderCounts[partName],
        currentOrderCount: currentOrderCounts[partName],
        change:
          (currentOrderCounts[partName] - previousOrderCounts[partName]) /
            previousOrderCounts[partName] || 0,
      });
    }
  }

  orderCountChanges.sort((left, right) => right.change - left.change);

  return orderCountChanges;
}
