/* ── slide 7 스킬 화면 : 스킬 2장 추가 (Design B 전용) ──
   designB/index.html · index-video.html 에서만 로드한다.
   flow-data.js 다음, engine.js 앞에 둬야 한다 — engine 은 로드 시점에 LIO_FLOW 를 읽는다.

   공용 flow-data.js 의 SKILLS(10개)는 A 의 5열 그리드와 C 가 함께 쓰므로 고치지 않고,
   B 페이지 메모리에서만 뒤에 덧붙인다 → 기존 인덱스 0~9 는 그대로, 새 스킬은 10 · 11.
   카드색은 theme-b.css 의 .skill-card[data-skill="10"/"11"] (--scB).

   배치 : 가운데 2열은 Conclusions 1장뿐이라 빈 칸이 많았고 LIO 에 가리지도 않는다.
   새 스킬 2장을 이 열 맨 위부터 넣어 화면에 들어오자마자 보이게 한다. */
(function () {
  'use strict';
  var F = window.LIO_FLOW;
  if (window.LIO_THEME !== 'B' || !F || !F.SKILLS) return;

  /* name 은 alt 용 정식 명칭(평문). 카드에는 기존 B 스킬처럼(Analyzing Characters → Characters)
     줄인 이름을 쓴다. bName 은 engine 의 skillNameHtml 이 HTML 로 그대로 넣으므로
     줄바꿈은 <br>, & 는 &amp; 로 적는다 — 2줄 (Cause & Effect 와 같은 높이) */
  F.SKILLS.push(
    { name:'Analyzing Conflicts and Solutions', bName:'Conflicts &amp;<br>Solutions',
      bImg:'skill_analyzing_conflicts.png', color:'#1FB5B0' },   // 10 청록
    { name:"Describing a Character's Motives",  bName:"Character's<br>Motives",
      bImg:'skill_character_motives.png',   color:'#D45FE0' }    // 11 자주
  );

  // engine 기본값 [[0,5,8],[4],[1,3,6],[2,7,9]] 에서 2열만 바꾼다 (컬럼별 data-skill, 위→아래)
  window.LIO_B_SKILL_COLS = [[0, 5, 8], [10, 11, 4], [1, 3, 6], [2, 7, 9]];
})();
