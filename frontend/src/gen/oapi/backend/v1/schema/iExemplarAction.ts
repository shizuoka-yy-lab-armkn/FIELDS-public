/**
 * Generated by orval v6.19.1 🍺
 * Do not edit manually.
 * Proficiv Backend API
 * OpenAPI spec version: 0.1.0
 */

/**
 * 熟練者をお手本とした各アクションの詳細
 */
export type IExemplarAction = {
  actionId: number;
  /** 最大値 (sec) */
  durMax: number;
  /** 平均値 (sec) */
  durMean: number;
  /** 中央値 (sec) */
  durMedian: number;
  /** 最小値 (sec) */
  durMin: number;
  /** 標準偏差 (sec) */
  durStd: number;
};
