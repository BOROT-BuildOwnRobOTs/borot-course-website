import { Loader2 } from 'lucide-react'

/**
 * Lightweight placeholder for the dynamically-imported {@link StlViewer}.
 * Lives in its own file so the parent page can render it during SSR/hydration
 * without pulling Three.js into the initial chunk.
 */
export function StlViewerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        'w-full h-[420px] rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 border flex items-center justify-center text-gray-400'
      }
    >
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  )
}
