import * as schema from "@/gen/oapi/backend/v1/schema";
import { fmtDatetime } from "@/utils/datetime";

export const fmtRecordName = (record: schema.Record): string => {
  const d = new Date(record.startedAt);
  return `[${record.username}] 収録 ${record.seq} - ${fmtDatetime(d)}`;
};

export const frameIndexToTimestamp = (frameIndex: number, fps: number): string => {
  const secs = frameIndex / fps | 0;
  const m = secs / 60 | 0;
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const frameDiffToSecDuration = (frameBegin: number, frameEnd: number, fps: number): string => {
  const secs = (frameEnd - frameBegin) / fps;
  return secs.toFixed(1);
};

export const calcScore = (v: {
  missingProccesCount: number;
  wrongOrderCount: number;
  userWorkSecs: number;
  maximumSpeedBonusSecs: number;
}) => {
  const baseline = 60;

  const cfg = {
    missingProcessPenalty: -20,
    wrongOrderPenalty: -5,
    noMistakeBonus: 10,
    speedBonusMaxPoints: 30,
    speedBonusSpanSecs: 60,
  } as const;

  const hasMistakes = v.missingProccesCount + v.wrongOrderCount > 0;

  const diff = Math.max(0, Math.min(cfg.speedBonusSpanSecs, v.userWorkSecs - v.maximumSpeedBonusSecs));
  const speedBonus = (1 - diff / cfg.speedBonusSpanSecs) * cfg.speedBonusMaxPoints;

  console.log("diff:", diff);
  console.log("speedBonus:", speedBonus);

  const detail = {
    baseline,
    missingProccesPenalty: cfg.missingProcessPenalty * v.missingProccesCount,
    wrongOrderPenalty: cfg.wrongOrderPenalty * v.wrongOrderCount,
    noMistakeBonus: hasMistakes ? 0 : cfg.noMistakeBonus,
    speedBonus,
  };

  const total = Object.values(detail).reduce((a, b) => a + b, 0);
  console.log("total:", total);

  return {
    total: Math.max(0, Math.min(100, total)),
    detail,
    cfg,
    input: v,
  };
};
