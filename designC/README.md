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
  lio-footsteps.js  slide 5 LIO 등장 발소리 (C 전용 사본)
  quiz-reaction.js  정 · 오답 LIO 반응 (C 전용 사본)
  c-lio-guide.js    하단 LIO 안내 말풍선 (Figma C_SLIDE16)
  c-bgm-toggle.js   헤더 오른쪽 끝 배경음악 On/Off 버튼 (♫ · localStorage 기억)
```
