// ==============================
// 꼬마키즈 모바일 — 핵심 로직
// ==============================

// === 안전한 localStorage ===
const safeStorage = {
  get(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  },
};

// === 상태 ===
const state = {
  stars: parseInt(safeStorage.get("kkomakids_m_stars", "0") || "0", 10),
  recentWords: [],
  questionIndex: 0,
  correctCount: 0,
  results: [],
  questionAnswered: false,
  completePuzzle: null,
};

// === DOM ===
const screens = {
  home: document.getElementById("screen-home"),
  grid: document.getElementById("screen-grid"),
  complete: document.getElementById("screen-complete"),
  result: document.getElementById("screen-result"),
  garage: document.getElementById("screen-garage"),
  balloon: document.getElementById("screen-balloon"),
  balloonResult: document.getElementById("screen-balloon-result"),
  compose: document.getElementById("screen-compose"),
  clap: document.getElementById("screen-clap"),
};
const starCountEl = document.getElementById("starCount");
const cardGridEl = document.getElementById("cardGrid");
const starPopEl = document.getElementById("starPop");
starCountEl.textContent = state.stars;

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// === 별 시스템 ===
function addStar(amount = 1) {
  if (amount > 0) {
    state.stars += amount;
    safeStorage.set("kkomakids_m_stars", String(state.stars));
    starCountEl.textContent = state.stars;
    popStar();
    vibrate(15);
  }
}
function popStar() {
  starPopEl.classList.remove("show");
  void starPopEl.offsetWidth;
  starPopEl.classList.add("show");
}

// === 진동 피드백 (모바일) ===
function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

// ==============================
// TTS — 디바운스 + 큐 관리 (이전 교훈)
// ==============================
let _lastSpeakTime = 0;
let _lastSpeakText = "";
const SPEAK_DEBOUNCE_MS = 250;

function speak(text, lang = "ko-KR") {
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  const now = Date.now();

  // 같은 텍스트 빠른 연속 호출 무시
  if (text === _lastSpeakText && now - _lastSpeakTime < SPEAK_DEBOUNCE_MS) return;

  // 큐 누적 방지 — 데몬 stall 방지
  if (synth.speaking || synth.pending) synth.cancel();

  _lastSpeakTime = now;
  _lastSpeakText = text;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.9;
  utter.pitch = 1.05;
  utter.volume = 1;
  // voice 명시 안 함 — Chrome/Safari 알아서 lang으로 선택

  setTimeout(() => synth.speak(utter), 30);
}

// ==============================
// 카드 그리드 (한글/영어)
// ==============================
function renderCardGrid(items, mode) {
  cardGridEl.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("button");
    card.className = "card";

    const charEl = document.createElement("div");
    charEl.className = "card-char";
    charEl.textContent = item.char;

    const emojiEl = document.createElement("div");
    emojiEl.className = "card-emoji";
    emojiEl.textContent = item.emoji;

    const wordEl = document.createElement("div");
    wordEl.className = "card-word";
    wordEl.textContent = item.word;

    card.appendChild(charEl);
    card.appendChild(emojiEl);
    card.appendChild(wordEl);

    card.addEventListener("click", () => {
      if (mode === "hangul") speak(`${item.name}, ${item.word}`, "ko-KR");
      else                   speak(`${item.char}, ${item.word}`, "en-US");
      addStar();
      // 모바일: 큰 카드 상세 보기
      showCardDetail(item, mode);
    });

    cardGridEl.appendChild(card);
  });
}

// === 카드 상세 (탭 시 풀스크린) ===
const cardDetailEl = document.getElementById("cardDetail");
const detailEmojiEl = document.getElementById("detailEmoji");
const detailCharEl = document.getElementById("detailChar");
const detailWordEl = document.getElementById("detailWord");
const detailSpeakBtn = document.getElementById("detailSpeakBtn");
const detailCloseBtn = document.getElementById("detailCloseBtn");

let _currentDetail = null;
function showCardDetail(item, mode) {
  _currentDetail = { item, mode };
  detailEmojiEl.textContent = item.emoji;
  detailCharEl.textContent = item.char;
  detailWordEl.textContent = item.word;
  cardDetailEl.classList.remove("hidden");
}
function hideCardDetail() {
  cardDetailEl.classList.add("hidden");
  _currentDetail = null;
}
detailSpeakBtn.addEventListener("click", () => {
  if (!_currentDetail) return;
  const { item, mode } = _currentDetail;
  if (mode === "hangul") speak(`${item.name}, ${item.word}`, "ko-KR");
  else                   speak(`${item.char}, ${item.word}`, "en-US");
});
detailCloseBtn.addEventListener("click", hideCardDetail);
// 배경 탭으로도 닫기
cardDetailEl.addEventListener("click", (e) => {
  if (e.target === cardDetailEl) hideCardDetail();
});

// ==============================
// 글자 완성 게임
// ==============================
const QUESTIONS_PER_LEVEL = 10;
const PASS_THRESHOLD = 8;

const completeEmojiEl = document.getElementById("completeEmoji");
const syllableContainerEl = document.getElementById("syllableContainer");
const vowelChoicesEl = document.getElementById("vowelChoices");
const completeQuestionEl = document.getElementById("completeQuestion");

// 모음 방향 (한글 시각 구조)
const VERTICAL_VOWELS = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅣ"];
function vowelOrientation(v) {
  return VERTICAL_VOWELS.includes(v) ? "vertical" : "horizontal";
}

function decomposeSyllable(s) {
  const code = s.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  const finalIdx = code % 28;
  const consonantIdx = Math.floor(code / 588);
  const vowelIdx = Math.floor((code % 588) / 28);
  return {
    consonant: ALL_CONSONANTS[consonantIdx],
    vowel: ALL_VOWELS[vowelIdx],
    final: ALL_FINALS[finalIdx],
    hasFinal: finalIdx !== 0,
  };
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startCompleteGame() {
  state.questionIndex = 0;
  state.correctCount = 0;
  state.results = [];
  state.questionAnswered = false;
  state.recentWords = [];
  showScreen("complete");
  renderProgressBar();
  renderCompletionPuzzle();
}

function renderProgressBar() {
  const dots = document.getElementById("progressDots");
  const text = document.getElementById("progressText");
  dots.innerHTML = "";
  for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    if (state.results[i] === true) dot.classList.add("correct");
    if (state.results[i] === false) dot.classList.add("wrong");
    dots.appendChild(dot);
  }
  const current = Math.min(state.questionIndex + 1, QUESTIONS_PER_LEVEL);
  text.textContent = `${current} / ${QUESTIONS_PER_LEVEL}`;
}

function generateCompletionPuzzle() {
  // 최근 5문제 단어 제외
  let candidates = COMPLETION_PUZZLES.filter(p => !state.recentWords.includes(p.word));
  if (candidates.length === 0) candidates = COMPLETION_PUZZLES;
  const puzzle = candidates[Math.floor(Math.random() * candidates.length)];
  state.recentWords.push(puzzle.word);
  if (state.recentWords.length > 5) state.recentWords.shift();

  const syllables = [...puzzle.word];
  const missingIdx = Math.random() < 0.5 ? 0 : 1;
  const missingType = Math.random() < 0.5 ? "vowel" : "consonant";
  const target = decomposeSyllable(syllables[missingIdx]);

  let correctAnswer, choices;
  if (missingType === "vowel") {
    correctAnswer = target.vowel;
    const others = SIMPLE_VOWELS.filter(v => v !== correctAnswer);
    shuffleArray(others);
    choices = shuffleArray([correctAnswer, ...others.slice(0, 3)]);
  } else {
    correctAnswer = target.consonant;
    // 헷갈리는 자음 페어 동시 출현 방지
    const CONFUSING = {
      "ㄷ":"ㅌ","ㅌ":"ㄷ","ㅂ":"ㅍ","ㅍ":"ㅂ",
      "ㄱ":"ㅋ","ㅋ":"ㄱ","ㅈ":"ㅊ","ㅊ":"ㅈ",
    };
    const exclude = new Set([correctAnswer]);
    if (CONFUSING[correctAnswer]) exclude.add(CONFUSING[correctAnswer]);
    const others = SIMPLE_CONSONANTS.filter(c => !exclude.has(c));
    shuffleArray(others);
    choices = shuffleArray([correctAnswer, ...others.slice(0, 3)]);
  }

  state.completePuzzle = {
    word: puzzle.word, emoji: puzzle.emoji,
    syllables, missingIdx, missingType,
    consonant: target.consonant, vowel: target.vowel,
    correctAnswer,
  };
  return choices;
}

function renderCompletionPuzzle() {
  const choices = generateCompletionPuzzle();
  const p = state.completePuzzle;

  completeEmojiEl.textContent = p.emoji;
  completeQuestionEl.textContent =
    p.missingType === "vowel" ? "빠진 모음을 골라보세요" : "빠진 자음을 골라보세요";

  // 음절 박스 동적 생성
  syllableContainerEl.innerHTML = "";
  p.syllables.forEach((syl, i) => {
    const box = document.createElement("div");
    box.className = "syllable-box";
    if (i === p.missingIdx) {
      box.classList.add("missing", `vowel-${vowelOrientation(p.vowel)}`);
      const con = document.createElement("span");
      con.className = p.missingType === "consonant" ? "blank" : "con";
      con.textContent = p.missingType === "consonant" ? "?" : p.consonant;
      const vow = document.createElement("span");
      vow.className = p.missingType === "vowel" ? "blank" : "vow";
      vow.textContent = p.missingType === "vowel" ? "?" : p.vowel;
      box.appendChild(con);
      box.appendChild(vow);
    } else {
      box.textContent = syl;
    }
    syllableContainerEl.appendChild(box);
  });

  // 보기 버튼
  vowelChoicesEl.innerHTML = "";
  choices.forEach(v => {
    const btn = document.createElement("button");
    btn.className = "vowel-choice";
    btn.textContent = v;
    btn.addEventListener("click", () => handleCompletionAnswer(btn, v));
    vowelChoicesEl.appendChild(btn);
  });

  // 단어 들려주기
  setTimeout(() => speak(p.word, "ko-KR"), 350);
}

function handleCompletionAnswer(btn, chosen) {
  if (state.questionAnswered) return;
  state.questionAnswered = true;

  const p = state.completePuzzle;
  const box = syllableContainerEl.children[p.missingIdx];

  if (chosen === p.correctAnswer) {
    btn.classList.add("correct");
    state.results.push(true);
    state.correctCount++;
    addStar(1);
    box.classList.remove("missing", "vowel-vertical", "vowel-horizontal");
    box.classList.add("revealed");
    box.innerHTML = "";
    box.textContent = p.syllables[p.missingIdx];
    setTimeout(() => speak(p.word, "ko-KR"), 300);
    setTimeout(advanceQuestion, 1700);
  } else {
    btn.classList.add("wrong");
    state.results.push(false);
    vibrate([20, 30, 20]); // 오답 진동
    setTimeout(() => {
      vowelChoicesEl.querySelectorAll(".vowel-choice").forEach(b => {
        if (b.textContent === p.correctAnswer) b.classList.add("correct");
      });
      box.classList.remove("missing", "vowel-vertical", "vowel-horizontal");
      box.classList.add("revealed");
      box.innerHTML = "";
      box.textContent = p.syllables[p.missingIdx];
      speak(p.word, "ko-KR");
    }, 500);
    setTimeout(advanceQuestion, 2300);
  }
}

function advanceQuestion() {
  state.questionIndex++;
  state.questionAnswered = false;
  renderProgressBar();
  if (state.questionIndex >= QUESTIONS_PER_LEVEL) {
    showResult();
  } else {
    renderCompletionPuzzle();
  }
}

function showResult() {
  const passed = state.correctCount >= PASS_THRESHOLD;
  if (passed) addStar(5);

  document.getElementById("resultEmoji").textContent = passed ? "🎉" : "💪";
  document.getElementById("resultTitle").textContent = passed ? "잘했어요!" : "한 번 더 해볼까?";
  document.getElementById("resultScore").textContent = `${state.correctCount} / ${QUESTIONS_PER_LEVEL}`;
  document.getElementById("resultMessage").textContent =
    passed ? "보너스 별 +5 ⭐" : "조금만 더 하면 통과해요!";

  showScreen("result");
}

document.getElementById("resultRetryBtn").addEventListener("click", startCompleteGame);
document.getElementById("resultHomeBtn").addEventListener("click", () => showScreen("home"));

// ==============================
// Web Audio 효과음 (펑/삐) — 외부 파일 0
// ==============================
let _audioCtx = null;
let _audioWarmedUp = false;

function getAudioCtx() {
  if (!_audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    _audioCtx = new Ctx();
  }
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

// iOS Safari 깨우기: 첫 사용자 인터랙션에서 무음 노트 재생
function warmUpAudio() {
  if (_audioWarmedUp) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  _audioWarmedUp = true;
  // 무음 짧은 노트 (gain 0.0001)로 컨텍스트 활성화
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  g.gain.value = 0.0001;
  osc.connect(g); g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}
// 첫 터치/클릭 한 번만 등록 (capture로 가장 먼저)
const _warmHandler = () => { warmUpAudio(); };
document.addEventListener("touchstart", _warmHandler, { once: true, capture: true, passive: true });
document.addEventListener("click",      _warmHandler, { once: true, capture: true });
function playPopSound() {
  const ctx = getAudioCtx(); if (!ctx) return;
  const dur = 0.14;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 45);
  }
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 800;
  const g = ctx.createGain(); g.gain.value = 0.55;
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start();
}
// 박수 소리 (음절 박수용)
function playClapSound() {
  const ctx = getAudioCtx(); if (!ctx) return;
  const dur = 0.08;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 35);
  }
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 0.7;
  const g = ctx.createGain(); g.gain.value = 0.55;
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start();
}

function playClapSequence(count, onDone) {
  let i = 0;
  function step() {
    if (i >= count) { if (onDone) onDone(); return; }
    playClapSound();
    i++;
    setTimeout(step, 380);
  }
  step();
}

function playWrongSound() {
  const ctx = getAudioCtx(); if (!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(280, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.25);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.3);
}

// ==============================
// 자동차 컬렉션
// ==============================
function renderGarage() {
  const grid = document.getElementById("garageGrid");
  const info = document.getElementById("garageInfo");
  const msg = document.getElementById("garageMessage");

  const unlocked = CAR_COLLECTION.filter(c => state.stars >= c.starsRequired).length;
  const total = CAR_COLLECTION.length;
  info.textContent = `⭐ 별 ${state.stars}개 · 🚗 ${unlocked} / ${total}`;

  grid.innerHTML = "";
  CAR_COLLECTION.forEach(car => {
    const got = state.stars >= car.starsRequired;
    const tile = document.createElement("div");
    tile.className = "garage-tile" + (got ? " unlocked" : " locked");
    tile.innerHTML = got
      ? `<div class="garage-tile-emoji">${car.emoji}</div><div class="garage-tile-name">${car.name}</div>`
      : `<div class="garage-tile-emoji">🔒</div><div class="garage-tile-name">${car.name}</div><div class="garage-tile-stars">${car.starsRequired}⭐</div>`;
    grid.appendChild(tile);
  });

  // 다음 자동차 진행 바
  const next = CAR_COLLECTION.find(c => state.stars < c.starsRequired);
  if (!next) {
    document.getElementById("garageProgress").style.display = "none";
    msg.textContent = "🏆 모든 자동차를 모았어요!";
  } else {
    document.getElementById("garageProgress").style.display = "block";
    document.getElementById("garageNextEmoji").textContent = next.emoji;
    const remaining = next.starsRequired - state.stars;
    document.getElementById("garageNextRemaining").textContent = `별 ${remaining}개 더!`;
    const prevIdx = CAR_COLLECTION.indexOf(next) - 1;
    const prevStars = prevIdx >= 0 ? CAR_COLLECTION[prevIdx].starsRequired : 0;
    const pct = Math.min(100, Math.round(((state.stars - prevStars) / (next.starsRequired - prevStars)) * 100));
    document.getElementById("garageProgressFill").style.width = pct + "%";
    if (state.stars === 0) msg.textContent = "별을 모아 자동차를 모아봐요!";
    else if (unlocked >= 10) msg.textContent = `🎉 ${unlocked}대! 거의 다!`;
    else if (unlocked > 0)   msg.textContent = `🚗 자동차 ${unlocked}대 모음`;
    else                     msg.textContent = "조금만 더 모으면 첫 자동차!";
  }
}

// ==============================
// 풍선 터뜨리기
// ==============================
const BALLOON_DURATION = 40;
const BALLOON_COLORS = ["#ef4444","#f59e0b","#facc15","#10b981","#06b6d4","#3b82f6","#8b5cf6","#ec4899"];
const balloonFieldEl = document.getElementById("balloonField");
const balloonMissionEl = document.getElementById("balloonMission");
const balloonTimerEl = document.getElementById("balloonTimer");
const balloonScoreEl = document.getElementById("balloonScore");
state.balloonGame = null;

function startBalloonGame() {
  state.balloonGame = {
    score: 0, timeLeft: BALLOON_DURATION,
    round: 0, timerId: null, correctRemaining: 0, active: true,
  };
  updateBalloonStats();
  startBalloonRound();
  state.balloonGame.timerId = setInterval(tickBalloonTimer, 1000);
}

function startBalloonRound() {
  const game = state.balloonGame;
  if (!game.active) return;
  game.round++;
  // 라운드별 풍선 수
  const count = game.round < 3 ? 4 : (game.round < 6 ? 5 : 6);
  const pool = [...WORD_PAIRS].sort(() => Math.random() - 0.5);
  const correct = pool[0];
  const wrongs = pool.slice(1, count);
  const balloons = shuffleArray([
    { word: correct.word, isCorrect: true },
    ...wrongs.map(p => ({ word: p.word, isCorrect: false })),
  ]);
  balloonMissionEl.textContent = `${correct.emoji} ${correct.word} 찾아!`;
  balloonMissionEl.style.animation = "none";
  void balloonMissionEl.offsetWidth;
  balloonMissionEl.style.animation = "";
  speak(`${correct.word} 찾아 터뜨려요`, "ko-KR");
  game.correctRemaining = balloons.filter(b => b.isCorrect).length;
  renderBalloons(balloons);
}

function renderBalloons(balloons) {
  balloonFieldEl.innerHTML = "";
  const fieldH = balloonFieldEl.getBoundingClientRect().height || 400;
  balloons.forEach((b, i) => {
    const el = document.createElement("div");
    el.className = "balloon";
    const seg = 80 / balloons.length;
    const left = 10 + seg * i + (Math.random() - 0.5) * (seg * 0.4);
    el.style.left = left + "%";
    el.style.top = (fieldH * 0.4 + Math.random() * fieldH * 0.5) + "px";
    el.style.animationDuration = BALLOON_DURATION + "s";

    const shape = document.createElement("div");
    shape.className = "balloon-shape";
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    shape.style.background = color;
    shape.style.color = color;
    const inner = document.createElement("span");
    inner.style.color = "white";
    inner.textContent = b.word;
    shape.appendChild(inner);

    const string = document.createElement("div");
    string.className = "balloon-string";
    el.appendChild(shape);
    el.appendChild(string);

    el.addEventListener("click", () => onBalloonClick(el, b));
    el.addEventListener("animationend", (e) => {
      if (e.animationName === "floatUp") el.remove();
    });
    balloonFieldEl.appendChild(el);
  });
}

function onBalloonClick(el, balloon) {
  const game = state.balloonGame;
  if (!game || !game.active || el.classList.contains("popping")) return;

  if (balloon.isCorrect) {
    el.classList.add("popping");
    game.score += 10;
    addStar(1);
    playPopSound();
    showBurst(el);
    updateBalloonStats();
    game.correctRemaining--;
    setTimeout(() => el.remove(), 500);
    if (game.correctRemaining <= 0) {
      setTimeout(() => { if (game.active) startBalloonRound(); }, 700);
    }
  } else {
    el.classList.add("wrong");
    playWrongSound();
    vibrate([20, 30, 20]);
    game.timeLeft = Math.max(0, game.timeLeft - 2);
    updateBalloonStats();
    setTimeout(() => el.classList.remove("wrong"), 400);
  }
}

function showBurst(balloonEl) {
  const rect = balloonEl.getBoundingClientRect();
  const fieldRect = balloonFieldEl.getBoundingClientRect();
  const burst = document.createElement("div");
  burst.className = "balloon-burst";
  burst.textContent = "💥";
  burst.style.left = (rect.left - fieldRect.left + rect.width / 2 - 20) + "px";
  burst.style.top  = (rect.top  - fieldRect.top  + rect.height / 2 - 20) + "px";
  balloonFieldEl.appendChild(burst);
  setTimeout(() => burst.remove(), 600);
}

function tickBalloonTimer() {
  const game = state.balloonGame;
  if (!game || !game.active) return;
  game.timeLeft--;
  updateBalloonStats();
  if (game.timeLeft <= 0) endBalloonGame();
}

function updateBalloonStats() {
  const game = state.balloonGame;
  if (!game) return;
  balloonTimerEl.textContent = `⏱ ${Math.max(0, game.timeLeft)}초`;
  balloonTimerEl.classList.toggle("danger", game.timeLeft <= 5);
  balloonScoreEl.textContent = `점수 ${game.score}`;
}

function endBalloonGame() {
  const game = state.balloonGame;
  if (!game) return;
  game.active = false;
  clearInterval(game.timerId);
  const bonus = Math.floor(game.score / 30);
  if (bonus > 0) addStar(bonus);
  document.getElementById("balloonFinalScore").textContent = `점수 ${game.score}`;
  let msg;
  if (game.score >= 100)     msg = "🌟 정말 잘했어요!";
  else if (game.score >= 50) msg = "👍 잘했어요!";
  else if (game.score >= 20) msg = "🎈 좋아요! 한 번 더?";
  else                       msg = "💪 다시 도전해봐요!";
  document.getElementById("balloonFinalMsg").textContent = msg;
  showScreen("balloonResult");
}

document.getElementById("balloonRetryBtn").addEventListener("click", () => {
  showScreen("balloon");
  setTimeout(startBalloonGame, 50);
});
document.getElementById("balloonGarageBtn").addEventListener("click", () => {
  renderGarage();
  showScreen("garage");
});
document.getElementById("balloonHomeBtn").addEventListener("click", () => showScreen("home"));

// ==============================
// 자모 합성
// ==============================
function combineJamo(c, v, f) {
  const ci = CONSONANT_INDEX[c];
  const vi = VOWEL_INDEX[v];
  if (ci === undefined || vi === undefined) return null;
  const fi = f ? (FINAL_INDEX[f] || 0) : 0;
  return String.fromCharCode(0xAC00 + ci * 588 + vi * 28 + fi);
}

const consonantPickerEl = document.getElementById("consonantPicker");
const vowelPickerEl = document.getElementById("vowelPicker");
const finalPickerEl = document.getElementById("finalPicker");
const composeCharEl = document.getElementById("composeChar");
const composeHintEl = document.getElementById("composeHint");

state.compose = { consonant: null, vowel: null, final: null, difficulty: "easy" };

function buildPicker(container, items, type) {
  container.innerHTML = "";
  items.forEach(ch => {
    const btn = document.createElement("button");
    btn.className = "picker-btn";
    btn.textContent = ch;
    btn.addEventListener("click", () => {
      if (type === "final") {
        // 받침 토글
        if (state.compose.final === ch) {
          state.compose.final = null;
          btn.classList.remove("selected");
        } else {
          container.querySelectorAll(".picker-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          state.compose.final = ch;
        }
      } else {
        container.querySelectorAll(".picker-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        if (type === "consonant") state.compose.consonant = ch;
        else                      state.compose.vowel = ch;
      }
      updateComposeResult();
    });
    container.appendChild(btn);
  });
}

function updateComposeResult() {
  const { consonant: c, vowel: v, final: f } = state.compose;
  if (c && v) {
    const ch = combineJamo(c, v, f);
    composeCharEl.textContent = ch;
    speak(ch, "ko-KR");
    addStar(1);
    const hint = !f ? SYLLABLE_HINTS[ch] : null;
    if (hint) {
      composeHintEl.textContent = `${hint.emoji} ${hint.word}`;
      setTimeout(() => speak(hint.word, "ko-KR"), 700);
    } else if (f) {
      composeHintEl.textContent = "받침을 다시 누르면 빠져요";
    } else {
      composeHintEl.textContent = "";
    }
  } else if (c) {
    composeCharEl.textContent = c;
    composeHintEl.textContent = "모음을 골라보세요";
  } else if (v) {
    composeCharEl.textContent = v;
    composeHintEl.textContent = "자음을 골라보세요";
  } else {
    composeCharEl.textContent = "?";
    composeHintEl.textContent = "자음과 모음을 골라보세요";
  }
}

function applyComposeDifficulty() {
  const easy = state.compose.difficulty === "easy";
  buildPicker(consonantPickerEl, easy ? COMPOSE_CONSONANTS_EASY : COMPOSE_CONSONANTS_HARD, "consonant");
  buildPicker(vowelPickerEl,     easy ? COMPOSE_VOWELS_EASY     : COMPOSE_VOWELS_HARD,     "vowel");
  buildPicker(finalPickerEl,     easy ? COMPOSE_FINALS_EASY     : COMPOSE_FINALS_HARD,     "final");
  document.getElementById("composeEasyBtn").classList.toggle("active", easy);
  document.getElementById("composeHardBtn").classList.toggle("active", !easy);
}

function startCompose() {
  state.compose = { consonant: null, vowel: null, final: null, difficulty: state.compose.difficulty || "easy" };
  applyComposeDifficulty();
  updateComposeResult();
  showScreen("compose");
}

document.getElementById("composeEasyBtn").addEventListener("click", () => {
  state.compose.difficulty = "easy";
  state.compose.consonant = state.compose.vowel = state.compose.final = null;
  applyComposeDifficulty();
  updateComposeResult();
});
document.getElementById("composeHardBtn").addEventListener("click", () => {
  state.compose.difficulty = "hard";
  state.compose.consonant = state.compose.vowel = state.compose.final = null;
  applyComposeDifficulty();
  updateComposeResult();
});

// ==============================
// 음절 박수
// ==============================
const clapEmojiEl = document.getElementById("clapEmoji");
const clapWordEl = document.getElementById("clapWord");
const clapButtonsEl = document.getElementById("clapButtons");
const clapFeedbackEl = document.getElementById("clapFeedback");
state.clap = null;

function splitKoreanSyllables(word) {
  return [...word].filter(c => {
    const code = c.charCodeAt(0);
    return code >= 0xAC00 && code <= 0xD7A3;
  });
}

function speakSyllablesWithClaps(word) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const sylls = splitKoreanSyllables(word);
  if (sylls.length === 0) return;
  let i = 0;
  function next() {
    if (i >= sylls.length) return;
    const u = new SpeechSynthesisUtterance(sylls[i]);
    u.lang = "ko-KR";
    u.rate = 0.85;
    u.pitch = 1.1;
    u.onstart = () => playClapSound();
    u.onend = () => { i++; setTimeout(next, 220); };
    u.onerror = () => { i++; setTimeout(next, 220); };
    window.speechSynthesis.speak(u);
  }
  next();
}

function loadClapQuestion() {
  const item = SYLLABLE_WORDS[Math.floor(Math.random() * SYLLABLE_WORDS.length)];
  state.clap = { item, answered: false };
  clapEmojiEl.textContent = item.emoji;
  clapWordEl.textContent = item.word;
  clapFeedbackEl.textContent = "";
  // 보기 4개 (1-5 중 정답 + 무작위 3개)
  const correct = item.count;
  const others = [1,2,3,4,5].filter(n => n !== correct);
  shuffleArray(others);
  const choices = [correct, ...others.slice(0, 3)].sort((a, b) => a - b);

  clapButtonsEl.innerHTML = "";
  choices.forEach(n => {
    const btn = document.createElement("button");
    btn.className = "clap-btn";
    btn.textContent = "👏".repeat(n) + " " + n;
    btn.addEventListener("click", () => handleClapAnswer(btn, n, correct));
    clapButtonsEl.appendChild(btn);
  });

  setTimeout(() => speakSyllablesWithClaps(item.word), 250);
}

function handleClapAnswer(btn, chosen, correct) {
  if (!state.clap || state.clap.answered) return;

  if (chosen === correct) {
    state.clap.answered = true;
    btn.classList.add("correct");
    clapFeedbackEl.textContent = "🎉 잘했어요!";
    addStar(1);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    playClapSequence(correct, () => {
      setTimeout(loadClapQuestion, 600);
    });
  } else {
    btn.classList.add("wrong");
    clapFeedbackEl.textContent = "한 번 더!";
    vibrate([20, 30, 20]);
    speakSyllablesWithClaps(state.clap.item.word);
    setTimeout(() => btn.classList.remove("wrong"), 500);
    // lock 안 거니까 다시 시도 가능
  }
}

document.getElementById("nextClapBtn").addEventListener("click", () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  loadClapQuestion();
});

// ==============================
// 메인 모드 선택
// ==============================
document.querySelectorAll(".mode-card").forEach(btn => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (mode === "hangul") {
      const items = [...HANGUL_CONSONANTS, ...HANGUL_VOWELS];
      renderCardGrid(items, "hangul");
      showScreen("grid");
    } else if (mode === "alphabet") {
      renderCardGrid(ALPHABET, "alphabet");
      showScreen("grid");
    } else if (mode === "complete") {
      startCompleteGame();
    } else if (mode === "garage") {
      renderGarage();
      showScreen("garage");
    } else if (mode === "balloon") {
      showScreen("balloon");
      setTimeout(startBalloonGame, 50);
    } else if (mode === "compose") {
      startCompose();
    } else if (mode === "clap") {
      showScreen("clap");
      setTimeout(loadClapQuestion, 50);
    }
  });
});

// === 상단 별 카운트 → 차고 바로가기 ===
document.querySelector(".stars").addEventListener("click", () => {
  renderGarage();
  showScreen("garage");
});

// 홈 버튼
document.getElementById("homeBtn").addEventListener("click", () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  hideCardDetail();
  state.questionIndex = 0;
  state.results = [];
  state.questionAnswered = false;
  // 풍선 게임 정리
  if (state.balloonGame) {
    state.balloonGame.active = false;
    clearInterval(state.balloonGame.timerId);
  }
  showScreen("home");
});

// === 모바일 특화: iOS 더블탭 줌 방지 ===
let lastTouchEnd = 0;
document.addEventListener("touchend", (e) => {
  const now = Date.now();
  if (now - lastTouchEnd < 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

// === 첫 사용자 인터랙션으로 audio 컨텍스트 깨움 ===
document.addEventListener("touchstart", function warm() {
  document.removeEventListener("touchstart", warm);
}, { once: true });
