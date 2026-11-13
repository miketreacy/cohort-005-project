/**
 * Fails on a dead oxlint exemption: a file named in an `overrides` entry that
 * turns rules off, which would lint clean without it.
 *
 * Exemptions get copied. A split that carries the original file's exemption
 * list onto every new file hides nothing at first, and then hides the next
 * real breach in those files. An exemption earns its line only while the file
 * still breaks the rule.
 *
 * Checked: override entries whose rules are all "off" and whose `files` are
 * plain paths. A glob (`app/routes/**`) is a policy, not an exemption, so its
 * entry is left alone.
 *
 * Usage: npm run lint:exemptions
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Override = { files: string[]; rules?: Record<string, unknown> };
type Config = { overrides?: Override[] } & Record<string, unknown>;
type Diagnostic = { code?: string; filename?: string };

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const configPath = resolve(repoRoot, ".oxlintrc.json");

// The config is JSONC. Only whole-line `//` comments appear in it, and none of
// its strings contain `//`, so dropping those lines is enough.
const config: Config = JSON.parse(
  readFileSync(configPath, "utf8")
    .split("\n")
    .filter((line) => !/^\s*\/\//.test(line))
    .join("\n")
);

const isPath = (file: string) => !/[*?[{]/.test(file);

// The temporary config sits next to the real one, because `jsPlugins` and the
// `overrides` paths resolve against the config's own directory.
const scratch = resolve(repoRoot, ".oxlintrc.exemption-check.json");

/** The rules each file breaks under `candidate`, as "file\trule". */
function breaches(candidate: Config, files: string[]): Set<string> {
  writeFileSync(scratch, JSON.stringify(candidate));
  let out: string;
  try {
    out = execFileSync(
      "npx",
      ["oxlint", "-c", scratch, "--format", "json", ...files],
      { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
    );
  } catch (error) {
    // oxlint exits non-zero when it finds anything. That is the answer.
    out = String((error as { stdout?: string }).stdout ?? "");
  } finally {
    rmSync(scratch, { force: true });
  }
  const { diagnostics = [] } = JSON.parse(out) as {
    diagnostics?: Diagnostic[];
  };
  return new Set(
    diagnostics.map(({ filename = "", code = "" }) => {
      // `eslint(max-depth)` → `max-depth`; `typescript(x)` → `typescript/x`.
      const rule = code
        .replace(/^eslint\((.+)\)$/, "$1")
        .replace(/^([\w-]+)\((.+)\)$/, "$1/$2");
      return `${filename.replace(`${repoRoot}/`, "")}\t${rule}`;
    })
  );
}

const dead: string[] = [];

for (const [index, override] of (config.overrides ?? []).entries()) {
  const rules = Object.entries(override.rules ?? {});
  const exempts = rules.length > 0 && rules.every(([, v]) => v === "off");
  const files = override.files.filter(isPath);
  if (!exempts || files.length !== override.files.length) continue;

  const present = files.filter((file) => existsSync(resolve(repoRoot, file)));
  for (const missing of files.filter((file) => !present.includes(file))) {
    dead.push(`${missing}: no such file (${rules.map(([r]) => r).join(", ")})`);
  }

  // The same config with this one entry's rules back on for its files.
  const overrides = (config.overrides ?? []).filter((_, i) => i !== index);
  const found = breaches({ ...config, overrides }, present);
  const unneeded = present.flatMap((file) =>
    rules
      .filter(([rule]) => !found.has(`${file}\t${rule}`))
      .map(([rule]) => `${file}: ${rule} is off but the file does not break it`)
  );
  dead.push(...unneeded);
}

if (dead.length > 0) {
  console.error("Dead exemptions in .oxlintrc.json:\n");
  for (const line of dead) console.error(`  ${line}`);
  console.error(
    "\nRemove each file from that override's `files`. An exemption is for a " +
      "file that still breaks the rule, not for one that came from a file " +
      "that did."
  );
  process.exit(1);
}

console.log("Every oxlint exemption is still needed.");
