import { describe, expect, it } from "vitest";
import { MAX_TOKENS, judge, tokensOf } from "./file-tokens.js";

describe("tokensOf", () => {
  it("counts four bytes as a token, rounding up", () => {
    expect(tokensOf(8)).toBe(2);
    expect(tokensOf(9)).toBe(3);
  });
});

describe("judge", () => {
  it("passes any file at the limit", () => {
    expect(judge(MAX_TOKENS, null)).toBe("ok");
    expect(judge(MAX_TOKENS, MAX_TOKENS * 3)).toBe("ok");
  });

  it("fails a new file over the limit", () => {
    expect(judge(MAX_TOKENS + 1, null)).toBe("over");
  });

  it("fails a file that crosses the limit in this change", () => {
    expect(judge(MAX_TOKENS + 1, MAX_TOKENS)).toBe("over");
  });

  it("passes a file that was already over and did not grow", () => {
    expect(judge(MAX_TOKENS * 2, MAX_TOKENS * 2)).toBe("ok");
    expect(judge(MAX_TOKENS * 2, MAX_TOKENS * 2 + 1)).toBe("ok");
  });

  it("fails a file that was already over and grew", () => {
    expect(judge(MAX_TOKENS * 2 + 1, MAX_TOKENS * 2)).toBe("grew");
  });
});
