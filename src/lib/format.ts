const rules = new Intl.PluralRules("en-US");

// "1 report", "2 reports". Pass the plural form when adding "s" is wrong.
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count.toLocaleString("en-US")} ${rules.select(count) === "one" ? singular : pluralForm}`;
}

// A limit in plain words: "Resets in 3 hours". Rounds up, so the user never waits longer than it says.
export function resetsIn(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  if (minutes < 60) return `Resets in ${plural(minutes, "minute")}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Resets in ${plural(hours, "hour")}`;
  return `Resets in ${plural(Math.ceil(hours / 24), "day")}`;
}
