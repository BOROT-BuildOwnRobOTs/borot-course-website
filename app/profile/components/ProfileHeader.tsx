"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, GraduationCap, LogOut, Mail, Phone, Users } from "lucide-react"
import { UserData, Enrollment } from "../types"
import { getTierInfo } from "./TeacherTierBadge"

interface Props {
  user: UserData
  tierSessionCount: number
  onLogout: () => void
}

export default function ProfileHeader({ user, tierSessionCount, onLogout }: Props) {
  const allEnrollments: Enrollment[] = (user.students ?? []).flatMap((s) => s.enrollments ?? [])
  const completedCount = allEnrollments.filter((e) => e.status === "completed").length
  const activeCount = allEnrollments.filter((e) => e.status === "active").length

  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar — teacher gets tier ring, others get plain circle */}
          {user.role === "teacher" ? (() => {
            const { tier: tInfo, percent: tPct } = getTierInfo(tierSessionCount)
            const ringColors = ["#94a3b8", "#6366f1", "#8b5cf6", "#f59e0b"]
            const ringColor = ringColors[tInfo.id - 1]
            const circ = 2 * Math.PI * 42
            return (
              <div className="relative shrink-0 flex flex-col items-center gap-1.5">
                <div className="relative" style={{ width: 92, height: 92 }}>
                  <svg
                    width="92" height="92" viewBox="0 0 92 92"
                    className="absolute inset-0"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <circle cx="46" cy="46" r="42" fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
                    <circle
                      cx="46" cy="46" r="42"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeDasharray={`${circ}`}
                      strokeDashoffset={`${circ * (1 - tPct / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-[7px] rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                  style={{ color: ringColor, borderColor: ringColor + "50", backgroundColor: ringColor + "18" }}
                >
                  {tInfo.label}
                </span>
              </div>
            )
          })() : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
              {user.name.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <Badge
                variant="outline"
                className={
                  user.role === "teacher"
                    ? "border-orange-300 text-orange-600 bg-orange-50"
                    : "border-blue-300 text-blue-600 bg-blue-50"
                }
              >
                {user.role === "teacher" ? (
                  <><GraduationCap className="h-3 w-3 mr-1" /> ครู</>
                ) : (
                  <><Users className="h-3 w-3 mr-1" /> ผู้ปกครอง</>
                )}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.role === "teacher" && user.specialization && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{user.specialization}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="gap-2 text-destructive hover:text-destructive bg-transparent"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </Button>
      </div>

      {/* Summary card (parent only) */}
      {user.role === "parent" && (
        <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-5 pb-5">
            <div className="grid grid-cols-3 divide-x divide-primary/10 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{user.students?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">นักเรียน</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-500">{activeCount}</p>
                <p className="text-xs text-muted-foreground mt-1">กำลังเรียน</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-500">{completedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">จบแล้ว</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
