"use strict";

// ===== 状態 =====
const state = {
  profile: { sex: "male", age: 30, height: 170, weight: 60, activity: 1.55 },
  targetCal: 0, // 1食分の目標カロリー
  fullness: 0,
  calories: 0,
  round: 0,
  maxRounds: 20,
  eaten: [],
  combo: 0,
  bestCombo: 0,
  pair: [],
  assist: false,
};

const TARGET_FULLNESS = 80; // 腹八分目
const MAX_FULLNESS = 100; // これを超えると食べすぎ失敗

const $ = (id) => document.getElementById(id);

// ===== 画面切り替え =====
function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $("screen-" + name).classList.add("active");
  window.scrollTo(0, 0);
}

// ===== 栄養計算（Mifflin-St Jeor 式）=====
function calcTargets(p) {
  const base =
    10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "male" ? 5 : -161);
  const bmr = Math.round(base); // 基礎代謝
  const tdee = Math.round(bmr * p.activity); // 1日の総消費カロリー
  const perMeal = Math.round(tdee / 3); // 1食分
  return { bmr, tdee, perMeal };
}

// ===== 設定画面 =====
function readProfile() {
  const sex = document.querySelector("#seg-sex button.active").dataset.val;
  const age = clampNum($("in-age").value, 10, 100, 30);
  const height = clampNum($("in-height").value, 120, 220, 170);
  const weight = clampNum($("in-weight").value, 30, 200, 60);
  const activity = parseFloat($("in-activity").value);
  return { sex, age, height, weight, activity };
}

function clampNum(v, min, max, fallback) {
  const n = parseFloat(v);
  if (isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function updateEstimate() {
  const p = readProfile();
  const t = calcTargets(p);
  $("estimate").innerHTML =
    `<div class="est-row"><span>基礎代謝</span><b>${t.bmr.toLocaleString()} kcal/日</b></div>` +
    `<div class="est-row"><span>1日の必要量</span><b>${t.tdee.toLocaleString()} kcal/日</b></div>` +
    `<div class="est-row hot"><span>この1食の目標</span><b>${t.perMeal.toLocaleString()} kcal</b></div>`;
}

// ===== ゲーム =====
function startGame() {
  state.profile = readProfile();
  state.targetCal = calcTargets(state.profile).perMeal;
  state.fullness = 0;
  state.calories = 0;
  state.round = 0;
  state.eaten = [];
  state.combo = 0;
  state.bestCombo = 0;
  state.assist = $("in-assist").checked;

  saveProfile();

  $("cal-target").textContent = state.targetCal.toLocaleString();
  // カロリーゲージの最大値は目標の2倍を上限として表示
  $("cal-target-line").style.left = "50%";

  showScreen("game");
  renderGauges(true);
  nextPair();
}

function nextPair() {
  state.round++;
  if (state.round > state.maxRounds) {
    finish("rounds");
    return;
  }
  $("round-label").textContent = `ラウンド ${state.round} / ${state.maxRounds}`;

  // 重複しない2品をランダムに
  const i = Math.floor(Math.random() * FOODS.length);
  let j = Math.floor(Math.random() * FOODS.length);
  while (j === i) j = Math.floor(Math.random() * FOODS.length);
  state.pair = [FOODS[i], FOODS[j]];

  renderCards();
}

function renderCards() {
  state.pair.forEach((food, idx) => {
    const el = $("card-" + idx);
    let detail = `<span class="food-tag tag-${food.tag}">${TAG_LABEL[food.tag]}</span>`;
    if (state.assist) {
      detail += `<span class="food-detail">満腹+${food.fill}% / ${food.cal}kcal</span>`;
    }
    el.innerHTML =
      `<span class="food-emoji">${food.emoji}</span>` +
      `<span class="food-name">${food.name}</span>` +
      detail;
    el.classList.remove("pop");
    void el.offsetWidth; // reflow でアニメ再生
    el.classList.add("pop");
  });
}

function eat(idx) {
  const food = state.pair[idx];
  const newFullness = state.fullness + food.fill;

  state.calories += food.cal;
  state.eaten.push(food);

  // ヘルシー判定（カロリー密度が低いほど健康的）→ コンボ
  const density = food.cal / food.fill; // 低いほど良い
  if (density <= 12) {
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
  } else {
    state.combo = 0;
  }

  showToast(`${food.emoji} ${food.name}　満腹 +${food.fill}%・${food.cal}kcal`);

  // 食べすぎ判定
  if (newFullness > MAX_FULLNESS) {
    state.fullness = newFullness;
    renderGauges();
    finish("overfull");
    return;
  }

  state.fullness = newFullness;
  renderGauges();
  updateCombo();
  nextPair();
}

function skip() {
  state.combo = 0;
  updateCombo();
  showToast("⏭️ スキップ");
  nextPair();
}

function updateCombo() {
  const el = $("combo-label");
  if (state.combo >= 2) {
    el.textContent = `🔥 ヘルシー ${state.combo} 連続`;
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function renderGauges(instant) {
  const fPct = Math.min(100, state.fullness);
  $("fullness-val").textContent = Math.round(state.fullness);
  $("fullness-fill").style.width = fPct + "%";
  const fFill = $("fullness-fill");
  if (state.fullness > MAX_FULLNESS) fFill.className = "fill danger";
  else if (state.fullness >= 70 && state.fullness <= 90) fFill.className = "fill good";
  else fFill.className = "fill";

  const calMax = state.targetCal * 2;
  const cPct = Math.min(100, (state.calories / calMax) * 100);
  $("cal-val").textContent = state.calories.toLocaleString();
  $("cal-fill").style.width = cPct + "%";
  const cFill = $("cal-fill");
  if (state.calories > state.targetCal) cFill.className = "fill over";
  else cFill.className = "fill cal-ok";

  if (state.calories > state.targetCal) {
    $("cal-sub").textContent = `⚠️ 目標を ${(state.calories - state.targetCal).toLocaleString()}kcal オーバー`;
    $("cal-sub").className = "gauge-sub warn";
  } else {
    $("cal-sub").textContent = `あと ${(state.targetCal - state.calories).toLocaleString()}kcal が目標内`;
    $("cal-sub").className = "gauge-sub";
  }
}

let toastTimer = null;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.remove("show");
  void t.offsetWidth;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 1600);
}

// ===== 結果 =====
function finish(reason) {
  const F = state.fullness;
  const C = state.calories;
  const T = state.targetCal;

  // 満腹度スコア（80%に近いほど高い）
  const fullnessScore = Math.max(0, 100 - Math.abs(F - TARGET_FULLNESS) * 3);
  // 健康スコア（目標カロリー以内なら満点、超過で減点）
  let healthScore;
  if (C <= T) healthScore = 100;
  else healthScore = Math.max(0, 100 - ((C - T) / T) * 120);

  let total = Math.round(fullnessScore * 0.6 + healthScore * 0.4);
  total += Math.min(15, state.bestCombo * 2); // コンボボーナス

  let grade, title, message, failed = false;

  if (reason === "overfull") {
    failed = true;
    total = 0;
    grade = "F";
    title = "食べすぎ！🤢";
    message = "お腹がはちきれそう…。引き際を見極めよう。次はもう少し手前で「ごちそうさま」を。";
  } else if (F < 40) {
    grade = "D";
    total = Math.round(total * 0.5);
    title = "物足りない…🥲";
    message = "腹八分目には程遠い量。もう少し食べないと栄養もエネルギーも足りないよ。";
  } else {
    total = Math.min(100, total);
    if (total >= 95) {
      grade = "S"; title = "完璧な腹八分目！✨";
      message = "理想的な食事！満足感もカロリーも文句なし。食の達人です。";
    } else if (total >= 85) {
      grade = "A"; title = "お見事！😋";
      message = "とても良いバランス。腹八分目を狙えていて健康的な選択でした。";
    } else if (total >= 70) {
      grade = "B"; title = "なかなか！🙂";
      message = C > T ? "満腹度はいい感じ。でもカロリーがやや高め。野菜を増やそう。"
                      : "良い感じ！もう少し80%に寄せられると満点が見えてくる。";
    } else if (total >= 55) {
      grade = "C"; title = "うーん…😐";
      message = C > T ? "カロリーオーバー気味。スナックやスイーツは膨れないのに高カロリー！"
                      : "腹八分目から少しズレ気味。引き際の見極めが鍵。";
    } else {
      grade = "D"; title = "練習あるのみ！😅";
      message = C > T ? "高カロリーな選択が多かったみたい。野菜・果物・汁物で賢く膨らませよう。"
                      : "目標から大きくズレました。満腹度80%・カロリー目標内を狙おう。";
    }
  }

  // ベストスコア保存
  const best = saveBest(total);

  // 描画
  $("result-grade").textContent = grade;
  $("result-grade").className = "grade grade-" + grade;
  $("result-title").textContent = title;
  $("result-message").textContent = message;
  $("r-fullness").textContent = Math.round(F);
  $("r-cal").textContent = C.toLocaleString();
  $("r-cal-target").textContent = T.toLocaleString();
  $("r-score").textContent = total;
  $("result-best").textContent = `ベストスコア: ${best}`;

  renderEaten();
  showScreen("result");
}

function renderEaten() {
  const el = $("result-eaten");
  if (state.eaten.length === 0) {
    el.innerHTML = "<div class='eaten-title'>何も食べませんでした</div>";
    return;
  }
  // 集計
  const counts = {};
  state.eaten.forEach((f) => {
    counts[f.name] = counts[f.name] || { food: f, n: 0 };
    counts[f.name].n++;
  });
  const items = Object.values(counts)
    .map((c) => `<span class="eaten-item">${c.food.emoji} ${c.food.name}${c.n > 1 ? "×" + c.n : ""}</span>`)
    .join("");
  el.innerHTML = `<div class='eaten-title'>食べたもの（${state.eaten.length}品）</div><div class='eaten-list'>${items}</div>`;
}

// ===== 保存（localStorage）=====
function saveProfile() {
  try {
    localStorage.setItem("hachibu_profile", JSON.stringify({
      sex: state.profile.sex, age: state.profile.age,
      height: state.profile.height, weight: state.profile.weight,
      activity: state.profile.activity, assist: state.assist,
    }));
  } catch (e) {}
}

function loadProfile() {
  try {
    const p = JSON.parse(localStorage.getItem("hachibu_profile"));
    if (!p) return;
    $("in-age").value = p.age;
    $("in-height").value = p.height;
    $("in-weight").value = p.weight;
    $("in-activity").value = p.activity;
    $("in-assist").checked = !!p.assist;
    document.querySelectorAll("#seg-sex button").forEach((b) => {
      b.classList.toggle("active", b.dataset.val === p.sex);
    });
  } catch (e) {}
}

function saveBest(score) {
  let best = 0;
  try {
    best = parseInt(localStorage.getItem("hachibu_best") || "0", 10);
    if (score > best) {
      best = score;
      localStorage.setItem("hachibu_best", String(best));
    }
  } catch (e) {}
  return best;
}

// ===== イベント登録 =====
function init() {
  loadProfile();
  updateEstimate();

  // 性別セグメント
  document.querySelectorAll("#seg-sex button").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#seg-sex button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      updateEstimate();
    });
  });

  ["in-age", "in-height", "in-weight", "in-activity"].forEach((id) => {
    $(id).addEventListener("input", updateEstimate);
    $(id).addEventListener("change", updateEstimate);
  });

  $("btn-start").addEventListener("click", startGame);
  $("card-0").addEventListener("click", () => eat(0));
  $("card-1").addEventListener("click", () => eat(1));
  $("btn-skip").addEventListener("click", skip);
  $("btn-finish").addEventListener("click", () => finish("manual"));
  $("btn-replay").addEventListener("click", startGame);
  $("btn-back").addEventListener("click", () => showScreen("setup"));
}

document.addEventListener("DOMContentLoaded", init);
