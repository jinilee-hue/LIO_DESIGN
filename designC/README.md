# DESIGN C — B 의 심플 버전

B 타입을 복사해 만든 세 번째 시안이다. 단순화 방향은 별도 지시로 정한다.
현재 상태는 **B 와 렌더 결과가 동일**하다(의도한 차이는 `data-variant="C"` 와 주석뿐).

## 동작은 B 와 같다

`index.html` 이 `window.LIO_THEME = 'B'` 를 그대로 쓴다. 엔진의 테마 분기 4곳과
`bOnly` 화면 필터가 B 와 똑같이 동작해야 하기 때문이다. C 를 구분해야 할 때는
`<html data-variant="C">` 를 CSS 에서 쓴다.

```css
/* theme-c.css 안에서 */
[data-variant="C"] .msg.lio .bubble { ... }
```

## A · B 에 영향을 주지 않기 위한 규칙

C 작업은 **`designC/` 안에서만** 한다. 아래 파일은 A · B 가 함께 쓰는 공용 파일이라
C 때문에 고치면 세 시안 전부에 반영된다.

| 공용 파일 | 쓰는 곳 |
|---|---|
| `prototype/base.css` | A · B · C |
| `prototype/flow-data.js` | A · B · C |
| `prototype/kr-map.js` | A · B · C |
| `prototype/engine.js` | A · B · C |
| `IMAGE/**` | A · B · C (읽기만 — 기존 파일 덮어쓰기 금지, 새 파일로 추가) |

`theme-c.css` · `lio-footsteps.js` · `quiz-reaction.js` 는 B 에서 복사한 **C 전용
사본**이다. 여기서 무엇을 지우거나 고쳐도 B 는 영향받지 않는다.

### 커밋 전 확인

C 작업 커밋은 `designC/` 밖을 건드리지 않아야 한다.

```bash
git diff --name-only HEAD    # designC/ 밖의 경로가 나오면 멈추고 되돌린다
```

### 공용 파일을 고쳐야 하는 경우

C 만의 화면 흐름이나 문구가 필요해지면 공용 파일 수정이 불가피하다. 그때는
`flow-data.js` 에 `cOnly` 플래그를 더하는 식으로 **A · B 의 기존 동작을 바꾸지 않는
추가(opt-in) 형태**로만 넣고, 넣기 전에 합의한다. 기존 값을 바꾸는 수정은 하지 않는다.

## 파일

```
designC/
  index.html        DESIGN C · Simple  (공용 prototype/* 을 로드)
  theme-c.css       theme-b.css 사본 — 단순화 작업은 여기서
  c-flow.js         C 의 축소된 FLOW — engine 이 읽기 전에 화면을 걷어낸다
  c-topic-pages.js  토픽 20종을 6개씩 4장으로 (slide 8 · PAGE 7)
  lio-footsteps.js  slide 5 LIO 등장 발소리 (C 전용 사본)
  quiz-reaction.js  정 · 오답 LIO 반응 (C 전용 사본)
  c-lio-guide.js    하단 LIO 안내 말풍선 (Figma C_SLIDE16)
  c-bgm-toggle.js   헤더 오른쪽 끝 배경음악 On/Off 버튼 (♫ · localStorage 기억)
```

## 토픽 선택 화면 — 4장 (`c-topic-pages.js`)

토픽 종류가 6개 → **20개**로 늘었다. 한 화면에 보이는 카드는 그대로 6개이므로
같은 선택 화면(slide 8 · PAGE 7)을 4장으로 나눴다. 화면 정의는 4장 모두 같고
카드 데이터만 바뀐다 — 실제 구현에서는 토픽 목록을 6개씩 페이징하면 된다.

| 화면 id | cut 라벨 | 카드 |
|---|---|---|
| `topic` | Topic page 1/4 | Trips & Visits · Animals and Nature · Special Days · Growing Things · Friends and Family · Games & Play |
| `topic_p2` | Topic page 2/4 | My Day · My School · My Family · Favorite Things · Things I See · Weather Days |
| `topic_p3` | Topic page 3/4 | Pets & Animals · Bugs & Small Animals · Animal Homes · Friends · Places Nearby · Helping Hands |
| `topic_p4` | Topic page 4/4 | Class Jobs · Group Rules |

### 명칭

확정 목록(스프레드시트) 기준이다. 4건이 `and` → `&` 로 바뀌었다.

| 확정 명칭 | 이전 | 어디 |
|---|---|---|
| Trips & Visits | Trips and Visits | 1페이지 |
| Games & Play | Games and Play | 1페이지 |
| Pets & Animals | Pets and Animals | 3페이지 |
| Bugs & Small Animals | Bugs and Small Animals | 3페이지 |

1페이지 두 건은 이름이 공용 `prototype/flow-data.js` 의 `TOPICS` 에서 오므로 거기서
고치면 A · B 의 기존 값을 바꾸게 된다. `c-topic-pages.js` 의 `P1_NAMES` 로 C 에서만
라벨을 덧썼다. **A · B 는 아직 `Trips and Visits` · `Games and Play` 로 보인다** —
세 시안을 맞추려면 `flow-data.js` 의 `name` 두 개를 바꿔야 하는데 합의 후에 한다.

확정 목록은 18종인데 프로토타입은 20종이다. 1페이지의 **`Animals and Nature` ·
`Friends and Family` 두 이름이 확정 목록에 없다.** 확정 목록에 `Pets & Animals` ·
`Animal Homes` · `Bugs & Small Animals` · `Friends` · `My Family` 가 따로 있어
쪼개진 것으로 보인다. 이 둘을 빼면 18종 = **6개씩 정확히 3페이지**가 되어 지금의
2장짜리 마지막 페이지도 없어진다. 다만 두 항목 모두 공용 `flow-data.js` 소속이고
카드를 빼는 것은 내용 결정이라 확인 후에 한다.

신규 14종의 일러스트는 `IMAGE/topic-images/` 다. 1페이지는 기존 6종
(`IMAGE/topic1~6.png` · `flow-data.js` 의 `TOPICS`) 그대로라 손대지 않았다.

**20 ÷ 6 이라 마지막 장이 2개다.** 남는 카드를 지우고 가운데 열로 밀어 넣어
카드 폭은 다른 장과 같게 맞췄다. 4장을 꽉 채우려면 토픽이 24종,
3장으로 줄이려면 18종이어야 한다 — 종수 조정이 필요하면 알려달라.

### 공용 파일을 안 건드린 방법

카드 마크업을 만드는 `layoutTopic()` 은 공용 `engine.js` 에 있고 언제나
`LIO_FLOW.TOPICS`(6개)만 읽는다. 화면마다 다른 목록을 넘길 방법이 없어 두 단계로 나눴다.

1. **`engine.js` 로드 전** — `F.SCREENS` 에 topic 화면 사본 3장을 끼워 넣는다.
   engine 은 로드 시점에 목록을 한 번 스냅샷하므로 순서가 중요하다
   (`c-flow.js` 와 같은 이유로 `index.html` 에서 `engine.js` 앞에 둔다).
2. **렌더 후** — `#stage` 를 `MutationObserver` 로 보다가 새로 그려진 토픽 화면의
   카드 6장을 그 페이지의 데이터로 덧칠한다.

카드 DOM 을 새로 만들지 않고 **있는 노드를 고쳐 쓰는 것**이 핵심이다. engine 의
`wire()` 가 이미 그 노드에 클릭 핸들러(최대 2개 선택 · Continue 활성)를 걸어 두었으므로
노드를 유지하면 선택 동작을 다시 구현할 필요가 없다. `wire()` 는 `innerHTML` 대입과
같은 태스크에서 돌고 `MutationObserver` 콜백은 그 뒤 마이크로태스크라 순서도 항상 이쪽이
나중이다 — 페인트 전이므로 기존 이미지가 한 번 스쳐 보이지도 않는다.

### `theme-c.css` 변경 (3곳)

카드 일러스트 크기가 자리(`nth-child`) 기준으로 박혀 있어 페이지마다 순서가 다른
지금은 맞지 않는다. 카드별 변수로 바꿨다.

- `.topic-card .tc-img` : `background-size:70%` → `var(--tc-size,70%)`,
  `background-position:center` → `var(--tc-pos,center)`
- 기존 `nth-child` 광학 보정은 `.scr-topic` 으로 한정 — 1페이지는 그대로 두고,
  2페이지 이후는 `c-topic-pages.js` 의 `sizeOf()` 가 카드마다 `--tc-size` 를 계산해 준다
  (아래 «일러스트 크기» 참고)
- `.topic-card .tc-name` : `font-size` → `var(--tc-name-fs, …)`
  (`Bugs and Small Animals` 처럼 긴 이름만 줄인다 — 라벨은 `nowrap` 이다)

그리고 `.topic-pager` 를 새로 추가했다. **페이지 인디케이터는 프로토타입에서 4장을
구분해 보여주기 위한 것으로 실제 화면 요구사항이 아니다.** 카드 · Continue 의 수직
배치를 밀지 않도록 `absolute` 로 오른쪽 위에 띄웠고, 점을 누르면 그 페이지로 간다.
빼려면 `c-topic-pages.js` 의 `PAGER = false`.

### 일러스트 크기 — 육안 크기 맞추기

20종의 원본 비율이 저마다 다르다(세로 긴 `topic4` 554×755 ~ 가로 긴
`Group_Rules` 947×789). `background-size` 를 같은 %로 주면 육안 크기가 크게
어긋난다. 알파 여백을 실측해 보니 20종 모두 여백 없이 꽉 잘려 있어
(불투명 bbox = 캔버스 전체) **원본 비율만으로 시각 크기가 정해진다.**

```
background-size:S  →  렌더 폭 = S·카드폭,  렌더 높이 = S·카드폭·(h/w)
시각 크기(기하평균)  = √(폭·높이) = S·카드폭·√(h/w)

k = √(h/w) 라 두면   S = T/k   로 20종의 시각 크기가 T 로 같아진다
```

`c-topic-pages.js` 는 카드 데이터에 원본 픽셀 크기(`wh:[w,h]`)만 적고 `sizeOf()`
가 `S` 를 계산한다. 손으로 % 를 적지 않으니 새 일러스트를 넣을 때도 `wh` 만
채우면 크기가 맞는다. **전체를 키우거나 줄이려면 `T` 하나만 만지면 된다.**

| 상수 | 값 | 이유 |
|---|---|---|
| `T` | `0.93` | 1페이지(Figma 튜닝값 88/80/80/80/98/88%)의 실측 평균. 1페이지는 이미 이 규칙에 가깝게(0.89 ~ 1.00) 잡혀 있어 건드리지 않고, 신규 14종만 여기로 모았다 |
| `CAP` | `0.94` | 폭 상한. 가로로 긴 두 장(Group Rules `w/h` 1.20 · Helping Hands 1.17)은 `T` 를 그대로 맞추면 `S` 가 100% 를 넘어 카드 좌우가 잘린다. 이 두 장만 `T` 보다 5~6% 작다 |

결과 (`--tc-size`) — 1페이지는 변화 없음:

| 페이지 | 값 |
|---|---|
| 1 | 88 · 80 · 80 · 80 · 98 · 88% (기존 그대로) |
| 2 | 94 · 94 · 94 · 88.3 · 91.7 · 94% |
| 3 | 94 · 92.6 · 90.2 · 93.4 · 89.5 · 94% |
| 4 | 90.6 · 94% |

### 카드 색

기존 4색(파랑 · 초록 · 분홍 · 주황)과 같은 규칙 — Tailwind `300 → 400` 세로
그라데이션 — 으로 하늘 · 청록 · 에메랄드 · 라임 · 앰버 · 로즈 · 보라 · 남보라 · 노랑을
더 꺼내 썼다. 색은 일러스트의 주된 색과 부딪히지 않고 뒤로 물러나는 쪽으로 골랐고
(초록 일러스트엔 보라 · 로즈, 따뜻한 일러스트엔 시원한 배경), 한 줄 안에서는 따뜻한
색과 시원한 색이 번갈아 오게 배치해 특정 카드가 튀지 않도록 했다.
팔레트 전체는 `c-topic-pages.js` 의 `C` 에 있다.
