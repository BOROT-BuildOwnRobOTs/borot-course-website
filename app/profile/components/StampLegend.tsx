export default function StampLegend() {
  return (
    <div className="flex gap-4 mt-4 pt-3 border-t flex-wrap">
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <div className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0" />
        เข้าเรียนแล้ว
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <div className="w-3.5 h-3.5 rounded-full bg-red-100 border-2 border-red-300 shrink-0" />
        ขาดเรียน
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
        วันนี้
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <div className="w-3.5 h-3.5 rounded-full bg-gray-100 border-2 border-gray-300 shrink-0" />
        ยังไม่ถึง
      </span>
    </div>
  )
}
