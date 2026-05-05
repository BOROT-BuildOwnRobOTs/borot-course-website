import type { PrintMaterial, PrintPriority } from '@/lib/print-enums'

export interface PricingConfig {
  materialRatesThbPerGram: Record<PrintMaterial, number>
  machineRateThbPerHour: number
  setupFeeThb: number
  failureBufferPct: number     // e.g. 0.08 = 8%
  marginMultiplier: number     // e.g. 1.4
  expressMultiplier: number    // e.g. 1.5
  minOrderThb: number
}

// MVP defaults. Move to a Mongo-backed config doc in phase 2 so admin can edit without a deploy.
export const DEFAULT_PRICING: PricingConfig = {
  materialRatesThbPerGram: {
    pla: 2.5,
    pla_matte: 3.0,
    petg: 3.5,
    tpu: 5.0,
    abs: 3.5,
  },
  machineRateThbPerHour: 30,
  setupFeeThb: 50,
  failureBufferPct: 0.08,
  marginMultiplier: 1.4,
  expressMultiplier: 1.5,
  minOrderThb: 100,
}

// Approximate filament density (g/cm³) — used when estimating weight from volume.
export const MATERIAL_DENSITY_G_PER_CM3: Record<PrintMaterial, number> = {
  pla: 1.24,
  pla_matte: 1.27,
  petg: 1.27,
  tpu: 1.21,
  abs: 1.04,
}

export interface QuoteInput {
  material: PrintMaterial
  layerHeightMm: 0.12 | 0.20 | 0.28
  infillPct: number
  quantity: number
  priority: PrintPriority
  // From slicer (phase 2) or admin estimate
  estWeightG?: number
  estTimeMin?: number
  // From mesh parse (phase 2) — only used if estWeightG missing
  volumeCm3?: number
  supportComplexity?: 0 | 1 | 2
}

export interface QuoteBreakdown {
  weightG: number
  timeMin: number
  materialCost: number
  machineCost: number
  setupFee: number
  supportFee: number
  buffered: number              // (sum) * (1 + failureBufferPct)
  withMargin: number            // buffered * marginMultiplier
  priorityMul: number
  unitPrice: number             // final per-unit
  lineTotal: number             // unitPrice * quantity
  autoQuote: boolean            // false if model requires admin review
}

/**
 * Compute a price quote. In MVP this is **only used as a starting suggestion**
 * — admin reviews every order and may override. The same function will drive
 * fully-automatic quotes once the slicer worker is wired up in phase 2.
 */
export function computeQuote(input: QuoteInput, cfg: PricingConfig = DEFAULT_PRICING): QuoteBreakdown {
  // 1. Estimate weight if not provided
  let weightG = input.estWeightG ?? 0
  if (!weightG && input.volumeCm3) {
    const density = MATERIAL_DENSITY_G_PER_CM3[input.material]
    // Rough infill weighting: ~15% shell + scaled infill volume
    const infillFactor = 0.15 + 0.85 * (input.infillPct / 100)
    weightG = input.volumeCm3 * density * infillFactor
  }

  // 2. Estimate time, applying layer-height multiplier (thinner = slower)
  const layerMul = ({ 0.12: 1.5, 0.2: 1.0, 0.28: 0.8 } as const)[input.layerHeightMm] ?? 1.0
  const timeMin = (input.estTimeMin ?? 0) * layerMul
  const timeHr = timeMin / 60

  // 3. Cost components
  const materialCost = weightG * cfg.materialRatesThbPerGram[input.material]
  const machineCost = timeHr * cfg.machineRateThbPerHour
  const setupFee = cfg.setupFeeThb
  const supportFee = (input.supportComplexity ?? 0) * cfg.setupFeeThb * 0.3

  // 4. Buffer + margin
  const subtotal = materialCost + machineCost + setupFee + supportFee
  const buffered = subtotal * (1 + cfg.failureBufferPct)
  const withMargin = buffered * cfg.marginMultiplier

  // 5. Priority + minimum
  const priorityMul = input.priority === 'express' ? cfg.expressMultiplier : 1
  const unitPrice = Math.max(withMargin * priorityMul, cfg.minOrderThb)
  const lineTotal = unitPrice * input.quantity

  // 6. Flag complex jobs for admin review
  const autoQuote =
    (input.supportComplexity ?? 0) < 2 &&
    weightG > 0 &&
    timeMin > 0

  return {
    weightG: round(weightG, 1),
    timeMin: Math.round(timeMin),
    materialCost: round(materialCost, 2),
    machineCost: round(machineCost, 2),
    setupFee,
    supportFee: round(supportFee, 2),
    buffered: round(buffered, 2),
    withMargin: round(withMargin, 2),
    priorityMul,
    unitPrice: round(unitPrice, 2),
    lineTotal: round(lineTotal, 2),
    autoQuote,
  }
}

function round(n: number, d: number): number {
  const f = 10 ** d
  return Math.round(n * f) / f
}
