import { z } from 'zod';

export const segmentStatusSchema = z.enum(['active', 'recovered', 'partial']);
export const causeIdSchema = z.enum([
  'deleted',
  'overwritten',
  'power_cut',
  'disconnected',
  'motion_schedule',
  'disk_error',
  'time_changed',
]);

export const caseSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['new', 'processing', 'ready']),
  createdAt: z.string().optional().default(''),
  recorderCount: z.number().optional().default(0),
  cameraCount: z.number().optional().default(0),
  incidentTime: z.string().optional(),
  notes: z.string().optional().default(''),
  sha256: z.string().optional().default(''),
});

export const recorderSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  brand: z.string(),
  adapterUsed: z.string().optional().default('generic'),
  imageHash: z.string(),
  hashVerifiedAt: z.string().optional(),
  acquiredAt: z.string(),
  fileSizeMb: z.number().optional(),
});

export const cameraSchema = z.object({
  id: z.string(),
  recorderId: z.string().optional().default(''),
  channel: z.number(),
  locationName: z.string(),
  clockOffsetS: z.number().default(0),
  offsetErrorS: z.number().default(0),
  status: z.enum(['ok', 'gaps', 'offset_uncertain']),
});

export const segmentSchema = z.object({
  id: z.string(),
  cameraId: z.string(),
  startOriginal: z.string(),
  startCorrected: z.string(),
  durationS: z.number(),
  status: segmentStatusSchema,
  method: z.enum(['index', 'carved']),
  hash: z.string(),
  clipUrl: z.string().optional().default(''),
});

export const causeCandidateSchema = z.object({
  cause: causeIdSchema,
  confidence: z.number(),
  supports: z.array(z.string()).default([]),
  contradicts: z.array(z.string()).default([]),
});

export const gapSchema = z.object({
  id: z.string(),
  cameraId: z.string(),
  start: z.string(),
  end: z.string(),
  durationS: z.number().optional().default(0),
  candidates: z.array(causeCandidateSchema).default([]),
  verdict: z.union([causeIdSchema, z.literal('undetermined')]),
  investigatorNotes: z.string().optional().default(''),
  reviewStatus: z.enum(['unreviewed', 'reviewed', 'disputed', 'accepted']).optional().default('unreviewed'),
});

export const detectionSchema = z.object({
  id: z.string(),
  cameraId: z.string(),
  timeCorrected: z.string(),
  label: z.string(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  thumbnailUrl: z.string(),
  frameRef: z.string(),
  sourceHash: z.string(),
  confidence: z.number().optional(),
});

export const searchResultSchema = z.object({
  detection: detectionSchema,
  similarity: z.number(),
  order: z.number(),
});

export const metricsSchema = z.object({
  recoveryRate: z.object({
    recovered: z.number(),
    known: z.number(),
    partial: z.number().optional(),
  }),
  alignmentErrorS: z.array(
    z.object({
      camera: z.string(),
      value: z.number(),
    })
  ),
  processing: z.object({
    minutesPerSecond: z.number(),
    totalDurationS: z.number().optional(),
  }),
  falsePositiveRate: z.object({
    incorrect: z.number(),
    total: z.number(),
  }),
  hashVerified: z.object({
    verified: z.number(),
    total: z.number(),
  }),
  traceability: z.object({
    linked: z.number(),
    total: z.number(),
  }),
});
