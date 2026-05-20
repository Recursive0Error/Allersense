const TWENTY_FOUR_HOUR_TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const TWELVE_HOUR_TIME_REGEX = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/;

const padTwo = (value: number) => value.toString().padStart(2, "0");

export function to12HourTime(value: string): string {
  const time = value.trim();
  if (!time) return "";

  const match24 = time.match(TWENTY_FOUR_HOUR_TIME_REGEX);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${padTwo(hour12)}:${padTwo(minutes)} ${suffix}`;
  }

  const match12 = time.match(TWELVE_HOUR_TIME_REGEX);
  if (match12) {
    const hours = Number(match12[1]);
    const minutes = Number(match12[2]);
    const suffix = match12[3].toUpperCase();
    return `${padTwo(hours)}:${padTwo(minutes)} ${suffix}`;
  }

  return value;
}

export function to24HourTime(value: string): string {
  const time = value.trim();
  if (!time) return "";

  const match24 = time.match(TWENTY_FOUR_HOUR_TIME_REGEX);
  if (match24) {
    return `${padTwo(Number(match24[1]))}:${match24[2]}`;
  }

  const match12 = time.match(TWELVE_HOUR_TIME_REGEX);
  if (match12) {
    const hours = Number(match12[1]);
    const minutes = match12[2];
    const suffix = match12[3].toUpperCase();

    let convertedHours = hours % 12;
    if (suffix === "PM") convertedHours += 12;

    return `${padTwo(convertedHours)}:${minutes}`;
  }

  return value;
}
