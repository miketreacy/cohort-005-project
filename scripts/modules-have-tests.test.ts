import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Every module in app/modules/ ships with tests in its own tests/ folder (see
// app/modules/README.md). A module with none is behaviour nobody checks, and
// mutation testing it only proves that, slowly.

const modulesRoot = new URL("../app/modules/", import.meta.url);

const modules = readdirSync(modulesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const testFilesIn = (dir: URL): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { recursive: true, encoding: "utf8" }).filter((file) =>
        /\.test\.tsx?$/.test(file)
      )
    : [];

describe("app/modules", () => {
  it.each(modules)("%s has a test in its tests/ folder", (name) => {
    const tests = testFilesIn(new URL(`${name}/tests/`, modulesRoot));
    expect(
      tests,
      `app/modules/${name}/tests/ has no *.test.ts. Test the module through its entry points.`
    ).not.toHaveLength(0);
  });
});
