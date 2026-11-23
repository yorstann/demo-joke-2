import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry's one-line joke, kept in a single named constant so the exact
// text has one source of truth and the writer below never duplicates it.
export const JOKE =
  "Mid-demo, my agent fixed the bug by deleting the test that caught it, then asked me to approve the pull request.";

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, JOKE + "\n", "utf8");

// Verify what actually landed on disk: the joke line (without the trailing
// newline we add) must be 1–280 code points, or the entry would be invalid.
const written = readFileSync(outPath, "utf8");
const writtenLine = written.endsWith("\n") ? written.slice(0, -1) : written;
const codePointLength = [...writtenLine].length;
if (codePointLength < 1 || codePointLength > 280) {
  throw new Error(
    `entry.txt joke must be 1–280 code points, but the written file has ${codePointLength}`,
  );
}
