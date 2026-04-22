const prompt = require("prompt-sync")();
const chalk = require("chalk");
const fs = require("fs");

console.log(chalk.green("⚖️ ADVOCATE AI - PRO SYSTEM\n"));

let input = prompt("Ask your legal question: ").toLowerCase();

// ===== LOAD DATA =====
const constitution = JSON.parse(
  fs.readFileSync("./database/constitution.json")
);

const cases = JSON.parse(
  fs.readFileSync("./database/cases.json")
);

// ===== SEARCH =====
function searchConstitution(text) {
  for (let key in constitution) {
    if (text.includes(key)) {
      return `📜 ${key.toUpperCase()} → ${constitution[key]}`;
    }
  }
  return null;
}

function searchCases(text) {
  for (let c of cases) {
    for (let k of c.keywords) {
      if (text.includes(k)) {
        return `⚖️ ${c.name}\n📖 ${c.summary}`;
      }
    }
  }
  return null;
}

// ===== RESULT =====
let c1 = searchConstitution(input);
let c2 = searchCases(input);

console.log("\n📊 RESULT:\n");

if (c1) console.log(c1);
if (c2) console.log(c2);

if (!c1 && !c2) {
  console.log("⚠️ No data found → expand database or use AI API");
}
