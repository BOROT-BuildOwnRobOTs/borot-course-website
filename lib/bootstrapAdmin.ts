import Admin from '@/models/Admin'
import bcrypt from 'bcryptjs'

let bootstrapped = false

const SUPER_EMAIL = 'admin@borot.local'
const DEFAULT_PASSWORD = 'admin'

/**
 * Ensure a default super-admin record exists so email-based login works
 * out of the box. The legacy `admin/admin` username login is also kept on
 * the client; this record is the canonical super-admin in the database.
 */
export async function bootstrapAdmin() {
  if (bootstrapped) return
  bootstrapped = true

  const existing = await Admin.findOne({ email: SUPER_EMAIL })
  if (existing) return

  const password = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  await Admin.create({
    name: 'Super Admin',
    email: SUPER_EMAIL,
    password,
    role: 'super',
    branch: null,
    active: true,
  })
}
