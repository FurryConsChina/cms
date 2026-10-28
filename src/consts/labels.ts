import type { ContactLinkType } from "@/types/contactLink";

export const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export const linkTypeLabels: Record<ContactLinkType, string> = {
  website: "官网",
  twitter: "Twitter / X",
  weibo: "微博",
  qq_group: "QQ 群",
  bilibili: "哔哩哔哩",
  rednote: "小红书",
  wikifur: "WikiFur",
  facebook: "Facebook",
  plurk: "Plurk",
};

export const mediaRoleLabels: Record<string, string> = {
  cover: "封面",
  poster: "海报",
  gallery: "相册",
  videos: "视频",
  lives: "直播",
  logo: "标志",
  avatar: "头像",
  portrait: "形象图",
};

export const mediaOwnerLabels: Record<string, string> = {
  event: "活动",
  organization: "组织",
  profile: "主体资料",
  event_participation: "参加记录",
};

export const targetTypeLabels: Record<string, string> = {
  application: "应用",
  event: "活动",
  event_feature: "活动标签",
  event_benefit: "活动权益",
  event_participation: "参加记录",
  offer: "票档",
  feedback: "反馈",
  infrastructure: "基础设施",
  infra: "基础设施",
  media: "媒体",
  media_asset: "媒体资源",
  organization: "组织",
  organization_claim: "组织认领",
  organization_invitation: "组织邀请",
  organization_member: "组织成员",
  place: "地点",
  profile: "主体资料",
  profile_claim: "主体认领",
  profile_invitation: "主体邀请",
  profile_member: "主体成员",
  region: "地区",
  user: "用户",
  auth: "账户",
};

const auditVerbLabels: Record<string, string> = {
  created: "创建",
  updated: "更新",
  update: "更新",
  deleted: "删除",
  visibility_changed: "修改可见性",
  claim_requested: "申请认领",
  claim_reviewed: "审核认领",
  invitation_created: "发出邀请",
  invitation_accepted: "接受邀请",
  invitation_revoked: "撤销邀请",
  usages_replaced: "更新绑定",
  cache_cleaned: "清理缓存",
  sitemap_refreshed: "刷新站点地图",
  sitemap_generated: "生成站点地图",
  password_changed: "修改密码",
  password_reset: "重置密码",
};

export const auditActionLabel = (action: string) => {
  const [target, verb] = action.split(".");
  if (!verb) return auditVerbLabels[target] ?? action;
  return `${auditVerbLabels[verb] ?? verb}${targetTypeLabels[target] ?? target}`;
};
