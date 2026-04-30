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
    }
  });
});

// 홈 버튼
document.getElementById("homeBtn").addEventListener("click", () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  hideCardDetail();
  state.questionIndex = 0;
  state.results = [];
  state.questionAnswered = false;
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
