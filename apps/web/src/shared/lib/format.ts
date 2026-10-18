const numberFormat = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 1,
});

const preciseFormat = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 2,
});

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPercent(value: number): string {
  return `${numberFormat.format(value)} %`;
}

export function formatMb(mb: number): string {
  if (mb >= 1024) {
    return `${preciseFormat.format(mb / 1024)} ГБ`;
  }
  return `${numberFormat.format(mb)} МБ`;
}

export function formatGb(gb: number): string {
  return `${numberFormat.format(gb)} ГБ`;
}

export function formatRate(mbps: number): string {
  return `${numberFormat.format(mbps)} Мбіт/с`;
}

export function formatUptime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (days > 0) return `${days} дн ${hours} год`;
  if (hours > 0) return `${hours} год ${minutes} хв`;
  if (minutes > 0) return `${minutes} хв`;
  return `${total} с`;
}

export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const relativeDateFormat = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const clockTimeFormat = new Intl.DateTimeFormat("uk-UA", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function formatRelativeTime(at: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - at) / 1000));

  if (seconds < 10) return "щойно";
  if (seconds < 60) return `${seconds} с тому`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} хв тому`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год тому`;

  return relativeDateFormat.format(at);
}

export function formatClockTime(at: number): string {
  return clockTimeFormat.format(at);
}
