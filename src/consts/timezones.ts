const commonTimezones: Record<string, string> = {
  "Asia/Shanghai": "中国大陆",
  "Asia/Hong_Kong": "香港",
  "Asia/Macau": "澳门",
  "Asia/Taipei": "台湾",
  "Asia/Tokyo": "日本",
  "Asia/Seoul": "韩国",
  "Asia/Singapore": "新加坡",
  "Asia/Bangkok": "泰国",
  "Europe/London": "英国",
  "America/New_York": "美国东部",
  "America/Los_Angeles": "美国西部",
  "Australia/Sydney": "悉尼",
  UTC: "协调世界时",
};

const intl = Intl as typeof Intl & { supportedValuesOf?: (key: "timeZone") => string[] };

export const timezoneOptions = [
  ...new Set([...Object.keys(commonTimezones), ...(intl.supportedValuesOf?.("timeZone") ?? [])]),
].map((value) => ({
  value,
  label: commonTimezones[value] ? `${commonTimezones[value]}（${value}）` : value,
}));
