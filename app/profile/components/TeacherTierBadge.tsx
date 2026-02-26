"use client"

import { cn } from "@/lib/utils"
import { Sparkles, Zap, Cpu, Crown } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ─── Tier definitions ────────────────────────────────────────────────────────
export const TEACHER_TIERS = [
  {
    id: 1,
    min: 0,
    label: "Rookie Bot",
    labelTH: "ผู้ฝึกหัด",
    Icon: Sparkles,
    iconBg: "bg-slate-500",
    nameplateGradient: "from-slate-200 via-slate-100 to-slate-200",
    border: "border-slate-300",
    text: "text-slate-700",
    bar: "from-slate-400 to-slate-600",
    pill: "bg-slate-500 text-white",
    glow: "",
  },
  {
    id: 2,
    min: 81,
    label: "Circuit Spark",
    labelTH: "นักสร้างวงจร",
    Icon: Zap,
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    nameplateGradient: "from-blue-100 via-indigo-50 to-blue-100",
    border: "border-blue-300",
    text: "text-blue-800",
    bar: "from-blue-400 to-indigo-500",
    pill: "bg-blue-600 text-white",
    glow: "shadow-blue-200",
  },
  {
    id: 3,
    min: 201,
    label: "Code Engineer",
    labelTH: "วิศวกรโค้ด",
    Icon: Cpu,
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-700",
    nameplateGradient: "from-violet-100 via-purple-50 to-violet-100",
    border: "border-violet-400",
    text: "text-violet-800",
    bar: "from-violet-400 to-purple-600",
    pill: "bg-violet-600 text-white",
    glow: "shadow-violet-200",
  },
  {
    id: 4,
    min: 500,
    label: "Legendary Mentor",
    labelTH: "ปรมาจารย์",
    Icon: Crown,
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
    nameplateGradient: "from-amber-100 via-yellow-50 to-amber-100",
    border: "border-amber-400",
    text: "text-amber-800",
    bar: "from-amber-400 to-orange-500",
    pill: "bg-amber-500 text-white",
    glow: "shadow-amber-200",
  },
] as const

// ─── Helper ───────────────────────────────────────────────────────────────────
export function getTierInfo(count: number) {
  const thresholds = [0, 81, 201, 500]
  let tierIndex = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (count >= thresholds[i]) { tierIndex = i; break }
  }
  const tier = TEACHER_TIERS[tierIndex]
  const isMax = tierIndex === TEACHER_TIERS.length - 1
  const nextTier = !isMax ? TEACHER_TIERS[tierIndex + 1] : null

  let percent = 100
  if (!isMax && nextTier) {
    const span = nextTier.min - tier.min
    percent = Math.min(Math.round(((count - tier.min) / span) * 100), 100)
  }

  return { tier, tierIndex, isMax, percent, nextTier }
}

// ─── Nameplate Badge ──────────────────────────────────────────────────────────
interface TeacherTierBadgeProps {
  sessionCount: number
  className?: string
}

export default function TeacherTierBadge({ sessionCount, className }: TeacherTierBadgeProps) {
  const { tier, isMax, percent, nextTier } = getTierInfo(sessionCount)
  const { Icon } = tier

  const badge = (
    <div
      className={cn(
        // Nameplate frame: slim horizontal strip with gradient bg + decorative border
        "inline-flex items-center gap-0 rounded-lg border-2 overflow-hidden shadow-sm cursor-help",
        tier.border,
        tier.glow && `shadow-md ${tier.glow}`,
        className
      )}
    >
      {/* Left icon block */}
      <div className={cn("flex items-center justify-center h-full px-2.5 py-2 shrink-0", tier.iconBg)}>
        <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>

      {/* Nameplate body */}
      <div className={cn(
        "flex items-center gap-3 px-3 py-1.5 bg-gradient-to-r",
        tier.nameplateGradient,
      )}>
        {/* Tier name */}
        <div>
          <p className={cn("text-xs font-extrabold leading-none tracking-wide", tier.text)}>
            {tier.label}
          </p>
          <p className="text-[9px] text-muted-foreground leading-none mt-0.5">
            {isMax ? "ระดับสูงสุด" : `อีก ${Math.max(0, (nextTier?.min ?? 0) - sessionCount)} ครั้งถึง Tier ${(tier.id + 1)}`}
          </p>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-black/10 shrink-0" />

        {/* Progress bar + % */}
        <div className="flex items-center gap-1.5 min-w-[80px]">
          <div className="relative flex-1 h-1.5 rounded-full bg-black/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tier.bar)}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className={cn("text-[11px] font-black tabular-nums shrink-0", tier.text)}>
            {percent}%
          </span>
        </div>
      </div>

      {/* Right tier pill */}
      <div className={cn("flex items-center justify-center px-2 py-1.5 shrink-0 h-full text-[10px] font-black tracking-widest", tier.pill)}>
        T{tier.id}
      </div>
    </div>
  )

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom" className="p-0 overflow-hidden rounded-xl border-0 shadow-xl w-56">
          {/* Header */}
          <div className={cn("flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r", tier.nameplateGradient)}>
            <div className={cn("flex items-center justify-center w-7 h-7 rounded-full shrink-0", tier.iconBg)}>
              <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className={cn("text-sm font-extrabold leading-none", tier.text)}>{tier.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{tier.labelTH} · T{tier.id}</p>
            </div>
          </div>

          {/* Body */}
          <div className="bg-popover px-3 py-2.5 space-y-2.5">
            {/* Session count */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">ครั้งที่สอนจบแล้ว</span>
              <span className="font-black tabular-nums text-foreground">{sessionCount} ครั้ง</span>
            </div>

            {!isMax && nextTier ? (
              <>
                {/* Next tier target */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">เป้าหมาย {nextTier.label}</span>
                  <span className="font-bold tabular-nums text-foreground">{nextTier.min} ครั้ง</span>
                </div>

                {/* Remaining */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">ยังขาดอยู่</span>
                  <span className="font-bold tabular-nums text-orange-500">
                    {Math.max(0, nextTier.min - sessionCount)} ครั้ง
                  </span>
                </div>

                {/* Progress bar with % */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">ความคืบหน้า</span>
                    <span className={cn("font-black tabular-nums", tier.text)}>{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tier.bar)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>T{tier.id} ({tier.min})</span>
                    <span>T{nextTier.id} ({nextTier.min})</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-1">
                <p className="text-xs font-bold text-amber-600">🏆 ถึงระดับสูงสุดแล้ว!</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">ยอดเยี่ยมมากครับ</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
