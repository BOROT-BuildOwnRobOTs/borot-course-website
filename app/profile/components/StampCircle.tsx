import { MessageSquare, RefreshCw } from "lucide-react"

interface StampCircleProps {
  stampNumber: number
  date: Date
  isToday: boolean
  isPast: boolean
  isCheckedIn: boolean
  hasFeedback: boolean
  isRescheduled: boolean
  onClick?: () => void
  isClickable: boolean
}

export default function StampCircle({
  stampNumber,
  date,
  isToday,
  isPast,
  isCheckedIn,
  hasFeedback,
  isRescheduled,
  onClick,
  isClickable,
}: StampCircleProps) {
  const circleStyle = isCheckedIn
    ? "bg-green-500 text-white shadow-md shadow-green-200"
    : isToday
    ? "bg-blue-500 text-white shadow-md shadow-blue-200"
    : isPast
    ? "bg-red-100 text-red-400 border-2 border-red-300"
    : "bg-gray-100 text-gray-400 border-2 border-gray-300"

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <button
          onClick={onClick}
          disabled={!isClickable}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all
            ${circleStyle}
            ${isRescheduled ? "ring-2 ring-orange-400 ring-offset-1" : ""}
            ${isClickable ? "hover:scale-110 cursor-pointer" : "cursor-default"}
          `}
        >
          {stampNumber}
        </button>
        
        {/* Feedback badge */}
        {isCheckedIn && hasFeedback && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
            <MessageSquare className="h-2.5 w-2.5 text-white" />
          </span>
        )}
        
        {/* Reschedule badge */}
        {isRescheduled && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center shadow-sm">
            <RefreshCw className="h-2.5 w-2.5 text-white" />
          </span>
        )}
      </div>
      <span className="text-[9px] text-center text-muted-foreground leading-tight max-w-[48px]">
        {date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}
      </span>
    </div>
  )
}