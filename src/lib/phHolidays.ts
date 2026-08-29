import { dateKey } from "./date";

export interface HolidaySeed {
  date: string;
  label: string;
}

// Meeus/Jones/Butcher Gregorian algorithm for Easter Sunday.
function computeEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function lastMondayOfAugust(year: number): Date {
  const lastDay = new Date(year, 8, 0); // day 0 of Sept = last day of Aug
  const dow = lastDay.getDay(); // 0 = Sunday
  const offsetFromMonday = (dow + 6) % 7;
  return addDays(lastDay, -offsetFromMonday);
}

/**
 * Regular Philippine holidays for a given year (Republic Act 9492 list).
 * Movable dates (Holy Week, National Heroes Day) are computed, not hardcoded.
 * Special non-working holidays declared yearly by presidential proclamation
 * (e.g. extra bridge holidays) are NOT included here since they can't be
 * predicted — those can be added manually in Settings.
 */
export function getPhRegularHolidays(year: number): HolidaySeed[] {
  const easter = computeEasterSunday(year);
  const maundyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const heroesDay = lastMondayOfAugust(year);

  return [
    { date: dateKey(new Date(year, 0, 1)), label: "New Year's Day" },
    { date: dateKey(maundyThursday), label: "Maundy Thursday" },
    { date: dateKey(goodFriday), label: "Good Friday" },
    { date: dateKey(new Date(year, 3, 9)), label: "Araw ng Kagitingan" },
    { date: dateKey(new Date(year, 4, 1)), label: "Labor Day" },
    { date: dateKey(new Date(year, 5, 12)), label: "Independence Day" },
    { date: dateKey(heroesDay), label: "National Heroes Day" },
    { date: dateKey(new Date(year, 10, 30)), label: "Bonifacio Day" },
    { date: dateKey(new Date(year, 11, 25)), label: "Christmas Day" },
    { date: dateKey(new Date(year, 11, 30)), label: "Rizal Day" },
  ];
}
