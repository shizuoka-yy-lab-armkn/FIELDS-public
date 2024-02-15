import * as schema from "@/gen/oapi/backend/v1/schema";

export class RecordSegmentAggrLite {
  readonly opstepId: string;

  readonly opstepOrd: number;
  readonly displayNo: number;
  readonly shortName: string;
  readonly longName: string;
  readonly referenceDurSec: number;

  protected readonly fps: number;
  readonly beginSec: number;
  readonly endSec: number;

  get beginFrame(): number {
    return this.beginSec * this.fps;
  }

  get endFrame(): number {
    return this.endSec * this.fps;
  }

  get durSec(): number {
    return this.endSec - this.beginSec;
  }

  isTooLongDur(): boolean {
    return this.durSec > this.referenceDurSec * 2;
  }

  isAllowableDur(): boolean {
    return this.durSec < this.referenceDurSec * 1.2;
  }

  constructor(
    seg: { begin?: number; end?: number },
    opstep: schema.ActionMeta,
    fps: number,
  ) {
    this.opstepId = opstep.id;
    this.opstepOrd = opstep.ordSerial;
    this.displayNo = opstep.displayNo;
    this.shortName = opstep.shortName;
    this.longName = opstep.longName;
    this.referenceDurSec = opstep.masterDurMean;

    this.fps = fps;
    this.beginSec = (seg.begin ?? 0) / fps;
    this.endSec = (seg.end ?? 0) / fps;
  }
}

export type RecordSegmentType = schema.Segment["type"];

export class RecordSegmentAggr extends RecordSegmentAggrLite {
  public readonly type: RecordSegmentType;
  public readonly likelihood: number;

  constructor(
    seg: { type: RecordSegmentType; begin?: number; end?: number; likelihood?: number },
    opstep: schema.ActionMeta,
    fps: number,
  ) {
    super(seg, opstep, fps);
    this.type = seg.type;
    this.likelihood = seg.likelihood ?? 0;
  }
}
