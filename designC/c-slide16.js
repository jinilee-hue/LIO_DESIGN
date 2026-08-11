/* ── slide 16 하단 LIO + 말풍선 (Design C 전용) ─────────────────────────────
   기획: Figma C_SLIDE16 (node 384:322) — 우측 활동 영역 하단 오른쪽에
   윙크하는 LIO 와 파란 말풍선("You did great! / Let's go next step!") 이 놓인다.
   말풍선은 떴다가 TTS 로 읽고 사라진다. LIO 는 남는다.

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
  var HTML =
    '<div class="c16-cheer" aria-hidden="true">' +
      '<div class="c16-bubble">You did great!<br>Let\'s go next step!</div>' +
      '<div class="c16-lio"></div>' +          // 16프레임 스프라이트 (theme-c.css)
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

  /* 다 읽으면(또는 읽을 수 없으면) 말풍선을 지운다 */
  function speakThenHide(bubble) {
    var done = false;
    // DOM 에서 지우지 않는다 — 지우면 flex 가 줄어들며 LIO 가 왼쪽으로 밀린다.
    // .c16-gone 이 opacity + visibility 로만 감추므로 LIO 위치는 그대로다.
    function hide() {
      if (done || !bubble.isConnected) return;
      done = true;
      bubble.classList.add('c16-gone');
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

  function mount() {
    var dev = document.querySelector('#stage .device.' + SCREEN);
    if (!dev) return;
    var host = dev.querySelector('.reading');
    if (!host || host.querySelector('.c16-cheer')) return;
    dropMessages(dev);
    host.insertAdjacentHTML('beforeend', HTML);
    var bubble = host.querySelector('.c16-bubble');
    if (bubble) setTimeout(function () { speakThenHide(bubble); }, LEAD);
  }

  // engine 은 화면을 옮길 때 #stage 의 내용을 새로 그린다 — 그 시점마다 다시 붙인다.
  var stage = document.getElementById('stage');
  if (stage) new MutationObserver(mount).observe(stage, { childList: true });
  // 음성 목록은 비동기로 채워진다 — 준비되면 다시 고르도록 이벤트만 걸어 둔다.
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function () {};
  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
