import type { Order } from ".";
import { dateFilterFormat, type Links, type Meta } from "../Request";

type OrdersListRequestParams = {
  dateFrom: Date;
  dateTo: Date;
  page: number;
  limit: number;
};

export function ordersListRequestUrl(params: OrdersListRequestParams): URL {
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/orders`);
  url.searchParams.append("dateFrom", dateFilterFormat(params.dateFrom));
  url.searchParams.append("dateTo", dateFilterFormat(params.dateTo));
  url.searchParams.append("page", params.page.toString());
  url.searchParams.append("limit", params.limit.toString());
  url.searchParams.append("key", import.meta.env.VITE_API_KEY);

  return url;
}

export type OrdersListResponse = {
  data: Order[];
  links: Links;
  meta: Meta;
};
