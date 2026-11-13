import { describe, expect, it } from "vitest";
import { renderThread } from "../thread.server";
import { markdown } from "~/lib/text";

type ThreadComment = Parameters<typeof renderThread>[0][number];

function comment(
  id: number,
  body: string,
  overrides: Partial<ThreadComment> = {}
): ThreadComment {
  return {
    id,
    body: markdown(body),
    createdAt: "2026-11-01T00:00:00.000Z",
    editedAt: null,
    deleted: false,
    author: {
      id: 1,
      name: "Sarah Chen",
      avatarUrl: null,
      isInstructor: false,
      isPlatformAdmin: false,
    },
    replies: [],
    ...overrides,
  };
}

describe("renderThread", () => {
  it("renders each body to HTML and keeps the raw markdown", async () => {
    const [rendered] = await renderThread([comment(1, "**bold**")]);

    expect(rendered.bodyHtml).toContain("<strong>bold</strong>");
    expect(rendered.body).toBe("**bold**");
  });

  it("escapes HTML a commenter writes", async () => {
    const [rendered] = await renderThread([
      comment(1, "<script>alert(1)</script>"),
    ]);

    expect(rendered.bodyHtml).not.toContain("<script>");
  });

  it("renders no body for a deleted comment", async () => {
    const [rendered] = await renderThread([
      comment(1, "gone", { deleted: true }),
    ]);

    expect(rendered.bodyHtml).toBe("");
  });

  it("renders replies, keeping the nesting", async () => {
    const [rendered] = await renderThread([
      comment(1, "question", { replies: [comment(2, "_answer_")] }),
    ]);

    expect(rendered.replies).toHaveLength(1);
    expect(rendered.replies[0].id).toBe(2);
    expect(rendered.replies[0].bodyHtml).toContain("<em>answer</em>");
  });
});
