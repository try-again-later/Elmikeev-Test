import type { Order } from "@/api/order";

function getDiscountSumPerPartName(orders: Order[]) {
  const discountSumPerPartName: Record<
    number,
    { count: number; discountSum: number }
  > = {};

  for (const order of orders) {
    if (!(order.nm_id in discountSumPerPartName)) {
      discountSumPerPartName[order.nm_id] = {
        count: 1,
        discountSum: order.discount_percent,
      };
    } else {
      discountSumPerPartName[order.nm_id].count += 1;
      discountSumPerPartName[order.nm_id].discountSum += order.discount_percent;
    }
  }

  return discountSumPerPartName;
}

export default function orderAverageDiscountPerPartName(
  orders: Order[]
): Array<{ partName: number; averageDiscount: number }> {
  const discountSumPerPartName = getDiscountSumPerPartName(orders);

  // Sort in descending order
  const sortedCancelCounts = (
    Object.keys(discountSumPerPartName) as unknown as number[]
  ).map((partName) => ({
    partName,
    averageDiscount:
      discountSumPerPartName[partName].discountSum /
      discountSumPerPartName[partName].count,
  }));
  sortedCancelCounts.sort(
    (left, right) => right.averageDiscount - left.averageDiscount
  );

  return sortedCancelCounts;
}

export function compareOrderAverageDiscounts(
  previousOrders: Order[],
  currentOrders: Order[]
) {
  const previousDiscountSums = getDiscountSumPerPartName(previousOrders);
  const currentDiscountSums = getDiscountSumPerPartName(currentOrders);

  const partNames: Set<number> = new Set([
    ...(Object.keys(previousDiscountSums) as unknown as number[]),
    ...(Object.keys(currentDiscountSums) as unknown as number[]),
  ]);

  const averageDiscountChanges: Array<{
    partName: number;
    previousAverageDiscount: number;
    currentAverageDiscount: number;
    change: number;
  }> = [];
  for (const partName of partNames) {
    if (partName in previousDiscountSums && partName in currentDiscountSums) {
      const previousAverageDiscount =
        previousDiscountSums[partName].discountSum /
        previousDiscountSums[partName].count;

      const currentAverageDiscount =
        currentDiscountSums[partName].discountSum /
        currentDiscountSums[partName].count;

      averageDiscountChanges.push({
        partName,
        previousAverageDiscount,
        currentAverageDiscount,
        change:
          (currentAverageDiscount - previousAverageDiscount) /
            previousAverageDiscount || 0,
      });
    }
  }
  averageDiscountChanges.sort((left, right) => right.change - left.change);

  return averageDiscountChanges;
}
