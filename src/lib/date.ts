export const getToday = () => new Date();

export const getDefaultStartDate = () => {
  const today = getToday();
  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 4);
  return dateKey(defaultStart);
};

export const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const DEFAULT_START_DATE = getDefaultStartDate();
export const isValidDateKey = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && dateKey(date) === value;
};
export const displayDate = (
  value: string,
  options?: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat(
    "en-US",
    options ?? { month: "long", day: "numeric", year: "numeric" },
  ).format(new Date(`${value}T12:00:00`));
