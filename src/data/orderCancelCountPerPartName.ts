import type { Order } from "@/api/order";

export default function orderCancelCountPerPartName(
  orders: Order[]
): Array<{ partName: number; cancelCount: number }> {
  const cancelCountPerPartName: Record<number, number> = {};
  for (const order of orders) {
    if (order.is_cancel) {
      if (!(order.nm_id in cancelCountPerPartName)) {
        cancelCountPerPartName[order.nm_id] = 1;
      } else {
        cancelCountPerPartName[order.nm_id] += 1;
      }
    }
  }

  // Sort in descending order
  const sortedCancelCounts = (
    Object.keys(cancelCountPerPartName) as unknown as number[]
  ).map((partName) => ({
    partName,
    cancelCount: cancelCountPerPartName[partName],
  }));
  sortedCancelCounts.sort(
    (left, right) => right.cancelCount - left.cancelCount
  );

  return sortedCancelCounts;
}
