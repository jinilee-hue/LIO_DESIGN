/* ── Design C · 토픽 페이지 여러 장 ────────────────────────────────────────────
   토픽 종류가 6개 → 20개로 늘었다. 한 화면에 보이는 카드는 그대로 6개이므로
   같은 토픽 선택 화면을 4장으로 나눈다 (6 · 6 · 6 · 2).

     page 1  scr-topic       Trips and Visits … Games and Play        (기존 6개)
     page 2  scr-topic_p2    My Day … Weather Days                    (신규)
     page 3  scr-topic_p3    Pets and Animals … Helping Hands         (신규)
     page 4  scr-topic_p4    Class Jobs · Group Rules                 (신규)

   왜 이렇게 하나
     카드 마크업을 만드는 layoutTopic() 은 공용 engine.js 에 있고 항상
     window.LIO_FLOW.TOPICS(6개) 만 읽는다. 화면마다 다른 목록을 넘길 방법이
     없고 engine.js · flow-data.js 는 A · B 공용이라 손대지 않는다
     (designC/README.md 의 격리 규칙).
     그래서 두 단계로 나눴다.
       1) engine.js 로드 전  — F.SCREENS 에 topic 화면 사본 3장을 끼워 넣는다.
          (engine 은 로드 시점에 목록을 한 번 스냅샷한다 — c-flow.js 와 같은 이유)
       2) engine.js 렌더 후  — #stage 를 MutationObserver 로 보다가 새로 그려진
          토픽 화면의 카드 6장을 그 페이지의 데이터로 덧칠한다.

     카드 DOM 을 새로 만들지 않고 있는 노드를 고쳐 쓰는 것이 핵심이다. engine 의
     wire() 가 이미 그 노드에 클릭 핸들러(최대 2개 선택 · Continue 활성)를 걸어
     두었으므로 노드를 유지하면 선택 동작을 다시 구현할 필요가 없다.
     MutationObserver 콜백은 innerHTML 대입 직후 · 페인트 전에 도는 마이크로태스크라
     기존 이미지가 한 번 스쳐 보이는 일도 없다.

   카드 색
     기존 4색과 같은 계열(Tailwind 300 → 400 세로 그라데이션)에서 하늘 · 청록 ·
     라임 · 앰버 · 보라 · 남보라 · 노랑 등을 더 꺼내 썼다. 각 색은 일러스트의
     주된 색과 부딪히지 않고 뒤로 물러나는 쪽으로 골랐다(따뜻한 그림 ↔ 시원한 배경).

   개발 전달 시 참고
     · 실제 구현에서는 토픽 목록을 서버에서 받아 6개씩 페이징하면 된다.
       화면 정의는 4장 모두 동일하고 카드 데이터만 바뀐다.
     · 카드 우하단 페이지 인디케이터(1/4 …)는 이 프로토타입에서 페이지 구분을
       보여주기 위한 것이다. 필요 없으면 PAGER 를 false 로 두면 사라진다.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var F = window.LIO_FLOW;
  if (!F || !F.SCREENS) return;

  var PAGER = true;                 // 페이지 인디케이터 표시
  var IMG   = '../IMAGE/';          // engine.js 의 IMG 와 같은 기준
  var DIR   = 'topic-images/';      // 새로 추가된 토픽 일러스트 폴더

  /* 색 팔레트 — [flat, 그라데이션 위, 그라데이션 아래]
     blue · green · pink · orange 는 flow-data.js 의 기존 값 그대로다. */
  var C = {
    blue:    ['#6BB6F8', '#8EC5FF', '#51A2FF'],
    sky:     ['#3AC8FF', '#74D4FF', '#00BCFF'],
    cyan:    ['#29DEF8', '#53EAFD', '#00D3F3'],
    teal:    ['#23E1C9', '#46ECD5', '#00D5BE'],
    emerald: ['#2FDEA3', '#5EE9B5', '#00D492'],
    green:   ['#38C46A', '#7BF1A8', '#05DF72'],
    lime:    ['#AAED29', '#BBF451', '#9AE600'],
    yellow:  ['#FED310', '#FFDF20', '#FDC700'],
    amber:   ['#FFC518', '#FFD230', '#FFB900'],
    orange:  ['#FF9A3D', '#FFB86A', '#FF8904'],
    rose:    ['#FF8296', '#FFA1AD', '#FF637E'],
    pink:    ['#F86BA6', '#FDA5D5', '#FB64B6'],
    purple:  ['#CE96FF', '#DAB2FF', '#C27AFF'],
    violet:  ['#B59CFF', '#C4B4FF', '#A684FF'],
    indigo:  ['#8F9DFF', '#A3B3FF', '#7C86FF'],
  };

  /* 신규 페이지의 카드
       name  카드 밖 라벨 (한 줄 · nowrap 이라 길면 fs 로 줄인다)
       img   IMAGE/ 아래 경로
       c     팔레트 키
       wh    원본 픽셀 크기 (sips -g pixelWidth -g pixelHeight 로 실측). 아래 sizeOf()
             가 이걸로 background-size 를 계산한다 — 손으로 %를 적지 않는다.
       fs    라벨 글자 크기 override (긴 이름만) */
  var PAGES = [
    [ // page 2 — 나와 내 주변 (따뜻한 색 · 시원한 색을 번갈아 둔다)
      { name:'My Day',          img:'My_Day.png',          c:'amber',   wh:[912,857] },
      { name:'My School',       img:'My_School.png',       c:'blue',    wh:[800,740] },
      { name:'My Family',       img:'My_Family.png',       c:'orange',  wh:[822,779] },
      { name:'Favorite Things', img:'Favorite_Things.png', c:'violet',  wh:[661,733] },
      { name:'Things I See',    img:'Things_I_See.png',    c:'rose',    wh:[646,664] },
      { name:'Weather Days',    img:'Weather_Days.png',    c:'sky',     wh:[791,775] },
    ],
    [ // page 3 — 동물과 장소
      { name:'Pets & Animals',         img:'Pets_and_Animals.png',       c:'lime',    wh:[762,741] },
      { name:'Bugs & Small Animals',   img:'Bugs_and_Small_Animals.png', c:'purple',  wh:[884,892],
        fs:'clamp(13px,1.37cqw,21.6px)' },
      { name:'Animal Homes',           img:'Animal_Homes.png',           c:'emerald', wh:[748,796] },
      { name:'Friends',                img:'Friends.png',                c:'pink',    wh:[832,825] },
      { name:'Places Nearby',          img:'Places_Nearby.png',          c:'teal',    wh:[788,850] },
      { name:'Helping Hands',          img:'Helping_Hands.png',          c:'rose',    wh:[978,834] },
    ],
    [ // page 4 — 교실과 규칙 (2장 — 가운데 정렬)
      { name:'Class Jobs',  img:'Class_Jobs.png',  c:'indigo', wh:[618,651] },
      { name:'Group Rules', img:'Group_Rules.png', c:'yellow', wh:[947,789] },
    ],
  ];

  /* ── 1페이지 명칭 덮어쓰기 ────────────────────────────────────────────────
     확정 명칭은 'Trips & Visits' · 'Games & Play' 인데 1페이지 카드 이름은 공용
     prototype/flow-data.js 의 TOPICS 에서 온다. 거기서 고치면 A · B 의 기존 값을
     바꾸게 되므로(designC/README.md 의 격리 규칙) C 에서만 라벨을 덧쓴다.
     자리 순서대로 6칸 — null 은 flow-data.js 값을 그대로 쓴다는 뜻이다.
     ※ A · B 는 아직 'Trips and Visits' · 'Games and Play' 로 보인다. 세 시안을
       맞추려면 flow-data.js 의 name 두 개를 바꿔야 하는데 합의 후에 한다. */
  var P1_NAMES = [
    'Trips & Visits',   // was 'Trips and Visits'
    null,               // 'Animals and Nature'  ← 확정 목록에 없는 이름
    null,               // 'Special Days'
    null,               // 'Growing Things'
    null,               // 'Friends and Family'  ← 확정 목록에 없는 이름
    'Games & Play',     // was 'Games and Play'
  ];

  var COLS = 6;   // theme-c.css 의 .topic-grid grid-template-columns

  /* ── 일러스트 크기 맞추기 ─────────────────────────────────────────────────
     20종이 원본 비율이 저마다 달라(세로 긴 것 554x755 ~ 가로 긴 것 978x834)
     background-size 를 같은 %로 주면 육안 크기가 크게 어긋난다.
     알파 여백을 실측해 보니 20종 모두 여백 없이 꽉 잘려 있어(bbox = 캔버스),
     비율만으로 시각 크기가 정해진다.

       background-size:S  →  렌더 폭 = S·카드폭,  렌더 높이 = S·카드폭·(h/w)
       시각 크기(기하평균) = √(폭·높이) = S·카드폭·√(h/w)

     따라서 √(h/w) 를 k 라 두면 S = T/k 로 20종의 시각 크기가 T 로 같아진다.

     T   1페이지(Figma 튜닝값 88/80/80/80/98/88%)의 실측 평균이 0.93 이라 거기
         맞췄다. 1페이지는 이미 이 규칙에 가깝게(0.89~1.00) 잡혀 있어 건드리지
         않았고, 신규 14종만 T 로 모은다.
     CAP 가로로 긴 두 장(Group Rules 1.20 · Helping Hands 1.17)은 T 를 그대로
         맞추면 S 가 100% 를 넘어 카드 좌우가 잘린다. 폭 상한을 94% 로 둔다
         (1페이지 topic5 가 이미 98% 를 쓴다). 이 두 장만 T 보다 5~6% 작다.
     ※ 전체를 키우거나 줄이려면 T 하나만 만지면 된다. */
  var T = 0.93, CAP = 0.94;

  function sizeOf(t) {
    if (!t.wh) return null;
    var k = Math.sqrt(t.wh[1] / t.wh[0]);
    return (Math.min(CAP, T / k) * 100).toFixed(1) + '%';
  }

  /* ── 1. 화면 3장 끼워 넣기 (engine.js 가 목록을 읽기 전) ─────────────────── */
  var base = null, at = -1;
  for (var i = 0; i < F.SCREENS.length; i++) {
    if (F.SCREENS[i].id === 'topic') { base = F.SCREENS[i]; at = i; break; }
  }
  if (!base) return;

  // 1페이지도 몇 장 중 몇 번째인지 알 수 있게 cut 라벨을 붙인다
  var total = PAGES.length + 1;
  base.cut = 'Topic page 1/' + total;

  var made = PAGES.map(function (topics, n) {
    return {
      id: 'topic_p' + (n + 2),
      // 같은 슬라이드를 쪼갠 화면이므로 slide · page 는 원본과 같게 두고 cut 으로 구분한다
      // (flow-data.js 의 greeting/greeting_cut3 과 같은 방식)
      page: base.page, slide: base.slide, section: base.section, title: base.title,
      cut: 'Topic page ' + (n + 2) + '/' + total,
      layout: 'topic',
      mascot: base.mascot,
      lioLine: base.lioLine,          // 한 화면을 페이징한 것이라 헤드라인은 그대로
      introBgm: true,                 // engine 의 INTRO_BGM_IDS 에는 없는 id → 명시 opt-in
      cTopics: topics,                // ↓ 2단계에서 쓰는 이 파일만의 필드
      spec: [
        '토픽 선택 화면 ' + (n + 2) + '/' + total + ' — 카드 6개 단위 페이징',
        '전체 토픽 ' + (6 + 14) + '종 · 한 화면에 6개 (마지막 장은 ' + topics.length + '개)',
        '카드 구성: 일러스트 + 주제 / 6개 중 2개 선택 → 선택 카드 체크 활성',
        '2개 카드 선택 이후 3번째 선택 시 처음 카드 해제',
        '"Continue" : 2개 선택 시 버튼 활성화 → 다음 단계',
      ],
    };
  });

  F.SCREENS.splice.apply(F.SCREENS, [at + 1, 0].concat(made));

  /* ── 2. 렌더된 카드 덧칠 ────────────────────────────────────────────────── */
  var BY_ID = {};
  made.forEach(function (s) { BY_ID[s.id] = s.cTopics; });

  var ORDER = ['topic'].concat(made.map(function (s) { return s.id; }));

  function paint(device) {
    // scr-<id> 클래스로 어느 페이지인지 안다 (engine.js 의 renderScreen)
    var id = null;
    for (var k = 0; k < ORDER.length; k++) {
      if (device.classList.contains('scr-' + ORDER[k])) { id = ORDER[k]; break; }
    }
    if (!id) return;

    var grid = device.querySelector('.topic-grid');
    if (!grid || grid.dataset.cPage) return;      // 같은 화면을 두 번 칠하지 않는다
    grid.dataset.cPage = String(ORDER.indexOf(id) + 1);

    var topics = BY_ID[id];
    if (id === 'topic') {
      // 1페이지는 engine 이 그린 그대로 두고 라벨만 고친다 (색 · 크기 · 이미지 유지)
      device.querySelectorAll('.topic-card .tc-name').forEach(function (nm, j) {
        if (P1_NAMES[j]) nm.textContent = P1_NAMES[j];
      });
    }
    if (topics) {
      var cards = device.querySelectorAll('.topic-card');
      // 카드가 6장보다 적은 페이지는 남는 카드를 지우고 가운데 열로 밀어 넣는다
      // (열 수를 유지해야 다른 페이지와 카드 폭이 같다)
      var start = Math.floor((COLS - topics.length) / 2) + 1;
      for (var j = 0; j < cards.length; j++) {
        var card = cards[j], t = topics[j];
        if (!t) { card.remove(); continue; }      // engine 의 핸들러는 노드째 떨어져 나간다
        var c = C[t.c] || C.blue;
        card.style.setProperty('--tc', c[0]);
        card.style.setProperty('--tc-from', c[1]);
        card.style.setProperty('--tc-to', c[2]);
        var size = t.size || sizeOf(t);
        if (size)   card.style.setProperty('--tc-size', size);
        if (t.pos)  card.style.setProperty('--tc-pos', t.pos);
        if (t.fs)   card.style.setProperty('--tc-name-fs', t.fs);
        var img = card.querySelector('.tc-img');
        if (img) img.style.setProperty('--tc-img', "url('" + IMG + DIR + t.img + "')");
        var nm = card.querySelector('.tc-name');
        if (nm) nm.textContent = t.name;
        if (topics.length < COLS) card.style.gridColumn = String(start + j);
      }
    }

    if (PAGER) addPager(device, grid, ORDER.indexOf(id));
  }

  function addPager(device, grid, cur) {
    var screen = grid.closest('.topicscreen');
    if (!screen || screen.querySelector('.topic-pager')) return;
    var p = document.createElement('div');
    p.className = 'topic-pager';
    p.innerHTML = ORDER.map(function (id, n) {
      return '<button class="tp-dot' + (n === cur ? ' on' : '') + '" data-i="' + n +
             '" aria-label="Topic page ' + (n + 1) + '"></button>';
    }).join('') + '<span class="tp-count">' + (cur + 1) + ' / ' + ORDER.length + '</span>';
    // 화면 흐름 높이를 건드리지 않도록 absolute (theme-c.css) — 카드 영역 오른쪽 위
    screen.appendChild(p);
    p.querySelectorAll('.tp-dot').forEach(function (b) {
      b.addEventListener('click', function () {
        var E = window.LIO_ENGINE; if (!E) return;
        var want = ORDER[+b.dataset.i];
        var i = F.SCREENS.findIndex(function (x) { return x.id === want; });
        if (i >= 0) E.goTo(i);
      });
    });
  }

  function scan() {
    var d = document.querySelector('#stage .device.layout-topic');
    if (d) paint(d);
  }

  var stage = document.getElementById('stage');
  if (!stage) return;
  new MutationObserver(scan).observe(stage, { childList: true, subtree: false });
  scan();   // ?id=topic 등으로 토픽 화면에서 바로 시작하는 경우
})();
