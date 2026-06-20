import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const outDir = path.join(root, ".tmp-reading-tests");
const files = [
  "lib/lunar-converter.ts",
  "lib/xiaoliu-ren.ts",
  "lib/ming-gong.ts",
  "lib/marriage-direction.ts",
];

await rm(outDir, { recursive: true, force: true });
await mkdir(path.join(outDir, "lib"), { recursive: true });
await writeFile(path.join(outDir, "package.json"), JSON.stringify({ type: "commonjs" }));

for (const file of files) {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(path.join(root, file), "utf8"),
  );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: file,
  });
  await writeFile(path.join(outDir, file.replace(/\.ts$/, ".js")), output.outputText);
}

const lunar = await import(pathToFileURL(path.join(outDir, "lib/lunar-converter.js")));
const xlr = await import(pathToFileURL(path.join(outDir, "lib/xiaoliu-ren.js")));
const ming = await import(pathToFileURL(path.join(outDir, "lib/ming-gong.js")));
const marriage = await import(pathToFileURL(path.join(outDir, "lib/marriage-direction.js")));

const cases = [];
function test(name, fn) {
  cases.push({ name, fn });
}

test("lunar converter handles Spring Festival boundary", () => {
  assert.deepEqual(
    pick(lunar.fromGregorian("2024-02-09"), ["month", "day", "isLeapMonth"]),
    { month: 12, day: 30, isLeapMonth: false },
  );
  assert.deepEqual(
    pick(lunar.fromGregorian("2024-02-10"), ["month", "day", "isLeapMonth"]),
    { month: 1, day: 1, isLeapMonth: false },
  );
});

test("lunar converter preserves leap month flag", () => {
  const converted = lunar.fromGregorian("2023-03-22");
  assert.equal(converted.month, 2);
  assert.equal(converted.day, 1);
  assert.equal(converted.isLeapMonth, true);
});

test("lunar converter rejects unsupported years", () => {
  assert.throws(() => lunar.fromGregorian("1899-12-31"), /UNSUPPORTED_GREGORIAN_YEAR/);
  assert.throws(() => lunar.fromGregorian("2101-01-01"), /UNSUPPORTED_GREGORIAN_YEAR/);
});

test("xiaoliu-ren hour index boundaries", () => {
  assert.equal(xlr.getHourIndex(0), 1);
  assert.equal(xlr.getHourIndex(1), 2);
  assert.equal(xlr.getHourIndex(22), 12);
  assert.equal(xlr.getHourIndex(23), 1);
});

test("xiaoliu-ren acceptance examples", () => {
  assert.equal(xlr.calculateXiaoliuRen(1, 1, 23).result, "大安");
  assert.equal(xlr.calculateXiaoliuRen(4, 11, 15).result, "赤口");
});

test("xiaoliu-ren reading returns trace and ignores question in calculation", () => {
  const result = xlr.createXiaoliuRenReading({
    occurredAt: "2026-06-20T15:30:00+08:00",
    timezone: "Asia/Shanghai",
    question: "这次沟通是否适合今天推进？",
  });
  assert.equal(result.input.questionIncludedInCalculation, false);
  assert.equal(result.calculation.formula, "mod(lunarMonth + lunarDay + hourIndex - 3, 6)");
  assert.ok(result.calculation.trace.length >= 5);
});

test("ming-gua acceptance examples", () => {
  assert.equal(ming.calculateMingGuaNumber(1995, "male"), 2);
  assert.equal(ming.calculateMingGuaNumber(2018, "female"), 6);
  assert.equal(ming.calculateMingGuaNumber(1984, "male"), 7);
  assert.equal(ming.calculateMingGuaNumber(1990, "female"), 8);
});

test("ming-gua nine-year snapshot", () => {
  const male = range(1984, 1993).map((year) => ming.calculateMingGuaNumber(year, "male"));
  const female = range(1984, 1993).map((year) => ming.calculateMingGuaNumber(year, "female"));
  assert.deepEqual(male, [7, 6, 2, 4, 3, 2, 1, 9, 8, 7]);
  assert.deepEqual(female, [8, 9, 1, 2, 3, 4, 8, 6, 7, 8]);
});

test("ming-gua match levels", () => {
  const best = ming.calculateMingGuaMatch(
    ming.calculateMingGua({ birthYear: 1995, gender: "male" }),
    ming.calculateMingGua({ birthYear: 2018, gender: "female" }),
  );
  assert.equal(best.result.level, "traditional-best-pair");

  const same = ming.calculateMingGuaMatch(
    ming.calculateMingGua({ birthYear: 1987, gender: "male" }),
    ming.calculateMingGua({ birthYear: 1990, gender: "male" }),
  );
  assert.equal(same.result.level, "same-group");

  const cross = ming.calculateMingGuaMatch(
    ming.calculateMingGua({ birthYear: 1995, gender: "male" }),
    ming.calculateMingGua({ birthYear: 1987, gender: "male" }),
  );
  assert.equal(cross.result.level, "cross-group");
});

test("marriage direction acceptance examples", () => {
  assert.deepEqual(
    pick(marriage.calculateMarriageDirectionFromLunar(3, 3), [
      "branch",
      "direction",
      "axis",
    ]),
    { branch: "午", direction: "南", axis: "南—北" },
  );
  assert.deepEqual(
    pick(marriage.calculateMarriageDirectionFromLunar(1, 1), [
      "branch",
      "direction",
      "axis",
    ]),
    { branch: "寅", direction: "东北", axis: "东北—西南" },
  );
});

let failed = 0;
for (const item of cases) {
  try {
    item.fn();
    console.log(`ok - ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${item.name}`);
    console.error(error);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`\n${cases.length} reading engine tests passed.`);
}

function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
