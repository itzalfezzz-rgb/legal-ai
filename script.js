async function send() {
  const inputBox = document.getElementById("input");
  const chatBox = document.getElementById("chatBox");

  const input = inputBox.value.trim();

  // ❌ Empty check
  if (!input) return;

  // 👉 User message show
  chatBox.innerHTML += `
    <div class="user">You: ${input}</div>
  `;

  // Clear input
  inputBox.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();

    // ✅ Safe reply
    const reply = data.reply || "⚠️ No response from AI";

    chatBox.innerHTML += `
      <div class="ai">AI: ${reply}</div>
    `;

  } catch (err) {
    chatBox.innerHTML += `
      <div class="ai">❌ Error connecting to server</div>
    `;
  }

  // 🔥 Auto scroll (important)
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("input").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    send();
  }
});
