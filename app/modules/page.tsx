import { Navbar } from "@/components/navbar"
import { ModuleDetails } from "@/components/module-details"
import { LearningPath } from "@/components/learning-path"

export default function ModulesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="py-12">
          <ModuleDetails />
          <LearningPath />
        </div>
      </main>
    </>
  )
}
