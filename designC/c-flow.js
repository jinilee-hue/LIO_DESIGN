/* ── Design C 의 축소된 FLOW ────────────────────────────────────────────────
   C 는 A · B 보다 흐름을 줄여서 보여준다. 여기서 뺄 화면을 지정한다.

   왜 이렇게 하나
     화면 목록은 공용 prototype/flow-data.js 에 있어 거기서 지우면 A · B 에서도
     사라진다. engine.js 도 공용이라 손댈 수 없다.
     engine.js 는 로드되는 순간 window.LIO_FLOW.SCREENS 를 읽어 자기 목록을 만든다
     (const SCREENS = F.SCREENS.filter(...)). 그래서 flow-data.js 다음, engine.js
     앞에 이 파일을 끼워 넣어 C 페이지의 메모리에서만 목록을 줄인다.
     → 공용 파일 무변경 · A · B 무영향 (designC/README.md 의 격리 규칙)

   확인해 둔 것
     · 빼는 화면들로 'go' 나 'act' 로 이동하는 곳은 없다. 모두 배열 순서(goNext)로
       들어가므로, 빼면 앞 화면의 다음이 자동으로 그 뒤 화면이 된다.
       (flow-data 의 'game' 참조 3건은 모두 layout:'game' 으로 화면 id 가 아니다)
     · aOnly / bOnly 플래그를 쓰는 화면이 없어 engine 의 목록과 이 배열의
       인덱스가 정확히 일치한다 — c-slide16.js 의 goTo 인덱스도 그대로 맞는다. */
(function () {
  'use strict';

  // 뺄 화면 (원래 slide 번호 — 기획서 PAGE)
  var DROP = [
    'skill_video_intro',   // 10 (PAGE  9) Skill Video Intro
    'skill_video',         // 11 (PAGE 10) Skill Video
    'game_intro',          // 12 (PAGE 11) Game Intro
    'game',                // 13 (PAGE 12) Game
    'fp1_intro',           // 14 (PAGE 13) FP1 Intro
  ];

  var F = window.LIO_FLOW;
  if (!F || !F.SCREENS) return;
  F.SCREENS = F.SCREENS.filter(function (s) { return DROP.indexOf(s.id) < 0; });
})();
