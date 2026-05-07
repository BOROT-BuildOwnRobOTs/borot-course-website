'use client'

import * as React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Human-readable kind, e.g. "student", "parent", "branch". Used in copy. */
  itemType: string
  /** Display name (also the phrase user must type unless `confirmPhrase` is set). */
  itemName: string
  /** Override what the user must type. Defaults to `itemName`. */
  confirmPhrase?: string
  /** Optional extra context shown on the first warning step. */
  description?: React.ReactNode
  /** Bullet list of consequences shown on the first warning step. */
  consequences?: string[]
  /** Async-aware. The dialog auto-closes on success and stays open on throw. */
  onConfirm: () => Promise<void> | void
  /** Override the destructive button label on stage 2. */
  destructiveLabel?: string
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemType,
  itemName,
  confirmPhrase,
  description,
  consequences,
  onConfirm,
  destructiveLabel = 'Delete forever',
}: DeleteConfirmDialogProps) {
  const [stage, setStage] = React.useState<1 | 2>(1)
  const [typed, setTyped] = React.useState('')
  const [isDeleting, setIsDeleting] = React.useState(false)

  const phrase = (confirmPhrase ?? itemName).trim()
  const matches = typed.trim() === phrase && phrase.length > 0

  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStage(1)
        setTyped('')
        setIsDeleting(false)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!matches || isDeleting) return
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Leave dialog open so the user can retry; caller is responsible for surfacing error UI.
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isDeleting) return
        onOpenChange(next)
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-red-700">
              {stage === 1 ? `Delete this ${itemType}?` : `Final confirmation`}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm text-gray-700">
              {stage === 1 ? (
                <>
                  <p>
                    You are about to permanently delete{' '}
                    <strong className="text-gray-900 break-words">&ldquo;{itemName}&rdquo;</strong>.
                  </p>
                  {description ? <div>{description}</div> : null}
                  <div className="rounded-md border border-red-200 bg-red-50 p-3">
                    <p className="font-semibold text-red-700 mb-1">
                      This action cannot be undone.
                    </p>
                    {consequences && consequences.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 text-red-700">
                        {consequences.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-red-700">
                        Deleted records cannot be recovered from inside the app.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p>
                    To confirm, type{' '}
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-red-700">
                      {phrase}
                    </code>{' '}
                    below:
                  </p>
                  <Input
                    autoFocus
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder={phrase}
                    disabled={isDeleting}
                    className={
                      matches
                        ? 'border-green-400 focus-visible:ring-green-400'
                        : 'focus-visible:ring-red-400'
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Names are matched exactly (including spaces and case).
                  </p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {stage === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setStage(2)}>
                I understand, continue
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStage(1)}
                disabled={isDeleting}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={!matches || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {destructiveLabel}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
