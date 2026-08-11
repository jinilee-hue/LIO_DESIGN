/* ── 하단 LIO 안내 말풍선 (Design C 전용) ───────────────────────────────────
   기획: Figma C_SLIDE16 (node 384:322) — 우측 활동 영역 하단 오른쪽에 LIO 가 서고
   파란 말풍선으로 안내한다. 안내가 대화창 말풍선을 대신하므로 원래 대화는 걷어낸다.

   화면마다 말풍선을 순차로 띄운다. 한 개가 다 읽히면 사라지고 다음 것이 뜬다.
     slide 15  진입 : 지문 듣는 방법 → 학생이 풀기 → 채점 : 결과 멘트 → Pre-retry
               (C 는 15 와 16 을 한 화면으로 합쳤다 — c-flow.js)
     slide 17  진입 : STRATEGY FOR MAIN IDEA 3단계를 순차로 설명
               (원래 18 의 전략 박스를 여기로 옮겼다. 18 의 박스는 theme-c 에서 감춘다)

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
  var REACT_WAIT = 400;  // 채점 후 이 시간 안에 반응이 안 뜨면 그냥 멘트로
  var GAP = 260;         // 반응이 사라진 뒤 멘트까지의 숨돌림
  var STEP_GAP = 420;    // 말풍선 하나가 사라지고 다음 것이 뜨기까지

  var CONFIG = [
    {
      screen: 'scr-fp1_mq',                        // slide 15 (PAGE 14) — 16 을 합쳤다
      drop: [/press the Listen button/i],          // 말풍선이 대신하는 대화
      // 원문 "If you want to listen, press the Listen button next to each paragraph." 를
      // 글자 크기를 줄이지 않고 두 줄에 담기게 뜻만 남겨 줄였다.
      enter: [
        { html: 'Press Listen to hear<br>each paragraph.',
          text: 'Press Listen to hear each paragraph.' },
      ],
      grade: [
        { html: "You did great!<br>Let's go next step!",
          text: "You did great! Let's go next step!",
          // 15·16 을 합치면서 한 화면이 정답·오답을 모두 받는다 — 오답에 칭찬이 나가면
          // 안 되므로 결과별로 문구를 나눈다(원래 16 은 정답경로 전용이었다).
          wrongHtml: "Nice try!<br>Let's look at it together.",
          wrongText: "Nice try! Let's look at it together." },
      ],
      go: 'pre_retry',                             // 원래 slide 16 의 Next 와 같은 목적지
    },
    {
      // slide 18 : 전략 박스는 17 로 옮겼으므로 그것을 여는 멘트도 걷어낸다
      // (박스 자체는 theme-c.css 에서 감춘다)
      screen: 'scr-fp1_et_correct',                // slide 18 (PAGE 17)
      drop: [/strategy you just used/i],
    },
    {
      screen: 'scr-fp1_et',                        // slide 17 (PAGE 16) Evidence Tap 안내
      // 원래 slide 18 의 STRATEGY FOR MAIN IDEA 박스를 LIO 설명으로 옮겼다.
      // 3번 항목의 원문은 'Ask "What big idea covers ALL the key details?" — that is
      // the main idea.' 인데 말풍선 두 줄에 맞게 뜻만 남겨 줄였다.
      enter: [
        { html: 'Here is the strategy<br>for the main idea.',
          text: 'Here is the strategy for the main idea.' },
        { html: '1. Find the topic<br>or main character.',
          text: 'One. Find the topic or main character.' },
        { html: '2. Find the<br>key details.',
          text: 'Two. Find the key details.' },
        { html: '3. Ask what big idea<br>covers ALL the details.',
          text: 'Three. Ask what big idea covers all the details. That is the main idea.' },
      ],
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

  /* 지정한 화면으로 넘어간다 (go 가 없으면 그대로 머문다) */
  function advance(go) {
    if (!go) return;
    setTimeout(function () {
      var E = window.LIO_ENGINE, F = window.LIO_FLOW;
      if (!E || !F) return;
      var i = F.SCREENS.findIndex(function (x) { return x.id === go; });
      if (i >= 0) E.goTo(i);
    }, 520);                                       // 말풍선이 사라지는 전환(.45s)을 기다린다
  }

  /* 말풍선 하나 : 띄우고 읽고 감춘다. 끝나면 next() */
  function sayOne(step, bubble, lio, wrong, next) {
    if (!bubble || !bubble.isConnected) return;
    var say = (wrong && step.wrongText) ? step.wrongText : step.text;
    bubble.innerHTML = (wrong && step.wrongHtml) ? step.wrongHtml : step.html;
    // 다시 띄울 때 등장 애니메이션이 재생되도록 클래스를 떼고 리플로우를 한 번 일으킨다
    bubble.classList.remove('c16-gone', 'c16-in');
    void bubble.offsetWidth;
    bubble.classList.add('c16-in');
    if (lio) lio.classList.remove('c16-still');    // 말하기 시작

    var done = false;
    function finish() {
      if (done || !bubble.isConnected) return;
      done = true;
      bubble.classList.add('c16-gone');
      if (lio) lio.classList.add('c16-still');     // 입 다문 프레임에서 정지
      setTimeout(next, STEP_GAP);
    }
    // 발화 시간을 예측할 수 없는 환경(음성 없음 · 헤드리스)을 위한 안전장치
    var fallback = Math.max(2200, say.split(/\s+/).length * 380 + 1400);
    var timer = setTimeout(finish, fallback);

    setTimeout(function () {
      if (!window.speechSynthesis) return;
      try {
        var u = new SpeechSynthesisUtterance(say);
        u.lang = 'en-US'; u.pitch = 1.25; u.rate = 0.92; u.volume = 1;
        u.voice = pickVoice();
        u.onend = function () { clearTimeout(timer); finish(); };
        u.onerror = function () { clearTimeout(timer); finish(); };
        window.speechSynthesis.speak(u);
      } catch (e) { /* 안전장치 타이머가 처리한다 */ }
    }, LEAD);
  }

  /* 말풍선 여러 개를 순서대로 */
  function sayAll(steps, bubble, lio, wrong, done) {
    var i = 0;
    (function step() {
      if (i >= steps.length) { if (done) done(); return; }
      sayOne(steps[i++], bubble, lio, wrong, step);
    })();
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
        // 오답을 고르면 engine 이 고른 보기에 .wrong 을 붙인다
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
    setTimeout(function () {                       // 반응이 시작되지 않는 경우의 보험
      if (started || dev.classList.contains('c16-react')) return;
      mo.disconnect();
      run();
    }, REACT_WAIT);
  }

  function mount() {
    for (var k = 0; k < CONFIG.length; k++) {
      var cfg = CONFIG[k];
      var dev = document.querySelector('#stage .device.' + cfg.screen);
      if (!dev) continue;
      var host = dev.querySelector('.reading');
      if (!host || host.querySelector('.c16-cheer')) return;

      dropMessages(dev, cfg.drop);
      // 말풍선은 자리를 차지한 채 감춰 둔다(c16-gone) — 나중에 넣으면 flex 가 늘며
      // LIO 가 밀린다. LIO 는 정지 상태(c16-still)로 시작해 말할 때만 움직인다.
      host.insertAdjacentHTML('beforeend',
        '<div class="c16-cheer" aria-hidden="true">' +
          '<div class="c16-bubble c16-gone"></div>' +
          '<div class="c16-lio c16-still"></div>' +
        '</div>');

      var bubble = host.querySelector('.c16-bubble');
      var lio = host.querySelector('.c16-lio');
      var c = cfg;
      if (c.enter && c.enter.length) {
        setTimeout(function () { sayAll(c.enter, bubble, lio, false, null); }, 700);
      }
      if (c.grade && c.grade.length) {
        watchGrade(dev, function (wrong) {
          sayAll(c.grade, bubble, lio, wrong, function () { advance(c.go); });
        });
      }
      return;
    }
  }

  // engine 은 화면을 옮길 때 #stage 의 내용을 새로 그린다 — 그 시점마다 다시 붙인다.
  var stage = document.getElementById('stage');
  if (stage) new MutationObserver(mount).observe(stage, { childList: true });
  // 음성 목록은 비동기로 채워진다 — 준비되면 다시 고르도록 이벤트만 걸어 둔다.
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function () {};
  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
