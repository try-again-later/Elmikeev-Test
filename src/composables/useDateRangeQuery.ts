import { useRouteQuery } from "@vueuse/router";
import { parse as dateParse, format as dateFormat } from "date-fns";
import { type Ref } from "vue";

export default function useDateRangeQuery(
  dateFrom: Ref<Date | null>,
  dateTo: Ref<Date | null>
) {
  const DATE_FORMAT = "yyyy-MM-dd";

  const dateFromQuery = useRouteQuery<string | null>("dateFrom");
  if (dateFrom.value == null && dateFromQuery.value != null) {
    dateFrom.value = dateParse(dateFromQuery.value, DATE_FORMAT, new Date());
  }

  const dateToQuery = useRouteQuery<string | null>("dateTo");
  if (dateTo.value == null && dateToQuery.value != null) {
    dateTo.value = dateParse(dateToQuery.value, DATE_FORMAT, new Date());
  }

  watch(dateFrom, (newDateFrom) => {
    if (
      newDateFrom != null &&
      dateTo.value != null &&
      newDateFrom.getTime() > dateTo.value.getTime()
    ) {
      dateTo.value = newDateFrom;
    }
  });
  watchEffect(() => {
    if (dateFrom.value == null) {
      dateFromQuery.value = null;
    } else {
      dateFromQuery.value = dateFormat(dateFrom.value, DATE_FORMAT);
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
  watchEffect(() => {
    if (dateTo.value == null) {
      dateToQuery.value = null;
    } else {
      dateToQuery.value = dateFormat(dateTo.value, DATE_FORMAT);
    }
  });
}
