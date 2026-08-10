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
   채점이 일어나는 모든 화면에서 동작한다 — 선택지(.choice) · 단어 테스트(.emoji-opt) ·
   Definition Detective(.det-card). 특정 화면만 빼려면 show() 앞에서 화면 id 를 확인하면 된다. */
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

  // 채점이 일어나는 요소들. 여기에 .correct / .wrong 이 '새로' 붙는 순간이 채점 시점이다.
  //   .choice    선택지(2·4지선다, 복수선택 Check 포함)
  //   .emoji-opt 단어 테스트 보기
  //   .det-card  Definition Detective 카드
  var GRADED = '.choice, .emoji-opt, .det-card';

  // 한 번 채점하면 여러 요소에 동시에 클래스가 붙는다(고른 것 + 정답). 같은 순간의 변화를
  // 모아 한 번만 반응한다. 하나라도 .wrong 이면 오답으로 본다.
  var pending = null;
  function queue(el) {
    if (!pending) pending = { wrong: false, t: setTimeout(fire, 60) };
    if (el.classList.contains('wrong')) pending.wrong = true;
  }
  function fire() {
    var p = pending; pending = null;
    if (!p) return;
    show(p.wrong ? 'x' : 'o');
  }

  // 정적으로 미리 칠해진 상태(flow-data 의 state:'correct')는 렌더 시점부터 붙어 있으므로
  // '변화' 가 아니고, 아래 관찰자에 걸리지 않는다 — 화면에 들어가자마자 터지지 않는다.
  var mo = new MutationObserver(function (recs) {
    recs.forEach(function (r) {
      var el = r.target;
      if (!el.matches || !el.matches(GRADED)) return;
      if (!el.classList.contains('correct') && !el.classList.contains('wrong')) return;
      var was = r.oldValue || '';
      if (/\b(correct|wrong)\b/.test(was)) return;   // 이미 채점돼 있던 것
      queue(el);
    });
  });
  var stage = document.getElementById('stage') || document.body;
  mo.observe(stage, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
})();
