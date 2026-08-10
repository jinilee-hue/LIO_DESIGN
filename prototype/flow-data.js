/* =====================================================================
   LIO Step 2 · Skill Core — Flow Prototype
   flow-data.js  :  전체 화면 콘텐츠 모델 (LIO_Step2_Flow_Wireframe_v1.1.pptx 기반)
   - slide 번호는 기획서 페이지 기준. v1.1 이후 화면이 추가되어 번호가 밀려 있다 :
     slide 9 뒤 3화면(Skill Video Intro/Video/Game Intro) · 13 뒤 1화면(FP1 Intro) ·
     22 뒤 1화면(Something else 선택) ·
     v1.2 대조로 35 뒤 2화면(S 분리형 단일/복수) · 38 뒤 2화면(S4 Confirm/누적)
     v1.2 대조로 Entry Method C·B 선택 화면 2개 추가
     v1.2 대조로 Walk the Passage 질문 3화면 · 학습 종료 화면 1화면 추가
     → 현재 5~64, 64화면.
   - 이 파일은 Design A / Design B 두 프로토타입이 공유합니다.
   - 화면 렌더링은 engine.js 가 담당합니다.
   ===================================================================== */

/* ---------- 공용 상수 : 지문 / 메인질문 / 전략 / 핵심단어 ---------- */

// 지문 "A Day at the Tide Pools" — 문장 단위 id 부여 (하이라이트/커서 제어용)
// kw() : 핵심단어(파란 밑줄), s()/문단 구조는 engine 이 렌더
/* 보조 지문 — 기획서 PAGE 41·42(S4 Confirm)가 쓰는 지문.
   Confirm 활동은 Identifying Literary Genres / Inferring Author's Purpose 두 스킬에서만
   나오고, 기획서도 이 지문으로 그린다. 문장 id 는 f1.. 로 본 지문(p1..)과 구분한다. */
const PASSAGE_FARM = {
  title: 'A Trip to the Farm',
  paras: [
    [
      { id:'f1', html:'Mia and her dad went to a <kw>farm</kw>.' },
      { id:'f2', html:'It was her first time there.' },
      { id:'f3', html:'She saw big red <kw>barns</kw> and green <kw>fields</kw>.' },
    ],
    [
      { id:'f4', html:'A <kw>farmer</kw> met them at the <kw>gate</kw>.' },
      { id:'f5', html:'She showed them the animals.' },
      { id:'f6', html:'Mia saw cows, pigs, and chickens.' },
      { id:'f7', html:'The chickens were loud!' },
    ],
    [
      { id:'f8', html:'Then the farmer took them to the <kw>garden</kw>.' },
      { id:'f9', html:'She let Mia pick a <kw>carrot</kw>.' },
      { id:'f10', html:'Mia pulled hard and it came out.' },
      { id:'f11', html:'She was so happy.' },
    ],
    [
      { id:'f12', html:'On the way home, Mia held the carrot.' },
      { id:'f13', html:'&ldquo;I learned something new today,&rdquo; she said.' },
      { id:'f14', html:'Dad smiled.' },
      { id:'f15', html:'&ldquo;Farms are where our food grows,&rdquo; he said.' },
      { id:'f16', html:'Mia looked at the carrot.' },
      { id:'f17', html:'She could not wait to eat it.' },
    ],
  ],
};

const PASSAGE = {
  title: 'A Day at the Tide Pools',
  paras: [
    [
      { id:'p1', html:'Last summer, Maya visited the ocean with her class.' },
      { id:'p2', html:'They walked down to the rocky shore to <kw>explore</kw> the <kw>tide</kw> pools.' },
      { id:'p3', html:'A tide pool is a small pool of water left behind when the ocean tide goes out.' },
      { id:'p4', html:'Maya had never seen one before.' },
    ],
    [
      { id:'p5', html:'The pools were full of living things.' },
      { id:'p6', html:'Maya <kw>spotted</kw> a sea star clinging to a wet rock.' },
      { id:'p7', html:'Its five arms were bright orange.' },
      { id:'p8', html:'A hermit crab dragged its borrowed shell across the sandy bottom.' },
      { id:'p9', html:'Small fish darted between the rocks to hide.' },
    ],
    [
      { id:'p10', html:"Maya's teacher explained that tide pool animals must survive two different worlds." },
      { id:'p11', html:'When the tide comes in, the animals are covered by cold ocean water.' },
      { id:'p12', html:'When the tide goes out, they are left in the warm sun.' },
      { id:'p13', html:'Because of this, these animals are very <kw>tough</kw>.' },
    ],
    [
      { id:'p14', html:'Maya wrote down everything she <kw>observed</kw> in her notebook.' },
      { id:'p15', html:'She learned that even a small pool can hold many living things.' },
      { id:'p16', html:'She left the shore feeling <kw>amazed</kw> by what she had discovered.' },
    ],
  ],
};

const MAIN_Q = 'What is "A Day at the Tide Pools" mostly about?';
const CHOICES = [
  { k:'A', html:'a girl who discovers the animals and wonders of tide pools' },   // 정답
  { k:'B', html:'a girl who learns how to swim in the ocean with her class' },
  { k:'C', html:'a class that finds a lost sea star on a rocky beach' },
  { k:'D', html:'a teacher who studies ocean water for a science project' },
];

// 전략 카드 — 아이콘은 Design B 스킬 3D 아이콘(b_skill) 재사용
const STRATEGY = {
  title:'STRATEGY FOR MAIN IDEA',
  items:[
    { bImg:'skill_making_inferences.png', html:'Find the topic or main character' },
    { bImg:'skill_recalling_facts_1.png', html:'Find the key details' },
    { bImg:'skill_main_ideas.png', html:'Ask "What big idea covers ALL the key details?" — that is the main idea.' },
  ],
};

// 10개 학습 스킬 (오늘 = Main Ideas / Determining Main Idea)
// aImg : a_skill 폴더(일러스트 북커버), bImg : b_skill 폴더(3D 아이콘), color : Design B 카드색
// Figma A_Skill_list_AI(114:595) 표시 순서 + 정확한 a_skill 파일 매핑
/* 스킬 10개 (Design B 는 이름이 다르다 — bName)
   ⚠ name 은 그대로 둬야 한다 : engine.js 의 skillNameHtml 이 name 을 키로 2줄 분리 매핑을
     하고 있어서 name 을 바꾸면 Design A 의 카드 라벨이 1줄이 되며 레이아웃이 밀린다.
     B 에서 쓸 새 이름은 bName 에 두고 THEME==='B' 일 때만 쓴다. */
const SKILLS = [
  { name:'Main Ideas',            today:true, aImg:'skill1.png',  bImg:'skill_main_ideas.png',                 color:'#F2B01E' }, // 노랑
  { name:'Recalling Facts 1',     bName:'Facts: WH Question', aImg:'skill2.png',  bImg:'skill_facts_wh_question.png',          color:'#3E9BE0' }, // 파랑
  { name:'Recalling Facts 2',     bName:'Facts: True or Not True', aImg:'skill3.png',  bImg:'skill_facts_true_or_not_true.png',          color:'#3E9BE0' }, // 파랑
  { name:'Recalling Facts 3',     bName:'Facts: Sentence Completion', aImg:'skill10.png', bImg:'skill_facts_sentence_completion.png',          color:'#25438A' }, // 네이비
  { name:'Drawing Conclusions',   bName:'Conclusions', aImg:'skill4.png',  bImg:'skill_drawing_conclusions.png',        color:'#7DBD3E' }, // 초록
  { name:'Making Inferences',     bName:'Inferences', aImg:'skill5.png',  bImg:'skill_inferences.png',          color:'#A66BF8' }, // 보라
  { name:'Cause & Effect',        aImg:'skill6.png',  bImg:'skill_cause_effect.png',               color:'#EF8A2A' }, // 주황
  { name:'Analyzing Characters',  bName:'Characters', aImg:'skill7.png',  bImg:'skill_analyzing_characters.png',       color:'#C1502E' }, // 빨강
  { name:"Author's Purpose",      aImg:'skill8.png',  bImg:'skill_authors_purpose.png',            color:'#D99A5B' }, // 탠
  { name:'Literary Genres',       aImg:'skill9.png',  bImg:'skill_literary_genres.png',            color:'#8FCDE8' }, // 하늘
];

// 6개 토픽 (선택: 2개)
const TOPICS = [
  { name:'Trips and Visits',   img:'topic1.png', color:'#6BB6F8', from:'#8EC5FF', to:'#51A2FF' },
  { name:'Animals and Nature', img:'topic2.png', color:'#38C46A', from:'#7BF1A8', to:'#05DF72' },
  { name:'Special Days',       img:'topic3.png', color:'#F86BA6', from:'#FDA5D5', to:'#FB64B6' },
  { name:'Growing Things',     img:'topic4.png', color:'#38C46A', from:'#7BF1A8', to:'#05DF72' },
  { name:'Friends and Family', img:'topic5.png', color:'#FF9A3D', from:'#FFB86A', to:'#FF8904' },
  { name:'Games and Play',     img:'topic6.png', color:'#6BB6F8', from:'#8EC5FF', to:'#51A2FF' },
];

// 핵심 단어 (Word Peek / Find & Flip)
const KEYWORDS = [
  { w:'explore',  emoji:'🧭', def:'To look around a place to learn about it.', ex:'We explore the park to find hidden treasures.', exKr:'우리는 숨은 보물을 찾으러 공원을 탐험한다.', kr:'장소를 돌아다니며 배우는 것', short:'look around a new place', shortKr:'새로운 곳을 둘러보다', clue:'to look around a new place and discover things', clueKr:'새로운 곳을 둘러보며 발견하는 것', easyDef:'looking around and discovering new things', easyDefKr:'이리저리 둘러보며 새로운 것을 찾는 것', exEasy:'We explore the park to find hidden butterflies.', exEasyKr:'우리는 숨은 나비를 찾으러 공원을 둘러봐요.' },
  { w:'tide',     emoji:'🌊', def:'The regular rise and fall of the sea.',      ex:'The tide goes out and leaves small pools.',     exKr:'썰물이 되면 작은 웅덩이가 남는다.', kr:'바닷물이 오르내리는 것',   short:'rise and fall of the sea', shortKr:'바닷물의 밀물과 썰물', clue:"the rise and fall of the ocean's water", clueKr:'바닷물이 오르고 내리는 것', easyDef:'the sea water coming up and going down', easyDefKr:'바닷물이 올라왔다 내려갔다 하는 것', exEasy:'The tide comes up, then it goes back down.', exEasyKr:'바닷물이 올라왔다가 다시 내려가요.' },
  { w:'spotted',  emoji:'👀', def:'Saw or noticed something.',                  ex:'Maya spotted a sea star on a rock.',            exKr:'마야는 바위 위의 불가사리를 발견했다.', kr:'보거나 알아챘다',        short:'saw by surprise', shortKr:'우연히 발견하다', clue:'saw or noticed something suddenly', clueKr:'무언가를 갑자기 보거나 알아챈 것', easyDef:'seeing something all of a sudden', easyDefKr:'무언가를 갑자기 본 것', exEasy:'I spotted a little bird in the tree.', exEasyKr:'나는 나무에서 작은 새를 발견했어요.' },
  { w:'tough',    emoji:'💪', def:'Strong and able to survive hard things.',    ex:'These animals are very tough.',                 exKr:'이 동물들은 매우 강인하다.', kr:'강하고 잘 견디는',       short:'strong and handy', shortKr:'강하고 잘 견디는', clue:'strong and able to survive hard things', clueKr:'강하고 힘든 것도 잘 견디는', easyDef:'very strong and not easy to break', easyDefKr:'아주 튼튼해서 쉽게 망가지지 않는', exEasy:'This box is tough, so it does not break.', exEasyKr:'이 상자는 튼튼해서 부서지지 않아요.' },
  { w:'observed', emoji:'🔎', def:'Watched something carefully to learn about it.', ex:'She observed everything in her notebook.',  exKr:'그녀는 공책에 모든 것을 관찰해 적었다.', kr:'주의 깊게 관찰했다',    short:'watched carefully', shortKr:'주의 깊게 살펴보다', clue:'watched something carefully', clueKr:'무언가를 주의 깊게 지켜본 것', easyDef:'looking at something very carefully', easyDefKr:'무언가를 아주 자세히 살펴보는 것', exEasy:'We observed the ants with a big glass.', exEasyKr:'우리는 큰 돋보기로 개미를 관찰했어요.' },
  { w:'amazed',   emoji:'😮', def:'Very surprised in a good way.',              ex:'She felt amazed by what she discovered.',       exKr:'그녀는 발견한 것에 놀라워했다.', kr:'매우 놀란',             short:'very surprised', shortKr:'매우 놀란', clue:'very surprised in a happy way', clueKr:'기분 좋게 매우 놀란 것', easyDef:'feeling very surprised and happy', easyDefKr:'아주 놀랍고 신기한 기분', exEasy:'I was amazed by the big rainbow.', exEasyKr:'나는 큰 무지개를 보고 놀랐어요.' },
];

// Explore Words : 키워드 이외 지문에서 탭 가능한 단어(점선 표시) — 영영뜻/한글뜻
const EXPLORE_EXTRA = [
  { w:'dragged',  def:'Pulled along with force.',                              kr:'힘껏 끌고 갔다' },
  { w:'borrowed', def:'Temporarily used something that belongs to someone else.', kr:'남의 것을 잠시 빌렸다' },
  { w:'small',    def:'Not big; easy to hold.',                                kr:'크지 않은; 작은' },
  /* 보조 지문(A Trip to the Farm)의 탭 가능한 단어들. 기획서 화면의 carrot 팝업과 같은 형식.
     ⚠ carrot 외 뜻은 기획서에 없어 같은 형식으로 쓴 초안이다. */
  { w:'farm',   emoji:'🚜', def:'A place where people grow food and keep animals.', ex:'Mia and her dad went to a farm.',        kr:'농장' },
  { w:'barns',  emoji:'🏚️', def:'Big farm buildings that keep animals and hay.',    ex:'She saw big red barns and green fields.', kr:'헛간' },
  { w:'fields', emoji:'🌾', def:'Wide open land where plants grow.',                ex:'She saw big red barns and green fields.', kr:'들판' },
  { w:'farmer', emoji:'👩\u200d🌾', def:'A person who works on a farm.',               ex:'A farmer met them at the gate.',         kr:'농부' },
  { w:'gate',   emoji:'🚪', def:'A door in a fence that you open to go in.',        ex:'A farmer met them at the gate.',         kr:'문' },
  { w:'garden', emoji:'🌱', def:'A place where vegetables or flowers are grown.',   ex:'Then the farmer took them to the garden.', kr:'텃밭' },
  { w:'carrot', emoji:'🥕', def:'An orange vegetable that grows in the ground.',    ex:'She let Mia pick a carrot.',             kr:'당근' },
];

/* ---------- 화면 정의 (LIO_Step2_Flow_Wireframe_v1.1.pptx slides 5 → 49) ----------
   공통 필드:
   id,
   slide   : PPTX 슬라이드 번호(파일 탐색 기준 — 임의로 바꾸지 말 것)
             ⚠ v1.1 기준이었으나 slide 9 뒤에 Skill Video Intro / Skill Video / Game Intro
               3화면이 추가되어 이후 번호가 +3 밀렸다(기존 10~49 → 13~52).
   title   : v1.1 PPTX 해당 슬라이드의 TITLE 원문 그대로 (하단 캡션 · Index 공용)
   cut     : (선택) 같은 슬라이드를 여러 화면으로 쪼갠 경우의 구분 라벨
   section : 헤더 우측 타이틀
   layout, spec(화면정의서 Description 항목 배열), + 레이아웃별 데이터
   ※ 한 슬라이드가 여러 화면이면 slide/title 은 중복되고 cut 으로만 구분한다.
------------------------------------------------------------------------------ */

const SCREENS = [

/* 5 ─ 진입 표지 */
{
  id:'entry', slide:5, section:'', title:'STEP2_Skill Score 진입 화면 표지', layout:'splash',
  spec:['LIO 캐릭터 아이콘 + 애니메이션 효과','타이틀 "LIO Skill Core" 표출 · 음악 + 제목 읽기'],
},

/* 6 ─ Greeting / A_Intro_cut2 (일러스트 + 순차 말풍선 + TTS) */
{
  id:'greeting', slide:6, section:'Greeting', title:'STEP2_Intro', cut:'cut2', layout:'center',
  mascot:'lio2.png',
  // Design B(센터 카드)용 메시지
  message:[
    'Hi <b>Maya</b>! Welcome to Skill Core!',
    "I'm <b>LIO</b>, and I'll be your reading buddy today.",
    'We will practice together!',
    "Ready? Let's go!",
  ],
  buttons:[{ html:"Let's go! ▶", style:'primary' }],
  // Design A(A_Intro_cut2)용 인트로 시퀀스 : 영상 후 페이드인 → 왼쪽 말풍선(TTS) → 오른쪽 말풍선(TTS)
  // image / 말풍선 텍스트는 실제 A_Intro_cut2에 맞게 교체 가능. audio 지정 시 TTS 대신 성우 오디오 재생.
  introSeq:{
    image:'intro2.png',   // A_Intro_cut2 배경 (도서관)
    fadeIn:true,
    autoNext:true,   // 마지막 말풍선 후 자동으로 cut3로 페이드 전환
    bubbles:[  // Figma A_Intro_cut2 원문 그대로
      { side:'left',  text:'Hi <b class="nm">Maya</b>! Welcome to Skill<br>Core!' /* , audio:'../IMAGE/tts/cut2_1.mp3' */ },
      { side:'right', text:"I'm <b class=\"lio-nm\">LIO</b>, and I'll be your<br>reading buddy today." },
    ],
  },
  spec:['Step 명칭 / Skill 명칭 / 화면 활동명','A_Intro_cut1 영상 종료 → 페이드아웃 → A_Intro_cut2 이미지 페이드인','LIO 왼쪽 말풍선 등장 + TTS → 사라짐 → 오른쪽 말풍선 등장 + TTS','마지막 말풍선 후 자동으로 A_Intro_cut3로 전환','TTS: 아기사자 LIO(7세 남아 톤) · 성우 오디오로 교체 가능'],
},

/* 6b ─ A_Intro_cut3 (일러스트 + 순차 말풍선 + TTS) — Design A 전용 */
{
  id:'greeting_cut3', slide:6, section:'Greeting', title:'STEP2_Intro', cut:'cut3', layout:'center',
  message:[],
  introSeq:{
    image:'intro2.png',   // A_Intro_cut3 배경 (도서관 — cut2와 동일)
    fadeIn:false,         // cut2와 같은 배경 → 페이드 없이 말풍선만 교체
    bubbles:[  // Figma A_Intro_cut3 원문 그대로
      { side:'left',  text:'We will practice together!' },
      { side:'right', text:"Ready? Let's go!" },
    ],
    cta:"Let's go!", ctaImg:'ui/btn_letsgo.png',   // Figma 버튼 원본
  },
  spec:['A_Intro_cut3 이미지 페이드인 (cut2에서 자동 연결)','왼쪽 말풍선 등장 + TTS → 사라짐 → 오른쪽 말풍선 등장 + TTS','TTS: 아기사자 LIO(7세 남아 톤) · 성우 오디오로 교체 가능',"마지막 말풍선 후 'Let's go!' 버튼 → Skill Intro 이동"],
},

/* 7 ─ Skill Intro */
{
  id:'skill', slide:7, section:'Intro', title:'Skill_Name_Intro', layout:'skill',
  spec:['Skill 대표 이미지와 학습 스킬 10개 표출','회전 후 "Let\'s find your skill!" 하면서 오늘 학습 스킬에서 멈춤','전체 리스트 사라지면 다음 확대 화면(아이콘 위치)로 이동'],
},

/* 8 ─ Topic Selection */
{
  id:'topic', slide:8, section:'Topic Selection', title:'Topic_Selection', layout:'topic',
  mascot:'lio_face.png', // Figma B_Topic_list lio_face 1 (thinking)
  // Figma: line1 Nunito Medium 36 / line2 Nunito ExtraBold 60
  lioLine:'<span class="tl-sub">Before practicing, let\'s pick two topics, <b class="nm">Maya</b>!</span><span class="tl-main">Which ones sound fun?</span>',
  spec:['카드 구성: 아이콘 + 주제 / 6개 중 2개 선택 → 선택 카드 색상 변화','2개 카드 선택 이후 3번째 선택 시 처음 카드 해제','"Continue" : 2개 선택 시 버튼 활성화 → 다음 단계'],
},

/* 9 ─ Activity Plan Intro */
{
  id:'plan', slide:9, section:'Intro', title:'Game_Intro', layout:'center',
  mascot:'lio_face2.png', mascotBig:true,
  message:[
    'Here\'s how today will go: <b class="nm">watch a video</b> → <b class="nm">play a game</b> → <b class="nm">read &amp; practice</b>',
    "Ready? Let's get started!",
  ],
  buttons:[{ html:"Let's play! ▶", style:'primary' }],
  // Design A : A_Game Intro (침실 배경 + 순차 말풍선 + Let's play)
  introSeq:{
    image:'intro4.png',
    fadeIn:true,
    bubbles:[  // Figma A_Game Intro 원문 그대로
      { side:'left',  text:'Here\'s how today will go:<br><b class="nm">watch a video</b> → <b class="nm">play a game</b> → <b class="nm">read &amp; practice</b>' },
      { side:'right', text:"Ready? Let's get started!" },
    ],
    cta:"Let's play!", ctaImg:'ui/btn_letsplay.png',   // Figma 버튼 원본
  },
  spec:['A_Game Intro: 침실 일러스트 배경, 헤더 없음','좌 "Here\'s how today will go..." → 우 "first, we\'ll play a game, and then we\'ll read and practice together!"',"강조: play a game(초록) / read and practice(핑크)","'Let's play!'(초록) : 게임 실행으로 이동"],
},
/* 9b ─ Skill Video Intro (기획서 PAGE 10) : LIO TTS 후 'Let's watch!' 버튼 생성.
   디자인은 slide 9(Game_Intro)와 동일한 인트로 씬을 그대로 쓴다. */
{
  id:'skill_video_intro', slide:10, section:'Intro', title:'Skill1/2_Warming_Up_Skill_Video_Intro', layout:'center',
  mascot:'lio_face2.png', mascotBig:true,
  message:[
    'Time for a quick video, <b>Maya</b>! Let\'s learn all about "<b class="hl">Determining Main Ideas</b>" before we jump in.',
    "Let's watch!",
  ],
  buttons:[{ html:"Let's watch! ▶", style:'primary' }],
  introSeq:{
    image:'intro4.png',
    fadeIn:true,
    bubbles:[
      { side:'left',  text:'Time for a quick video, <b class="nm">Maya</b>!<br>Let\'s learn all about <b class="mi">"Determining Main Ideas"</b><br>before we jump in.' },
      { side:'right', text:"Let's watch!" },
    ],
    cta:"Let's watch!",   // A 용 버튼 이미지(btn_letswatch)는 없어 텍스트 버튼으로 렌더된다
  },
  spec:['LIO(TTS) 대화 완료 후 \'Let\'s watch!\' 버튼 생성',"'Let's watch! ➤' 클릭 → 'Skill Video' 시청 화면 전환"],
},

/* 9c ─ Skill Video (기획서 PAGE 11) : 스킬 영상 시청. 게임 실행화면과 같은 풀블리드 형태.
   ⚠ 썸네일은 임시로 게임 썸네일을 쓴다 — 실제 skill video 썸네일/영상으로 교체 필요. */
{
  id:'skill_video', slide:11, section:'Intro', title:'Skill1/2_Warming_Up_Skill_Video', layout:'game',
  gameImage:'launcher/video_thumbnails/video_main_idea.png',   // A : 영상 썸네일 원본(2400×1600)
  gameImageB:'b/video_main_idea.jpg',                          // B : 디바이스 크기로 맞춘 JPG (game_bg.jpg 와 같은 규격)
  gameCta:"Let's go! ▶", gameCtaImg:'ui/btn_letsgo.png',
  gameTitle:'Skill Video', gameRound:'Determining Main Ideas',
  spec:['약 10분 내 스킬 영상 시청','영상 시청 후 Game Intro 화면 전환','※ 현재는 썸네일만 — 실제 영상 재생은 추후 연결'],
},

/* 9d ─ Game Intro (기획서 PAGE 12) : 영상 시청 후 게임 안내.
   디자인은 slide 9(Game_Intro)와 동일. */
{
  id:'game_intro', slide:12, section:'Game', title:'Skill1/2_Warming_Up_Game_Intro', layout:'center',
  mascot:'lio_face2.png', mascotBig:true,
  message:[
    'Nice job watching, <b>Maya</b>!',
    'Now let\'s warm up those <b class="hl">Main Idea</b> skills with a game!',
  ],
  buttons:[{ html:"Let's play! ▶", style:'primary' }],
  introSeq:{
    image:'intro4.png',
    fadeIn:true,
    bubbles:[
      { side:'left',  text:'Nice job watching, <b class="nm">Maya</b>!' },
      { side:'right', text:'Now let\'s warm up those <b class="mi">Main Idea</b> skills with a game!' },
    ],
    cta:"Let's play!", ctaImg:'ui/btn_letsplay.png',
  },
  spec:['LIO(TTS) 대화 완료 후 \'Let\'s play!\' 버튼 생성','학생은 선택이 아닌, 배울 skill 의 게임을 진행',"'Let's play! ➤' → 다음 단계로 이동"],
},

/* 10 ─ FP1 Game Intro (Warm-up) */
{
  id:'game', slide:13, section:'Game', title:'Game+FP1_Intro_화면전환', layout:'game',
  gameImage:'launcher/thumbnails/09_main_ideas.png',  // Design A : Main Ideas 게임 풀 일러스트
  gameImageB:'b/game_bg.jpg',                         // Design B : 게임 썸네일 풀블리드
  gameCta:"Let's go! ▶", gameCtaImg:'ui/btn_letsgo.png',   // Figma 버튼 원본
  gameTitle:'Puzzle Builder', gameRound:'Round 1 of 3',
  transition:[
    'Great job with the game, <b>Maya</b>! 🎉',
    'Now let\'s put your <b class="hl">Main Idea</b> skills to work — with a story about <b class="hl">Trips and Visits</b>!',
    "Let's go! 📖",
  ],
  spec:['B: 게임 썸네일 풀블리드 · 헤더/오버레이 없음 (탭→다음)','A: Game 시작 화면 + FP1_Intro 화면 전환'],
},
/* 13b ─ FP1 Intro (기획서 PAGE 13) : 게임 후 FP1 안내. LIO TTS 후 'Let's go!' 버튼 생성.
   디자인은 slide 12(Game Intro)와 같은 인트로 씬을 그대로 쓴다.
   ※ 이 문구는 원래 game 화면의 transition 배열에 있었지만, layoutGame 이 A/B 모두 조기
     반환해서 실제로는 렌더되지 않았다(별도 화면으로 분리됨). transition 은 그대로 남겨둔다. */
{
  id:'fp1_intro', slide:14, section:'Further Practice 1', title:'Skill1/2_FP1_Intro', layout:'center',
  mascot:'lio_face2.png', mascotBig:true,
  message:[
    'Great job with the game, <b>Maya</b>!',
    'Now let\'s put your <b class="hl">Main Idea</b> skills to work — with a story about <b class="hl">Trips and Visits</b>!',
    "Let's go!",
  ],
  buttons:[{ html:"Let's go! \u25B6", style:'primary' }],
  introSeq:{
    image:'intro2.png',
    fadeIn:true,
    bubbles:[
      { side:'left',  text:'Great job with the game, <b class="nm">Maya</b>!' },
      { side:'right', text:'Now let\'s put your <b class="mi">Main Idea</b> skills to work — with a story about <b class="nm">Trips and Visits</b>! Let\'s go!' },
    ],
    cta:"Let's go!", ctaImg:'ui/btn_letsgo.png',
  },
  spec:['LIO(TTS) 대화 완료 후 \'Let\'s go!\' 버튼 생성','1) Skill name 언급',"2) 'Let's go! \u27A4' 클릭 → FP1_Main_Question 문제 풀이"],
},

/* 11 ─ FP1 Main Question */
{
  id:'fp1_mq', slide:15, section:'Further Practice 1', title:'FP1/2_Main_Question', layout:'reading',
  passage:true, listen:true,
  blocks:[
    { t:'lio', html:'Read the passage and answer the question.', tts:true, kr:true },
    { t:'lio', html:'If you want to listen, press the Listen button next to each paragraph.', tts:true, kr:true },
    { t:'q', html:MAIN_Q, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:CHOICES[0].html },
      { k:'B', html:CHOICES[1].html },
      { k:'C', html:CHOICES[2].html },
      { k:'D', html:CHOICES[3].html },
    ]},
  ],
  spec:['지문 영역: Listen(단락 읽기, 음성 중 Stop 전환) / Stop(일시정지)','단어: 하단 어휘 카드 팝업 · 예문 LLM 생성 · KR↔영어 전환','Main Question: KR 버튼 → 한국어 예문 생성','보기(4지 선다): KR 버튼 → 한국어 예문 생성'],
},

/* 12 ─ FP1 Main Question 정답경로 */
{
  id:'fp1_mq_correct', slide:16, section:'Further Practice 1', title:'FP1_Main_Question_정답경로', cut:'M06/M07 정답', layout:'reading',
  passage:true,
  blocks:[
    { t:'lio', html:'Read the passage and answer the question.', tts:true, kr:true },
    { t:'q', html:MAIN_Q, kr:true },
    { t:'choices', kr:true, instantGrade:true, items:[
      { k:'A', html:CHOICES[0].html, state:'correct' },
      { k:'B', html:CHOICES[1].html },
      { k:'C', html:CHOICES[2].html },
      { k:'D', html:CHOICES[3].html },
    ]},
    { t:'lio', html:"You did great! You found the main idea about the girl's discovery at the tide pools. Let's move on to the next step!", tts:true, kr:true },
    { t:'lio', html:"Nice work! Choose what you'd like to do next.", tts:true, kr:true },
    // Next : 다음 화면이 아니라 Pre-Retry(slide 37)로 점프한다 → engine 의 data-act 핸들러
    { t:'buttons', align:'end', items:[{ html:'Next ▶', style:'primary', act:'goPreRetry' }] },
  ],
  spec:['M06: Main Question 제시','M07: Main question 정답(A) 탭 → 🎉 전체 confetti + correct reaction + brief praise','정답 시 quiz_o / 오답 시 quiz_x LIO 스프라이트가 가운데 크게 떴다 사라진다 (Design B)',"Next 버튼 → Pre-Retry 화면으로 이동"],
},

/* 13 ─ FP1 Evidence Tap */
{
  id:'fp1_et', slide:17, section:'Further Practice 1', title:'FP1_Main_Question_정답경로', cut:'Evidence Tap 안내', layout:'reading',
  passage:true, etMode:true,   /* 사전 하이라이트 없음 · 문장 탭 시에만 하이라이트 */
  blocks:[
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
  ],
  spec:['ET 활동 안내(문제 제시)','4지 선다가 아닌 지문 영역에서 문장 클릭','문장에 커서 이동시 동시 하이라이트 효과'],
},

/* 14 ─ FP1 Evidence Tap 정답 */
{
  id:'fp1_et_correct', slide:18, section:'Further Practice 1', title:'FP1_Main_Question_정답경로', cut:'Evidence Tap 정답', layout:'reading',
  passage:true, hl:{ p1:'green', p2:'green', p5:'green', p14:'green', p15:'green', p16:'green' },
  blocks:[
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Great work! You found where Maya discovered tide pools. The evidence strongly supports the main idea about her exploration.', tts:true, kr:true },
    { t:'lio', html:"Great job working through that on your own! Here's the strategy you just used — save it for next time.", tts:true, kr:true },
    { t:'strategy' },
    // Next : slide 37 Pre-Retry 로 점프 (slide 16 과 같은 goPreRetry 핸들러)
    { t:'buttons', align:'end', items:[{ html:'Next ▶', style:'primary', act:'goPreRetry' }] },
  ],
  spec:['ET(Evidence Tap) 정답','M07b_Evidence: 정답 공개 + 다른 ET 정답도 하이라이트','strategy cue 제공',
        'STRATEGY 박스 밑 Next 버튼 → Pre-Retry(slide 37) 로 이동'],
},

/* 15 ─ FP1 ET 1차 오답 */
{
  id:'fp1_et_wrong1', slide:19, section:'Further Practice 1', title:'FP1_Main_Question_정답경로_ET_1차_오답', layout:'reading',
  // 기획서와 동일 : 붉은 오답 하이라이트를 유지한 채 지문에서 답을 다시 고를 수 있다.
  // 이미 1번 틀린 상태(etTries:1) — 결과에 따라 각 결과 화면으로 간다(FP2 slide 56 과 같은 방식).
  passage:true, listen:true, etMode:true, hl:{ p10:'red', p11:'red' },
  etAnswers:['p1', 'p2', 'p5', 'p14', 'p15', 'p16'], etTries:1,
  etGo:{ correct:'fp1_et_retry', wrong:'fp1_et_wrong2' },   // 1-4: 붉은 오답 유지 + 지문 재선택(탭 가능)
  blocks:[
    { t:'q', html:MAIN_Q, kr:true },                                     // 1-1: Main question 정답
    { t:'choices', kr:true, items:[
      { k:'A', html:CHOICES[0].html, state:'correct' },
      { k:'B', html:CHOICES[1].html },
      { k:'C', html:CHOICES[2].html },
      { k:'D', html:CHOICES[3].html },
    ]},
    { t:'lio', html:"You're ready to dive into Evidence Tap!", tts:true, kr:true },
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },   // 1-2
    { t:'lio', html:'Try looking where Maya visits and discovers new things. Try again. Tap the sentence that best supports the main idea.', tts:true, kr:true, retry:true },   // 1-3: 힌트 없음 + Retry 제안
  ],
  spec:['Main question 정답 → 🎉 confetti + reaction','ET 1차 오답: 지문 영역 커서 이동, 답 선택 1차 오답 결과 붉은 색 하이라이트 + reaction','LIO: 힌트 없음 + Retry 제안 멘트','붉은 색 오답 하이라이트 유지 + 지문 영역 답 재선택'],
},

/* 16 ─ FP1 ET 1차 오답 Retry 이후 정답 */
{
  id:'fp1_et_retry', slide:20, section:'Further Practice 1', title:'FP1_Main_Question_정답경로_ET_1차_오답_Retry_이후_정답', layout:'reading',
  passage:true, hl:{ p1:'green', p2:'green' },
  blocks:[
    { t:'lio', html:"You're ready to dive into Evidence Tap. Let's explore together!", tts:true, kr:true },
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:'Great work! You found where Maya discovered tide pools. The evidence strongly supports the main idea about her exploration.', tts:true, kr:true },
    { t:'lio', html:"Great job working through that on your own! Here's the strategy you just used — save it for next time.", tts:true, kr:true },
    { t:'strategy' },
    // Next : slide 37 Pre-Retry 로 점프 (slide 16·18 과 같은 goPreRetry 핸들러)
    { t:'buttons', align:'end', items:[{ html:'Next ▶', style:'primary', act:'goPreRetry' }] },
  ],
  spec:['ET(Evidence Tap) 정답 (Retry 이후)','M07b_Evidence: 정답 공개 + 다른 ET 정답도 하이라이트','strategy cue 제공',
        'STRATEGY 박스 밑 Next 버튼 → Pre-Retry(slide 37) 로 이동'],
},

/* 17 ─ FP1 ET 2차 오답 */
{
  id:'fp1_et_wrong2', slide:21, section:'Further Practice 1', title:'FP1_Main_Question_정답경로_ET_Retry_이후_2차_오답', layout:'reading',
  passage:true, hl:{ p1:'green', p2:'green', p5:'green' },
  blocks:[
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:'Try looking where Maya visits and discovers new things. Try again. Tap the sentence that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:'Not quite, but good try! The evidence is highlighted in the passage. It shows how Maya\'s visit helped her discover many wonders in the tide pools.', tts:true, kr:true },
    { t:'buttons', align:'end', items:[{ html:'Next ▶', style:'primary', reveal:true }] },   // 우측 끝 · 탭하면 전략 표출
    { t:'strategy', hidden:true },   // Next 누르기 전엔 숨김
    // 전략 박스 밑 Next : slide 37 Pre-Retry 로 점프. hidden 이라 전략과 함께 나타난다
    // (위 reveal 버튼이 .reveal-hidden 을 전부 걷어낸다)
    { t:'buttons', align:'end', hidden:true, items:[{ html:'Next ▶', style:'primary', act:'goPreRetry' }] },
  ],
  spec:['ET(Evidence Tap)_retry 이후 2차 오답','M07c_Evidence Reveal: 정답 공개 + 다른 ET 정답도 하이라이트 (붉은 하이라이트 없음)','Next 버튼 탭 → strategy cue 표출',
        'STRATEGY 박스 밑 Next 버튼 → Pre-Retry(slide 37) 로 이동'],
},

/* 18 ─ FP1 Main Question 오답 → Scaffolding intro */
{
  id:'fp1_mq_wrong', slide:22, section:'Further Practice 1', title:'FP1_Main_Question_오답경로', layout:'reading',
  passage:true, listen:true,   // 기획서와 달리: 좌 지문 / 우 내용 2단
  blocks:[
    { t:'lio', html:'Read the question and pick your answer.', tts:true, kr:true },
    { t:'q', html:MAIN_Q, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:CHOICES[0].html },
      { k:'B', html:CHOICES[1].html, state:'wrong' },
      { k:'C', html:CHOICES[2].html },
      { k:'D', html:CHOICES[3].html },
    ]},
    { t:'lio', html:"No worries, mistakes help us learn! Let's see why this answer might not fit.", tts:true, kr:true },
    { t:'lio', html:'Pick why this answer is wrong.', tts:true, kr:true },
    { t:'choices', variant:'reason', kr:true, items:[
      // 정답이므로 sel(파란 라인)이 아니라 correct — 다른 화면의 정답 공통 배경(연두)과 같게 한다.
      // sel 은 slide 29·42·43 처럼 '학생이 고른 메뉴 항목' 표시에 쓰는 상태다.
      { k:'A', html:'Not in the text', state:'correct' },
      { k:'B', html:'Opposite meaning to what the text says' },
      { k:'C', html:'Too specific or too general (only one detail, or too broad)', state:'wrong' },
      { k:'D', html:'Not what the question asks for' },
    ]},
    { t:'lio', html:"The correct reason is 'Too specific or too general'. The passage does not mention Maya learning to swim — it only talks about exploring.", tts:true, kr:true },
    // primary 로 통일 : orange 는 이 한 곳만 쓰던 예외였다. primary 는 A 에선 주황, B 에선 파랑이라
    // 두 디자인 모두 각자의 공통 Next 색이 된다.
    { t:'buttons', align:'end', items:[{ html:'Next ▶', style:'primary', reveal:true }] },   // 우측 · 탭하면 아래 표출
    { t:'lio', html:"Now we know why it didn't fit — let's practice and try again! What would you like to do first?", tts:true, kr:true, hidden:true },
    // go : 항목별 이동 화면. A·B 는 기존대로 Word Check, C 는 'Something else' 전용 화면으로.
    { t:'menu', hidden:true, kr:true, items:[
      { bImg:'skill_literary_genres.png', html:'Can I check some words?', go:'wordcheck_a' },
      { bImg:'skill_main_ideas.png',      html:'Let me practice the skill!', go:'wordcheck_a' },
      { bImg:'skill_drawing_conclusions.png', html:'Something else', go:'fp1_something_else' },
    ]},
  ],
  spec:['M08 Main question 오답: 선택 오답 선지 붉은 색 전환 + incorrect reaction','SA: 선택 선지가 오답인 이유 질문 + 보기 4지 선다 제시','M09 Scaffolding_intro: SA 선지별 3개 옵션 제시 (단어확인 / 스킬연습 / 기타)'],
},
/* 18b ─ FP1 Main Question 오답경로 · Scaffolding_1 에서 'Something else' 선택
   (기획서 PAGE 22 Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_1_C_Something_else_선택)
   3가지 옵션 버튼 → 문장이 입력창에 자동 완성 → Send → 옵션별 LIO 멘트.
   옵션에 따른 별도 활동은 없고, 어느 것을 골라도 Word Check 로 들어간다. */
{
  id:'fp1_something_else', slide:23, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_1_C_Something_else_선택',
  cut:'Something else 선택', layout:'reading',
  passage:true,
  blocks:[
    // 앞 화면(slide 22)의 끝 맥락을 이어 보여준다 — 기획서도 같은 화면을 다시 싣는다
    { t:'choices', variant:'reason', kr:true, items:[
      { k:'C', html:'Too specific or too general (only one detail, or too broad)', state:'wrong' },
      { k:'D', html:'Not what the question asks for' },
    ]},
    { t:'lio', html:"You got it right! The passage doesn't say Maya learned to swim. It talks about exploring tide pools. Remember, not all details fit.", tts:true, kr:true },
    { t:'lio', html:"Now we know why it didn't fit — let's practice and try again! What would you like to do first?", tts:true, kr:true },
    { t:'menu', kr:true, items:[
      { bImg:'skill_literary_genres.png', html:'Can I check some words?' },
      { bImg:'skill_main_ideas.png',      html:'Let me practice the skill!' },
      { bImg:'skill_drawing_conclusions.png', html:'Something else', state:'sel' },
    ]},
    // 기획서 순서 : 입력폼이 위, 옵션 버튼이 아래.
    // mic:true 를 쓰는 이유 — send:true 는 freechat 전용 버튼(data-fc-send)을 렌더해서
    // 일반 Send 핸들러가 제외한다. mic:true 는 Send + 마이크 쌍을 렌더하고 핸들러에 걸린다.
    { t:'input', placeholder:'Pick one below, or type your own…', mic:true },
    // act:'pick' → 문장이 입력창에 자동 완성된다. Send 를 눌러야 그 옵션의 답만 표출된다.
    { t:'buttons', nowrap:true, align:'start', items:[
      // 세 개는 나란한 선택지라 색을 공통(primary)으로 둔다 — 기획서도 같은 스타일이다
      { html:'💡 Give me a hint', style:'primary', act:'pick', pick:'hint',    fill:'I want a hint for the question' },
      { html:'📖 Read again',     style:'primary', act:'pick', pick:'read',    fill:'I want to read the passage again' },
      { html:'🤔 Not sure',       style:'primary', act:'pick', pick:'notsure', fill:'I am not sure what to do' },
    ]},
    { t:'user', html:'I want a hint for the question', hidden:true, interest:'hint' },
    { t:'lio', html:"I see, you're looking for a hint. Let's first check some key words, and then we can explore the question together.", tts:true, kr:true, hidden:true, interest:'hint' },
    { t:'user', html:'I want to read the passage again', hidden:true, interest:'read' },
    { t:'lio', html:"That's a great idea! Let's look at some key words together first. It'll help your understanding when you read again.", tts:true, kr:true, hidden:true, interest:'read' },
    { t:'user', html:'I am not sure what to do', hidden:true, interest:'notsure' },
    { t:'lio', html:"I understand! Let's look at some key words first together to help.", tts:true, kr:true, hidden:true, interest:'notsure' },
    // 어느 옵션이든 Word Check 진입 (기획서: 옵션별 활동 없음 · 모든 옵션 후 Word Check = 다음 화면)
    { t:'label', html:'Word Check', hidden:true, interest:'next' },
    { t:'lio', html:"Let's check some words.", tts:true, kr:true, hidden:true, interest:'next' },
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary' }] },
  ],
  spec:["'C. Something else' 선택 시 3가지 옵션 제공 : Give me a hint / Read again / Not sure",
        "각 버튼 클릭 시 문장으로 자동 완성 후 'Send' 클릭",
        '옵션별 LIO 멘트 (hint / read again / not sure)',
        "옵션에 따른 별도 활동은 없음 — 모든 옵션 선택 후 'Word Check' 진입, 이후 'Word Peek' 진행"],
},

/* 19 ─ Scaffolding Word Check (A · 정답) */
{
  id:'wordcheck_a', slide:24, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_1_A/B/C_선택_필수_활동_word check_정답', layout:'reading',
  passage:true, focusWord:'tough',   // 지문에서 해당 단어만 포커스
  blocks:[
    { t:'lio', html:"Let's warm up with a couple of key words!", tts:true, kr:true },
    // 기획서: 옵션 선택 후 'Let's check!' 버튼 생성 → 누르면 단어 테스트 진입.
    // act:'wordFly' → 지문의 단어가 오른쪽 chip 으로 날아와 박히고, 아래 내용이 열린다.
    { t:'buttons', align:'end', items:[{ html:"Let's check! ▶", style:'primary', act:'wordFly' }] },
    { t:'label', html:'Word Check', afterFly:true },
    { t:'lio', html:"Let's check the words.", tts:true, kr:true, afterFly:true },
    { t:'chip', html:'tough' },
    { t:'lio', html:"What does 'tough' mean?", tts:true, kr:true, afterFly:true },   // 단어 박힌 뒤 표출
    // 기획서: 전레벨 2지 선다 고정
    { t:'emoji', kr:true, reveal:true, afterFly:true, items:[   // 답 선택 시 아래 피드백·Next 표출
      { emoji:'💪', html:'strong and hard', state:'correct' },
      { emoji:'😢', html:'sad and upset' },
    ]},
    { t:'lio', html:"'Tough' means strong and hard, like the rocks at the tide pools!", tts:true, kr:true, hidden:true },
    // 기획서: 2개 모두 정답 → Teach(Word Peek) 진입. 바로 다음 화면(slide 25 = word check
    // 오답)이 아니라 slide 26 wordpeek 으로 보내야 한다.
    { t:'buttons', align:'end', hidden:true, items:[{ html:'Next ▶', style:'primary', go:'wordpeek' }] },
  ],
  spec:["3가지 옵션 중 A·B 선택 시 'Let's check!' 버튼 생성 → Word Check(단어 테스트) 필수 진입",
        "C(Something else) 는 마지막 학습으로 Word Check 필수 진입",
        '문제 제시 동시에 지문 영역 내 해당 단어 하이라이트',
        '테스트 문항 2가지(key words 중 랜덤 2개) 고정 · 전레벨 2지 선다 고정',
        "문제 답 선택 후 'Next' 버튼 생성",
        '본 화면은 2개 모두 정답 → 학습 마무리 reaction 🎉 confetti → Teach(Word Peek) 진입'],
},

/* 20 ─ Scaffolding Word Check 오답 (기획서 PAGE 24)
   문제가 둘이다 : spotted → Next → explore. 각 문제는 2지 선다(기획서: 전레벨 고정).
   결과는 '1개만 정답' → 실패 멘트 (1/2) → Teach(Word Peek) → Game.
   ※ 지문에서 단어가 날아와 chip 에 박히는 연출(focusWord)은 첫 문제에만 걸린다 —
     engine 의 runWordFocusFly 가 .kw-focus/.wordchip 을 하나씩만 잡는다. 두 번째 단어는
     Next 와 함께 chip 이 그대로 나타난다. */
{
  id:'wordcheck_b', slide:25, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_1_A/B/C_선택_필수_활동_word check_오답',
  layout:'reading',
  passage:true, focusWord:'spotted',   // 지문에서 해당 단어만 포커스
  blocks:[
    // ── 문제 1 : spotted (오답 → 바로 정답 제시)
    { t:'chip', html:'spotted' },
    { t:'lio', html:'What does "spotted" mean?', tts:true, kr:true, afterFly:true },
    { t:'emoji', kr:true, reveal:true, afterFly:true, items:[
      { emoji:'👀', html:'Saw or noticed.', state:'correct' },
      { emoji:'✏️', html:'Painted or colored.' },
    ]},
    { t:'lio', html:'X does not mean that. "Spotted" means saw or noticed.', tts:true, kr:true, hidden:true },
    { t:'buttons', align:'end', hidden:true, items:[{ html:'Next ▶', style:'primary', reveal:true }] },
    // ── 문제 2 : explore (Next 로 표출)
    { t:'chip', html:'explore', stage2:true },
    { t:'lio', html:"What does 'explore' mean?", tts:true, kr:true, stage2:true },
    { t:'emoji', kr:true, reveal:true, stage2:true, items:[
      { emoji:'🧭', html:'to look around', state:'correct' },
      { emoji:'☀️', html:'to shine' },
    ]},
    // ── 두 문제 결과 : 1개만 정답 → 단어 테스트 실패 언급
    { t:'lio', html:"It looks like some words need a little more practice — let's do some word learning together! (1/2)", tts:true, kr:true, hidden:true },
    { t:'lio', html:"Next, we'll peek at the key words together — then play a quick game!", tts:true, kr:true, hidden:true },
    { t:'buttons', align:'end', hidden:true, items:[{ html:'Next ▶', style:'primary' }] },
  ],
  spec:['문제 제시 동시에 지문 영역 내 해당 단어 하이라이트',
        '학생 단어 카드 탭 — 오답의 경우 바로 정답 제시',
        "문제 답 선택 후 'Next' 버튼 생성 → 두 번째 단어 문제",
        '본 화면은 1개만 정답 또는 모두 오답 → "단어 테스트 실패" 언급',
        'Teach(Word Peek) 이후 Game 활동 진입',
        ],
},

/* 21 ─ Word Peek / Teach (PPTX 21) */
{
  id:'wordpeek', slide:26, section:'Further Practice 1', title:'FP1_Main_Question_오답경로_word check_이후_Teach(공통)', layout:'teach',
  passage:true,
  lioLine:"Here are the key words. Tap any card — I'll read the word and show what it means. 🔊",
  // 완료 시 말풍선은 두지 않는다 — 카드 6개가 모두 완료 색으로 바뀌고 'Next' 가 나오는 것으로
  // 충분하다. (탭 안내는 없어진 'Tap a word!' 버튼을 가리켰고, 지문 단어 탭은 별도 화면
  // Explore Words(slide 29)가 담당한다.) doneLio 를 아예 두지 않으면 engine 이 빈 배열로 다룬다.
  // 기획서 3: 마지막 단어 카드 완료 후 'Next' 버튼 하나. 다른 화면의 Next 와 같은 primary 색.
  // 'Tap a word!' 는 뺐다 — 기획서 완료 상태에 없고, 엔진 핸들러가 자기 버튼줄을
  // scrollIntoView 하는 것뿐이어서 실제로 아무 동작도 하지 않았다. 지문 단어를 더 탭해 보는
  // 활동은 별도 화면인 Explore Words(slide 29)가 담당한다.
  buttons:[{ html:'Next ▶', style:'primary', advance:true }],
  spec:['Teach_Word Peek(Peek & Pop)','key word 카드 6개 모두 탭 후 다음 활동 진행 · 카드 커서 이동 시 색상 전환','탭 즉시 지문 영역 단어 하이라이트 · 학습 완료된 카드 색상 전환','단어 설명 카드(이미지 포함) · 예문은 본문 원문에서 발췌','"Not sure" 클릭: 재설명 실시간 LLM 생성 / "Got it" 이후 남은 카드 탭 이어서','마지막 단어 카드 완료 후 \'Next\' 버튼 → Word Check 만점이면 Explore Words, 1개 이상 오답이면 Game'],
},

/* 22 ─ Teach 이후 Game : Memory Match (PPTX 22) */
{
  id:'teach_game', slide:27, section:'Further Practice 1', title:'FP1_Main_Question_오답경로_word check_Teach_이후_Game', cut:'Memory Match', layout:'memory',
  passage:true,
  lioLine:"Nice! You've met all the words. Which game do you want to play? 🔊",
  spec:['Memory Match','Hint 기회 3번 제공','5초 동안 단어·의미 기억 → 이후 카드 뒷면 뒤집기','단어와 의미가 맞는 경우 카드 색상 전환(성공), 아니면 다시 뒷면','짝 맞추기 6쌍 완료 → 다음 활동','Definition Detective 선택 시 해당 게임으로 전환'],
},

/* 23 ─ Teach 이후 Game : Definition Detective (PPTX 23) */
{
  id:'teach_detective', slide:28, section:'Further Practice 1', title:'FP1_Main_Question_오답경로_word check_Teach_이후_Game', cut:'Definition Detective', layout:'detective',
  passage:true,
  lioLine:"Nice! You've met all the words. Which game do you want to play? 🔊",
  spec:['Definition Detective','의미와 매칭되는 단어 2개 카드 중 택1','애니메이션 효과: 카드 움직임','오답의 경우: 붉은색 하이라이트 + Retry 제시','정답의 경우: 🎉 confetti + correct reaction + brief praise','6개 clue 완료 → 다음 활동(Explore Words)'],
},

/* 24 ─ Teach/Game 이후 Explore Words (PPTX 24) */
{
  id:'explore_words', slide:29, section:'Further Practice 1', title:'FP1_Main_Question_오답경로_word check_Teach/Game_이후_Explore_Words', layout:'explore',
  passage:true,
  lioLine:'Before we go — want to know any other words? Tap any word in the passage to see its meaning. The pink words are our key words. 🔊',
  spec:['Explore Words_지문영역','박스 도형(key words) 이외 단어 학습 활동','탭 가능한 단어(점선 표시)만 클릭 가능 · 지문 영역 단어 클릭 시 하이라이트','학습 활동 표출: LIO가 클릭한 단어 표시 및 영영뜻 제시','단어 학습 제한 없음','Skill Practice 진입'],
},

/* 25 ─ Entry Method (3택1) */
{
  id:'entry_method', slide:30, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_2_Entry Method_A_Let’s read and check what I understand!', layout:'reading',
  passage:true,
  blocks:[
    { t:'lio', html:"Let's practice the skill! How would you like to start?", tts:true, kr:true },
    // 이 화면은 A 를 고른 상태(PAGE 29). B·C 를 누르면 각각의 '선택된 상태' 화면으로 보낸다.
    { t:'menu', items:[
      { bImg:'skill_recalling_facts_1.png', html:"Let's read and check what I understood!", state:'sel' },
      { bImg:'skill_main_ideas.png', html:'Let me practice the skill!', go:'entry_b' },
      { bImg:'skill_literary_genres.png', html:'Explain the story to me!', go:'entry_c' },
    ]},
    { t:'lio', html:"Great! Let's read each paragraph together.", tts:true, kr:true },
    { t:'buttons', items:[{ html:"Let's read! ▶", style:'primary' }] },
  ],
  spec:['Entry Method 3개 옵션: A.읽고 확인 / B.스킬 인트로 / C.이야기 설명','"Let\'s read!" 클릭 → 4단락 읽고 문제 풀이 활동 반복'],
},

/* 26 ─ Walk (Let's read & check) */
{
  id:'walk_read', slide:31, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_2_Entry Method_A_Let’s read and check what I understand!', layout:'reading',
  passage:true, walkPara:true,   /* 단락 진행에 맞춰 지문 하이라이트 이동 */ listen:true,
  blocks:[
    { t:'lio', html:'Let\'s read paragraph 1! Use the listen button in the passage.', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Next ▶', style:'primary' }] },
    { t:'label', html:'Paragraph 1', para:1 },
    { t:'lio', html:'Where did Maya explore?', tts:true, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:'The rocky shore', state:'correct' },
      { k:'B', html:'The sandy beach' },
    ]},
    { t:'lio', html:'Yes! Great job! 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Next ▶', style:'primary' }] },
    { t:'lio', html:'Let\'s read paragraph 2! Listen, then answer.', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Next ▶', style:'primary' }] },
    { t:'label', html:'Paragraph 2', para:2 },
    { t:'lio', html:'What did Maya spot in the pools?', tts:true, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:'A sea star', state:'correct' },
      { k:'B', html:'A dolphin' },
    ]},
    { t:'lio', html:'Right! She spotted a sea star. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Next ▶', style:'primary' }] },
    { t:'lio', html:'Paragraph 3 is next. Listen carefully!', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Next ▶', style:'primary' }] },
    { t:'label', html:'Paragraph 3', para:3 },
    { t:'lio', html:'Why are tide pool animals tough?', tts:true, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:'They survive two different worlds', state:'correct' },
      { k:'B', html:'They never leave the water' },
    ]},
    { t:'lio', html:'Yes — two worlds make them tough! 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Next ▶', style:'primary' }] },
    { t:'lio', html:'Last paragraph! Listen, then check.', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Next ▶', style:'primary' }] },
    { t:'label', html:'Paragraph 4', para:4 },
    { t:'lio', html:'How did Maya feel when she left?', tts:true, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:'Amazed by her discovery', state:'correct' },
      { k:'B', html:'Bored and tired' },
    ]},
    { t:'lio', html:'Perfect! She left amazed. 🔊', tts:true, kr:true },
    { t:'lio', html:'Great reading! You know all 4 paragraphs. 🔊', tts:true, kr:true },
    { t:'lio', html:"Now, you're going to practice the Main Idea skill. This skill is about finding the ONE big idea that covers the WHOLE passage — not just one paragraph! 🔊", tts:true, kr:true },
    { t:'buttons', items:[{ html:'Start Skill Practice! ▶', style:'green' }] },
  ],
  spec:['단락 타이틀(Paragraph N)은 그 단락의 질문 바로 위에 둔다','화면 전환 시 지문 영역 하이라이트 유지','Listen 버튼 클릭 → 해당 단락 음성 발화','Next 버튼: Paragraph 1~4 + 각 문제 제시(2지선다), retry/ET 없음','4단락 반복 후 정답 개수 상관없이 Scaffolding 진입'],
},
/* 26b ─ Entry Method C 선택 (기획서 v1.2 PAGE 31)
   메뉴에서 'Explain the story to me!' 를 고른 상태. 'Let's go!' → 문단 요약 읽기(다음 화면).
   구조는 slide 30(A 선택)과 동일하다. */
{
  id:'entry_c', slide:32, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_2_Entry Method_C_Explain the story to me!',
  cut:'C 선택', layout:'reading',
  passage:true,
  blocks:[
    { t:'lio', html:"Let's practice the skill! How would you like to start?", tts:true, kr:true },
    { t:'menu', items:[
      { bImg:'skill_recalling_facts_1.png', html:"Let's read and check what I understood!", go:'walk_read' },
      { bImg:'skill_main_ideas.png', html:'Let me practice the skill!', go:'entry_b' },
      { bImg:'skill_literary_genres.png', html:'Explain the story to me!', state:'sel' },
    ]},
    { t:'lio', html:'Sure! Let me give you a quick summary of each paragraph.', tts:true, kr:true },
    { t:'buttons', items:[{ html:"Let's go! ▶", style:'primary' }] },
  ],
  spec:['Entry Method 3개 옵션 중 C 를 고른 상태',
        "'Let's go!' 클릭 → 지문의 각 문단 요약문 읽기"],
},

/* 27 ─ Walk (Explain the story) */
{
  id:'walk_explain', slide:33, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_2_Entry Method_C_Explain the story to me!', layout:'reading',
  passage:true, walkPara:true,   /* 단락 진행에 맞춰 지문 하이라이트 이동 */ listen:true,
  blocks:[
    { t:'label', html:'Paragraph 1', para:1 },
    { t:'lio', html:'Maya went to the ocean that summer. Her class explored the tide pools together. Tide pools are small water pools left by the ocean. Maya saw them for the first time. They walked on the rocky shore. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Got it! 👍', style:'primary' },{ html:'More simply 🔁', style:'navy' }] },
    { t:'lio', html:'Maya saw little ocean pools for the first time. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Okay! ✅', style:'primary' }] },
    { t:'label', html:'Paragraph 2', para:2 },
    { t:'lio', html:'The pools were full of living things. Maya spotted a bright orange sea star, a hermit crab with a borrowed shell, and small fish hiding between rocks. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Got it! 👍', style:'primary' },{ html:'More simply 🔁', style:'navy' }] },
    { t:'lio', html:'Maya found a sea star, a hermit crab, and small fish. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Okay! ✅', style:'primary' }] },
    { t:'label', html:'Paragraph 3', para:3 },
    { t:'lio', html:"Maya's teacher explained that tide pool animals must survive two worlds — cold ocean water when the tide is in, and warm sun when the tide is out. That makes them very tough. 🔊", tts:true, kr:true },
    { t:'buttons', items:[{ html:'Got it! 👍', style:'primary' },{ html:'More simply 🔁', style:'navy' }] },
    { t:'lio', html:'Tide pool animals are tough because they live in two worlds. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Okay! ✅', style:'primary' }] },
    { t:'label', html:'Paragraph 4', para:4 },
    { t:'lio', html:'Maya wrote everything she observed in her notebook. She learned that even a small pool can hold many living things, and she left feeling amazed. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Got it! 👍', style:'primary' },{ html:'More simply 🔁', style:'navy' }] },
    { t:'lio', html:'Maya wrote what she saw and left amazed. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Okay! ✅', style:'primary' }] },
    { t:'lio', html:'Great reading! You know all 4 paragraphs. 🔊', tts:true, kr:true },
    { t:'buttons', items:[{ html:'Start Skill Practice! ▶', style:'green' }] },
  ],
  spec:['"More simply" 탭 → 문단 한 줄 요약','"Okay" 탭 → 다음 문단 이동','버튼 2개: [Got it!] / [More simply] 탭 시 다음 문단 하이라이트','4단락 반복 후 정답 개수 상관없이 Scaffolding 진입'],
},
/* 27b ─ Entry Method B 선택 (기획서 v1.2 PAGE 33)
   메뉴에서 'Let me practice the skill!' 를 고른 상태.
   'Let's go!' → Scaffolding 3 Skill Practice Intro(다음 화면 = interest).
   ⚠ LIO 답변 문구는 기획서 목업이 이미지라 추출할 수 없어 초안이다. */
{
  id:'entry_b', slide:34, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_2_Entry Method_B_Let me practice the skill!',
  cut:'B 선택', layout:'reading',
  passage:true,
  blocks:[
    { t:'lio', html:"Let's practice the skill! How would you like to start?", tts:true, kr:true },
    { t:'menu', items:[
      { bImg:'skill_recalling_facts_1.png', html:"Let's read and check what I understood!", go:'walk_read' },
      { bImg:'skill_main_ideas.png', html:'Let me practice the skill!', state:'sel' },
      { bImg:'skill_literary_genres.png', html:'Explain the story to me!', go:'entry_c' },
    ]},
    { t:'lio', html:"Great choice! Let's go straight to the skill practice.", tts:true, kr:true },
    { t:'buttons', items:[{ html:"Let's go! ▶", style:'primary' }] },
  ],
  spec:['Entry Method 3개 옵션 중 B 를 고른 상태',
        "'Let's go!' 클릭 → Scaffolding 3 (Skill Practice) Intro 진입",
        '※ LIO 답변 문구는 기획서 목업이 이미지라 초안이다 — 검토 필요'],
},

/* 28 ─ Interest Probe (Small Talk) */
{
  id:'interest', slide:35, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_2_Entry_Method_B/Scaffolding_3_Skill_Practice_Intro', layout:'reading',
  passage:true,
  blocks:[
    { t:'lio', html:'This passage is about exploring tide pools. Do you like exploring new places?', tts:true, kr:true },
    { t:'buttons', nowrap:true, items:[
      { html:'Yes, I do! 🌊', style:'primary', act:'interestYes' },
      { html:'Not really… 😊', style:'navy', act:'interestNo' },
      { html:'I want to tell you more! ✏️', style:'green', act:'yes', toast:'Type anything you want to share — English or Korean!' },
    ]},
    { t:'input', placeholder:'Tell me more…', mic:true, hidden:true },   /* Send + 마이크 */
    { t:'user', html:'Yes, I do!', hidden:true, interest:'yes' },
    { t:'lio', html:'Exploring places is exciting and fun! Keep being curious about the world. 🔊', tts:true, kr:true, hidden:true, interest:'yes' },
    { t:'user', html:'Not really…', hidden:true, interest:'no' },
    { t:'lio', html:"That's okay! New places can feel big. We'll explore this story together. 🔊", tts:true, kr:true, hidden:true, interest:'no' },
    { t:'user', html:'I love beaches!', hidden:true, interest:'more' },
    { t:'lio', html:'Thanks for sharing! Beaches and tide pools are full of wonders. 🔊', tts:true, kr:true, hidden:true, interest:'more' },
    { t:'lio', html:"Okay! Let's start the skill practice! 🔊", tts:true, kr:true, hidden:true, interest:'next' },
    { t:'buttons', hidden:true, interest:'next', items:[{ html:'Start Skill Practice! ▶', style:'green' }] },
  ],
  spec:['STG — PI(Interest Probe): Small Talk Generator (Step2에서는 "흥미" 기반 대화)',"'Yes I do!' → Scaffolding 진입","'Not really' → Scaffolding 진입","'I want to tell you more!' → 타이핑 입력 자유 대화(LLM) → Scaffolding 진입"],
},

/* 29 ─ Skill Practice S1 (Question Type) */
{
  id:'skill_s1', slide:36, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Skill_Practice_단일_정답', layout:'reading',
  passage:true, hl:{ p2:'green', p5:'green', p14:'green', p15:'green' },
  blocks:[
    // S1 은 전 스킬 공통 2지선다(기획서 PAGE 35). 답을 고르면 결과에 따라 멘트가 갈린다.
    { t:'label', html:'S1 — Question Type' },
    { t:'lio', html:'Look at this question: What is "A Day at the Tide Pools" mostly about?', tts:true, kr:true },
    { t:'lio', html:'What does it ask for?', tts:true, kr:true },
    { t:'choices', kr:true, instantGrade:true, items:[
      { k:'A', html:'the main idea', state:'correct' },
      { k:'B', html:'one specific fact' },
    ]},
    { t:'lio', html:'Great job identifying the main idea! Mostly about means it covers the whole passage.', tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:'Try again. Correct answer: A - the main idea. It asks for the idea covering all parts of the passage.', tts:true, kr:true, hidden:true, interest:'wrong' },
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary', reveal:true }] },
    // S3 도 같은 방식. 오답 멘트는 S1 과 같은 형태로 맞춘 초안이다.
    { t:'label', html:'S3 — Whole Pattern', hidden:true },
    { t:'lio', html:'Look at the WHOLE passage. Which pattern best fits all paragraphs together?', tts:true, kr:true, hidden:true },
    { t:'choices', kr:true, instantGrade:true, hidden:true, items:[
      { k:'A', html:'Maya explores tide pools and discovers many living things', state:'correct' },
      { k:'B', html:'Maya learns to swim with her class' },
    ]},
    { t:'lio', html:'Yes! The whole passage is about Maya exploring and discovering tide-pool life — not just one detail.', tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:'Try again. Correct answer: A - Maya explores tide pools and discovers many living things. It covers every paragraph.', tts:true, kr:true, hidden:true, interest:'wrong' },
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary' }] },
  ],
  spec:["Skill_Practice_단일_정답_화면 · Skill 마다 S(Step)의 명칭/정답 개수는 다름",
        "2지 선다 (S1 은 전 스킬 공통)",
        "답 선택 즉시 채점 — 정답/오답에 따라 LIO 멘트가 갈린다",
        "정답: 🎉 confetti + correct reaction + brief praise",
        "오답: 정답 제시 + Retry 없음",
        "'Next' 버튼 클릭 후 다음 STEP 학습 활동 진행",
        "S 구성(v1.2 공통 정의): S1 Question Type(전 스킬 공통·2지선다) / S2 Gather Clues(스킬별 가변) / S3 Analyze·Locate / S4 Evidence Tap 또는 Confirm"],
},

/* 30 ─ Skill Practice S2 (Key Details · 복수선택) */
{
  id:'skill_s2', slide:37, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Skill_Practice_복수_정답', layout:'reading',
  passage:true,
  blocks:[
    { t:'label', html:'S2 — Key Details' },
    { t:'lio', html:'Select three key details about what Maya did and discovered.', tts:true, kr:true },
    { t:'lio', html:'Select 3 details that show what Maya did.', tts:true, kr:true },
    { t:'choices', variant:'multi', grade:true, kr:true, items:[
      { k:'A', html:'Maya and her class visited the tide pools for exploration.', state:'correct' },
      { k:'B', html:'The pools were full of living things.', state:'correct' },
      { k:'C', html:'She learned even small pools have many living things.', state:'correct' },
      { k:'D', html:'Maya learned how to swim in the tide pools.', state:'wrong' },
    ]},
    { t:'buttons', items:[{ html:'Check ✓', style:'primary', check:true }] },
    // 기획서: 정답/오답에 따라 멘트가 갈린다
    { t:'lio', html:'Great choice! You identified how Maya explored the tide pools, what she observed, and her learning about the living things.', tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:'Almost there! Remember, Maya did not learn swimming. Correct details: explored tide pools, living things in pools, learned even small pools have many creatures.', tts:true, kr:true, hidden:true, interest:'wrong' },
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary' }] },
  ],
  spec:["Skill_Practice_복수_정답_화면 · Skill 마다 S(Step)의 명칭/정답 개수는 다름",
        "지문 영역 key word 클릭 → 단어 뜻+예문 표출 동시 TTS",
        "'Pick two clues' 지시문에 따라 학생 중복 답안 선택",
        "학생 답안 선택 후 'check' 클릭",
        "정답: 🎉 confetti + correct reaction + brief praise",
        "오답: 정답 제시 + Retry 없음",
        "'Next' 버튼 클릭 후 다음 STEP 학습 활동 진행"],
},
/* 30b ─ Skill Practice S(Step)내 분리형 · 단일 정답 (기획서 v1.2 PAGE 38)
   S2 는 스킬별로 S2-1 / S2-2 로 나뉘어 순차 진행된다(v1.2 공통 정의).
   Determining Main Ideas 의 S2 는 'Main Topic + Key Events' 이므로
   S2-1 = Main Topic(단일 정답) · S2-2 = Key Events(복수 정답) 로 나눴다.
   ⚠ 기획서 목업이 이미지라 화면 문구를 추출할 수 없었다 — 아래 문구는 초안이다. */
{
  id:'skill_s2_split1', slide:38, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Skill_Practice_S(Step)내_분리형_화면_단일_정답',
  cut:'S2-1 Main Topic', layout:'reading',
  passage:true, hl:{ p1:'green', p2:'green' },
  blocks:[
    { t:'label', html:'S2-1 — Main Topic / Character' },
    { t:'lio', html:'Let us find the main topic. Who or what was this passage mainly about?', tts:true, kr:true },
    { t:'lio', html:'Choose the best answer.', tts:true, kr:true },
    { t:'choices', kr:true, instantGrade:true, items:[
      { k:'A', html:'Maya', state:'correct' },
      { k:'B', html:'the teacher' },
      { k:'C', html:'the tide pools' },
      { k:'D', html:'a hermit crab' },
    ]},
    { t:'lio', html:'Great choice! Maya appears in every paragraph, showing the whole story follows her experience.', tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:"That's a good try, but remember, the correct answer is Maya because she appears in every paragraph.", tts:true, kr:true, hidden:true, interest:'wrong' },
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary' }] },
  ],
  spec:['Skill_Practice_S(Step)내_분리형_화면 · Skill 마다 S(Step)의 명칭/정답 개수는 다름',
        'S(Step)1-1, S(Step)-2 로 분기되는 경우 순차적 진행 — 본 화면은 단일 정답인 경우',
        '정답: 🎉 confetti + correct reaction + brief praise',
        '오답: 정답 제시 + Retry 없음',
        "'Next' 버튼 클릭 후 다음 STEP 학습 활동 진행",
        '문구는 기획서 화면(PAGE 38/39) 원문'],
},

/* 30c ─ Skill Practice S(Step)내 분리형 · 복수 정답 (기획서 v1.2 PAGE 39)
   위 S2-1 에 이어지는 S2-2. 복수 정답이라 'Check' 로 채점한다(skill_s2 와 같은 방식).
   ⚠ 문구는 초안이다. */
{
  id:'skill_s2_split2', slide:39, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Skill_Practice_S(Step)내_분리형_화면_복수_정답',
  cut:'S2-2 Key Events', layout:'reading',
  passage:true,
  blocks:[
    { t:'label', html:'S2-2 — Key Details' },
    { t:'lio', html:'Select three key details about what Maya did and discovered.', tts:true, kr:true },
    { t:'lio', html:'Select 3 details that show what Maya did.', tts:true, kr:true },
    { t:'choices', variant:'multi', grade:true, kr:true, items:[
      { k:'A', html:'Maya and her class visited the tide pools for exploration.', state:'correct' },
      { k:'B', html:'The pools were full of living things.', state:'correct' },
      { k:'C', html:'She learned even small pools have many living things.', state:'correct' },
      { k:'D', html:'Maya learned how to swim in the tide pools.' },
    ]},
    { t:'buttons', items:[{ html:'Check ✓', style:'primary', check:true }] },
    { t:'lio', html:'Great choice! You identified how Maya explored the tide pools, what she observed, and her learning about the living things.', tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:'Almost there! Remember, Maya did not learn swimming. Correct details: explored tide pools, living things in pools, learned even small pools have many creatures.', tts:true, kr:true, hidden:true, interest:'wrong' },
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary' }] },
  ],
  spec:['Skill_Practice_S(Step)내_분리형_화면 · Skill 마다 S(Step)의 명칭/정답 개수는 다름',
        'S(Step)1-1, S(Step)-2 로 분기되는 경우 순차적 진행 — 본 화면은 복수 정답인 경우',
        "학생 답안 선택 후 'Check' 클릭",
        '정답: 🎉 confetti + correct reaction + brief praise',
        '오답: 정답 제시 + Retry 없음',
        "'Next' 버튼 클릭 후 다음 STEP 학습 활동 진행",
        '문구는 기획서 화면(PAGE 38/39) 원문'],
},

/* 31 ─ Skill Practice S4 (Find the Evidence) */
{
  id:'skill_s4', slide:40, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Skill_Practice(S4_활동1)', layout:'reading',
  // 문장을 탭해 채점한다. 근거 문장은 slide 18 과 같다(정답 공개 시 초록으로 표시된다).
  passage:true, etMode:true, etAnswers:['p1', 'p2', 'p5', 'p14', 'p15', 'p16'],   /* 사전 하이라이트 없음 · 문장을 탭해야 하이라이트 */
  blocks:[
    { t:'label', html:'S4 — Find the Evidence' },
    { t:'lio', html:'Tap one of the evidence sentences that answers the question.', tts:true, kr:true },
    // 결과별 멘트 — 1차 오답 / 정답 / 2차 오답(정답 공개)
    { t:'lio', html:'That sentence is a detail — look for a sentence that connects directly to what Maya saw or learned overall.', tts:true, kr:true, hidden:true, interest:'wrong' },
    { t:'lio', html:"Yes! That's one of the evidence sentences! It directly supports the main idea — Maya's discovery of tide pools.", tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:'Here are the evidence sentences highlighted in green! Each one shows what Maya discovered or learned.', tts:true, kr:true, hidden:true, interest:'reveal' },
    // 기획서: 'Next' → Passage_Clarify(P43). 다음 화면(41 Confirm)은 다른 스킬의 S4 활동2다.
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary', go:'clarify' }] },
  ],
  spec:["S4 — ET(Evidence Tap) 활동 · 해당 skill 8개(Recalling Facts 3종, Drawing Conclusions, Making Inferences, Cause/Effect, Main Idea, Analyzing Characters)",
        "학생 답안 선택: ET 직접 탭",
        "정답 선택 시 정답 공개: 지문 영역 내 하이라이트 + 'Next' 버튼 생성",
        "오답 선택 시 retry 있음 — 처음 선택한 오답 문장은 붉은색 하이라이트 후 사라짐, 2회 오답이면 정답 공개 + 'Next' 버튼 생성",
        "두 정오답 경로 모두 정답 공개 시 근거 문장 하이라이트",
        "'Next' 클릭 → Passage_Clarify 활동 진행"],
},
/* 31b ─ Skill Practice S4 활동2 · Confirm (기획서 v1.2 PAGE 41)
   ET 와 달리 정오답이 없다 — 학생이 고른 문장에 대한 '설명만' 제시한다.
   해당 스킬은 Identifying Literary Genres · Inferring Author's Purpose 2개이며,
   기획서 목업의 스킬도 Literary Genres 다. 프로토타입은 지문이 하나뿐이라 같은 지문에서
   문장을 탭하는 형태로 만들었다(문장 탭은 Passage Clarify 와 같은 clarify 배선을 쓴다).
   ⚠ 문구는 초안이다. */
{
  id:'skill_s4_confirm', slide:41, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Skill_Practice(S4_활동2)',
  cut:'S4 Confirm', layout:'reading',
  // Confirm 은 Literary Genres / Author's Purpose 스킬의 활동이라 기획서도 다른 지문을 쓴다
  passage:true, passageRef:'PASSAGE_FARM', skillName:'Identifying Literary Genres',
  clarify:true, clarifyAccum:true,   /* 탭한 문장 하이라이트 누적 */ hl:{ f1:'green' },
  blocks:[
    { t:'label', html:'S4 — Confirm' },
    { t:'lio', html:'Good work! Now, find a sentence that gives you a clue about the type of writing. Tap it!', tts:true, kr:true },
    { t:'lio', html:'Yes! "Mia and her dad" are characters — people in this text. Characters are a clue that shows the type of writing.', tts:true, kr:true },
    { t:'buttons', items:[
      { html:'Tap another sentence 👆', style:'dark', act:'another' },
      { html:"I'm ready! ▶", style:'navy', go:'clarify' },
    ]},
  ],
  spec:['S4 — Confirm 활동 · 해당 skill 2개 (Identifying Literary Genres, Inferring Author\'s Purpose)',
        "'Tap another sentence' 클릭 후 지문 영역에서 문장 직접 클릭",
        'ET 활동과 달리 정오답 결과가 없다 — 학생의 선택 답안에 대한 설명만 제시',
        "'I'm ready!' 클릭 → Passage_Clarify 활동 진행",
        '※ 기획서 목업이 이미지라 화면 문구는 초안이다 — 검토 필요'],
},

/* 31c ─ Skill Practice S4 활동2 예외 : 설명 누적 (기획서 v1.2 PAGE 42)
   처음 탭한 문장을 유지한 채 다른 문장을 탭하면 하이라이트와 설명이 '누적' 된다.
   ⚠ 문구는 초안이다. */
{
  id:'skill_s4_confirm_more', slide:42, section:'Further Practice 1',
  title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Skill_Practice(S4_활동2)',
  cut:'S4 Confirm · 누적', layout:'reading',
  passage:true, passageRef:'PASSAGE_FARM', skillName:'Identifying Literary Genres',
  clarify:true, clarifyAccum:true,   /* 탭한 문장 하이라이트 누적 */ hl:{ f1:'green', f8:'green' },   // 처음 탭한 문장 유지 + 다음 문장 누적
  blocks:[
    { t:'label', html:'S4 — Confirm' },
    { t:'lio', html:'Good work! Now, find a sentence that gives you a clue about the type of writing. Tap it!', tts:true, kr:true },
    { t:'lio', html:'Yes! "Mia and her dad" are characters — people in this text. Characters are a clue that shows the type of writing.', tts:true, kr:true },
    { t:'lio', html:'Yes! Moving to the garden is a new scene. Following characters to new places is a clue about the type of writing.', tts:true, kr:true },
    { t:'buttons', items:[
      { html:'Tap another sentence 👆', style:'dark', act:'another' },
      { html:"I'm ready! ▶", style:'navy', go:'clarify' },
    ]},
  ],
  spec:['S4 — Confirm 활동 예외 학습 플로우',
        '처음 탭한 문장 유지',
        '다른 탭한 학습 문장 하이라이트 = 점차 누적',
        '설명 멘트도 추가 누적',
        "'Tap another sentence' 클릭으로 추가 학습 가능",
        "'I'm ready!' 클릭 → Passage_Clarify 활동 진행",
        '※ 기획서 목업이 이미지라 화면 문구는 초안이다 — 검토 필요'],
},

/* 32 ─ Passage Clarify */
{
  id:'clarify', slide:43, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Passage_Clarify', layout:'reading',
  passage:true, clarify:true,
  blocks:[
    { t:'lio', html:"Do you have anything you don't understand? Tap the sentence.", tts:true, kr:true },
    { t:'buttons', items:[
      { html:"Yes, I'll tap it.", style:'primary', act:'yes' },
      { html:"No, let's move on! ▶", style:'navy' },
    ]},
    { t:'user', html:'Tap a sentence in the passage above!', side:'sys', hidden:true },
    { t:'lio', html:'A hermit crab moves with its borrowed shell on the sand.', tts:true, kr:true, stage2:true },
    // v1.2: 'Yes, I'll tap it.' 로 활동을 진행한 경우의 'Let's move on!' 은 Retry 로 간다.
    // (진행하지 않고 'No, let's move on' 을 누른 경우만 Pre-retry) — 그래서 여기만 go 를 준다.
    { t:'buttons', stage2:true, items:[
      { html:'Another sentence?', style:'primary', act:'another' },
      { html:"Let's move on! ▶", style:'dark', go:'fp1_retry' },
    ]},
  ],
  spec:["Passage Clarify — 이해 안 되는 문장이 있는지 확인하는 활동(Y/N)",
        "오답경로에서는 스킬 연습(S1~S4)이 끝나면 Pre-Retry 전 필수 진행",
        "지문 영역 내 문장 단위 점선 밑줄 · 커서 이동 시 클릭 가능",
        "'Yes, I'll tap it.' → 지문에서 문장 Tap → 해당 문장 하이라이트 + 설명, 'Another sentence?' 로 추가 가능",
        "'No, let's move on' (활동을 진행하지 않은 경우) → Pre-retry 진입",
        "'Let's move on!' (활동을 진행한 경우) → Retry 진입"],
},

/* 33 ─ Pre-retry Q&A */
{
  id:'pre_retry', slide:44, section:'Further Practice 1', title:'Skill1/2_FP1/2_Main_Question_오답경로_Scaffolding_3_Pre_retry', layout:'reading',
  passage:true,
  blocks:[
    { t:'lio', html:'Before we try the question again — do you have anything you want to ask?', tts:true, kr:true },
    { t:'buttons', items:[
      { html:'Yes, I have a question!', style:'primary', act:'yes', toast:'Type your question or use the microphone!' },
      { html:"No, let's go! ▶", style:'navy' },
    ]},
    { t:'input', placeholder:'Ask anything about the passage…', mic:true, hidden:true },
    // 기획서 3) 'Next' 클릭 → Retry. 질문하기를 고른 뒤에도 다음으로 갈 수 있어야 한다.
    { t:'buttons', align:'end', hidden:true, items:[{ html:'Next ▶', style:'primary', go:'fp1_retry' }] },
  ],
  spec:["Pre-retry — 'Passage Clarify' 에서 'No, let's move on' 을 누른 경우 진입",
        "Q&A 두 가지 옵션",
        "'Yes, I have a question!' → 영어/한국어 가능 · 마이크 버튼 클릭 후 발화 · 타이핑 후 'Ask' 클릭",
        "'No, let's go!' → Retry 활동 진입, 화면 전환"],
},

/* 34 ─ Retry Main Question (FP1) */
{
  id:'fp1_retry', slide:45, section:'Further Practice 1', title:'Skill1/2_FP1_Main_Question_오답경로_FP1_Retry', layout:'reading',
  passage:true,
  blocks:[
    { t:'label', html:'Retry — Main Question' },
    { t:'lio', html:'Let us try the question: What is A Day at the Tide Pools mostly about?', tts:true, kr:true },
    { t:'lio', html:'Choose the best answer.', tts:true, kr:true },
    { t:'choices', kr:true, instantGrade:true, items:[
      { k:'A', html:CHOICES[0].html, state:'correct' },
      { k:'B', html:CHOICES[1].html },
      { k:'C', html:CHOICES[2].html, state:'wrong' },
      { k:'D', html:CHOICES[3].html },
    ]},
    // 기획서: 정답 → confetti + praise + strategy → 'Next' / 오답 → 정답 공개 + strategy → 'Got it'
    { t:'lio', html:"Well done! You found the main idea because it covers Maya's exploration and discoveries at the tide pools.", tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:'Not quite, but you got this! The correct answer is: a girl who discovers the animals and wonders of tide pools, because it covers all about Maya\'s experiences and observations.', tts:true, kr:true , hidden:true, interest:'wrong' },
    { t:'lio', html:"Here's a Skill Tip: look for the idea that covers the WHOLE story — not just one detail.", tts:true, kr:true , hidden:true, interest:'wrong' },
    { t:'lio', html:"Great job working through that! Here's the strategy you can save for next time.", tts:true, kr:true , hidden:true, interest:'next' },
    { t:'strategy', hidden:true, interest:'next' },
    { t:'buttons', align:'end', hidden:true, interest:'correct', items:[{ html:'Next ▶', style:'green' }] },
    { t:'buttons', align:'end', hidden:true, interest:'wrong', items:[{ html:'Got it! 👍', style:'green' }] },
  ],
  spec:["Retry — Main Question 재출제 (문제 + 보기, 선지 개수는 학생 수준에 따라 다름)",
        "정답: 🎉 confetti + correct reaction + brief praise + strategy cue 표출 → 'Next' → FP2_Intro",
        "오답: 정답 공개 + strategy cue 표출 → 'Got it' → FP2_Intro"],
},

/* 35 ─ FP2 Intro (cut1) — slide 6과 같이 두 컷으로 분할 (버튼 겹침 방지) */
{
  id:'fp2_intro', slide:46, section:'Further Practice 2', title:'FP2_Intro', cut:'cut1', layout:'center',
  mascot:'lio2.png',
  // Design B(센터 카드)용 메시지
  message:[
    'Nice work on that story, <b>Maya</b>!',
    'Same skill again: <b class="hl">Main Idea</b>. Remember our strategy?',
    'New story about <b class="hl">Games and Play</b> — let\'s see what happens!',
  ],
  buttons:[{ html:"Let's go! ▶", style:'primary' }],
  introSeq:{
    image:'intro_fp2.png',
    fadeIn:true,
    autoNext:true,   // 앞 2문장 후 cut2로 자동 전환
    bubbles:[
      { side:'left',  text:'Nice work on that story,<br><b class="nm">Maya</b>!' },
      { side:'right', text:'Same skill again: <b class="mi">Main Idea</b>.<br>Remember our strategy?' },
    ],
  },
  spec:['FP1 학습 후 FP2 시작 화면 전환','cut1: 앞 2문장 + TTS → cut2 자동 전환','PIVOT: 파일럿 테스트 시 스킬별 FP3~5까지 추가 지문 학습 가능'],
},

/* 35b ─ FP2 Intro (cut2) */
{
  id:'fp2_intro_cut2', slide:46, section:'Further Practice 2', title:'FP2_Intro', cut:'cut2', layout:'center',
  message:[],
  introSeq:{
    image:'intro_fp2.png',
    fadeIn:false,
    bubbles:[
      { side:'left',  text:'New story about <b class="mi">Games and Play</b><br>— let\'s see what happens!' },
    ],
    cta:"Let's go!", ctaImg:'ui/btn_letsgo.png',
  },
  spec:['cut2: 마지막 문장 + TTS',"Let's go! 버튼 → FP2 Main Question"],
},

/* 36 ─ FP2 Main Question (+ 4 활동 옵션) */
{
  id:'fp2_mq', slide:47, section:'Further Practice 2', title:'FP2_Main Question_정답경로', layout:'reading',
  passage:true, listen:true,
  blocks:[
    { t:'lio', html:'Read the passage and answer the question.', tts:true, kr:true },
    { t:'lio', html:'If you want to listen, press the Listen button next to each paragraph.', tts:true, kr:true },
    { t:'q', html:MAIN_Q, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:CHOICES[0].html, state:'correct' },
      { k:'B', html:CHOICES[1].html },
      { k:'C', html:CHOICES[2].html },
      { k:'D', html:CHOICES[3].html },
    ]},
    { t:'lio', html:'You did great! You found the main idea about the tide pools. 🔊', tts:true, kr:true },
    { t:'lio', html:'Nice work! Choose what you\'d like to do next. 🔊', tts:true, kr:true },
    { t:'menu', kr:true, items:[
      { bImg:'skill_main_ideas.png', html:"I'm ready! Let's go!" },
      { bImg:'skill_recalling_facts_1.png', html:'I want to check some words.' },
      { bImg:'skill_literary_genres.png', html:'Walk me through the passage.' },
      { bImg:'skill_making_inferences.png', html:'I need something else.' },
    ]},
  ],
  confetti:true,
  spec:['M15 Main Question 제시 / M16 Main question 정답 → 🎉 confetti + praise','ET 진행 전 선택지 4개 제공:','A. 다음(E2-2 A): 활동 없이 ET 진행','B. 단어 확인(E2-3): Find & Flip (SC-07)','C. 내용 이해(E2-4): Walk the Passage (SC-08)','D. 기타(E2-2 D): 자유 입력 → CA가 분류'],
},

/* 37 ─ Find & Flip */
{
  id:'find_flip', slide:48, section:'Further Practice 2', title:'FP2_Main Question_정답경로_B', cut:'Find & Flip', layout:'findflip',
  intro:"Great choice! Let's explore some key words together!",
  label:'Find & Flip',
  lioLine:"Find each word in the passage, then tap it to flip the card and see what it means! 🔊",
  doneLio:['You found them all! Great job! 🔊','Want to explore more words? Blue words are our key words. Dotted words are other words you can tap too! 🔊'],
  buttons:[{ html:'Tap a word! 👆', style:'green', hint:true },{ html:"I'm done! Let's go ▶", style:'navy', go:'fp2_et' }   /* 기획서: → ET(P57) */],
  spec:['단어카드 + 본문 키워드 동시 탭 가능 (본문 핵심 키워드 카드 초기엔 뒤집힌 상태)','본문에서 단어 탭 → 카드 flip + 설명 카드(뜻·예문 · Teach UI와 동일, Got it/Not sure 없음)','단어가 속한 문장 노란 하이라이트 + TTS 읽기','6개 완료 → 🎉 confetti','"더 알고 싶은 단어?" 질문 후 본문 자유 탐색 · "I\'m done!" 클릭 → ET'],
},

/* 38 ─ Walk the Passage */
{
  id:'walk_passage', slide:49, section:'Further Practice 2', title:'FP2_Main Question_정답경로_C', cut:'Walk the Passage', layout:'reading',
  // 기획서 P52 : 마지막 문단 후 'Next' → ET / 'I have a question' → 문장 탭 활동(P53)
  passage:true, listen:true, walk:true, walkNextGo:'fp2_et', walkQGo:'walk_q',
  walkParas:[
    { label:'Paragraph 1', text:'Paragraph 1 introduces Maya and her class trip. Maya visits the ocean to explore tide pools for the first time.', simple:'In short: Maya goes to the ocean to see tide pools for the first time.' },
    { label:'Paragraph 2', text:'Paragraph 2 describes the living things Maya found — a sea star clinging to a rock, a hermit crab, and small fish.', simple:'In short: Maya finds a sea star, a hermit crab, and small fish.' },
    { label:'Paragraph 3', text:'Paragraph 3 explains that tide pool animals must survive two different worlds, so they are very tough.', simple:'In short: tide pool animals are tough because they live in two worlds.' },
    { label:'Paragraph 4', text:'Paragraph 4 shows Maya writing down what she observed and leaving the shore amazed by her discovery.', simple:'In short: Maya writes what she saw and leaves amazed.' },
  ],
  blocks:[
    { t:'menu', kr:true, items:[
      { bImg:'skill_main_ideas.png', html:"I'm ready! Let's go!" },
      { bImg:'skill_recalling_facts_1.png', html:'I want to check some words.' },
      { bImg:'skill_literary_genres.png', html:'Walk me through the passage.', state:'sel' },
      { bImg:'skill_making_inferences.png', html:'I need something else.' },
    ]},
    { t:'user', html:'Tap any blue or dotted word! When you are ready, press Continue.', side:'sys' },
    { t:'buttons', items:[{ html:'Continue ▶', style:'primary', act:'walkStart' }] },
    { t:'label', html:'Walk the Passage', hidden:true },
    { t:'lio', html:'Before we start, you can tap any blue or dotted word in the passage to check its meaning! Want to check words or go straight to walking through the passage?', tts:true, kr:true, hidden:true },
    { t:'buttons', hidden:true, items:[
      { html:'Let me check words first! 📖', style:'primary', act:'walkGo' },
      { html:"I'm ready to listen! 👂", style:'dark', act:'walkGo' },
    ]},
    { t:'walkarea' },
  ],
  spec:['도입: 선택지 버튼 2개 (단어 먼저 확인 / 바로 설명 듣기)','세부: 단어 먼저 확인하기 → 지문 내 단어 탭 → 하단 영어 뜻 TTS','바로 듣기: PARAGRAPH 1 설명 진행','단락별 설명(4단락 반복): 해당 단락 노란 하이라이트 · 핵심 문장→detail 순서','버튼: Next / More simply(1문장 재설명) / I have a question(모르는 문장 탭→설명)','활동 후 ET 진입'],
},
/* 44b ─ Walk the Passage · 'I have a question' — 문장을 고르지 않고 마치는 경우
   (기획서 v1.2 PAGE 53) 첫 단락은 다시 하지 않고 다음 단락으로 넘어간다.
   ⚠ 문구는 초안이다(목업이 이미지). */
{
  id:'walk_q', slide:50, section:'Further Practice 2',
  title:'Skill1/2_FP2_Main_Question_정답_경로_C_Walk_me_through_the_passage',
  cut:'I have a question', layout:'reading',
  passage:true, clarify:true,
  blocks:[
    { t:'label', html:'Walk the Passage' },
    { t:'lio', html:'Paragraph 1 introduces Maya and her class trip to the tide pools.', tts:true, kr:true },
    { t:'lio', html:'Is there a sentence you want me to explain? Tap it in the passage — you can also tap any blue or dotted word.', tts:true, kr:true },
    { t:'buttons', items:[
      { html:'Tap a sentence', style:'primary', act:'yes' },
      { html:"I'm done asking ▶", style:'navy', go:'walk_q_last' }   /* 기획서 P53 → P55 */,
    ]},
  ],
  spec:["'I have a question' 클릭 시 해당 문단 내 문장 단위로 클릭 가능",
        '학습 문단 외 다른 문단의 단어도 점선 set 유지',
        '지문 내 단어(key words/점선 단어) 클릭 → 색상 변화 + 하단 영영 뜻 TTS',
        "학생이 문장을 고르지 않고 'I'm done asking' 을 누른 경우 — 첫 단락은 재진행하지 않고 다음 단락으로",
        '※ 기획서 목업이 이미지라 화면 문구는 초안이다 — 검토 필요'],
},

/* 44c ─ Walk the Passage · 'I have a question' — 문장을 고른 경우
   (기획서 v1.2 PAGE 54) 클릭 전 파란색, 클릭 후 초록색으로 전환된다.
   'Another sentence' 로 설명을 더 듣고, 'Next paragraph' 로 다음 문단으로 간다.
   ⚠ 문구는 초안이다. */
{
  id:'walk_q_sent', slide:51, section:'Further Practice 2',
  title:'Skill1/2_FP2_Main_Question_정답_경로_C_Walk_me_through_the_passage',
  cut:'I have a question · 문장 선택', layout:'reading',
  passage:true, clarify:true, hl:{ p3:'green' },
  blocks:[
    { t:'label', html:'Walk the Passage' },
    { t:'lio', html:'Paragraph 1 introduces Maya and her class trip to the tide pools.', tts:true, kr:true },
    { t:'user', html:'Tap a sentence in the passage above!', side:'sys' },
    { t:'lio', html:'Good question! A tide pool is a small pool of water that stays behind on the rocks after the ocean water goes back out.', tts:true, kr:true },
    { t:'buttons', items:[
      { html:'Another sentence', style:'primary', act:'another' },
      { html:'Next paragraph ▶', style:'navy' },
    ]},
  ],
  spec:['해당 활동은 FP1 오답경로의 Passage Clarify 와 같다 — 다른 UI, 같은 학습 활동',
        '클릭 전 문장 색상 파란색 → 클릭 이후 초록색으로 전환',
        '클릭한 문장 설명 제시',
        "'Another sentence' → 다른 문장 설명 듣기",
        "'Next paragraph' → 다음 문단 학습 · 마지막 문단 이후에는 'Next' 로 바뀌어 ET 진입",
        '※ 기획서 목업이 이미지라 화면 문구는 초안이다 — 검토 필요'],
},

/* 44d ─ Walk the Passage · 마지막 문단 — 'Next paragraph' 가 'Next' 로 바뀐다
   (기획서 v1.2 PAGE 55) 이후 ET 로 진입한다.
   ⚠ 문구는 초안이다. */
{
  id:'walk_q_last', slide:52, section:'Further Practice 2',
  title:'Skill1/2_FP2_Main_Question_정답_경로_C_Walk_me_through_the_passage',
  cut:'I have a question · 마지막 문단', layout:'reading',
  passage:true, clarify:true, hl:{ p14:'green', p15:'green', p16:'green' },
  blocks:[
    { t:'label', html:'Walk the Passage' },
    { t:'lio', html:'In the last paragraph Maya writes down everything she observed, and she leaves the shore feeling amazed.', tts:true, kr:true },
    { t:'lio', html:'That is the whole passage! Ready to find the evidence together?', tts:true, kr:true },
    { t:'buttons', items:[
      { html:'Another sentence', style:'primary', act:'another' },
      { html:'Next ▶', style:'navy', go:'fp2_et' },
    ]},
  ],
  spec:['마지막 문단 활동 후 기존 \'Next paragraph\' 옵션이 \'Next\' 버튼으로 바뀐다',
        "'Next' 클릭 → Evidence Tap 진입",
        '※ 기획서 목업이 이미지라 화면 문구는 초안이다 — 검토 필요'],
},

/* 39 ─ Something else (자유 입력) */
{
  id:'something_else', slide:53, section:'Further Practice 2', title:'FP2_Main Question_정답경로_D', cut:'Something else', layout:'reading',
  passage:true, listen:true,
  blocks:[
    { t:'menu', kr:true, items:[
      { bImg:'skill_main_ideas.png', html:"I'm ready! Let's go!" },
      { bImg:'skill_recalling_facts_1.png', html:'I want to check some words.' },
      { bImg:'skill_literary_genres.png', html:'Walk me through the passage.' },
      { bImg:'skill_making_inferences.png', html:'I need something else.', state:'sel' },
    ]},
    { t:'lio', html:'Type or talk to me — tell me what you need! If English is hard, you can write in Korean too. 🔊', tts:true, kr:true },
    { t:'input', placeholder:'Type what you need… (English or Korean)', mic:true },   /* Send + 마이크 */
    { t:'user', html:'Maya는 무엇을 했어?', hidden:true },
    { t:'lio', html:"Maya discovered amazing things at the tide pools! Let's see what the key words are or walk through the passage together. 🔊", tts:true, kr:true, hidden:true },
    { t:'menu', kr:true, hidden:true, items:[
      { bImg:'skill_recalling_facts_1.png', html:'I want to check some words.' },
      { bImg:'skill_literary_genres.png', html:'Walk me through the passage.' },
    ]},
  ],
  spec:['타이핑 답안 제출(한국어 가능) · "Send" 버튼 클릭 → 답변','4가지 활동 보기 중 "I\'m Ready. Let\'s go!"를 제외한 활동','I want to check some words = word check (Find & Flip)','Walk me through the passage = walk the passage'],
},

/* 40 ─ FP2 Evidence Tap (문제 제시) */
{
  id:'fp2_et', slide:54, section:'Further Practice 2', title:'FP2_Main Question_정답경로_A/ET', layout:'reading',
  passage:true, etMode:true, etAnswers:['p1', 'p2', 'p5', 'p14', 'p15', 'p16'],   /* 사전 하이라이트 없음 · 문장 탭 시에만 하이라이트 */
  blocks:[
    // 기획서 P57 : 옵션 목록에서 A 를 고른 상태 + 진입 멘트 뒤에 ET 가 시작된다
     { t:'menu', kr:true, items:[
      { bImg:'skill_main_ideas.png', html:"I'm ready! Let's go!", state:'sel' },
      { bImg:'skill_recalling_facts_1.png', html:'I want to check some words.', go:'find_flip' },
      { bImg:'skill_literary_genres.png', html:'Walk me through the passage.', go:'walk_passage' },
      { bImg:'skill_making_inferences.png', html:'I need something else.', go:'something_else' },
    ]},
    { t:'lio', html:"Great! You're ready to dive into the Evidence Tap with confidence!", tts:true, kr:true },
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
    // 결과별 멘트 (기획서 PAGE 58·59·61 의 문구)
    { t:'lio', html:"That's not quite the main focus. Look near the start of her trip. Try again. Tap the sentence that best supports the main idea.", tts:true, kr:true, hidden:true, interest:'wrong' },
    { t:'lio', html:"Great choice! The evidence shows Maya's discoveries in the tide pools connect perfectly with the main idea of discovering animals and wonders.", tts:true, kr:true, hidden:true, interest:'correct' },
    { t:'lio', html:'Not quite, but good try! The evidence is highlighted in the passage. It shows how Maya\'s visit helped her discover many wonders in the tide pools.', tts:true, kr:true, hidden:true, interest:'reveal' },
    { t:'buttons', align:'end', hidden:true, interest:'next', items:[{ html:'Next ▶', style:'primary' }] },
  ],
  spec:['ET 활동 안내(문제 제시)','4지 선다가 아닌 지문 영역에서 문장 클릭','문장에 커서 이동시 동시 하이라이트 효과'],
},

/* 41 ─ FP2 Evidence Tap 정답 */
{
  id:'fp2_et_correct', slide:55, section:'Further Practice 2', title:'FP2_Main Question_정답경로_ET_정답', layout:'reading',
  passage:true, hl:{ p1:'green', p2:'green', p5:'green', p14:'green', p15:'green', p16:'green' },
  blocks:[
    { t:'label', html:'Evidence Tap' },
    // 기획서 P58 : 문제 제시 → (1차 오답 힌트) → 정답 멘트 순서
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:"That's not quite the main focus. Look near the start of her trip. Try again. Tap the sentence that best supports the main idea.", tts:true, kr:true },
    { t:'lio', html:"Great choice! The evidence shows Maya's discoveries in the tide pools connect perfectly with the main idea of discovering animals and wonders.", tts:true, kr:true },
    { t:'lio', html:"Great job working through that on your own! Here's the strategy you just used—save it for next time.", tts:true, kr:true },
    { t:'strategy' },
  ],
  confetti:true,
  spec:['ET(Evidence Tap) 정답','M16b_Evidence: 정답 공개 + 다른 ET 정답도 하이라이트 표출'],
},

/* 42 ─ FP2 ET 1차 오답 */
{
  id:'fp2_et_wrong1', slide:56, section:'Further Practice 2', title:'FP2_Main Question_정답경로_ET_1차_오답', layout:'reading',
  // 기획서 PAGE 59 4) : 붉은 오답 하이라이트를 유지한 채 지문에서 답을 다시 고를 수 있다.
  // 이미 1번 틀린 상태(etTries:1)라 다음 선택이 마지막 — 결과에 따라 각 페이지로 간다.
  passage:true, listen:true, etMode:true, hl:{ p14:'red' },
  etAnswers:['p1', 'p2', 'p5', 'p14', 'p15', 'p16'], etTries:1,
  etGo:{ correct:'fp2_et_retry', wrong:'fp2_et_wrong2' },   // 1차 오답: 붉은 하이라이트 유지 + 지문 재선택
  blocks:[
    { t:'q', html:MAIN_Q, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:CHOICES[0].html, state:'correct' },
      { k:'B', html:CHOICES[1].html },
      { k:'C', html:CHOICES[2].html },
      { k:'D', html:CHOICES[3].html },
    ]},
    { t:'lio', html:"You're ready to dive into Evidence Tap! 🔊", tts:true, kr:true },
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:'Try looking where Maya visits and discovers new things. Try again. Tap the sentence that best supports the main idea.', tts:true, kr:true, retry:true },
  ],
  spec:['Main question 정답 → 🎉 confetti + correct reaction','ET(Evidence Tap) 1차 오답: 지문 영역 커서 이동, 답 선택 1차 오답 결과 하이라이트 + reaction','LIO: 힌트 없음 + Retry 제안 멘트','붉은 색 오답 하이라이트 유지 + 지문 영역 답 재선택'],
},

/* 43 ─ FP2 ET retry 이후 정답 → Complete */
{
  id:'fp2_et_retry', slide:57, section:'Further Practice 2', title:'FP2_Main_Question_정답경로_ET_1차_오답_Retry_이후_정답', layout:'reading',
  passage:true, hl:{ p1:'green', p2:'green' },
  blocks:[
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:'Great job! You found the right details. You connected Maya\'s visit to finding living things. 🔊', tts:true, kr:true },
    { t:'lio', html:"Great job working through that on your own! Here's the strategy you just used — save it for next time. 🔊", tts:true, kr:true },
    { t:'strategy' },
    { t:'actcard', bImg:'skill_main_ideas.png', title:'Further Practice 2 Complete!' },
  ],
  spec:['ET(Evidence Tap)_retry 이후 정답','M16b Evidence: 정답 공개 + 다른 ET 정답도 하이라이트','Strategy cue 제공','FP2 학습 종료 안내 → M22 진입'],
},

/* 45 ─ FP2 Free Chat (M22) */
{
  id:'fp2_free_chat', slide:59, section:'Further Practice 2', title:'FP2_Main_Question_정답경로_ET_정답_이후_M22', cut:'Retry 정답 이후', layout:'reading',
  passage:true, freechat:true,
  blocks:[
    { t:'lio', html:'You said that you like new places. Where do you want to explore next?', tts:true, kr:true },
    { t:'user', html:'…land', fc:'turn1' },
    { t:'lio', html:"Nice, you're talking about a country! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'lio', html:"Now it's your turn! You can ask ME anything — you can even ask in Korean! Click my face moving around the screen! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'input', placeholder:'Tell me!', send:true, skip:true },
    { t:'actcard', bImg:'skill_main_ideas.png', title:'All done! 오늘 학습 끝!', fc:'end' },
    { t:'lio', html:'This was so much fun! You did great today. See you next time! 👋🔊', tts:true, kr:true, fc:'end' },
  ],
  spec:['M22_Free_Chat: 타이핑 후 "Send" 버튼 클릭 = 대화 1턴','LIO 캐릭터 얼굴 탭 → 자유 대화 2턴(한국어 가능)','"Done/Skip" 버튼 클릭 → 학습 최종 마무리 → 세션 종료'],
},

/* 45 ─ FP2 Free Chat (M22) · 와이어는 M22 1경로 — cut 라벨로만 진입 맥락 구분 */
{
  id:'fp2_free_chat_2', slide:59, section:'Further Practice 2', title:'FP2_Main_Question_정답경로_ET_정답_이후_M22', cut:'ET 정답 이후', layout:'reading',
  passage:true, freechat:true,
  blocks:[
    { t:'lio', html:'You finished Further Practice 2! Want to chat a little before we wrap up?', tts:true, kr:true },
    { t:'lio', html:'You said that you like new places. Where do you want to explore next?', tts:true, kr:true },
    { t:'input', placeholder:'Tell me!', send:true, skip:true },
    { t:'user', html:'Iceland', fc:'turn1' },
    { t:'lio', html:"Nice, you're talking about a country! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'lio', html:"Now it's your turn! You can ask ME anything — you can even ask in Korean! Click my face moving around the screen! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'actcard', bImg:'skill_main_ideas.png', title:'All done! 오늘 학습 끝!', fc:'end' },
    { t:'lio', html:'This was so much fun! You did great today. See you next time! 👋🔊', tts:true, kr:true, fc:'end' },
  ],
  spec:['ET 정답/완료 후 M22 Free Chat','Send = 대화 1턴 → LIO 얼굴 탭 → 자유 대화','Skip/Done → 학습 종료'],
},

/* 44 ─ FP2 ET 2차 오답 reveal → Complete */
{
  id:'fp2_et_wrong2', slide:58, section:'Further Practice 2', title:'FP2_Main_Question_정답경로_ET_2차_오답', layout:'reading',
  passage:true, hl:{ p1:'green', p2:'green', p5:'green' },
  blocks:[
    { t:'label', html:'Evidence Tap' },
    { t:'lio', html:'Now, tap the sentence in the passage that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:'Try looking where Maya visits and discovers new things. Try again. Tap the sentence that best supports the main idea.', tts:true, kr:true },
    { t:'lio', html:"Not quite, but good try! The evidence is highlighted in the passage. It shows how Maya's visit helped her discover many wonders in the tide pools.", tts:true, kr:true },
    { t:'buttons', align:'end', items:[{ html:'Next ▶', style:'primary', reveal:true }] },
    { t:'strategy', hidden:true },
    { t:'actcard', bImg:'skill_main_ideas.png', title:'Further Practice 2 Complete!', hidden:true },
  ],
  spec:['ET(Evidence Tap)_retry 이후 2차 오답','M16c Evidence Reveal: 정답 공개 + 다른 ET 정답도 하이라이트','Next 버튼 탭 → strategy cue 표출','FP2 학습 종료 안내 → M22 진입'],
},

/* 45 ─ FP2 ET 2차 오답 이후 M22 */
{
  id:'fp2_free_chat_3', slide:59, section:'Further Practice 2', title:'FP2_Main_Question_정답경로_ET_정답_이후_M22', cut:'ET 2차 오답 이후', layout:'reading',
  passage:true, freechat:true,
  blocks:[
    { t:'lio', html:'You finished the Skill Practice! Great work today! 🔊', tts:true, kr:true },
    { t:'lio', html:'You said that you like new places. Where do you want to explore next?', tts:true, kr:true },
    { t:'input', placeholder:'Tell me!', send:true, skip:true },
    { t:'user', html:'Iceland', fc:'turn1' },
    { t:'lio', html:"Nice, you're talking about a country! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'lio', html:"Now it's your turn! You can ask ME anything — you can even ask in Korean! Click my face moving around the screen! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'actcard', bImg:'skill_main_ideas.png', title:'All done! 오늘 학습 끝!', fc:'end' },
    { t:'lio', html:'This was so much fun! You did great today. See you next time! 👋🔊', tts:true, kr:true, fc:'end' },
  ],
  spec:['ET 2차 오답 → Complete 후 M22 Free Chat','Send / 얼굴 탭 / Done·Skip'],
},

/* 46 ─ FP2 Quick Exit 게이트 */
{
  id:'quick_exit', slide:60, section:'Further Practice 2', title:'FP2_오답경로_진입_전_Quick_Exit_게이트', layout:'quickexit',
  bg:'intro_qe.png',
  qeSeq:[
    { side:'left',  html:'What should we do?' },
    { side:'right', html:'Pick whichever<br>feels better.' },
  ],
  cards:[
    { title:'Just show me<br>the answer', tone:'plain', go:'fp2_et_wrong2' },
    { title:"Let's find out<br>why!", tone:'primary', go:'fp2_retry' },
  ],
  spec:['적용 조건: FP2 오답 & FP1도 오답 (이미 scaffolding 1회 받은 학생), M17 직후','말풍선 좌→우 순차 (Slide7과 동일 꼬리)','Quick Exit 1) "정답 바로 확인": M016C Answer Reveal → CA 마무리 멘트 → 전략 카드 → M22','2) "왜 틀렸는지 공부": M18/M19 표준 오답 흐름 진행 … M22 진행 후 학습 종료'],
},

/* 47 ─ Retry FP2 Main Question */
{
  id:'fp2_retry', slide:61, section:'Further Practice 2', title:'Retry_FP2', cut:'Main Question', layout:'reading',
  passage:true,
  blocks:[
    { t:'label', html:'Retry — Main Question' },
    { t:'lio', html:'Let us try the question: What is A Day at the Tide Pools mostly about?', tts:true, kr:true },
    { t:'lio', html:'Choose the best answer.', tts:true, kr:true },
    { t:'choices', kr:true, items:[
      { k:'A', html:CHOICES[0].html, state:'correct' },
      { k:'B', html:CHOICES[1].html },
      { k:'C', html:CHOICES[2].html, state:'wrong' },
      { k:'D', html:CHOICES[3].html },
    ]},
    { t:'lio', html:"Not quite, but you got this! The correct answer is: a girl who discovers the animals and wonders of tide pools, because it covers all about Maya's experiences and observations.", tts:true, kr:true },
    { t:'lio', html:"Here's a Skill Tip: choose the answer that covers Maya's whole experience — not just one moment.", tts:true, kr:true },
    { t:'lio', html:'You finished the Skill Practice! Great work today! 🔊', tts:true, kr:true },
    { t:'buttons', align:'end', nowrap:true, items:[
      { html:"Let's talk! 💬", style:'green' },
      { html:"I'm done! 👋", style:'navy', act:'sessionEnd' },
    ]},
    { t:'actcard', bImg:'skill_main_ideas.png', title:'All done! 오늘 학습 끝!', hidden:true },
    { t:'lio', html:'This was so much fun! You did great today. See you next time! 👋🔊', tts:true, kr:true, hidden:true },
  ],
  spec:['Retry: Main Question 재출제 — 문제 + 4지선다','정오답 분기: 정답 → 마무리멘트+전략카드 → 자유대화 / 오답 → Answer Reveal + Skill Tip(전략 카드 없음) → 자유대화',"'Let's Talk!' → M22 Free Chat","'I'm done!' → 학습 종료"],
},

/* 48 ─ Retry 이후 Free Chat (M22) */
{
  id:'fp2_retry_free_chat', slide:62, section:'Further Practice 2', title:'Retry_FP2', cut:'M22 Free Chat', layout:'reading',
  passage:true, freechat:true,
  blocks:[
    { t:'lio', html:"Not quite, but you got this! The correct answer is: a girl who discovers the animals and wonders of tide pools, because it covers all about Maya's experiences and observations.", tts:true, kr:true },
    { t:'lio', html:'You finished the Skill Practice! Great work today! 🔊', tts:true, kr:true },
    { t:'lio', html:'You said that you like new places. Where do you want to explore next?', tts:true, kr:true },
    { t:'input', placeholder:'Tell me!', send:true, skip:true },
    { t:'user', html:'Iceland', fc:'turn1' },
    { t:'lio', html:"Nice, you're talking about a country! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'lio', html:"Now it's your turn! You can ask ME anything — you can even ask in Korean! Click my face moving around the screen! 🔊", tts:true, kr:true, fc:'turn1' },
    { t:'actcard', bImg:'skill_main_ideas.png', title:'All done! 오늘 학습 끝!', fc:'end' },
    { t:'lio', html:'This was so much fun! You did great today. See you next time! 👋🔊', tts:true, kr:true, fc:'end' },
  ],
  spec:['M22 Free Chat: 영어/한국어 가능 안내','Send = 대화 1턴 → LIO 얼굴 탭 → 자유 대화 2턴(타이핑/마이크)','Skip/Done → 학습 종료 화면'],
},

/* 49 ─ 최종 학습 후 추가 학습 / 종료 선택 (Pilot) */
{
  id:'post_skill_pick', slide:63, section:'Skill Selection', title:'FP2_최종_학습_종료_추가_학습_자유_선택', layout:'quickexit',
  bg:'intro_fp2.png',
  qeSeq:[
    { side:'left',  html:'You did it, <b class="nm">Maya</b>! Want to practice another skill?' },
    { side:'right', html:"Tap <b>Another skill</b> to keep going, or <b>Finish</b> if you're ready to wrap up for today!" },
  ],
  actions:[
    { html:'Another skill', img:'ui/btn_another_skill.png', act:'goSkill' },
    { html:'Finish', img:'ui/btn_finish.png', act:'finishSession' },
  ],
  spec:['최종 학습 후 추가 학습 자유 선택 (Pilot 한정)','말풍선 순차 등장 후 CTA','Another skill → Skill Intro(SLIDE 7)','Finish → 전체 세션 종료'],
},
/* 50 ─ 학습 세션 종료 화면 (기획서 v1.2 PAGE 67)
   Free Chat 두 번째 대화에서 'Done' 을 누른 뒤, 또는 추가 skill 학습까지 끝낸 뒤 도달한다.
   'Exit' 클릭으로 전체 학습이 끝난다.
   ⚠ 문구는 초안이다(목업이 이미지). */
{
  id:'session_end', slide:64, section:'Skill Selection', title:'Skill1/2_FP2_학습_종료_화면', layout:'quickexit',
  bg:'intro_fp2.png',
  qeSeq:[
    { side:'left',  html:'Great work today, <b class="nm">Maya</b>! You finished everything.' },
    { side:'right', html:'See you next time — tap <b>Exit</b> when you are ready to go.' },
  ],
  // img 를 쓰면 그 이미지의 글자('Finish')가 그대로 나온다 → 텍스트 버튼으로 둔다
  actions:[
    { html:'Exit', style:'primary', chevron:true, act:'exitSession' },
  ],
  spec:['학습 세션 종료',
        "Free Chat 두 번째 대화 종료 'Done' 클릭 후 종료 화면",
        '학생이 추가 두 번째 skill 학습을 진행한 경우에도 이 화면으로 종료',
        "'Exit' 클릭 후 전체 학습 종료",
        '※ 기획서 목업이 이미지라 화면 문구는 초안이다 — 검토 필요'],
},

];

/* 전역 노출 */
window.LIO_FLOW = { PASSAGE, PASSAGE_FARM, MAIN_Q, CHOICES, STRATEGY, SKILLS, TOPICS, KEYWORDS, EXPLORE_EXTRA, SCREENS };
