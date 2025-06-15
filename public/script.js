const regionPos = {
  forehead: { x: 220, y: 80, spread: 62 },
  cheekL: { x: 130, y: 250, spread: 55 },
  cheekR: { x: 355, y: 250, spread: 55 },
  nose: { x: 245, y: 225, spread: 32 },
  chin: { x: 245, y: 390, spread: 38 },
  jaw: { x: 120, y: 340, spread: 50 },
};

const influencerTips = [
  "Try using BHA toner twice a week.",
  "A gentle foam cleanser is best for dry skin.",
  "Vitamin C serums can help with pigmentation.",
  "Patch test everything—especially in a new climate!",
  "Moisturizer is a must in Australia’s dry weather.",
  "Look for SPF 50+ to protect from strong sun.",
];

const translationMock = (text, lang) => {
  if (lang === "ko") return "[ENG] " + text; // 실제 번역 대신 데모
  if (lang === "en") return "[KOR] " + text;
  return text;
};

const faceArea = document.getElementById("face-area");
const form = document.getElementById("form");
const regionSel = document.getElementById("region");
const concernInput = document.getElementById("concernInput");
const envSel = document.getElementById("env");
const langSel = document.getElementById("lang");

const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = function (event) {
  const msg = JSON.parse(event.data);
  if (msg.type === "init") msg.data.forEach(addSticker);
  if (msg.type === "add") addSticker(msg.data);
  if (msg.type === "updateGroupBuy") updateGroupBuy(msg.data);
};

form.onsubmit = function (e) {
  e.preventDefault();
  const region = regionSel.value;
  const concern = concernInput.value.trim();
  const env = envSel.value;
  const lang = langSel.value;
  if (!concern) return;
  ws.send(
    JSON.stringify({
      type: "add",
      data: {
        region,
        concern,
        env,
        lang,
        groupBuyCount: 1,
        id: Date.now() + Math.random(),
      },
    })
  );
  concernInput.value = "";
};

// attach sticker
function addSticker({ region, concern, env, lang, groupBuyCount = 1, id }) {
  const pos = regionPos[region];
  if (!pos) return;
  // random position
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * pos.spread;
  const dx = Math.cos(angle) * radius;
  const dy = Math.sin(angle) * radius * 0.75;

  // container
  const sticker = document.createElement("div");
  sticker.className = "sticker";
  sticker.style.left = pos.x + dx + "px";
  sticker.style.top = pos.y + dy + "px";
  sticker.id = "sticker-" + id;

  // content
  sticker.innerHTML = `<span class="concern">${concern}</span>
    <button class="translate-btn" onclick="showTranslation('${concern.replace(
      /'/g,
      "\\'"
    )}', '${lang}', this)">🌐</button>
    <span class="env-tag">${env}</span>
    <span class="group-buy" onclick="joinGroupBuy('${id}', this)">Group Buy +${groupBuyCount}</span>
    <span class="influencer">💡 ${getRandomTip()}</span>
  `;

  faceArea.appendChild(sticker);
}

// traslate
window.showTranslation = function (text, lang, btn) {
  const translated = translationMock(text, lang);
  btn.textContent = translated;
  setTimeout(() => {
    btn.textContent = "🌐";
  }, 1800);
};

// group buying
window.joinGroupBuy = function (id, btn) {
  ws.send(JSON.stringify({ type: "joinGroupBuy", data: { id } }));
  btn.style.transform = "scale(1.15)";
  setTimeout(() => {
    btn.style.transform = "scale(1)";
  }, 180);
};

// update
function updateGroupBuy({ id, groupBuyCount }) {
  const sticker = document.getElementById("sticker-" + id);
  if (sticker) {
    const gb = sticker.querySelector(".group-buy");
    if (gb) gb.textContent = `Group Buy +${groupBuyCount}`;
    if (groupBuyCount >= 2) gb.style.background = "#fae16c";
  }
}

// random influencers' comment
function getRandomTip() {
  return influencerTips[Math.floor(Math.random() * influencerTips.length)];
}
