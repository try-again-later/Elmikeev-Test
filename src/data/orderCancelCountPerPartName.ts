import type { Order } from "@/api/order";

function getCancelCountPerPartName(orders: Order[]) {
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

  return cancelCountPerPartName;
}

export default function orderCancelCountPerPartName(
  orders: Order[]
): Array<{ partName: number; cancelCount: number }> {
  const cancelCountPerPartName = getCancelCountPerPartName(orders);

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

export function compareOrderCancelCounts(
  previousOrders: Order[],
  currentOrders: Order[]
) {
  const previousCancelCounts = getCancelCountPerPartName(previousOrders);
  const currentCancelCounts = getCancelCountPerPartName(currentOrders);

  const partNames: Set<number> = new Set([
    ...(Object.keys(previousCancelCounts) as unknown as number[]),
    ...(Object.keys(currentCancelCounts) as unknown as number[]),
  ]);

  const cancelCountChanges: Array<{
    partName: number;
    previousCancelCount: number;
    currentCancelCount: number;
    change: number;
  }> = [];
  for (const partName of partNames) {
    if (partName in previousCancelCounts && partName in currentCancelCounts) {
      cancelCountChanges.push({
        partName,
        previousCancelCount: previousCancelCounts[partName],
        currentCancelCount: currentCancelCounts[partName],
        change:
          (currentCancelCounts[partName] - previousCancelCounts[partName]) /
            previousCancelCounts[partName] || 0,
      });
    }
  }
  cancelCountChanges.sort((left, right) => right.change - left.change);

  return cancelCountChanges;
}
