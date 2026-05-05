'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Upload, Loader2, FileBox, Trash2, Sparkles, Info } from 'lucide-react'
import { StlViewerSkeleton } from '@/components/print/stl-viewer-skeleton'
import { estimatePrice, formatPrintTime, type MeshStats } from '@/lib/print-estimate'

const StlViewer = dynamic(() => import('@/components/print/stl-viewer'), {
  ssr: false,
  loading: () => <StlViewerSkeleton />,
})

type Material = 'pla' | 'pla_matte' | 'petg' | 'tpu' | 'abs'
type Priority = 'standard' | 'express'
type LayerHeight = 0.12 | 0.20 | 0.28
type Delivery = 'pickup' | 'kerry' | 'flash' | 'ems'

const MATERIAL_LABELS: Record<Material, string> = {
  pla: 'PLA (Standard)',
  pla_matte: 'PLA Matte',
  petg: 'PETG (Tough)',
  tpu: 'TPU (Flexible)',
  abs: 'ABS (Heat-resistant)',
}

const COLOR_SWATCHES = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Grey', hex: '#7d7d7d' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Pink', hex: '#ec4899' },
]

interface UploadedFile {
  url: string
  publicId?: string
  fileName: string
  fileFormat: 'stl' | 'obj'
  sizeBytes: number
}

export default function PrintLandingPage() {
  const router = useRouter()
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [meshStats, setMeshStats] = useState<MeshStats | null>(null)

  // Print settings
  const [material, setMaterial] = useState<Material>('pla')
  const [color, setColor] = useState<string>('#1a1a1a')
  const [layerHeight, setLayerHeight] = useState<LayerHeight>(0.20)
  const [infill, setInfill] = useState<number>(20)
  const [quantity, setQuantity] = useState<number>(1)
  const [priority, setPriority] = useState<Priority>('standard')

  // Customer info — prefill from Clerk where possible
  const [customerName, setCustomerName] = useState<string>(user?.fullName ?? '')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerEmail, setCustomerEmail] = useState<string>(user?.primaryEmailAddress?.emailAddress ?? '')

  // Delivery
  const [delivery, setDelivery] = useState<Delivery>('pickup')
  const [recipient, setRecipient] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [district, setDistrict] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [notes, setNotes] = useState('')

  const handleFilePick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    e.target.value = '' // allow re-selecting same file later

    const ext = picked.name.split('.').pop()?.toLowerCase()
    if (ext !== 'stl' && ext !== 'obj') {
      toast.error('Only .stl and .obj files are supported')
      return
    }
    if (picked.size > 100 * 1024 * 1024) {
      toast.error('File too large (max 100 MB)')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', picked)
      const res = await fetch('/api/print/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? 'Upload failed')
        return
      }
      setFile({
        url: json.url,
        publicId: json.publicId,
        fileName: json.fileName,
        fileFormat: json.fileFormat,
        sizeBytes: json.sizeBytes,
      })
      toast.success('Model uploaded')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => { setFile(null); setMeshStats(null) }

  // Live price estimate. Recomputes whenever mesh stats or settings change.
  const estimate = useMemo(() => {
    if (!meshStats) return null
    return estimatePrice({
      ...meshStats,
      material, layerHeightMm: layerHeight, infillPct: infill, quantity, priority,
    })
  }, [meshStats, material, layerHeight, infill, quantity, priority])

  const validate = (): string | null => {
    if (!file) return 'Please upload an STL or OBJ file'
    if (!customerName.trim()) return 'Please enter your name'
    if (!/^\d{9,10}$/.test(customerPhone.replace(/\D/g, ''))) return 'Please enter a valid Thai phone number'
    if (delivery !== 'pickup') {
      if (!recipient.trim() || !shippingPhone.trim() || !line1.trim() || !province.trim() || !postalCode.trim()) {
        return 'Please complete the shipping address'
      }
    }
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { toast.error(err); return }
    if (!file) return

    setSubmitting(true)
    try {
      const body = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, ''),
        customerEmail: customerEmail.trim() || undefined,
        item: {
          file,
          material,
          color,
          layerHeightMm: layerHeight,
          infillPct: infill,
          quantity,
          priority,
          volumeCm3: meshStats?.volumeCm3,
          surfaceAreaCm2: meshStats?.surfaceAreaCm2,
          customerEstimateUnitPrice: estimate?.ok ? estimate.unitPrice : undefined,
        },
        deliveryMethod: delivery,
        shippingAddress: delivery === 'pickup' ? undefined : {
          recipient: recipient.trim(),
          phone: shippingPhone.replace(/\D/g, ''),
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          district: district.trim() || undefined,
          province: province.trim(),
          postalCode: postalCode.trim(),
        },
        notesCustomer: notes.trim() || undefined,
      }

      const res = await fetch('/api/print/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? 'Failed to create order')
        return
      }
      toast.success(`Order ${json.data.orderNumber} created`)
      router.push(`/service/3d-printing/orders/${json.data.id}`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to submit — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">3D Print Order</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload your model, choose your settings, and we&apos;ll quote your job.
          </p>
        </header>

        {/* Upload + Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Upload your model</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj"
              className="hidden"
              onChange={handleFileChange}
            />
            {!file ? (
              <button
                type="button"
                onClick={handleFilePick}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-12 flex flex-col items-center gap-3 hover:border-orange-400 hover:bg-orange-50/30 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-500">Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Click to upload .stl or .obj</span>
                    <span className="text-xs text-gray-400">Max 100 MB</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <StlViewer
                  url={file.url}
                  format={file.fileFormat}
                  color={color}
                  onMeshComputed={setMeshStats}
                />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FileBox className="w-4 h-4" />
                    <span className="font-medium">{file.fileName}</span>
                    <span className="text-gray-400">
                      ({(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Print settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Material</Label>
                <Select value={material} onValueChange={(v) => setMaterial(v as Material)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MATERIAL_LABELS) as Material[]).map((m) => (
                      <SelectItem key={m} value={m}>{MATERIAL_LABELS[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  className="mt-1.5"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                />
              </div>
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    className={`w-9 h-9 rounded-full border-2 transition ${
                      color === c.hex ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#hex or name"
                  className="w-32 h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Layer height</Label>
                <RadioGroup
                  value={String(layerHeight)}
                  onValueChange={(v) => setLayerHeight(Number(v) as LayerHeight)}
                  className="grid grid-cols-3 gap-2"
                >
                  {[
                    { v: 0.12, label: 'Fine', sub: '0.12 mm' },
                    { v: 0.20, label: 'Standard', sub: '0.20 mm' },
                    { v: 0.28, label: 'Draft', sub: '0.28 mm' },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={`border rounded-lg p-3 cursor-pointer text-center transition ${
                        layerHeight === o.v ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={String(o.v)} className="sr-only" />
                      <div className="text-sm font-medium">{o.label}</div>
                      <div className="text-xs text-gray-500">{o.sub}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Priority</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as Priority)}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    { v: 'standard', label: 'Standard', sub: 'Normal queue' },
                    { v: 'express', label: 'Express', sub: '~1.5× cost' },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={`border rounded-lg p-3 cursor-pointer text-center transition ${
                        priority === o.v ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={o.v} className="sr-only" />
                      <div className="text-sm font-medium">{o.label}</div>
                      <div className="text-xs text-gray-500">{o.sub}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Infill: <span className="font-mono text-orange-600">{infill}%</span></Label>
                <span className="text-xs text-gray-400">More = stronger + heavier</span>
              </div>
              <Slider
                value={[infill]}
                min={10}
                max={100}
                step={5}
                onValueChange={(v) => setInfill(v[0])}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Your details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full name</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Email <span className="text-gray-400">(optional)</span></Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={delivery}
              onValueChange={(v) => setDelivery(v as Delivery)}
              className="grid grid-cols-2 md:grid-cols-4 gap-2"
            >
              {[
                { v: 'pickup', label: 'Pickup', sub: 'At our shop' },
                { v: 'kerry', label: 'Kerry', sub: '1–3 days' },
                { v: 'flash', label: 'Flash', sub: '1–3 days' },
                { v: 'ems', label: 'EMS', sub: 'Thai Post' },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`border rounded-lg p-3 cursor-pointer text-center transition ${
                    delivery === o.v ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={o.v} className="sr-only" />
                  <div className="text-sm font-medium">{o.label}</div>
                  <div className="text-xs text-gray-500">{o.sub}</div>
                </label>
              ))}
            </RadioGroup>

            {delivery !== 'pickup' && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Recipient name</Label>
                    <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Recipient phone</Label>
                    <Input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} className="mt-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address line 1</Label>
                    <Input value={line1} onChange={(e) => setLine1(e.target.value)} className="mt-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address line 2 <span className="text-gray-400">(optional)</span></Label>
                    <Input value={line2} onChange={(e) => setLine2(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>District</Label>
                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Input value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Postal code</Label>
                    <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">5. Notes <span className="text-sm font-normal text-gray-400">(optional)</span></CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything we should know? Tolerances, special handling, etc."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Estimate + Submit (sticky) */}
        <div className="sticky bottom-4 bg-white border border-gray-200 rounded-xl p-4 shadow-lg space-y-3">
          {/* Live estimate */}
          {file && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {estimate?.ok ? (
                  <>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Estimated price</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ฿{estimate.lineTotal.toLocaleString()}
                      </span>
                      {quantity > 1 && (
                        <span className="text-xs text-gray-500">
                          (฿{estimate.unitPrice.toLocaleString()} × {quantity})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      ~{estimate.estWeightG.toFixed(1)} g · {formatPrintTime(estimate.estTimeMin)} print time
                    </p>
                    <p className="text-xs text-gray-500 flex items-start gap-1 mt-1.5">
                      <Info className="w-3 h-3 mt-0.5 shrink-0" />
                      Final price may be adjusted after admin review.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Calculating estimate…</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">Submit for review</p>
              <p className="text-xs text-gray-500">We&apos;ll confirm the final price within 24 hours.</p>
            </div>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || uploading || !file}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : 'Submit Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
