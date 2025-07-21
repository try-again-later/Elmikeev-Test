export type Links = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type Meta = {
  current_page: number;
  from: number | null;
  to: number | null;
  last_page: number;
  total: number;
};

export function dateFilterFormat(date: Date): string {
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return [year, month, day].join("-");
}
