const REGEX_ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

const isIsoDateString = (value: any): value is string => {
  return value && typeof value === "string" && REGEX_ISO_DATE.test(value);
};

/**
 * body 内の全ての ISO Date 文字列を JS の Date に変換する．
 * body が object ではない場合は何もしない．
 * 再帰的に処理するので body がネストされたオブジェクトでも大丈夫．
 */
export const replaceAllIsoDateStrToJsDate = (body: any): void => {
  if (body === null || body === undefined || typeof body !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(body)) {
    if (isIsoDateString(value)) {
      body[key] = new Date(value);
    } else if (typeof value === "object") {
      replaceAllIsoDateStrToJsDate(value);
    }
  }
};
