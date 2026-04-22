require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const session = require("express-session");
const path = require("path");

const app = express();

// ===== MIDDLEWARE =====
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "ultra-secret-key",
  resave: false,
  saveUninitialized: false,
}));

// ===== FILE STORAGE =====
const DATA_FILE = "data.json";

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      users: [],
      chatHistory: {}
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let { users, chatHistory } = loadData();

// ===== API CHECK =====
if (!process.env.OPENAI_API_KEY) {
  console.log("❌ API KEY missing");
  process.exit(1);
}

// ===== AI CONFIG =====
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ===== AUTH =====
function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Login required" });
  }
  next();
}

// ===== SIGNUP =====
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.json({ message: "Missing fields" });

  const exist = users.find(u => u.username === username);
  if (exist) return res.json({ message: "User exists" });

  users.push({ username, password });
  chatHistory[username] = [];

  saveData({ users, chatHistory });

  res.json({ message: "Signup successful" });
});

// ===== LOGIN =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.json({ message: "Invalid login" });

  req.session.user = user;
  res.json({ message: "Login successful" });
});

// ===== LOGOUT =====
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
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

// ===== CHAT =====
app.post("/chat", isLoggedIn, async (req, res) => {
  try {
    const message = req.body.message;
    const username = req.session.user.username;

    if (!message) return res.json({ reply: "Empty message" });

    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
    });

    let reply = response?.choices?.[0]?.message?.content || "AI failed";

    chatHistory[username].push({
      user: message,
      ai: reply,
      time: new Date()
    });

    saveData({ users, chatHistory });

    res.json({ reply });

  } catch (err) {
    res.json({ reply: "Error: " + err.message });
  }
});

// ===== CHAT HISTORY =====
app.get("/history", isLoggedIn, (req, res) => {
  const username = req.session.user.username;
  res.json(chatHistory[username] || []);
});

// ===== FIR =====
app.post("/fir", isLoggedIn, (req, res) => {
  try {
    const d = req.body;

    const fileName = `FIR_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, fileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(16).text("FIR APPLICATION", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`
Name: ${d.name}
Address: ${d.address}
Problem: ${d.problem}
`);

    doc.end();

    res.json({
      message: "FIR Generated",
      download: `/download/${fileName}`
    });

  } catch (err) {
    res.json({ message: "FIR Error" });
  }
});

// ===== DOWNLOAD =====
app.get("/download/:file", isLoggedIn, (req, res) => {
  const filePath = path.join(__dirname, req.params.file);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.json({ message: "File not found" });
  }
});

// ===== WHATSAPP BOT (TWILIO) =====
app.post("/whatsapp", async (req, res) => {
  const msg = req.body.Body;

  const response = await client.chat.completions.create({
    model: "meta-llama/llama-3-8b-instruct",
    messages: [{ role: "user", content: msg }],
  });

  const reply = response.choices[0].message.content;

  res.send(`
<Response>
<Message>${reply}</Message>
</Response>
`);
});

// ===== VOICE API (frontend use) =====
app.post("/voice", async (req, res) => {
  const text = req.body.text;

  const response = await client.chat.completions.create({
    model: "meta-llama/llama-3-8b-instruct",
    messages: [{ role: "user", content: text }],
  });

  res.json({ reply: response.choices[0].message.content });
});

// ===== HEALTH =====
app.get("/", (req, res) => {
  res.send("🚀 Legal AI PRO MAX running");
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
