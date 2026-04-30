// === 한글 자모 카드 ===
const HANGUL_CONSONANTS = [
  { char: "ㄱ", name: "기역", word: "가방",   emoji: "🎒" },
  { char: "ㄴ", name: "니은", word: "나비",   emoji: "🦋" },
  { char: "ㄷ", name: "디귿", word: "다람쥐", emoji: "🐿️" },
  { char: "ㄹ", name: "리을", word: "라면",   emoji: "🍜" },
  { char: "ㅁ", name: "미음", word: "물고기", emoji: "🐟" },
  { char: "ㅂ", name: "비읍", word: "바나나", emoji: "🍌" },
  { char: "ㅅ", name: "시옷", word: "사과",   emoji: "🍎" },
  { char: "ㅇ", name: "이응", word: "오리",   emoji: "🦆" },
  { char: "ㅈ", name: "지읒", word: "자동차", emoji: "🚗" },
  { char: "ㅊ", name: "치읓", word: "책",     emoji: "📖" },
  { char: "ㅋ", name: "키읔", word: "코끼리", emoji: "🐘" },
  { char: "ㅌ", name: "티읕", word: "토끼",   emoji: "🐰" },
  { char: "ㅍ", name: "피읖", word: "포도",   emoji: "🍇" },
  { char: "ㅎ", name: "히읗", word: "호랑이", emoji: "🐯" },
];

const HANGUL_VOWELS = [
  { char: "ㅏ", name: "아", word: "아기",   emoji: "👶" },
  { char: "ㅑ", name: "야", word: "야구",   emoji: "⚾" },
  { char: "ㅓ", name: "어", word: "어머니", emoji: "👩" },
  { char: "ㅕ", name: "여", word: "여우",   emoji: "🦊" },
  { char: "ㅗ", name: "오", word: "오이",   emoji: "🥒" },
  { char: "ㅛ", name: "요", word: "요리",   emoji: "🍳" },
  { char: "ㅜ", name: "우", word: "우유",   emoji: "🥛" },
  { char: "ㅠ", name: "유", word: "유리",   emoji: "🪟" },
  { char: "ㅡ", name: "으", word: "으악",   emoji: "😱" },
  { char: "ㅣ", name: "이", word: "이불",   emoji: "🛏️" },
];

// === 영어 알파벳 카드 ===
const ALPHABET = [
  { char: "A", word: "Apple",     emoji: "🍎" },
  { char: "B", word: "Bear",      emoji: "🐻" },
  { char: "C", word: "Cat",       emoji: "🐱" },
  { char: "D", word: "Dog",       emoji: "🐶" },
  { char: "E", word: "Egg",       emoji: "🥚" },
  { char: "F", word: "Fish",      emoji: "🐠" },
  { char: "G", word: "Grape",     emoji: "🍇" },
  { char: "H", word: "Horse",     emoji: "🐴" },
  { char: "I", word: "Ice cream", emoji: "🍦" },
  { char: "J", word: "Juice",     emoji: "🧃" },
  { char: "K", word: "Kite",      emoji: "🪁" },
  { char: "L", word: "Lion",      emoji: "🦁" },
  { char: "M", word: "Moon",      emoji: "🌙" },
  { char: "N", word: "Nest",      emoji: "🪺" },
  { char: "O", word: "Orange",    emoji: "🍊" },
  { char: "P", word: "Pig",       emoji: "🐷" },
  { char: "Q", word: "Queen",     emoji: "👸" },
  { char: "R", word: "Rabbit",    emoji: "🐰" },
  { char: "S", word: "Sun",       emoji: "☀️" },
  { char: "T", word: "Tiger",     emoji: "🐯" },
  { char: "U", word: "Umbrella",  emoji: "☂️" },
  { char: "V", word: "Violin",    emoji: "🎻" },
  { char: "W", word: "Watermelon",emoji: "🍉" },
  { char: "X", word: "Xylophone", emoji: "🎶" },
  { char: "Y", word: "Yogurt",    emoji: "🥣" },
  { char: "Z", word: "Zebra",     emoji: "🦓" },
];

// === 자모 분해/조립용 ===
const ALL_CONSONANTS = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const ALL_VOWELS = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const ALL_FINALS = ["", "ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const SIMPLE_VOWELS = ["ㅏ","ㅑ","ㅓ","ㅕ","ㅗ","ㅛ","ㅜ","ㅠ","ㅡ","ㅣ"];
const SIMPLE_CONSONANTS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

// === 자동차 컬렉션 (16대, 누적 별로 잠금 해제) ===
const CAR_COLLECTION = [
  { emoji: "🚗", name: "자동차",   starsRequired: 5   },
  { emoji: "🚕", name: "택시",     starsRequired: 12  },
  { emoji: "🚙", name: "SUV",      starsRequired: 22  },
  { emoji: "🚌", name: "버스",     starsRequired: 35  },
  { emoji: "🚓", name: "경찰차",   starsRequired: 50  },
  { emoji: "🚑", name: "구급차",   starsRequired: 70  },
  { emoji: "🚒", name: "소방차",   starsRequired: 95  },
  { emoji: "🛻", name: "픽업트럭", starsRequired: 125 },
  { emoji: "🚚", name: "트럭",     starsRequired: 160 },
  { emoji: "🏎️", name: "레이싱카", starsRequired: 200 },
  { emoji: "🚜", name: "트랙터",   starsRequired: 250 },
  { emoji: "🚂", name: "기차",     starsRequired: 320 },
  { emoji: "🚄", name: "고속열차", starsRequired: 400 },
  { emoji: "🚁", name: "헬리콥터", starsRequired: 500 },
  { emoji: "✈️", name: "비행기",   starsRequired: 620 },
  { emoji: "🚀", name: "로켓",     starsRequired: 750 },
];

// === 풍선 게임 단어 풀 (그림 + 단어) ===
const WORD_PAIRS = [
  { word: "사과",   emoji: "🍎" },
  { word: "강아지", emoji: "🐶" },
  { word: "고양이", emoji: "🐱" },
  { word: "자동차", emoji: "🚗" },
  { word: "꽃",     emoji: "🌸" },
  { word: "별",     emoji: "⭐" },
  { word: "토끼",   emoji: "🐰" },
  { word: "우유",   emoji: "🥛" },
  { word: "책",     emoji: "📖" },
  { word: "물고기", emoji: "🐟" },
  { word: "공",     emoji: "⚽" },
  { word: "달",     emoji: "🌙" },
  { word: "사자",   emoji: "🦁" },
  { word: "기린",   emoji: "🦒" },
  { word: "바나나", emoji: "🍌" },
  { word: "포도",   emoji: "🍇" },
  { word: "수박",   emoji: "🍉" },
  { word: "딸기",   emoji: "🍓" },
  { word: "거북이", emoji: "🐢" },
  { word: "코끼리", emoji: "🐘" },
  { word: "원숭이", emoji: "🐵" },
  { word: "병아리", emoji: "🐤" },
  { word: "여우",   emoji: "🦊" },
  { word: "곰",     emoji: "🐻" },
  { word: "돼지",   emoji: "🐷" },
  { word: "개구리", emoji: "🐸" },
  { word: "비행기", emoji: "✈️" },
  { word: "기차",   emoji: "🚂" },
];

// === 자모 합성 (한글 자음+모음+받침 결합) ===
// 한글 음절 = 0xAC00 + (자음 인덱스 × 588) + (모음 인덱스 × 28) + 종성
const CONSONANT_INDEX = {
  "ㄱ": 0,  "ㄲ": 1,  "ㄴ": 2,  "ㄷ": 3,  "ㄸ": 4,
  "ㄹ": 5,  "ㅁ": 6,  "ㅂ": 7,  "ㅃ": 8,  "ㅅ": 9,
  "ㅆ": 10, "ㅇ": 11, "ㅈ": 12, "ㅉ": 13, "ㅊ": 14,
  "ㅋ": 15, "ㅌ": 16, "ㅍ": 17, "ㅎ": 18,
};
const VOWEL_INDEX = {
  "ㅏ": 0, "ㅐ": 1, "ㅑ": 2, "ㅒ": 3, "ㅓ": 4,
  "ㅔ": 5, "ㅕ": 6, "ㅖ": 7, "ㅗ": 8, "ㅘ": 9,
  "ㅙ":10, "ㅚ":11, "ㅛ":12, "ㅜ":13, "ㅝ":14,
  "ㅞ":15, "ㅟ":16, "ㅠ":17, "ㅡ":18, "ㅢ":19, "ㅣ":20,
};
const FINAL_INDEX = {
  "ㄱ":1, "ㄴ":4, "ㄷ":7, "ㄹ":8, "ㅁ":16, "ㅂ":17, "ㅅ":19, "ㅇ":21,
};

// 자모 합성 - 쉬움 (단모음 + 기본 자음 + 단순 받침)
const COMPOSE_CONSONANTS_EASY = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const COMPOSE_VOWELS_EASY = ["ㅏ","ㅑ","ㅓ","ㅕ","ㅗ","ㅛ","ㅜ","ㅠ","ㅡ","ㅣ"];
const COMPOSE_FINALS_EASY = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ"];

// 자모 합성 - 어려움 (전체)
const COMPOSE_CONSONANTS_HARD = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const COMPOSE_VOWELS_HARD = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅛ","ㅜ","ㅠ","ㅡ","ㅣ","ㅘ","ㅙ","ㅚ","ㅝ","ㅞ","ㅟ","ㅢ"];
const COMPOSE_FINALS_HARD = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

// 자모 합성 결과 단어 힌트
const SYLLABLE_HINTS = {
  "가": { word: "가방",   emoji: "🎒" },
  "나": { word: "나비",   emoji: "🦋" },
  "다": { word: "다리",   emoji: "🦵" },
  "라": { word: "라면",   emoji: "🍜" },
  "마": { word: "마차",   emoji: "🛻" },
  "바": { word: "바나나", emoji: "🍌" },
  "사": { word: "사과",   emoji: "🍎" },
  "아": { word: "아기",   emoji: "👶" },
  "자": { word: "자동차", emoji: "🚗" },
  "차": { word: "차",     emoji: "🍵" },
  "카": { word: "카메라", emoji: "📷" },
  "타": { word: "타조",   emoji: "🦩" },
  "파": { word: "파인애플", emoji: "🍍" },
  "하": { word: "하트",   emoji: "❤️" },
  "고": { word: "고양이", emoji: "🐱" },
  "기": { word: "기린",   emoji: "🦒" },
  "도": { word: "도토리", emoji: "🌰" },
  "모": { word: "모자",   emoji: "🧢" },
  "무": { word: "무지개", emoji: "🌈" },
  "비": { word: "비",     emoji: "🌧️" },
  "소": { word: "소",     emoji: "🐄" },
  "오": { word: "오리",   emoji: "🦆" },
  "우": { word: "우산",   emoji: "☂️" },
  "토": { word: "토끼",   emoji: "🐰" },
  "포": { word: "포도",   emoji: "🍇" },
  "호": { word: "호랑이", emoji: "🐯" },
};

// === 음절 박수 단어 풀 ===
const SYLLABLE_WORDS = [
  // 1음절
  { word: "꽃", emoji: "🌸", count: 1 },
  { word: "별", emoji: "⭐", count: 1 },
  { word: "달", emoji: "🌙", count: 1 },
  { word: "해", emoji: "☀️", count: 1 },
  { word: "물", emoji: "💧", count: 1 },
  { word: "산", emoji: "⛰️", count: 1 },
  { word: "곰", emoji: "🐻", count: 1 },
  // 2음절
  { word: "사과", emoji: "🍎", count: 2 },
  { word: "토끼", emoji: "🐰", count: 2 },
  { word: "오리", emoji: "🦆", count: 2 },
  { word: "나비", emoji: "🦋", count: 2 },
  { word: "여우", emoji: "🦊", count: 2 },
  { word: "포도", emoji: "🍇", count: 2 },
  { word: "구름", emoji: "☁️", count: 2 },
  { word: "우유", emoji: "🥛", count: 2 },
  { word: "딸기", emoji: "🍓", count: 2 },
  { word: "수박", emoji: "🍉", count: 2 },
  { word: "기차", emoji: "🚂", count: 2 },
  // 3음절
  { word: "바나나",  emoji: "🍌", count: 3 },
  { word: "코끼리",  emoji: "🐘", count: 3 },
  { word: "호랑이",  emoji: "🐯", count: 3 },
  { word: "강아지",  emoji: "🐶", count: 3 },
  { word: "고양이",  emoji: "🐱", count: 3 },
  { word: "다람쥐",  emoji: "🐿️", count: 3 },
  { word: "무지개",  emoji: "🌈", count: 3 },
  { word: "자전거",  emoji: "🚲", count: 3 },
  { word: "할머니",  emoji: "👵", count: 3 },
  { word: "햄버거",  emoji: "🍔", count: 3 },
  { word: "병아리",  emoji: "🐤", count: 3 },
  { word: "비행기",  emoji: "✈️", count: 3 },
  // 4음절
  { word: "할아버지", emoji: "👴", count: 4 },
  { word: "유치원생", emoji: "🎒", count: 4 },
];

// === 글자 완성 게임 단어 풀 (입문용) ===
// 받침 없는 2음절 + 단모음만
const COMPLETION_PUZZLES = [
  { word: "사자",   emoji: "🦁" },
  { word: "가지",   emoji: "🍆" },
  { word: "나비",   emoji: "🦋" },
  { word: "모자",   emoji: "🧢" },
  { word: "오리",   emoji: "🦆" },
  { word: "우유",   emoji: "🥛" },
  { word: "호두",   emoji: "🌰" },
  { word: "비누",   emoji: "🧼" },
  { word: "하마",   emoji: "🦛" },
  { word: "보리",   emoji: "🌾" },
  { word: "노루",   emoji: "🦌" },
  { word: "다리",   emoji: "🦵" },
  { word: "거미",   emoji: "🕷️" },
  { word: "모기",   emoji: "🦟" },
  { word: "우주",   emoji: "🚀" },
  { word: "지구",   emoji: "🌍" },
  { word: "포도",   emoji: "🍇" },
  { word: "고래",   emoji: "🐳" },
  { word: "여우",   emoji: "🦊" },
  { word: "기차",   emoji: "🚂" },
];
