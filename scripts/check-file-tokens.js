// Fails when a file is too big for an agent to read and edit in one go.
// Tokens are estimated as bytes / 4, which is close enough for code.
// The rule is a ratchet: see scripts/file-tokens.js.
// Usage: node scripts/check-file-tokens.js <file>...

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { MAX_TOKENS, judge, tokensOf } from "./file-tokens.js";

// Generated files that nobody edits by hand, and workflow files, which
// GitHub reads as one file each and which cannot be split.
const IGNORED = [
  /(^|\/)package-lock\.json$/,
  /^drizzle\//,
  /^\.github\/workflows\/[^/]+\.yml$/,
];

const isBinary = (contents) => contents.subarray(0, 8000).includes(0);

/** The file's size in tokens at HEAD, or null when HEAD does not have it. */
const baseTokensOf = (file) => {
  try {
    const bytes = execFileSync("git", ["cat-file", "-s", `HEAD:${file}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return tokensOf(Number(bytes.trim()));
  } catch {
    return null;
  }
};

const failures = process.argv
  .slice(2)
  .map((file) => file.replaceAll("\\", "/").replace(`${process.cwd()}/`, ""))
  .filter((file) => !IGNORED.some((pattern) => pattern.test(file)))
  .map((file) => ({ file, contents: readFileSync(file) }))
  .filter(({ contents }) => !isBinary(contents))
  .map(({ file, contents }) => ({ file, tokens: tokensOf(contents.length) }))
  .filter(({ tokens }) => tokens > MAX_TOKENS)
  .map(({ file, tokens }) => {
    const baseTokens = baseTokensOf(file);
    return { file, tokens, baseTokens, verdict: judge(tokens, baseTokens) };
  })
  .filter(({ verdict }) => verdict !== "ok");

const over = failures.filter(({ verdict }) => verdict === "over");
const grew = failures.filter(({ verdict }) => verdict === "grew");

if (grew.length > 0) {
  console.error(
    `These files were already over ${MAX_TOKENS} tokens, and this commit makes them bigger:\n`
  );
  for (const { file, tokens, baseTokens } of grew) {
    console.error(`  ${file}: ~${baseTokens} → ~${tokens} tokens`);
  }
  console.error(`
A file over the limit may be edited, but may not grow. Make your change
without adding to the file's size: move what you add into a new file of its
own (a component in app/components/, logic in a module in app/modules/), and
import it. Do not split the rest of the file in this change; that is a
separate ticket.
`);
}

if (over.length > 0) {
  console.error(`These files are over ${MAX_TOKENS} tokens (bytes / 4):\n`);
  for (const { file, tokens } of over) {
    console.error(`  ${file}: ~${tokens} tokens`);
  }
  console.error(`
Split each file before you commit. Do not delete code or squash it onto fewer
lines to get under the limit.

How to split:
- Find the seams. Look for groups of functions, components, or tests that
  change together and share little with the rest of the file.
- Route modules (app/routes/*): keep the loader, action, and page component in
  the route file. Move the business logic into a module in app/modules/ and
  sub-components into their own files in app/components/.
- Logic that is already in a module (app/modules/<name>/): split it into more
  files under lib/. Keep the entry points (index.ts, index.server.ts) small. Do
  not add a barrel file. See app/modules/README.md.
- Tests: split by the behaviour under test, one file per area (for example
  <name>.refunds.test.ts, <name>.permissions.test.ts). Move shared fixtures
  into a fixtures file in the same tests/ folder.
- Scripts and seed data: move large data literals into their own files and
  import them.
`);
}

if (failures.length > 0) {
  console.error("When you are done, run `npm run check` and commit again.");
  process.exit(1);
}
