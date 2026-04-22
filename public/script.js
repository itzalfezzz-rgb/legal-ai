// ==============================
// GLOBAL CONFIG
// ==============================
const API = ""; // same origin

// ==============================
// AUTH SYSTEM
// ==============================
async function signup() {
  const res = await fetch("/signup", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const data = await res.json();
  showToast(data.message);
}

async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const data = await res.json();
  showToast(data.message);

  if (data.message.includes("successful")) {
    loadHistory();
  }
}

// ==============================
// CHAT SYSTEM (ADVANCED)
// ==============================
async function send() {
  let text = msg.value.trim();
  if (!text) return;

  addChat("user", text);
  msg.value = "";

  typing(true);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    typing(false);
    addChat("ai", data.reply);

    speak(data.reply); // 🔥 voice reply

  } catch (err) {
    typing(false);
    addChat("ai", "⚠️ Server error");
  }
}

// ==============================
// CHAT UI (GLASS + ANIMATION)
// ==============================
function addChat(type, text) {
  const div = document.createElement("div");

  div.className = type === "user" ? "chat user" : "chat ai";

  div.innerHTML = `
    <div class="bubble">${text}</div>
  `;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// typing animation
function typing(show) {
  let id = "typing";

  if (show) {
    let div = document.createElement("div");
    div.id = id;
    div.innerHTML = "🤖 typing...";
    chatBox.appendChild(div);
  } else {
    let el = document.getElementById(id);
    if (el) el.remove();
  }
}

// ==============================
// HISTORY LOAD
// ==============================
async function loadHistory() {
  const res = await fetch("/history");
  const data = await res.json();

  chatBox.innerHTML = "";

  data.forEach(chat => {
    addChat("user", chat.user);
    addChat("ai", chat.ai);
  });
}

// ==============================
// VOICE SYSTEM (SIRI STYLE BASIC)
// ==============================
function voice() {
  let rec = new webkitSpeechRecognition();
  rec.lang = "en-IN";

  rec.onresult = function(e) {
    msg.value = e.results[0][0].transcript;
    send();
  };

  rec.start();
}

// AI SPEAK BACK
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 1;
  speech.pitch = 1;
  window.speechSynthesis.speak(speech);
}

// ==============================
// FIR GENERATOR
// ==============================
async function fir() {
  const res = await fetch("/fir", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      name: document.getElementById("name").value,
      problem: document.getElementById("problem").value
    })
  });

  const data = await res.json();

  showToast(data.message);

  if (data.download) {
    window.open(data.download);
  }
}

// ==============================
// WHATSAPP SMART BUTTON
// ==============================
function openWhatsApp() {
  let text = encodeURIComponent("Hello, I need legal help.");
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

// ==============================
// SOCIAL LINKS (PRO FEATURE)
// ==============================
function openSocial(type) {
  const links = {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com"
  };

  window.open(links[type], "_blank");
}

// ==============================
// UI TOAST (MODERN)
// ==============================
function showToast(msg) {
  let t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;

  document.body.appendChild(t);

  setTimeout(() => t.remove(), 3000);
}

// ==============================
// PARTICLE BACKGROUND (LIGHT)
// ==============================
function particles() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2
    });
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = "rgba(0,255,255,0.5)";
      ctx.fill();

      p.y += 0.3;
      if (p.y > canvas.height) p.y = 0;
    });

    requestAnimationFrame(draw);
  }

  draw();
}

particles();

// ==============================
// PARALLAX EFFECT
// ==============================
window.addEventListener("scroll", () => {
  document.body.style.backgroundPositionY =
    window.scrollY * 0.5 + "px";
});
