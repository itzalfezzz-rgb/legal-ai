require("dotenv").config();

const prompt = require("prompt-sync")({ sigint: true });
const OpenAI = require("openai");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// ===== INIT =====
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `
You are a professional Indian legal AI.

Analyze user input and extract:

- crime (short)
- section (relevant Indian law like BNS/IPC)
- policeAction (clear action)

Respond ONLY in valid JSON:
{
  "crime": "",
  "section": "",
  "policeAction": ""
}
`;

// ===== SAFE JSON PARSER =====
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      crime: text,
      section: "Relevant Sections (BNS/IPC)",
      policeAction: "Register FIR and investigate"
    };
  }
}

// ===== FIR GENERATOR =====
function generateFIR(data, user) {
  return `
==============================
        FIR APPLICATION
==============================

To,
The Station House Officer
${user.policeStation}

Subject: Complaint regarding ${data.crime}

Respected Sir/Madam,

I, ${user.name}, S/o ${user.father}, resident of ${user.address}, hereby file a complaint against ${user.accused}.

That on ${user.date}, the accused was involved in the following act:
${data.crime}

Applicable Law:
${data.section}

Requested Action:
${data.policeAction}

Kindly take necessary legal action at the earliest.

Thanking You,

${user.name}

==============================
`;
}

// ===== PDF GENERATOR =====
function generatePDF(text) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("AI_FIR.pdf"));

  doc.fontSize(16).text("FIR APPLICATION", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(text);

  doc.end();
}

// ===== MAIN =====
async function run() {
  console.log("\n⚖️ ADVOCATE AI - FIR + PDF SYSTEM 🇮🇳\n");

  const problem = prompt("Describe your problem: ");

  if (!problem) {
    console.log("❌ Problem required");
    return;
  }

  const user = {
    name: prompt("Your Name: "),
    father: prompt("Father Name: "),
    address: prompt("Address: "),
    accused: prompt("Accused Name: "),
    policeStation: prompt("Police Station: "),
    date: prompt("Date: ")
  };

  try {
    // ===== AI CALL =====
    const res = await client.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: problem }
      ],
    });

    const aiText = res.choices[0].message.content.trim();
    const data = safeParse(aiText);

    // ===== GENERATE FIR =====
    const firText = generateFIR(data, user);

    // ===== SAVE FILES =====
    fs.writeFileSync("AI_FIR.txt", firText);
    generatePDF(firText);

    // ===== OUTPUT =====
    console.log("\n📊 AI ANALYSIS:\n", data);
    console.log("\n📄 FIR PREVIEW:\n");
    console.log(firText);

    console.log("✅ Saved: AI_FIR.txt");
    console.log("📄 Saved: AI_FIR.pdf\n");

  } catch (err) {
    if (err.status === 401) {
      console.log("❌ Invalid API Key");
    } else if (err.status === 429) {
      console.log("⚠️ Rate limit — wait and retry");
    } else {
      console.log("❌ Error:", err.message);
    }
  }
}

run();
