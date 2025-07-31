import type { Order } from "@/api/order";

export default function orderCountPerPartName(
  orders: Order[]
): Array<{ partName: number; count: number }> {
  const countPerPartName: Record<number, number> = {};
  for (const order of orders) {
    if (!(order.nm_id in countPerPartName)) {
      countPerPartName[order.nm_id] = 1;
    } else {
      countPerPartName[order.nm_id] += 1;
    }
  }

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
