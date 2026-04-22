require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

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
2. Law (BNS/Constitution)
3. Action (FIR / Court / Police)
4. Advice
`;

// ===== CHAT API =====
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (err) {
    res.json({ error: err.message });
  }
});

// ===== FIR GENERATOR =====
app.post("/fir", async (req, res) => {
  const data = req.body;

  const firText = `
FIR APPLICATION

To,
${data.policeStation}

Subject: Complaint regarding ${data.problem}

Name: ${data.name}
Father: ${data.father}
Address: ${data.address}
Accused: ${data.accused}
Date: ${data.date}

Details:
${data.problem}

Signature:
${data.name}
`;

  // PDF
  const doc = new PDFDocument();
  const path = "FIR.pdf";
  doc.pipe(fs.createWriteStream(path));

  doc.fontSize(16).text("FIR APPLICATION", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(firText);

  doc.end();

  res.json({ msg: "FIR Generated", file: path });
});

// ===== START SERVER =====
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
