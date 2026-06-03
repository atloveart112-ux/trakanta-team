/**
 * Date helpers (week-aligned to Monday).
 */

export function pad(n: number) {
  return n < 10 ? "0" + n : "" + n;
}

export function ymd(d: Date) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function startOfWeek(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
}

export function dateOfWeekday(weekStart: Date, dow: number) {
  const offset = (dow + 6) % 7;
  const x = new Date(weekStart);
  x.setDate(x.getDate() + offset);
  return x;
}

export function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
