import type { Income } from ".";
import { dateFilterFormat, type Links, type Meta } from "../Request";

type IncomesListRequestParams = {
  dateFrom: Date;
  dateTo: Date;
  page: number;
  limit: number;
};

export function incomesListRequestUrl(params: IncomesListRequestParams): URL {
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/incomes`);
  url.searchParams.append("dateFrom", dateFilterFormat(params.dateFrom));
  url.searchParams.append("dateTo", dateFilterFormat(params.dateTo));
  url.searchParams.append("page", params.page.toString());
  url.searchParams.append("limit", params.limit.toString());
  url.searchParams.append("key", import.meta.env.VITE_API_KEY);

  return url;
}

export type IncomesListResponse = {
  data: Income[];
  links: Links;
  meta: Meta;
};
