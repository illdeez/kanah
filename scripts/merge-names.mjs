import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { content } from "./names-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const daysPath = path.join(__dirname, "..", "src", "data", "days.ts");
let src = fs.readFileSync(daysPath, "utf8");

const j = (s) => JSON.stringify(s); // safe TS string literal
let merged = 0;
const missing = [];

for (const [id, c] of Object.entries(content)) {
  // Match the single-line placeholder entry for this id.
  const re = new RegExp(
    `^( *)\\{ id: ${JSON.stringify(id)}, number: (\\d+), name: ("[^"]*"), title: "[^"]*"[\\s\\S]*?contentReady: false \\},`,
    "m"
  );
  const m = src.match(re);
  if (!m) {
    missing.push(id);
    continue;
  }
  const indent = m[1];
  const number = m[2];
  const name = m[3];
  const lines = c.selectedLines.map((l) => `    ${j(l)},`).join("\n");
  const entry =
`${indent}{
${indent}  id: ${j(id)},
${indent}  number: ${number},
${indent}  name: ${name},
${indent}  title: ${j(c.title)},
${indent}  readingTime: ${j(c.readingTime || "٤ دقائق")},
${indent}  story: ${j(c.story)},
${indent}  hiddenMeaning: ${j(c.hiddenMeaning)},
${indent}  lifeImpact: ${j(c.lifeImpact)},
${indent}  reflectionQuestion: ${j(c.reflectionQuestion)},
${indent}  dailyAction: ${j(c.dailyAction)},
${indent}  selectedLines: [
${c.selectedLines.map((l) => `${indent}    ${j(l)},`).join("\n")}
${indent}  ],
${indent}  pledgeText: ${j(c.pledgeText)},
${indent}  contentReady: true,
${indent}},`;
  src = src.replace(re, entry.replace(/\$/g, "$$$$"));
  merged++;
}

fs.writeFileSync(daysPath, src);
console.log(`Merged ${merged} names.`);
if (missing.length) console.log(`No placeholder found for: ${missing.join(", ")}`);
