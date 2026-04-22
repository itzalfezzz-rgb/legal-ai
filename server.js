require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ===== API CHECK =====
if (!process.env.OPENAI_API_KEY) {
  console.log("❌ API KEY missing in .env");
  process.exit(1);
}

// ===== AI CONFIG =====
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `
You are Advocate AI (India).

Answer in Hinglish.

Format:
1. Issue
2. Law
3. Action
4. Advice
`;

// ===== CHAT API (ULTRA SAFE) =====
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.json({ reply: "❌ Please type something" });
    }

    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
    });

    // ===== SAFE EXTRACTION =====
    let reply = "⚠️ AI failed to respond";

    if (response && response.choices && response.choices.length > 0) {
      const msg = response.choices[0].message;
      if (msg && msg.content) {
        reply = msg.content;
      }
    }

    console.log("✅ AI Response:", reply);

    res.json({ reply });

  } catch (err) {
    console.log("❌ ERROR:", err.message);

    let errorMsg = "Server Error";

    if (err.status === 401) errorMsg = "❌ Invalid API Key";
    else if (err.status === 429) errorMsg = "⚠️ Rate limit — wait 1 min";
    else if (err.message) errorMsg = err.message;

    res.json({ reply: errorMsg });
  }
});

// ===== FIR API =====
app.post("/fir", (req, res) => {
  try {
    const d = req.body;

    const firText = `
FIR APPLICATION

To,
${d.policeStation || ""}

Subject: Complaint regarding ${d.problem || ""}

Name: ${d.name || ""}
Father: ${d.father || ""}
Address: ${d.address || ""}
Accused: ${d.accused || ""}
Date: ${d.date || ""}

Details:
${d.problem || ""}

Signature:
${d.name || ""}
`;

    fs.writeFileSync("FIR.txt", firText);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream("FIR.pdf"));

    doc.fontSize(16).text("FIR APPLICATION", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(firText);

    doc.end();

    console.log("📄 FIR Generated");

    res.json({ reply: "FIR Generated ✅ (Check folder)" });

  } catch (err) {
    res.json({ reply: "❌ FIR Error: " + err.message });
  }
});

// ===== START =====
app.listen(3000, () => {
  console.log("🚀 Running: http://localhost:3000");
});
