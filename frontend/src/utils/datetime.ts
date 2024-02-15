const REGEX_ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

const isIsoDateString = (value: unknown): value is string => {
  return value != null && typeof value === "string" && REGEX_ISO_DATE.test(value);
};

/**
 * body 内の全ての ISO Date 文字列を JS の Date に変換する．
 * body が object ではない場合は何もしない．
 * 再帰的に処理するので body がネストされたオブジェクトでも大丈夫．
 */
export const replaceAllIsoDateStrToJsDate = (body: unknown): void => {
  if (body === null || body === undefined || typeof body !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(body)) {
    if (isIsoDateString(value)) {
      // @ts-expect-error: [TS7053] Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'
      body[key] = new Date(value);
    } else if (typeof value === "object") {
      replaceAllIsoDateStrToJsDate(value);
    }
  }
};

export const fmtDate = (d: Date) => {
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const w = d.toLocaleDateString("ja", { weekday: "short" });
  return `${yyyy}-${mm}-${dd} (${w})`;
};

export const fmtTime = (d: Date) => {
  const HH = d.getHours().toString().padStart(2, "0");
  const MM = d.getMinutes().toString().padStart(2, "0");
  return `${HH}:${MM}`;
};

export const fmtDatetime = (d: Date) => {
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const w = d.toLocaleDateString("ja", { weekday: "short" });
  const HH = d.getHours().toString().padStart(2, "0");
  const MM = d.getMinutes().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd} (${w}) ${HH}:${MM}`;
};

export class Duration {
  /** ミリ秒単位の時間 */
  private readonly t: number;

  static readonly MILLI = 1;
  static readonly SECOND = Duration.MILLI * 1000;
  static readonly MINUTE = Duration.SECOND * 60;
  static readonly HOUR = Duration.MINUTE * 60;
  static readonly DAY = Duration.HOUR * 24;

  constructor(from: Date, to: Date) {
    this.t = to.getTime() - from.getTime();
  }

  days(): number {
    // ビット演算することで小数点以下の切り捨てをする
    return this.t / Duration.DAY | 0;
  }

  hours(): number {
    return this.t / Duration.HOUR | 0;
  }

  seconds(): number {
    return this.t / Duration.SECOND | 0;
  }

  hms(): [number, number, number] {
    let t = this.t;
    const h = t / Duration.HOUR | 0;
    t %= Duration.HOUR;

    const m = t / Duration.MINUTE | 0;
    t %= Duration.MINUTE;

    const s = t / Duration.SECOND | 0;
    return [h, m, s];
  }

  fmtHMS(hourMinDigits = 1): string {
    const [h, m, s] = this.hms();
    const paddedHour = h.toString().padStart(hourMinDigits, "0");
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${paddedHour}:${mm}:${ss}`;
  }

  static fromNumber(dur: bigint | number): Duration {
    if (typeof dur === "bigint") {
      if (dur > Number.MAX_SAFE_INTEGER) {
        throw new Error("cannot handle too big interger: " + dur);
      } else {
        dur = Number(dur);
      }
    }
    const now = new Date();
    return new Duration(now, new Date(now.getTime() + dur));
  }
}
