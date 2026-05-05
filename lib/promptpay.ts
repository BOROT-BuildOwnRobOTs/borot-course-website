import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

/**
 * Generate a PromptPay QR code for an order.
 *
 * `target` is the merchant's PromptPay ID — either a Thai phone number
 * (10 digits, e.g. "0812345678") or a national ID (13 digits). Configure via
 * the PROMPTPAY_TARGET env var so the same code works in dev and prod.
 *
 * Returns:
 *   - payload: the raw EMVCo string (store on the order so we can regenerate)
 *   - dataUrl: a base64 PNG suitable for an <img src> on the checkout page
 */
export async function generatePromptPayQR(amount: number, target?: string): Promise<{
  payload: string
  dataUrl: string
}> {
  const merchantId = target ?? process.env.PROMPTPAY_TARGET
  if (!merchantId) {
    throw new Error('PROMPTPAY_TARGET env var is not set')
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('PromptPay amount must be a positive number')
  }

  const payload = generatePayload(merchantId, { amount })
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 360,
  })

  return { payload, dataUrl }
}
