# LIO_DESIGN — Step 2 · Skill Core Flow 프로토타입

화면정의서 `LIO_Step2_Flow_Wireframe_v1.1.pptx` (49슬라이드)의 전체 학습 Flow를
클릭 가능한 HTML 프로토타입으로 구현한 것입니다. 같은 Flow를 두 가지 디자인으로 제공합니다.

## 화면 확인

| | 링크 |
|---|---|
| 랜딩 | https://jinilee-hue.github.io/LIO_DESIGN/ |
| **Design A** (Storybook) | https://jinilee-hue.github.io/LIO_DESIGN/designA/ |
| **Design B** (App UI) | https://jinilee-hue.github.io/LIO_DESIGN/designB/ |

특정 화면으로 바로 열기 — 주소 뒤에 `?s=<슬라이드번호>` 또는 `?id=<화면id>`
예) `.../designA/?s=46` → PPTX 46번 슬라이드(Quick Exit 게이트)

## 조작

- 키보드 `←` `→` 또는 하단 **이전 / 다음**
- **☰ Index** : 전체 48화면 목록(PPTX 번호 + TITLE) → 원하는 화면으로 점프
- **ⓘ 화면정의** : 현재 화면의 정의서 Description 패널
- 하단 **페이지** 칸에 PPTX 슬라이드 번호 입력 → 해당 화면으로 이동

## 슬라이드 번호 · 타이틀 규칙

하단 캡션 `Slide N`, 그 아래 타이틀, ☰ Index 목록의 타이틀은 모두
v1.1 PPTX의 **슬라이드 순번과 TITLE 원문**과 1:1로 일치합니다 (범위 **5~49**, 48화면).
PPTX 1~4는 표지·Index·Overview·플로우 구조라 대응 화면이 없습니다.

한 슬라이드를 여러 화면으로 쪼갠 경우(PPTX 6 · 13/14 · 22/23 · 45 · 47/48)는
번호·타이틀이 같고 타이틀 뒤의 **회색 cut 배지**로만 구분합니다.

> PPTX 슬라이드 우상단 `PAGE` 상자에 인쇄된 번호는 표지를 빼고 세서 **순번보다 1 작습니다**
> (46번째 슬라이드의 PAGE 상자 = `45`). 프로토타입은 **순번** 기준입니다.

## 구조

```
├─ index.html            랜딩 (A/B 선택)
├─ designA/  index.html + theme-a.css      Storybook 스킨
├─ designB/  index.html + theme-b.css      App UI 스킨
├─ prototype/
│    ├─ flow-data.js   48개 화면 콘텐츠 모델 (slide / title / cut / spec + 지문·질문·전략)
│    ├─ engine.js      렌더러 + 라우터 (A/B 공용)
│    ├─ kr-map.js      한국어 대역
│    └─ base.css       구조·레이아웃 공통
└─ IMAGE/               마스코트 · 토픽 · 스킬 아이콘 · 히어로 에셋
```

두 디자인은 같은 `flow-data.js` + `engine.js` 를 공유합니다. 문구를 한 번 고치면 A/B에 동시 반영됩니다.
색·장식만 `theme-a.css` / `theme-b.css` 에서 갈립니다.

## 수정 가이드

- **문구 / 화면 순서 / 분기** : `prototype/flow-data.js`
- **A/B 공통 레이아웃·컴포넌트** : `prototype/base.css`
- **디자인별 색·장식** : `designA/theme-a.css` · `designB/theme-b.css`
- **PPTX가 개정되면** : 각 화면의 `slide` / `title` 을 새 PPTX의 슬라이드 순번·TITLE 원문으로 다시 맞춥니다.
  하단 캡션과 Index가 이 두 필드를 그대로 쓰므로 여기만 고치면 둘 다 반영됩니다.

> 화면정의서 원본(pptx) · 슬라이드 렌더 이미지 · 기획 갭 문서는 이 저장소에 포함하지 않습니다.
