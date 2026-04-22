async function send() {
  const input = document.getElementById("input").value;

  const res = await fetch("/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ message: input })
  });

  const data = await res.json();

  document.getElementById("chatBox").innerHTML +=
    "<p><b>You:</b> " + input + "</p>" +
    "<p><b>AI:</b> " + data.reply + "</p>";
}

async function generateFIR() {
  const data = {
    name: name.value,
    father: father.value,
    address: address.value,
    accused: accused.value,
    policeStation: police.value,
    date: date.value,
    problem: problem.value
  };

  await fetch("/fir", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  alert("FIR Generated ✅");
}

/* 🔥 SCROLL ANIMATION */
window.addEventListener("scroll", () => {
  const scroll = window.scrollY;
  const adv = document.getElementById("advocate");

  if (adv) {
    adv.style.transform = `translateX(${scroll * 0.5}px)`;
  }
});
