import { Navbar } from "@/components/navbar"
import { ModuleSlideshow } from "@/components/module-slideshow"
import { LearningPath } from "@/components/learning-path"

export default function ModulesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <ModuleSlideshow />
        <LearningPath />
      </main>
    </>
  )
}
