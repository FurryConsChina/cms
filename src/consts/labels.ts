export const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export const linkTypeLabels: Record<string, string> = {
  website: "官网",
  twitter: "Twitter / X",
  weibo: "微博",
  qq_group: "QQ 群",
  bilibili: "哔哩哔哩",
  rednote: "小红书",
  wikifur: "WikiFur",
  facebook: "Facebook",
  plurk: "Plurk",
  email: "邮箱",
  other: "其他",
};
