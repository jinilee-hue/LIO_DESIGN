/* ── slide 16 정/오답 반응 : LIO 스프라이트가 가운데 크게 떴다 사라진다 (Design B 전용) ──
   designB/index.html 에서만 로드한다. 공용 engine.js / base.css 는 손대지 않는다.

   트리거는 MutationObserver 다. engine.js 의 instant-grade 핸들러가 선택지에 .correct /
   .wrong 클래스를 붙이는 순간을 감지한다 — 클릭 리스너를 따로 걸면 engine 의 핸들러와
   실행 순서를 다투게 되고, 오답일 때 정답 선지에도 .correct 가 붙는 순서를 놓칠 수 있다.

   판정 : 채점된 그룹에 .choice.wrong 이 있으면 오답, 없으면 정답.
     (오답이면 engine 이 "누른 선지 .wrong + 정답 선지 .correct" 를 함께 붙인다)

   오답일 때는 LIO 뒤(z-index 59)로 비 레이어 .quiz-rain 을 함께 깐다.

   오버레이는 .device 안에 넣어야 프로토타입 프레임 안에서만 뜬다. 재생이 끝나면
   animationend 로 스스로 제거한다 — 남겨두면 다음 화면에서 클릭을 가로챈다.
   ⚠ instantGrade 는 flow-data 에서 slide 16(fp1_mq_correct)만 쓴다. 다른 화면에도 붙으면
     여기도 함께 동작하므로, 화면을 한정하고 싶으면 SCREEN_IDS 를 확인하도록 고쳐야 한다. */
(function () {
  'use strict';
  if (window.LIO_THEME !== 'B') return;

  var DUR = 3700;   // 총 재생 시간(ms) — theme-b 의 bQuizIn(.34)+bQuizFrame(1.45×2)+bQuizOut(.46)

  function show(kind) {
    var dev = document.querySelector('#stage .device');
    if (!dev) return;
    dev.querySelectorAll('.quiz-reaction, .quiz-rain').forEach(function (n) { n.remove(); });

    // 오답이면 LIO 보다 먼저 비 레이어를 넣는다 (z-index 59 < LIO 60 → 확실히 뒤)
    var rain = null;
    if (kind === 'x') {
      rain = document.createElement('div');
      rain.className = 'quiz-rain';
      dev.appendChild(rain);
    }

    var el = document.createElement('div');
    el.className = 'quiz-reaction quiz-' + kind;   // quiz-o | quiz-x
    dev.appendChild(el);
    // 애니메이션이 끝나면 스스로 사라진다 (animationend 가 안 오는 환경 대비 타이머도 둔다)
    var done = false;
    function kill() {
      if (done) return;
      done = true;
      el.remove();
      if (rain) rain.remove();
    }
    el.addEventListener('animationend', function (e) {
      if (e.animationName === 'bQuizOut') kill();
    });
    setTimeout(kill, DUR + 600);
  }

  function watch(grp) {
    if (grp.dataset.reactionWatched) return;
    grp.dataset.reactionWatched = '1';
    var mo = new MutationObserver(function () {
      if (!grp.querySelector('.choice.correct, .choice.wrong')) return;
      mo.disconnect();
      show(grp.querySelector('.choice.wrong') ? 'x' : 'o');
    });
    mo.observe(grp, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // 화면이 갈릴 때마다 새 .choices.instant-grade 를 찾아 감시를 건다
  function scan() {
    document.querySelectorAll('#stage .choices.instant-grade').forEach(watch);
  }
  new MutationObserver(scan).observe(document.getElementById('stage') || document.body,
    { childList: true, subtree: true });
  scan();
})();
