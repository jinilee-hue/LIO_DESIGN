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
    'plan',                //  9 (PAGE  8) 전체 활동 Intro
    'skill_video_intro',   // 10 (PAGE  9) Skill Video Intro
    'skill_video',         // 11 (PAGE 10) Skill Video
    'game_intro',          // 12 (PAGE 11) Game Intro
    'game',                // 13 (PAGE 12) Game
    'fp1_intro',           // 14 (PAGE 13) FP1 Intro
    'fp1_mq_correct',      // 16 (PAGE 15) FP1 Main Question 정답경로 — 15 에 합쳤다
  ];
  // plan 을 뺀 이유 : 안내 문구가 "watch a video → play a game → read & practice" 로
  // 지운 활동들을 가리켜 흐름과 맞지 않았다. (engine 의 INTRO_BGM_IDS 에 'plan' 이
  // 들어 있지만 화면이 없으면 그 항목이 매칭되지 않을 뿐이라 문제되지 않는다)

  var F = window.LIO_FLOW;
  if (!F || !F.SCREENS) return;
  F.SCREENS = F.SCREENS.filter(function (s) { return DROP.indexOf(s.id) < 0; });

  /* slide 15 + 16 을 한 화면으로 합친다.
     두 화면의 내용은 거의 같다 — 15 는 지문·문제·보기, 16 은 같은 화면에 채점 결과와
     칭찬이 붙은 형태다. C 에서는 15 에서 바로 채점하고 그 자리에서 흐름을 마친다
     (안내 → 풀기 → 정/오답 반응 → 칭찬 → Pre-retry 자동 진행 : c-lio-guide.js).

     engine 은 choices 블록의 instantGrade 로 즉시 채점을 켜고, 정답은 item 의
     state:'correct' 로 안다(랜더 시 data-state 로만 나가 클릭 전까지 감춰진다).
     여기서 그 두 값을 세우면 flow-data.js 원본은 그대로 둘 수 있다.
     ※ 15 의 보기 item 은 16 과 별개 객체라 이 변경이 16 에 번지지 않는다
       (16 은 위에서 빼기도 했다). */
  var mq = F.SCREENS.filter(function (s) { return s.id === 'fp1_mq'; })[0];
  if (mq && mq.blocks) {
    for (var i = 0; i < mq.blocks.length; i++) {
      var b = mq.blocks[i];
      if (b.t !== 'choices') continue;
      b.instantGrade = true;
      if (b.items && b.items[0]) b.items[0].state = 'correct';   // A (기획서 slide 16 의 정답)
      break;
    }
  }
})();
