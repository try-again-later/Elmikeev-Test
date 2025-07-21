import type { Sale } from ".";
import { dateFilterFormat, type Links, type Meta } from "../Request";

type SalesListRequestParams = {
  dateFrom: Date;
  dateTo: Date;
  page: number;
  limit: number;
};

export function salesListRequestUrl(params: SalesListRequestParams): URL {
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/sales`);
  url.searchParams.append("dateFrom", dateFilterFormat(params.dateFrom));
  url.searchParams.append("dateTo", dateFilterFormat(params.dateTo));
  url.searchParams.append("page", params.page.toString());
  url.searchParams.append("limit", params.limit.toString());
  url.searchParams.append("key", import.meta.env.VITE_API_KEY);

  return url;
}

export type SalesListResponse = {
  data: Sale[];
  links: Links;
  meta: Meta;
};
