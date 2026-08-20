/* ── 배경음악 On/Off 버튼 (Design C 전용) ──────────────────────────────────
   상단 헤더(.hd) 오른쪽 끝, 섹션 라벨("Further Practice 1") 뒤에 스피커 버튼을
   붙인다. 눌러 두면 인트로 BGM 이 다시 나오지 않고, 다시 누르면 원래대로 돌아온다.

   공용 engine.js / base.css 는 손대지 않는다 (designC/README.md 의 격리 규칙).
   헤더 markup 은 engine.js 의 headerHTML() 이 만들므로 여기서 DOM 에 얹는다.
   engine 은 화면을 옮길 때 #stage 를 새로 그린다 — 그때마다 다시 붙여야 한다.

   BGM 은 engine.js 의 ensureBgm() 이 만든 <audio> 하나다(IIFE 안이라 밖에서
   함수를 못 부른다). body 에 붙어 있으므로 src 로 찾아서 직접 제어한다.

   ⚠ 껐다고 pause() 만 해서는 안 된다 — engine 의 syncIntroBgm() 이 화면을 옮길
     때마다 muted=false + play() 를 다시 부르기 때문이다. 그래서 그 요소의
     play() 를 감싸서, 꺼진 동안에는 "재생하려 했다"는 사실만 기록하고 실제
     재생은 막는다. 다시 켤 때 그 기록을 보고 이어서 재생한다.  */
(function () {
  'use strict';

  var KEY = 'lio_c_bgm';        // localStorage : 'off' 면 껐던 상태를 기억한다
  var on = true;                // 배경음악 허용 여부
  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}

  var el = null;                // engine 의 BGM <audio>
  var wanted = false;           // 꺼진 동안 engine 이 재생을 원했는가
  var baseVol = 0.38;           // 처음 본 볼륨(engine 의 INTRO_BGM_VOL)

  /* engine 이 만든 BGM 요소를 찾아 play()/pause() 를 한 번만 감싼다. */
  function audio() {
    if (el && el.isConnected) return el;
    var found = null;
    var list = document.querySelectorAll('audio');
    for (var i = 0; i < list.length; i++) {
      if ((list[i].currentSrc || list[i].src || '').indexOf('bgm/') >= 0) { found = list[i]; break; }
    }
    if (!found) return null;
    el = found;
    if (!el.dataset.cBgmHooked) {
      el.dataset.cBgmHooked = '1';
      if (el.volume) baseVol = el.volume;
      var play = el.play.bind(el);
      var pause = el.pause.bind(el);
      el.play = function () {
        // 꺼져 있으면 재생 의사만 기록한다 — engine 은 반환값의 catch 만 보므로
        // 이미 끝난 Promise 를 돌려주면 재시도 타이머도 돌지 않는다.
        if (!on) { wanted = true; return Promise.resolve(); }
        return play();
      };
      el.pause = function () { wanted = false; return pause(); };
    }
    return el;
  }

  /* 현재 상태를 소리와 버튼에 반영한다. */
  function apply() {
    var a = audio();
    if (a) {
      if (on) {
        a.muted = false;
        // 끄기 직전에 engine 의 페이드아웃이 돌던 중이면 볼륨이 낮게 남는다
        if (a.volume < baseVol) a.volume = baseVol;
        if (wanted && a.paused) { wanted = false; a.play().catch(function () {}); }
      } else {
        a.muted = true;
        if (!a.paused) { wanted = true; a.pause(); }
      }
    }
    var btns = document.querySelectorAll('.hd-bgm');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? '배경음악 끄기' : '배경음악 켜기');
      b.title = on ? '배경음악 끄기' : '배경음악 켜기';
      b.classList.toggle('is-off', !on);
      // 원본과 같이 켜짐 · 꺼짐은 CSS 로 숨기는 게 아니라 그림 자체를 갈아 끼운다
      // (꺼짐은 mask 가 필요해 클래스만으로는 만들 수 없다)
      var want = on ? 'on' : 'off';
      if (b.dataset.icon !== want) { b.dataset.icon = want; b.innerHTML = iconHTML(on); }
    }
  }

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    on = !on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (err) {}
    apply();
  }

  /* 아이콘 : AI-Studio(Wonder Story Lab)의 speaker / muted 를 그대로 가져왔다.
     원본은 AI-Studio/wsl-icons.js 의 ICON_DRAW.speaker · ICON_DRAW.muted 이고
     거기서도 같은 일(BGM 뮤트 토글 · teacher.html 의 .bgm-toggle)을 한다.
     · 파형은 하나, 콘은 두 번째 파형이 비운 자리를 쓴다 — 버튼 크기에서 뭉개지지
       않게 콘을 자기 fill 색으로 한 번 더 stroke 해서(round join) 굴리고 키운다.
     · 꺼짐은 다른 물건이 아니라 같은 물건이 조용해진 것이다 — 콘과 파형을 그대로
       두고 그 위를 한 줄로 지운다. 슬래시는 mask 로 그림에서 파내므로 어떤 버튼
       색에서도 진짜 틈으로 읽힌다.
     색만 C 의 헤더에 맞춰 다시 말한다(원본도 .bgm-toggle.is-on-cover 에서 같은 식으로
     제 색을 커버의 바이올렛으로 바꿔 쓴다) — 보라 그라디언트는 로열블루 위에서
     읽히지 않으므로 흰색(currentColor)으로 둔다. 슬래시의 핑크는 원본 그대로다.
     그 한 획만은 색이 아니라 상태로 읽혀야 하는 표시라서 원본도 남겨 두었다. */
  var PINK = '#FF6B9A';
  var SPK =
    '<path class="hd-bgm-cone" d="M7.2 18h7.44l11.16-9v30L14.64 30H7.2a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Z"/>' +
    '<path class="hd-bgm-wave" d="M32.5 14c4.4 3.5 7 7.8 7 10s-2.6 6.5-7 10"/>';
  var uid = 0;   // mask id 충돌 방지 — 원본 icon() 도 같은 이유로 uid 를 붙인다

  function iconHTML(playing) {
    if (playing) {
      return '<svg class="hd-bgm-ic" viewBox="0 0 48 48" aria-hidden="true">' + SPK + '</svg>';
    }
    var m = 'mBgmCut' + (++uid);
    // mask 의 흑백은 그대로 둔다 — 색을 바꾸면 파내던 선이 파내지 않는다
    return '<svg class="hd-bgm-ic" viewBox="0 0 48 48" aria-hidden="true">' +
        '<mask id="' + m + '">' +
          '<rect x="0" y="0" width="48" height="48" fill="#FFFFFF"/>' +
          '<path d="M8.5 8.5 39.5 39.5" fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round"/>' +
        '</mask>' +
        '<g mask="url(#' + m + ')">' + SPK + '</g>' +
        '<path class="hd-bgm-slash" d="M8.5 8.5 39.5 39.5" fill="none" stroke="' + PINK + '" stroke-width="3.6" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* 헤더가 새로 그려질 때마다 버튼을 다시 얹는다. */
  function mount() {
    var hd = document.querySelector('#stage .hd');
    if (!hd || hd.querySelector('.hd-bgm')) { apply(); return; }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hd-bgm';
    // click 은 engine 의 화면 진행 핸들러와 겹칠 수 있어 캡처 단계에서 잡는다.
    btn.addEventListener('click', toggle, true);
    hd.appendChild(btn);   // .hd-title 이 margin-left:auto 라 버튼은 그 오른쪽 끝에 선다
    apply();
  }

  var stage = document.getElementById('stage');
  if (stage) new MutationObserver(mount).observe(stage, { childList: true });
  if (document.readyState !== 'loading') mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
