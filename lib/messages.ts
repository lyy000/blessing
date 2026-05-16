export type Milestone = {
  id: string;
  reached: boolean;
  label: string;
};

const MILESTONE_THRESHOLDS: { id: string; min: number; label: string }[] = [
  {
    id: "first_warmth",
    min: 1,
    label: "第一声祝福已送达——愿曼桢的感冒快快好起来。",
  },
  {
    id: "gentle_breeze",
    min: 50,
    label: "暖意渐渐围着她，鼻塞和咳嗽也会轻一些吧。",
  },
  {
    id: "soft_recovery",
    min: 200,
    label: "这么多心念叠在一起，愿她今晚睡得更安稳。",
  },
  {
    id: "bright_day",
    min: 1000,
    label: "大家的心愿汇成晴天，愿她精神一点点回来。",
  },
  {
    id: "full_spring",
    min: 5000,
    label: "愿曼桢感冒痊愈，重新元气满满地奔跑。",
  },
];

export function milestonesForTotal(globalTotal: number): Milestone[] {
  return MILESTONE_THRESHOLDS.map((m) => ({
    id: m.id,
    reached: globalTotal >= m.min,
    label: m.label,
  }));
}

export function primaryEncouragement(globalTotal: number): string {
  if (globalTotal <= 0) {
    return "轻轻敲一敲木鱼，为曼桢送一句：感冒快快好起来。";
  }
  if (globalTotal < 20) {
    return "每一份祝福都在说——愿曼桢少咳几声、多喝温水、早点康复。";
  }
  if (globalTotal < 100) {
    return "大家的心愿叠起来了，愿她的感冒症状一天比一天轻。";
  }
  if (globalTotal < 500) {
    return "祝福越积越暖，愿曼桢早日退烧、恢复精神。";
  }
  return "这么多心念围着她，愿曼桢感冒痊愈，重新活蹦乱跳。";
}
