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

export const fmtDatetime = (d: Date) => {
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const w = d.toLocaleDateString("ja", { weekday: "short" });
  const HH = d.getHours().toString().padStart(2, "0");
  const MM = d.getMinutes().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd} (${w}) ${HH}:${MM}`;
};
