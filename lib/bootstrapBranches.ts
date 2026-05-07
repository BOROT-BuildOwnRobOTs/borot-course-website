import Branch from '@/models/Branch'
import Parent from '@/models/Parent'
import Student from '@/models/Student'
import Teacher from '@/models/Teacher'

let bootstrapped = false

/**
 * Seed default branches (Emquatier active, Rama2 coming_soon) and backfill
 * any pre-existing parents/students that have no branch to Emquatier.
 * Safe to call repeatedly — runs at most once per Node process.
 */
export async function bootstrapBranches() {
  if (bootstrapped) return
  bootstrapped = true

  const existingCount = await Branch.countDocuments({})

  let emquatier = await Branch.findOne({ slug: 'emquatier' })
  if (!emquatier) {
    emquatier = await Branch.create({
      name: 'Emquatier',
      slug: 'emquatier',
      status: 'active',
    })
  }

  let rama2 = await Branch.findOne({ slug: 'rama2' })
  if (!rama2) {
    rama2 = await Branch.create({
      name: 'Rama2',
      slug: 'rama2',
      status: 'coming_soon',
    })
  }

  // Only run the migration the very first time branches are seeded —
  // afterwards admins may legitimately leave docs un-branched and we
  // shouldn't auto-reassign them.
  if (existingCount === 0) {
    await Parent.updateMany(
      { $or: [{ branch: { $exists: false } }, { branch: null }] },
      { $set: { branch: emquatier._id } }
    )
    await Student.updateMany(
      { $or: [{ branch: { $exists: false } }, { branch: null }] },
      { $set: { branch: emquatier._id } }
    )
    await Teacher.updateMany(
      { $or: [{ branch: { $exists: false } }, { branch: null }] },
      { $set: { branch: emquatier._id } }
    )
  }
}
