import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CourseImage } from "~/components/course-image";
import { CourseMeta } from "~/components/course-meta";
import { cn } from "~/lib/utils";

export type SpotlightCourse = {
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  instructorName: string | null;
  lessonCount: number;
};

export function LandingHero({
  spotlight,
  signedIn,
}: {
  spotlight: SpotlightCourse | null;
  signedIn: boolean;
}) {
  return (
    <section
      className={cn(
        "mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24",
        spotlight && "lg:grid-cols-[3fr_2fr]"
      )}
    >
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
          Courses for developers
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Learn to code,
          <br />
          <span className="text-muted-foreground">at your own pace</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Structured courses built by experienced instructors. Track your
          progress, take quizzes, and build real-world skills.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link to="/courses">
              Browse Courses
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            {signedIn ? (
              <Link to="/dashboard">Go to your dashboard</Link>
            ) : (
              <Link to="/signup">Create an account</Link>
            )}
          </Button>
        </div>
      </div>
      {spotlight && <SpotlightCard course={spotlight} />}
    </section>
  );
}

function SpotlightCard({ course }: { course: SpotlightCourse }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <CourseImage
        src={course.coverImageUrl}
        alt={course.title}
        className="aspect-video w-full object-cover"
      />
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          New on Cadence
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary">
          {course.title}
        </h2>
        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        )}
        <CourseMeta
          className="mt-4"
          instructorName={course.instructorName}
          lessonCount={course.lessonCount}
        />
      </div>
    </Link>
  );
}
