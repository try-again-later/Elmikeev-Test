import type { Order } from "@/api/order";

export default function orderAverageDiscountPerPartName(
  orders: Order[]
): Array<{ partName: number; averageDiscount: number }> {
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
