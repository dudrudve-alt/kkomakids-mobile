# 꼬마키즈

4-5세 자녀를 위한 한글·영어 학습 웹앱

## 기능

- 📚 한글 자모 카드 (자음·모음 24장)
- 🔤 영어 알파벳 카드 (A-Z 26장)
- 🍎 한글·영어 단어 카드
- ✏️ 글자 완성 게임 (10문제, 80% 통과)
- 👏 음절 박수
- 🎮 미니게임과 자동차 컬렉션
- 🔊 Mac TTS로 생성한 한국어 오디오 우선 재생

## PC/모바일 통합

- 하나의 GitHub Pages 링크로 PC, 태블릿, 모바일 지원
- 화면 크기에 맞춰 메뉴와 게임판 자동 조정
- iOS Safari / Android Chrome 모두 지원
- 진동 피드백
- safe-area (노치/홈바 영역 대응)

## 사용 방법

[GitHub Pages 링크](https://dudrudve-alt.github.io/kkomakids-mobile/)

## 로컬 개발

```bash
python3 -m http.server 8000
```

http://localhost:8000 에서 확인

## 한국어 오디오 재생성

macOS에서 `data.js` 단어를 수정한 뒤 아래 명령으로 새 오디오와 manifest를 생성합니다.

```bash
node scripts/generate-audio.js
```

기본 음성은 `Yuna`, 속도는 `145`입니다. 필요하면 환경 변수로 바꿀 수 있습니다.

```bash
KKOMAKIDS_TTS_VOICE=Yuna KKOMAKIDS_TTS_RATE=145 node scripts/generate-audio.js --force
```
