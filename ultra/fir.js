const prompt = require("prompt-sync")();
const fs = require("fs");

// ===== HEADER =====
console.log("\n⚖️ FIR AUTO GENERATOR - INDIA 🇮🇳\n");

// ===== INPUT =====
let name = prompt("Your Name: ");
let father = prompt("Father Name: ");
let address = prompt("Address: ");
let policeStation = prompt("Police Station: ");
let date = prompt("Date (DD/MM/YYYY): ");
let incidentDate = prompt("Incident Date: ");
let incidentPlace = prompt("Incident Place: ");
let accused = prompt("Accused Name: ");
let issue = prompt("Describe Incident: ").toLowerCase();

// ===== SMART SECTION DETECTION =====
function detectSection(issue) {
  if (issue.includes("rape") || issue.includes("balatkar"))
    return "BNS Sec 63 (Rape)";
    
  if (issue.includes("theft") || issue.includes("chori"))
    return "BNS Sec 303 (Theft)";
    
  if (issue.includes("robbery") || issue.includes("loot"))
    return "BNS Sec 309 (Robbery)";
    
  if (issue.includes("assault") || issue.includes("maar"))
    return "BNS Sec 115 (Assault)";
    
  if (issue.includes("fraud") || issue.includes("cheat"))
    return "BNS Sec 316 (Cheating)";
    
  if (issue.includes("dowry") || issue.includes("dahej"))
    return "Dowry Prohibition Act Sec 3/4";
    
  if (issue.includes("domestic"))
    return "Domestic Violence Act 2005";
    
  return "Relevant Sections Applicable";
}

let section = detectSection(issue);

// ===== FIR TEXT =====
let fir = `
-------------------------------
          FIR APPLICATION
-------------------------------

To,
The Station House Officer,
${policeStation}

Subject: Complaint regarding ${issue}

Respected Sir/Madam,

I, ${name}, S/o ${father}, resident of ${address}, 
wish to lodge a complaint against ${accused}.

That on ${incidentDate}, at ${incidentPlace}, the accused committed the following act:

"${issue}"

This act constitutes an offence under ${section}.

I request you to kindly register my FIR and take strict legal action against the accused.

Thanking You,

Date: ${date}
Place: ${incidentPlace}

Signature:
${name}
`;

// ===== SAVE FILE =====
fs.writeFileSync("FIR.txt", fir);

// ===== OUTPUT =====
console.log("\n✅ FIR GENERATED SUCCESSFULLY\n");
console.log(fir);

console.log("📄 Saved as: FIR.txt\n");
