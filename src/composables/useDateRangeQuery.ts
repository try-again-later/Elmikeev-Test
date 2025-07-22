import { useRouteQuery } from "@vueuse/router";
import { parse as dateParse, format as dateFormat } from "date-fns";

export default function useDateRangeQuery() {
  const DATE_FORMAT = "yyyy-MM-dd";

  const dateFromQuery = useRouteQuery<string | null>("dateFrom");
  const dateFrom = computed<Date | null>({
    get() {
      if (dateFromQuery.value == null) {
        return null;
      }
      return dateParse(dateFromQuery.value, DATE_FORMAT, new Date());
    },
    set(value: Date | null) {
      if (value == null) {
        dateFromQuery.value = null;
      } else {
        dateFromQuery.value = dateFormat(value, DATE_FORMAT);
      }
    },
  });

  const dateToQuery = useRouteQuery<string | null>("dateTo");
  const dateTo = computed<Date | null>({
    get() {
      if (dateToQuery.value == null) {
        return null;
      }
      return dateParse(dateToQuery.value, DATE_FORMAT, new Date());
    },
    set(value: Date | null) {
      if (value == null) {
        dateToQuery.value = null;
      } else {
        dateToQuery.value = dateFormat(value, DATE_FORMAT);
      }
    },
  });

  watch(dateFrom, (newDateFrom) => {
    if (
      newDateFrom != null &&
      dateTo.value != null &&
      newDateFrom.getTime() > dateTo.value.getTime()
    ) {
      dateTo.value = newDateFrom;
    }
  });

  watch(dateTo, (newDateTo) => {
    if (
      newDateTo != null &&
      dateFrom.value != null &&
      dateFrom.value.getTime() > newDateTo.getTime()
    ) {
      dateFrom.value = newDateTo;
    }
  });

  return { dateFrom, dateTo };
}
