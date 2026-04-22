const prompt = require("prompt-sync")();
const chalk = require("chalk");

console.log(chalk.green("\n⚖️ ADVOCATE AI - HINDI SYSTEM 🇮🇳\n"));

let input = prompt("👉 Apna legal sawal likho: ").toLowerCase();

// ===== DATABASE =====
const database = [
  {
    name: "बलात्कार (Rape Case)",
    keywords: ["rape", "balatkar"],
    law: "BNS 2023",
    section: "धारा 63",
    advice: "तुरंत FIR दर्ज करें",
    type: "गंभीर अपराध"
  },
  {
    name: "दहेज मामला",
    keywords: ["dowry", "dahej"],
    law: "Dowry Act",
    section: "धारा 3/4",
    advice: "पुलिस शिकायत करें",
    type: "गंभीर"
  },
  {
    name: "चोरी",
    keywords: ["chori", "theft"],
    law: "BNS",
    section: "धारा 303",
    advice: "FIR दर्ज करें",
    type: "अपराध"
  },
  {
    name: "लूट",
    keywords: ["loot", "robbery"],
    law: "BNS",
    section: "धारा 309",
    advice: "तुरंत पुलिस को बताएं",
    type: "गंभीर"
  },
  {
    name: "जमीन विवाद",
    keywords: ["zamin", "jameen", "land"],
    law: "CPC 1908",
    section: "सिविल",
    advice: "कोर्ट केस करें",
    type: "सिविल"
  },
  {
    name: "पैसे का विवाद",
    keywords: ["paise", "loan", "udhar", "money"],
    law: "Contract Act",
    section: "रिकवरी",
    advice: "लीगल नोटिस भेजें",
    type: "सिविल"
  }
];

// ===== SEARCH =====
function findCase(text) {
  for (let c of database) {
    for (let k of c.keywords) {
      if (text.includes(k)) return c;
    }
  }
  return null;
}

let result = findCase(input);

// ===== OUTPUT =====
console.log("\n📊 RESULT:\n");

if (result) {
  console.log("📌 मामला:", result.name);
  console.log("⚖️ कानून:", result.law);
  console.log("📖 धारा:", result.section);
  console.log("💡 सलाह:", result.advice);
} else {
  console.log("⚠️ समझ नहीं आया");
}

// ===== LOOP =====
while (true) {
  let next = prompt("\n💬 अगला सवाल (exit to stop): ").toLowerCase();

  if (next === "exit") break;

  let res = findCase(next);

  console.log("\n📊 RESULT:\n");

  if (res) {
    console.log("📌 मामला:", res.name);
    console.log("⚖️ कानून:", res.law);
    console.log("📖 धारा:", res.section);
    console.log("💡 सलाह:", res.advice);
  } else {
    console.log("⚠️ समझ नहीं आया");
  }
}
