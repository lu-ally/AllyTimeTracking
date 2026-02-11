export interface PublicHoliday {
  date: string; // "YYYY-MM-DD"
  name: string;
}

export type GermanState =
  | "BW" | "BY" | "BE" | "BB" | "HB" | "HH"
  | "HE" | "MV" | "NI" | "NW" | "RP" | "SL"
  | "SN" | "ST" | "SH" | "TH";

function getEasterSunday(year: number): Date {
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
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getPublicHolidays(
  year: number,
  state: GermanState | string = "HH"
): PublicHoliday[] {
  const easter = getEasterSunday(year);
  const holidays: PublicHoliday[] = [];

  // Bundesweite feste Feiertage
  holidays.push(
    { date: `${year}-01-01`, name: "Neujahr" },
    { date: `${year}-05-01`, name: "Tag der Arbeit" },
    { date: `${year}-10-03`, name: "Tag der Deutschen Einheit" },
    { date: `${year}-12-25`, name: "1. Weihnachtstag" },
    { date: `${year}-12-26`, name: "2. Weihnachtstag" },
  );

  // Bundesweite bewegliche Feiertage (osterabhaengig)
  holidays.push(
    { date: formatDate(addDays(easter, -2)), name: "Karfreitag" },
    { date: formatDate(addDays(easter, 1)), name: "Ostermontag" },
    { date: formatDate(addDays(easter, 39)), name: "Christi Himmelfahrt" },
    { date: formatDate(addDays(easter, 50)), name: "Pfingstmontag" },
  );

  // Landesspezifische Feiertage
  const stateHolidays: Record<string, () => PublicHoliday[]> = {
    epiphany: () => [
      { date: `${year}-01-06`, name: "Heilige Drei Koenige" },
    ],
    corpusChristi: () => [
      { date: formatDate(addDays(easter, 60)), name: "Fronleichnam" },
    ],
    assumption: () => [
      { date: `${year}-08-15`, name: "Mariä Himmelfahrt" },
    ],
    reformationDay: () => [
      { date: `${year}-10-31`, name: "Reformationstag" },
    ],
    allSaints: () => [
      { date: `${year}-11-01`, name: "Allerheiligen" },
    ],
    repentanceDay: () => {
      // Mittwoch vor dem 23. November
      const nov23 = new Date(year, 10, 23);
      const dayOfWeek = nov23.getDay();
      const offset = dayOfWeek >= 3 ? dayOfWeek - 3 : dayOfWeek + 4;
      return [
        { date: formatDate(addDays(nov23, -offset)), name: "Buss- und Bettag" },
      ];
    },
    worldChildrensDay: () => [
      { date: `${year}-09-20`, name: "Weltkindertag" },
    ],
    womensDay: () => [
      { date: `${year}-03-08`, name: "Internationaler Frauentag" },
    ],
  };

  const stateMap: Record<GermanState, string[]> = {
    BW: ["epiphany", "corpusChristi", "allSaints"],
    BY: ["epiphany", "corpusChristi", "assumption", "allSaints"],
    BE: ["womensDay"],
    BB: ["reformationDay"],
    HB: ["reformationDay"],
    HH: ["reformationDay"],
    HE: ["corpusChristi"],
    MV: ["reformationDay", "womensDay"],
    NI: ["reformationDay"],
    NW: ["corpusChristi", "allSaints"],
    RP: ["corpusChristi", "allSaints"],
    SL: ["corpusChristi", "assumption", "allSaints"],
    SN: ["reformationDay", "repentanceDay"],
    ST: ["epiphany", "reformationDay"],
    SH: ["reformationDay"],
    TH: ["reformationDay", "worldChildrensDay"],
  };

  const additionalKeys = stateMap[state as GermanState] || stateMap["HH"];
  for (const key of additionalKeys) {
    if (stateHolidays[key]) {
      holidays.push(...stateHolidays[key]());
    }
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

export function isPublicHoliday(
  date: Date,
  state: GermanState | string = "HH"
): PublicHoliday | undefined {
  const year = date.getFullYear();
  const holidays = getPublicHolidays(year, state);
  const dateStr = formatDate(date);
  return holidays.find((h) => h.date === dateStr);
}

export function formatDateStr(date: Date): string {
  return formatDate(date);
}
