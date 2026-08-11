/* ── slide 5 LIO 등장 발소리 (Design B 전용) ─────────────────────────────────
   designB/index.html 에서만 로드한다. 공용 engine.js / base.css 는 손대지 않는다.

   트리거는 CSS 애니메이션 이벤트다. theme-b.css 의 걷기 애니메이션 bLioWalk 이
   시작될 때 animationstart 가 올라오므로, 그 순간에 발소리 타임라인을 예약한다.
   화면을 다시 들어오면 요소가 새로 만들어져 이벤트가 또 발생한다.
   prefers-reduced-motion 에서는 CSS 가 애니메이션을 끄므로 발소리도 자동으로 안 난다.

   보 간격은 프레임에서 뽑지 않았다 — 원본 걷기 4프레임이 "다리 모음 → 최대 벌어짐"
   반쪽 사이클이라(발 벌어짐 92→130→170→191px) 접지가 사이클당 1번뿐이어서 1.2초에
   2보밖에 안 나온다. 대신 눈에 보이는 몸의 이동(bLioWalkIn, 2.10s ·
   cubic-bezier(.16,.62,.36,1) — 뒤로 갈수록 감속)에 맞춰 간격이 벌어지는 7보로 잡았다.
   마지막 보(2.05s)가 사자가 멈추는 시점(2.10s)에 떨어진다.

   소리는 에셋 없이 Web Audio 로 합성한다 — 부드러운 저역 노이즈 '팟'(발바닥) +
   낮은 사인 '툭'(체중). 좌우 발을 번갈아 살짝 다르게 해 기계적으로 들리지 않게 했다.
   브라우저 자동재생 정책상 첫 사용자 제스처 전에는 소리가 나지 않는다(BGM 과 동일).  */
(function () {
  'use strict';
  if (window.LIO_THEME !== 'B') return;

  // [시각(초), 세기] — 화면에 들어오며 커지고 마지막 착지는 살짝 눌러 준다
  var STEPS = [
    [0.18, 0.62], [0.62, 0.74], [1.12, 0.86], [1.66, 0.97], [2.02, 0.82]
  ];
  var VOL = 0.14;          // BGM(0.38) 아래로 — 발소리가 앞서지 않게
  var ctx = null;
  var unlocked = false;
  var timers = [];

  /* 제스처 전에는 컨텍스트를 만들지도 않는다 — 만들면 브라우저가 자동재생 정책 경고를
     콘솔에 남기고(발걸음마다 1번) 어차피 소리도 안 난다. */
  function audio() {
    if (!unlocked) return null;
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  // 첫 제스처에 오디오 컨텍스트를 깨운다 (engine.js 의 BGM 언락과 같은 이유)
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { unlocked = true; audio(); }, { capture: true });
  });

  var noiseBuf = null;
  function noise(a) {
    if (!noiseBuf) {
      var n = Math.floor(a.sampleRate * 0.12);
      noiseBuf = a.createBuffer(1, n, a.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  /* 발소리 1회를 임의의 오디오 컨텍스트에 쌓는다. 라이브 컨텍스트와 OfflineAudioContext
     둘 다 받으므로, 검증할 때 이 함수를 그대로 오프라인 렌더해 파형을 확인할 수 있다.
     (파라미터를 따로 베껴 검증하면 실제 코드와 어긋나도 못 잡는다.)
     left 로 좌우 발을 번갈아 — 필터와 피치를 조금 달리해 같은 소리가 반복되는 티를 없앤다. */
  function voice(a, dest, t, strength, left) {
    var g = VOL * strength;

    // 발바닥 : 저역만 남긴 짧은 노이즈
    var src = a.createBufferSource(); src.buffer = noise(a);
    var lp = a.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = left ? 600 : 700;
    lp.Q.value = 0.6;
    var ng = a.createGain();
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(g, t + 0.010);   // 어택을 늘려 딸깍거리지 않게
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    src.connect(lp); lp.connect(ng); ng.connect(dest);
    src.start(t); src.stop(t + 0.20);

    // 체중 : 낮은 사인이 살짝 떨어지며 사라진다
    var o = a.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(left ? 104 : 92, t);
    o.frequency.exponentialRampToValueAtTime(left ? 58 : 52, t + 0.13);
    var og = a.createGain();
    og.gain.setValueAtTime(0, t);
    og.gain.linearRampToValueAtTime(g * 0.95, t + 0.012);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(og); og.connect(dest);
    o.start(t); o.stop(t + 0.20);
  }

  // 라이브 재생용 래퍼
  function step(strength, left) {
    var a = audio();
    if (!a || a.state !== 'running') return;
    voice(a, a.destination, a.currentTime + 0.005, strength, left);
  }

  function schedule() {
    timers.forEach(clearTimeout);
    timers = [];
    STEPS.forEach(function (s, i) {
      timers.push(setTimeout(function () { step(s[1], i % 2 === 0); }, s[0] * 1000));
    });
  }

  /* 검증용 — voice()/STEPS 를 그대로 OfflineAudioContext 에 렌더해 파형을 확인한다.
     프로덕션 동작에는 쓰지 않는다. */
  window.LIO_FOOTSTEPS = { voice: voice, steps: STEPS };

  // bLioWalk = theme-b.css 의 걷기 프레임 애니메이션. 이름이 바뀌면 여기도 바꿔야 한다.
  document.addEventListener('animationstart', function (e) {
    if (e.animationName === 'bLioWalk') schedule();
  }, true);
})();
