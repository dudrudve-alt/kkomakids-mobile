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
