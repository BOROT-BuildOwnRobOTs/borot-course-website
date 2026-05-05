// Pure-value enums + types for the 3D-print domain.
// Lives outside models/ so client components can import these constants without
// pulling Mongoose (and the Node-only `net`/`child_process` it depends on)
// into the browser bundle. The Mongoose schemas in models/ re-export from here.

export const PRINT_ORDER_STATUSES = [
  'pending_review',
  'quoted',
  'waiting_payment',
  'paid',
  'slicing',
  'in_queue',
  'printing',
  'post_processing',
  'ready_for_pickup',
  'shipping',
  'completed',
  'failed',
  'revision_needed',
] as const
export type PrintOrderStatus = (typeof PRINT_ORDER_STATUSES)[number]

export const PRINT_MATERIALS = ['pla', 'pla_matte', 'petg', 'tpu', 'abs'] as const
export type PrintMaterial = (typeof PRINT_MATERIALS)[number]

export type PrintPriority = 'standard' | 'express'
export type DeliveryMethod = 'pickup' | 'kerry' | 'flash' | 'ems'
export type PaymentMethod = 'promptpay' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected'

export const PRINT_JOB_STATUSES = ['queued', 'printing', 'done', 'failed', 'paused'] as const
export type PrintJobStatus = (typeof PRINT_JOB_STATUSES)[number]
