export function formatLocalizedDate(
  value,
  locale = "en",
  { includeTime = false } = {},
) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const normalizedLocale =
    locale === "ar" ? "ar-EG-u-nu-latn" : "en-US-u-nu-latn";

  const datePart = new Intl.DateTimeFormat(normalizedLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  if (!includeTime) return datePart;

  const timePart = new Intl.DateTimeFormat(normalizedLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${datePart} ${timePart}`;
}
