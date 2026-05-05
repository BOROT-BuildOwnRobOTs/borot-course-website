// Rough client-side price estimation for the customer-facing /print page.
//
// Uses the model's mesh volume + surface area (computed from the loaded
// BufferGeometry) plus per-material print-rate heuristics. The weight model
// approximates real slicer behavior:
//   filament_volume ≈ shell_volume + interior_volume × infillRatio
//   shell_volume    ≈ surfaceArea × shellThickness   (capped at V)
//
// where shellThickness lumps together perimeter walls, top/bottom solid
// layers, and first-layer extra. A constant ~0.20 cm matches Bambu/Prusa
// "Standard" profiles for typical small-to-medium parts within ~15%.
//
// Final price is always set by admin in the Orders dashboard — phase 2 will
// replace this with PrusaSlicer CLI numbers.

// Type-only import — keeps three out of any client bundle that only needs the
// price helpers. The viewer (which actually uses three at runtime) imports
// three itself.
import type * as THREE from 'three'
import {
  computeQuote,
  DEFAULT_PRICING,
  MATERIAL_DENSITY_G_PER_CM3,
  type PricingConfig,
  type QuoteBreakdown,
} from '@/lib/pricing'
import type { PrintMaterial, PrintPriority } from '@/lib/print-enums'

// Print throughput at 0.2 mm baseline, tuned to modern fast printers
// (Bambu X1/P1, Prusa MK4). Layer-height adjustment is applied inside
// computeQuote() via its layerMul lookup.
const PRINT_RATE_G_PER_HOUR: Record<PrintMaterial, number> = {
  pla: 25,
  pla_matte: 23,
  petg: 20,
  tpu: 10,
  abs: 20,
}

// Effective shell thickness in cm. Lumps together: outer perimeters (2 × 0.4 mm),
// top/bottom solid layers (~3 × layer height), and first-layer thickness.
// Tunable; 0.20 cm matches Bambu Studio "Standard" profiles to within ~15% for
// typical small-to-medium parts at 20% infill.
const SHELL_THICKNESS_CM = 0.20

// ─── Geometry helpers ────────────────────────────────────────────────────────

/** Volume of a closed triangle mesh via signed tetrahedra (returns mm³). */
export function bufferGeometryVolumeMm3(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position
  if (!pos) return 0

  const idx = geometry.index
  let volume = 0

  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2)
      volume += signedTetVolume(
        pos.getX(a), pos.getY(a), pos.getZ(a),
        pos.getX(b), pos.getY(b), pos.getZ(b),
        pos.getX(c), pos.getY(c), pos.getZ(c),
      )
    }
  } else {
    for (let i = 0; i < pos.count; i += 3) {
      volume += signedTetVolume(
        pos.getX(i),     pos.getY(i),     pos.getZ(i),
        pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1),
        pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2),
      )
    }
  }
  return Math.abs(volume)
}

/** Surface area of a triangle mesh — sum of triangle areas (returns mm²). */
export function bufferGeometrySurfaceAreaMm2(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position
  if (!pos) return 0
  const idx = geometry.index
  let area = 0
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2)
      area += triangleArea(
        pos.getX(a), pos.getY(a), pos.getZ(a),
        pos.getX(b), pos.getY(b), pos.getZ(b),
        pos.getX(c), pos.getY(c), pos.getZ(c),
      )
    }
  } else {
    for (let i = 0; i < pos.count; i += 3) {
      area += triangleArea(
        pos.getX(i),     pos.getY(i),     pos.getZ(i),
        pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1),
        pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2),
      )
    }
  }
  return area
}

/** Sum the volumes of every Mesh inside an Object3D tree (for OBJ groups). */
export function object3DVolumeMm3(obj: THREE.Object3D): number {
  let total = 0
  obj.traverse((child) => {
    const m = child as THREE.Mesh
    if (m.isMesh && m.geometry) total += bufferGeometryVolumeMm3(m.geometry)
  })
  return total
}

/** Sum the surface areas of every Mesh inside an Object3D tree (for OBJ groups). */
export function object3DSurfaceAreaMm2(obj: THREE.Object3D): number {
  let total = 0
  obj.traverse((child) => {
    const m = child as THREE.Mesh
    if (m.isMesh && m.geometry) total += bufferGeometrySurfaceAreaMm2(m.geometry)
  })
  return total
}

function signedTetVolume(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  x3: number, y3: number, z3: number,
): number {
  return (
    -x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2
    - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3
  ) / 6
}

function triangleArea(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  x3: number, y3: number, z3: number,
): number {
  // |cross(B-A, C-A)| / 2
  const ax = x2 - x1, ay = y2 - y1, az = z2 - z1
  const bx = x3 - x1, by = y3 - y1, bz = z3 - z1
  const cx = ay * bz - az * by
  const cy = az * bx - ax * bz
  const cz = ax * by - ay * bx
  return Math.sqrt(cx * cx + cy * cy + cz * cz) / 2
}

// ─── Estimation ──────────────────────────────────────────────────────────────

export interface MeshStats {
  volumeCm3: number
  surfaceAreaCm2: number
}

export interface EstimateInput extends MeshStats {
  material: PrintMaterial
  layerHeightMm: 0.12 | 0.20 | 0.28
  infillPct: number
  quantity: number
  priority: PrintPriority
}

export interface PriceEstimate {
  ok: boolean
  unitPrice: number
  lineTotal: number
  estWeightG: number
  estTimeMin: number
  /** Cubic cm of filament actually extruded — useful for admin verification. */
  filamentVolumeCm3: number
  breakdown: QuoteBreakdown | null
}

/**
 * Estimate filament weight using the shell-area model.
 * Falls back to a volume-only approximation when surface area is unavailable.
 */
export function estimateWeightG(
  volumeCm3: number,
  surfaceAreaCm2: number,
  material: PrintMaterial,
  infillPct: number,
): { weightG: number; filamentVolumeCm3: number } {
  const density = MATERIAL_DENSITY_G_PER_CM3[material]
  const infillRatio = infillPct / 100

  let filamentVolume: number
  if (surfaceAreaCm2 > 0) {
    // Shell-area model. Cap shell at the model volume so very thin shells stay sane.
    const shellVolume = Math.min(surfaceAreaCm2 * SHELL_THICKNESS_CM, volumeCm3)
    const interior = Math.max(0, volumeCm3 - shellVolume)
    filamentVolume = shellVolume + interior * infillRatio
  } else {
    // Fallback: volume-only with a more conservative shell baseline than the
    // original 0.15 (which under-counted typical small parts by ~2×).
    const factor = 0.40 + 0.60 * infillRatio
    filamentVolume = volumeCm3 * factor
  }
  return { weightG: filamentVolume * density, filamentVolumeCm3: filamentVolume }
}

/**
 * Compute a rough estimate the customer can see at configure time.
 * Reuses {@link computeQuote} so admin and customer always agree on the same number.
 */
export function estimatePrice(
  input: EstimateInput,
  cfg: PricingConfig = DEFAULT_PRICING,
): PriceEstimate {
  if (!Number.isFinite(input.volumeCm3) || input.volumeCm3 <= 0) {
    return {
      ok: false, unitPrice: 0, lineTotal: 0, estWeightG: 0,
      estTimeMin: 0, filamentVolumeCm3: 0, breakdown: null,
    }
  }

  const { weightG, filamentVolumeCm3 } = estimateWeightG(
    input.volumeCm3, input.surfaceAreaCm2, input.material, input.infillPct,
  )

  // Pre-derive a 0.2 mm baseline time so computeQuote can apply its layer-height
  // multiplier on top.
  const ratePerHr = PRINT_RATE_G_PER_HOUR[input.material]
  const baselineHours = weightG / ratePerHr
  const baselineMin = Math.max(1, Math.round(baselineHours * 60))

  const breakdown = computeQuote(
    {
      material: input.material,
      layerHeightMm: input.layerHeightMm,
      infillPct: input.infillPct,
      quantity: input.quantity,
      priority: input.priority,
      // Pass weight directly so computeQuote uses our shell-area estimate
      // instead of its own volume-only fallback.
      estWeightG: weightG,
      estTimeMin: baselineMin,
    },
    cfg,
  )

  return {
    ok: breakdown.unitPrice > 0,
    unitPrice: breakdown.unitPrice,
    lineTotal: breakdown.lineTotal,
    estWeightG: breakdown.weightG,
    estTimeMin: breakdown.timeMin,
    filamentVolumeCm3,
    breakdown,
  }
}

export function formatPrintTime(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
