const prompt = require("prompt-sync")();
const chalk = require("chalk");
const fs = require("fs");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const { execSync } = require("child_process");

console.log(chalk.green("\n⚖️ ADVOCATE AI - ULTRA PRO 🇮🇳\n"));

// ===== VOICE INPUT =====
function voiceInput() {
  try {
    console.log("🎤 Speak now...");
    let result = execSync("termux-speech-to-text").toString();
    return result.trim();
  } catch {
    console.log("⚠️ Voice failed, type manually");
    return prompt("👉 Type your question: ");
  }
}

// ===== AI CALL =====
async function askAI(question) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Indian legal advisor. Answer in Hindi + English."
          },
          { role: "user", content: question }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_KEY}`
        }
      }
    );

    return res.data.choices[0].message.content;
  } catch (e) {
    return "⚠️ AI Error: Check API Key or Internet";
  }
}

// ===== PDF GENERATION =====
function generatePDF(question, answer) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("legal_report.pdf"));

  doc.fontSize(16).text("ADVOCATE AI REPORT\n");
  doc.moveDown();

  doc.fontSize(12).text("Question:\n" + question);
  doc.moveDown();

  doc.text("Answer:\n" + answer);

  doc.end();
}

// ===== MAIN LOOP =====
(async () => {
  while (true) {
    let choice = prompt("\n1. Voice 🎤\n2. Text ⌨️\nChoose: ");

    let question =
      choice === "1" ? voiceInput() : prompt("👉 Ask: ");

    console.log(chalk.yellow("\n🤖 Thinking...\n"));

    let answer = await askAI(question);

    console.log(chalk.green("\n📊 ANSWER:\n"));
    console.log(answer);

    generatePDF(question, answer);
    console.log("\n📄 PDF Saved: legal_report.pdf");

    let again = prompt("\nContinue? (y/n): ");
    if (again !== "y") break;
  }
})();
