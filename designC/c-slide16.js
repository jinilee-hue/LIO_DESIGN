/* ── slide 16 하단 LIO + 말풍선 (Design C 전용) ─────────────────────────────
   기획: Figma C_SLIDE16 (node 384:322) — 우측 활동 영역 하단 오른쪽에
   윙크하는 LIO 와 남색 말풍선("You did great! / Let's go next step!") 이 놓인다.

   흐름 : 문제를 풀면 정/오답 반응이 하단 LIO 자리에서 재생되고, 그것이 끝나면
   LIO 가 말풍선을 띄워 안내를 읽는다. 다 읽으면 말풍선이 사라지고 LIO 가 멈춘 뒤
   다음 화면으로 자동 진행한다 — 그래서 Next 버튼은 감춘다(theme-c.css).
   목적지는 원래 Next 버튼이 가던 곳과 같다(engine 의 goPreRetry → 'pre_retry').

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

  var SCREEN = 'scr-fp1_mq_correct';       // slide 16 (기획서 PAGE 15)
  var TEXT = "You did great! Let's go next step!";
  var LEAD = 450;                          // 말풍선이 뜬 뒤 읽기 시작까지(ms)
  var GO = 'pre_retry';                    // 안내를 읽은 뒤 이동할 화면 (기존 Next 와 동일)
  var REACT_WAIT = 400;                    // 채점 후 이 시간 안에 반응이 안 뜨면 그냥 안내로
  var GAP = 260;                           // 반응이 사라진 뒤 안내까지의 숨돌림

  // 말풍선은 자리를 차지한 채 감춰 둔다(c16-gone) — 나중에 넣으면 flex 가 늘며 LIO 가 밀린다.
  // LIO 는 정지 상태(c16-still)로 시작해 안내할 때만 움직인다.
  var HTML =
    '<div class="c16-cheer" aria-hidden="true">' +
      '<div class="c16-bubble c16-gone">You did great!<br>Let\'s go next step!</div>' +
      '<div class="c16-lio c16-still"></div>' +   // 16프레임 스프라이트 (theme-c.css)
    '</div>';

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

  /* 안내가 끝나면 원래 Next 가 가던 화면으로 넘어간다 */
  function advance() {
    setTimeout(function () {
      var E = window.LIO_ENGINE, F = window.LIO_FLOW;
      if (!E || !F) return;
      var i = F.SCREENS.findIndex(function (x) { return x.id === GO; });
      if (i >= 0) E.goTo(i);
    }, 520);                                    // 말풍선이 사라지는 전환(.45s)을 기다린다
  }

  /* 다 읽으면(또는 읽을 수 없으면) 말풍선을 감추고 LIO 를 멈춘 뒤 다음 화면으로 */
  function speakThenHide(bubble, lio) {
    var done = false;
    // 말풍선을 DOM 에서 지우지 않는다 — 지우면 flex 가 줄어들며 LIO 가 왼쪽으로 밀린다.
    // .c16-gone 이 opacity + visibility 로만 감추므로 LIO 위치는 그대로다.
    function hide() {
      if (done || !bubble.isConnected) return;
      done = true;
      bubble.classList.add('c16-gone');
      if (lio) lio.classList.add('c16-still');   // 말하기 멈춤 (입 다문 프레임에서 정지)
      advance();
    }
    // 발화 시간을 예측할 수 없는 환경(음성 없음 · 헤드리스)을 위한 안전장치
    var fallback = Math.max(2200, TEXT.split(/\s+/).length * 380 + 1400);
    var timer = setTimeout(hide, fallback);

    if (!window.speechSynthesis) return;
    try {
      var u = new SpeechSynthesisUtterance(TEXT);
      u.lang = 'en-US'; u.pitch = 1.25; u.rate = 0.92; u.volume = 1;
      u.voice = pickVoice();
      u.onend = function () { clearTimeout(timer); hide(); };
      u.onerror = function () { clearTimeout(timer); hide(); };
      window.speechSynthesis.speak(u);
    } catch (e) { /* 안전장치 타이머가 처리한다 */ }
  }

  /* 말풍선을 띄우고 LIO 를 움직이며 안내를 읽는다 */
  function cheer(bubble, lio) {
    if (!bubble || !bubble.isConnected) return;
    bubble.classList.remove('c16-gone');
    bubble.classList.add('c16-in');               // 등장 애니메이션 (theme-c.css)
    if (lio) lio.classList.remove('c16-still');   // 말하기 시작
    setTimeout(function () { speakThenHide(bubble, lio); }, LEAD);
  }

  /* C 에서는 빼는 대화 말풍선.
     칭찬은 아래 LIO 말풍선이 대신하므로 중복이다. flow-data.js 는 A · B 와 공용이라
     거기서 지우면 세 시안 모두 사라진다 — 그래서 C 에서만 DOM 에서 걷어낸다. */
  var DROP = [/You found the main idea/i, /Choose what you'?d like to do next/i];

  function dropMessages(dev) {
    var msgs = dev.querySelectorAll('.activity-scroll .msg');
    for (var i = 0; i < msgs.length; i++) {
      var b = msgs[i].querySelector('.bubble');
      if (!b) continue;
      var txt = b.textContent || '';
      for (var j = 0; j < DROP.length; j++) {
        if (DROP[j].test(txt)) { msgs[i].remove(); break; }
      }
    }
  }

  /* 채점 시점 감지 — quiz-reaction.js 와 같은 방식.
     클릭 리스너를 따로 걸면 engine 의 채점 핸들러와 실행 순서를 다투게 된다.
     flow-data 의 state:'correct' 로 렌더 시점부터 붙어 있는 클래스는 '변화' 가
     아니므로(oldValue 확인) 화면에 들어가자마자 진행되지 않는다. */
  function watchGrade(dev, bubble, lio) {
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
        afterReaction(dev, function () { cheer(bubble, lio); });
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
    // 반응이 시작되지 않는 경우의 보험
    setTimeout(function () {
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
    dropMessages(dev);
    host.insertAdjacentHTML('beforeend', HTML);
    watchGrade(dev, host.querySelector('.c16-bubble'), host.querySelector('.c16-lio'));
  }

  // engine 은 화면을 옮길 때 #stage 의 내용을 새로 그린다 — 그 시점마다 다시 붙인다.
  var stage = document.getElementById('stage');
  if (stage) new MutationObserver(mount).observe(stage, { childList: true });
  // 음성 목록은 비동기로 채워진다 — 준비되면 다시 고르도록 이벤트만 걸어 둔다.
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function () {};
  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
