require("dotenv").config();

const prompt = require("prompt-sync")({ sigint: true });
const OpenAI = require("openai");

// ✅ OpenRouter config (MOST IMPORTANT)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `
You are Advocate AI — a senior Supreme Court lawyer of India.

Rules:
- Answer in Hindi + English mix (simple language)
- Use Indian law (BNS 2023, BNSS 2023, Constitution)
- Give practical legal steps
- Suggest FIR for criminal cases
- Suggest notice/civil case where needed

Format:
1. Issue
2. Law
3. Action
4. Advice
`;

// ===== MAIN FUNCTION =====
async function run() {
  console.log("\n⚖️ ADVOCATE AI - ULTRA PRO 🤖\n");

  const question = prompt("Ask your legal question: ");

  if (!question) {
    console.log("❌ Question empty");
    return;
  }

  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",// ✅ FREE model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ],
    });

    console.log("\n📊 ANSWER:\n");
    console.log(response.choices[0].message.content);
    console.log("\n✅ Done\n");

  } catch (err) {
    if (err.status === 401) {
      console.log("❌ Invalid API Key (OpenRouter use kar)");
    } else if (err.status === 429) {
      console.log("⚠️ Rate limit hit (thoda wait kar)");
    } else {
      console.log("❌ Error:", err.message);
    }
  }
}

run();
