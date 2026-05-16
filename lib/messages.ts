export type Milestone = {
  id: string;
  reached: boolean;
  label: string;
};

const MILESTONE_THRESHOLDS: { id: string; min: number; label: string }[] = [
  {
    id: "first_warmth",
    min: 1,
    label: "第一缕心念已抵达，像阳光落在被角上那样轻。",
  },
  {
    id: "gentle_breeze",
    min: 50,
    label: "风也变得温柔了，好像有人在替她掖好被角。",
  },
  {
    id: "soft_recovery",
    min: 200,
    label: "祝福叠成软软的云，她的呼吸也会更平稳一点。",
  },
  {
    id: "bright_day",
    min: 1000,
    label: "大家的心意汇成一片晴朗，她会一天比一天更有力气。",
  },
  {
    id: "full_spring",
    min: 5000,
    label: "春天好像提前来了——愿她早日回到元气满满的日子。",
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
    return "轻轻点一下木鱼，把你的祝福送给她吧。";
  }
  if (globalTotal < 20) {
    return "每一份祝福都像温水，会让她更舒服一点点。";
  }
  if (globalTotal < 100) {
    return "有了你们的心念，她的世界更亮、更暖了一些。";
  }
  if (globalTotal < 500) {
    return "祝福在悄悄累积——她会感受到这份柔软的力量的。";
  }
  return "这么多温柔的心愿围着她，她一定会更快好起来。";
}
