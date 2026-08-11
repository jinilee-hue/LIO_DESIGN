/* ── 하단 LIO 안내 말풍선 (Design C 전용) ───────────────────────────────────
   기획: Figma C_SLIDE16 (node 384:322) — 우측 활동 영역 하단 오른쪽에 LIO 가 서고
   파란 말풍선으로 안내한다. 안내가 대화창 말풍선을 대신하므로 원래 대화는 걷어낸다.

   C 는 slide 15 와 16 을 한 화면으로 합쳤다(c-flow.js 가 16 을 빼고 15 에 즉시채점을
   켠다). 그래서 한 화면에서 두 단계로 말한다.
     1) 진입   지문 듣는 방법을 안내
     2) 채점 후 정/오답 반응이 끝나면 칭찬 → Pre-retry 로 자동 진행

   공용 engine.js / flow-data.js / base.css 는 손대지 않는다. designC/index.html
   에서만 로드하므로 A · B 에는 영향이 없다 (designC/README.md 의 격리 규칙).

   붙이는 곳은 .reading 이다. .activity 는 base.css 에서 overflow:hidden 이라
   패널 밖으로 살짝 걸치는 목업 배치를 재현할 수 없다.

   좌표는 목업에서 그대로 환산했다. .device 의 aspect-ratio 가 1577/1072 로
   Figma 프레임과 같고 #stage 가 container-type:inline-size 이므로
   1cqw = 디바이스 폭의 1% = 목업 15.77px 이다. 크기 값은 theme-c.css 에 있다.

   TTS : engine.js 의 speak() 는 IIFE 안에 있어 밖에서 못 부른다(window.LIO_ENGINE
   은 이동 함수만 공개한다). 그래서 같은 설정(en-US · pitch 1.25 · rate 0.92)과
   같은 음성 우선순위로 여기서 직접 발화한다. speechSynthesis.cancel() 은 부르지
   않는다 — 화면의 다른 TTS 를 끊을 수 있다. */
(function () {
  'use strict';

  var LEAD = 450;        // 말풍선이 뜬 뒤 읽기 시작까지(ms)
  var REACT_WAIT = 400;  // 채점 후 이 시간 안에 반응이 안 뜨면 그냥 안내로
  var GAP = 260;         // 반응이 사라진 뒤 안내까지의 숨돌림
  var cheerText = '';    // 지금 말풍선이 담고 있는 문구 (정/오답에 따라 달라진다)

  var SCREEN = 'scr-fp1_mq';        // slide 15 (기획서 PAGE 14) — 16 을 여기 합쳤다

  // 말풍선이 대신하는 대화 (flow-data 는 A · B 공용이라 DOM 에서만 걷어낸다)
  var DROP = [/press the Listen button/i];

  // 순서대로 말한다. on:'enter' 는 진입 직후, on:'grade' 는 채점·반응이 끝난 뒤.
  var STEPS = [
    {
      on: 'enter',
      // 원문은 "If you want to listen, press the Listen button next to each paragraph." 인데
      // 글자 크기를 줄이지 않고 두 줄에 담기게 뜻만 남겨 줄였다.
      html: 'Press Listen to hear<br>each paragraph.',
      text: 'Press Listen to hear each paragraph.',
    },
    {
      on: 'grade',
      html: "You did great!<br>Let's go next step!",
      text: "You did great! Let's go next step!",
      // 15·16 을 합치면서 한 화면이 정답·오답을 모두 받는다. 오답에 칭찬이 나가면
      // 안 되므로 결과별로 문구를 나눈다(원래 16 은 정답경로 전용이었다).
      wrongHtml: "Nice try!<br>Let's look at it together.",
      wrongText: "Nice try! Let's look at it together.",
      go: 'pre_retry',               // 원래 slide 16 의 Next 와 같은 목적지
    },
  ];

  /* engine.js 의 pickVoice() 와 같은 우선순위 — 기계음 대신 자연스러운 음성 */
  function pickVoice() {
    var vs = [];
    try { vs = window.speechSynthesis.getVoices() || []; } catch (e) { return null; }
    var en = vs.filter(function (v) { return /^en/i.test(v.lang); });
    var prefs = [/natural/i, /online/i, /aria|jenny|ana|libby|maisie/i,
                 /google us english/i, /google/i, /samantha|zira/i];
    for (var i = 0; i < prefs.length; i++) {
      for (var j = 0; j < en.length; j++) if (prefs[i].test(en[j].name)) return en[j];
    }
    return en[0] || null;
  }

  /* 안내가 끝나면 지정한 화면으로 넘어간다 (go 가 없으면 그대로 머문다) */
  function advance(go) {
    if (!go) return;
    setTimeout(function () {
      var E = window.LIO_ENGINE, F = window.LIO_FLOW;
      if (!E || !F) return;
      var i = F.SCREENS.findIndex(function (x) { return x.id === go; });
      if (i >= 0) E.goTo(i);
    }, 520);                                     // 말풍선이 사라지는 전환(.45s)을 기다린다
  }

  /* 다 읽으면(또는 읽을 수 없으면) 말풍선을 감추고 LIO 를 멈춘다 */
  function speakThenHide(cfg, bubble, lio) {
    var done = false;
    // 말풍선을 DOM 에서 지우지 않는다 — 지우면 flex 가 줄어들며 LIO 가 밀린다.
    // .c16-gone 이 opacity + visibility 로만 감추므로 LIO 위치는 그대로다.
    function hide() {
      if (done || !bubble.isConnected) return;
      done = true;
      bubble.classList.add('c16-gone');
      if (lio) lio.classList.add('c16-still');   // 말하기 멈춤 (입 다문 프레임에서 정지)
      advance(cfg.go);
    }
    // 발화 시간을 예측할 수 없는 환경(음성 없음 · 헤드리스)을 위한 안전장치
    var say = cheerText || cfg.text;
    var fallback = Math.max(2200, say.split(/\s+/).length * 380 + 1400);
    var timer = setTimeout(hide, fallback);

    if (!window.speechSynthesis) return;
    try {
      var u = new SpeechSynthesisUtterance(say);
      u.lang = 'en-US'; u.pitch = 1.25; u.rate = 0.92; u.volume = 1;
      u.voice = pickVoice();
      u.onend = function () { clearTimeout(timer); hide(); };
      u.onerror = function () { clearTimeout(timer); hide(); };
      window.speechSynthesis.speak(u);
    } catch (e) { /* 안전장치 타이머가 처리한다 */ }
  }

  /* 말풍선을 띄우고 LIO 를 움직이며 안내를 읽는다 */
  function cheer(cfg, bubble, lio, wrong) {
    if (!bubble || !bubble.isConnected) return;
    // 오답 문구가 정의된 단계는 결과에 따라 갈라 쓴다
    cheerText = (wrong && cfg.wrongText) ? cfg.wrongText : cfg.text;
    bubble.innerHTML = (wrong && cfg.wrongHtml) ? cfg.wrongHtml : cfg.html;
    bubble.classList.remove('c16-gone', 'c16-in');
    void bubble.offsetWidth;                      // 등장 애니메이션을 다시 재생시킨다
    bubble.classList.remove('c16-gone');
    bubble.classList.add('c16-in');               // 등장 애니메이션 (theme-c.css)
    if (lio) lio.classList.remove('c16-still');   // 말하기 시작
    setTimeout(function () { speakThenHide(cfg, bubble, lio); }, LEAD);
  }

  /* 말풍선이 대신하는 대화를 걷어낸다 (flow-data 는 A · B 공용이라 DOM 에서만) */
  function dropMessages(dev, drop) {
    if (!drop || !drop.length) return;
    var msgs = dev.querySelectorAll('.activity-scroll .msg');
    for (var i = 0; i < msgs.length; i++) {
      var b = msgs[i].querySelector('.bubble');
      if (!b) continue;
      var txt = b.textContent || '';
      for (var j = 0; j < drop.length; j++) {
        if (drop[j].test(txt)) { msgs[i].remove(); break; }
      }
    }
  }

  /* 채점 시점 감지 — quiz-reaction.js 와 같은 방식.
     클릭 리스너를 따로 걸면 engine 의 채점 핸들러와 실행 순서를 다투게 된다.
     flow-data 의 state:'correct' 로 렌더 시점부터 붙어 있는 클래스는 '변화' 가
     아니므로(oldValue 확인) 화면에 들어가자마자 진행되지 않는다. */
  function watchGrade(dev, run) {
    var fired = false;
    var mo = new MutationObserver(function (recs) {
      if (fired) return;
      for (var i = 0; i < recs.length; i++) {
        var el = recs[i].target;
        if (!el.matches || !el.matches('.choice')) continue;
        if (!el.classList.contains('correct') && !el.classList.contains('wrong')) continue;
        if (/\b(correct|wrong)\b/.test(recs[i].oldValue || '')) continue;
        fired = true;
        mo.disconnect();
        // 채점 결과 : 오답을 고르면 engine 이 고른 보기에 .wrong 을 붙인다
        // (정답 보기에도 .correct 를 함께 붙이므로 .wrong 존재로 판정한다)
        var wrong = !!dev.querySelector('.choice.wrong');
        afterReaction(dev, function () { run(wrong); });
        return;
      }
    });
    mo.observe(dev, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  }

  /* 정/오답 반응이 끝나는 순간을 기다린다.
     반응은 하단 LIO 와 같은 자리에서 재생되고, 그동안 quiz-reaction.js 가 .c16-react 로
     LIO·말풍선을 감춘다. 고정 지연으로 맞추면 재생 길이가 바뀔 때마다 어긋나므로
     그 클래스가 걷히는 순간을 직접 본다. 반응이 아예 없으면(스크립트 미로드 등) 바로 진행. */
  function afterReaction(dev, run) {
    var started = dev.classList.contains('c16-react');
    var mo = new MutationObserver(function () {
      if (dev.classList.contains('c16-react')) { started = true; return; }
      if (!started) return;
      mo.disconnect();
      setTimeout(run, GAP);
    });
    mo.observe(dev, { attributes: true, attributeFilter: ['class'] });
    setTimeout(function () {                      // 반응이 시작되지 않는 경우의 보험
      if (started || dev.classList.contains('c16-react')) return;
      mo.disconnect();
      run();
    }, REACT_WAIT);
  }

  function mount() {
    var dev = document.querySelector('#stage .device.' + SCREEN);
    if (!dev) return;
    var host = dev.querySelector('.reading');
    if (!host || host.querySelector('.c16-cheer')) return;

    dropMessages(dev, DROP);
    // 말풍선은 자리를 차지한 채 감춰 둔다(c16-gone) — 나중에 넣으면 flex 가 늘며
    // LIO 가 밀린다. LIO 는 정지 상태(c16-still)로 시작해 말할 때만 움직인다.
    host.insertAdjacentHTML('beforeend',
      '<div class="c16-cheer" aria-hidden="true">' +
        '<div class="c16-bubble c16-gone"></div>' +
        '<div class="c16-lio c16-still"></div>' +
      '</div>');

    var bubble = host.querySelector('.c16-bubble');
    var lio = host.querySelector('.c16-lio');
    var enter = STEPS.filter(function (x) { return x.on === 'enter'; })[0];
    var grade = STEPS.filter(function (x) { return x.on === 'grade'; })[0];

    if (enter) setTimeout(function () { cheer(enter, bubble, lio); }, 700);
    if (grade) watchGrade(dev, function (wrong) { cheer(grade, bubble, lio, wrong); });
  }

  // engine 은 화면을 옮길 때 #stage 의 내용을 새로 그린다 — 그 시점마다 다시 붙인다.
  var stage = document.getElementById('stage');
  if (stage) new MutationObserver(mount).observe(stage, { childList: true });
  // 음성 목록은 비동기로 채워진다 — 준비되면 다시 고르도록 이벤트만 걸어 둔다.
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function () {};
  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
