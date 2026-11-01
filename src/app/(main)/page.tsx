import { FeaturedTutors } from '@/src/app/components/home/FeaturedTutor' // hoặc '@/components/home/FeaturedTutor' tùy alias trong tsconfig.json
import { StatsBand } from '@/src/app/components/home/StatsBand'
import { HowItWorks } from '@/src/app/components/home/HowItWorks'
import { Hero } from '@/src/app/components/home/HeroBanner'
import { BentoSubjectsGrid } from '@/src/app/components/home/SubjectsMarquee'
import { StudyTogether } from '@/src/app/components/home/StudyTogether'
import { Testimonials } from '@/src/app/components/home/Testimonials'
import TestimonialSection from '@/src/app/components/home/TestimonialCard'
import { TutorCta } from '@/src/app/components/home/TutorCta'
import { Questions } from '@/src/app/components/home/Questions'
import { Suspense } from "react";


function FeaturedTutorsSkeleton() {
  return (
    <section className="w-full bg-white py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 mb-6" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <Hero />

      <Suspense fallback={<FeaturedTutorsSkeleton />}>
        <FeaturedTutors />
      </Suspense>

      <StatsBand />
      <HowItWorks />
      <BentoSubjectsGrid />
      <StudyTogether />
      <TestimonialSection />
      <TutorCta />
      <Questions />
    </div>
  );
}
