/**
 * Generated by orval v6.19.1 🍺
 * Do not edit manually.
 * FIELDS Backend API
 * OpenAPI spec version: 0.1.0
 */
import type { ExemplarVideoSegment } from './exemplarVideoSegment';
import type { SubjectBrief } from './subjectBrief';

export type ExemplarVideo = {
  fps: number;
  id: string;
  segs: ExemplarVideoSegment[];
  slug: string;
  subject: SubjectBrief;
  videoUrl: string;
};
