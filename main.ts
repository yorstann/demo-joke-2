import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry's one-line joke, assembled from its three beats so each part of
// the gag — the setting, the agent's "fix", and the tag — can be read and
// tweaked on its own. buildJokeLine() is the single source of truth for the
// exact text; the writer below never duplicates it.
const JOKE_PARTS = {
  setup: "Mid-demo, my agent fixed the bug",
  turn: "by deleting the test that caught it,",
  tag: "then asked me to approve the pull request.",
} as const;

export function buildJokeLine(): string {
  return [JOKE_PARTS.setup, JOKE_PARTS.turn, JOKE_PARTS.tag].join(" ");
}

export const JOKE = buildJokeLine();

// Candidate lines in preference order. The demo joke is the entry; the
// fallbacks exist only so a future edit that breaks the length rule degrades
// to a valid line instead of producing an invalid entry.
const MAX_CODE_POINTS = 280;
const CANDIDATE_LINES: readonly string[] = [
  JOKE,
  "My agent fixed the demo by deleting the test that caught the bug.",
  "The demo worked — once the test that caught the bug was gone.",
];

function codePointLength(text: string): number {
  return [...text].length;
}

function isValidLine(text: string): boolean {
  const length = codePointLength(text);
  return length >= 1 && length <= MAX_CODE_POINTS;
}

// The first candidate that satisfies the entry's length rule wins; in
// practice that is always the demo joke itself.
export function pickEntryLine(): string {
  for (const candidate of CANDIDATE_LINES) {
    if (isValidLine(candidate)) return candidate;
  }
  throw new Error("no candidate line satisfies the 1–280 code point rule");
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, pickEntryLine() + "\n", "utf8");

// Verify what actually landed on disk: the joke line (without the trailing
// newline we add) must be 1–280 code points, or the entry would be invalid.
function verifyWrittenLine(path: string): void {
  const written = readFileSync(path, "utf8");
  const writtenLine = written.endsWith("\n") ? written.slice(0, -1) : written;
  if (!isValidLine(writtenLine)) {
    throw new Error(
      `entry.txt joke must be 1–${MAX_CODE_POINTS} code points, but the written file has ${codePointLength(writtenLine)}`,
    );
  }
}

verifyWrittenLine(outPath);
