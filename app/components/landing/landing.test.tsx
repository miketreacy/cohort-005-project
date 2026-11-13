import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { LandingHero } from "./landing-hero";
import { LandingStats } from "./landing-stats";
import { LandingFooter } from "./landing-footer";

function render(node: ReactNode) {
  const html = renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
  return { html, text: html.replace(/<[^>]+>/g, "") };
}

const course = {
  slug: "practical-data-vis",
  title: "Practical Data Visualisation",
  description: "Turn data into charts.",
  coverImageUrl: null,
  instructorName: "Marcus Johnson",
  lessonCount: 6,
};

function hrefs(root: { html: string }) {
  return [...root.html.matchAll(/<a [^>]*href="([^"]*)"/g)].map((m) => m[1]);
}

describe("LandingHero", () => {
  it("is left-aligned, not centred", () => {
    const root = render(<LandingHero spotlight={course} signedIn={false} />);
    expect(root.html).not.toContain("text-center");
    expect(root.html).not.toContain("justify-center gap-4");
  });

  it("offers sign-up to a visitor and the dashboard to a signed-in user", () => {
    const visitor = render(<LandingHero spotlight={null} signedIn={false} />);
    expect(hrefs(visitor)).toEqual(["/courses", "/signup"]);

    const member = render(<LandingHero spotlight={null} signedIn={true} />);
    expect(hrefs(member)).toEqual(["/courses", "/dashboard"]);
  });

  it("links the spotlight card to its course", () => {
    const root = render(<LandingHero spotlight={course} signedIn={false} />);
    expect(hrefs(root)).toContain("/courses/practical-data-vis");
    expect(root.text).toContain("Practical Data Visualisation");
    expect(root.text).toContain("Marcus Johnson");
    expect(root.text).toContain("6 lessons");
  });

  it("names a placeholder instructor when the course has none", () => {
    const root = render(
      <LandingHero
        spotlight={{ ...course, instructorName: null, description: null }}
        signedIn={false}
      />
    );
    expect(root.text).toContain("Instructor");
  });

  it("leaves the spotlight out when there is no course", () => {
    const root = render(<LandingHero spotlight={null} signedIn={false} />);
    expect(root.text).not.toContain("New on Cadence");
  });
});

describe("LandingStats", () => {
  it("shows the course and category counts", () => {
    const root = render(<LandingStats totalCourses={4} totalCategories={5} />);
    const text = root.text;
    expect(text).toContain("4Available Courses");
    expect(text).toContain("5Categories");
    expect(text).toContain("Self-pacedLearn on your schedule");
    expect(root.html).not.toContain("text-center");
  });

  it("uses a clock, not a people icon, for self-paced", () => {
    const root = render(<LandingStats totalCourses={0} totalCategories={0} />);
    expect(root.html).toContain("lucide-clock");
    expect(root.html).not.toContain("lucide-users");
  });
});

describe("LandingFooter", () => {
  it("links a visitor to log in and sign up", () => {
    const root = render(<LandingFooter signedIn={false} />);
    expect(hrefs(root)).toEqual(["/", "/courses", "/login", "/signup"]);
  });

  it("links a signed-in user to the dashboard", () => {
    const root = render(<LandingFooter signedIn={true} />);
    expect(hrefs(root)).toEqual(["/", "/courses", "/dashboard"]);
  });
});
