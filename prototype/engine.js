/* =====================================================================
   LIO Step 2 · Skill Core — Flow Prototype
   engine.js : 화면 렌더러 + 라우터 (Design A / B 공통)
   - 각 index.html 은 이 파일 로드 전에 window.LIO_THEME = 'A' | 'B' 를 설정합니다.
   ===================================================================== */
(function () {
  const F = window.LIO_FLOW;
  const THEME = window.LIO_THEME || 'B';
  const IMG = '../IMAGE/';
  // 테마 전용 화면 필터 (aOnly: Design A 전용, bOnly: Design B 전용)
  const SCREENS = F.SCREENS.filter(s => !(s.aOnly && THEME !== 'A') && !(s.bOnly && THEME !== 'B'));

  let idx = 0;

  // 화면 전환 시 취소할 대기 타이머 레지스트리 (잔여 콜백이 다음 화면을 건드리는 버그 방지)
  let _timers = [];
  let _rafs = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); _timers.push(t); return t; };
  const clearTimers = () => {
    _timers.forEach(clearTimeout); _timers = [];
    _rafs.forEach(cancelAnimationFrame); _rafs = [];
  };
  const trackRaf = (id) => { _rafs.forEach(cancelAnimationFrame); _rafs = [id]; return id; };

  /* ---------------- helpers ---------------- */
  const esc = (s) => s;
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const kw = (html) => html.replace(/<kw>/g, '<b class="kw">').replace(/<\/kw>/g, '</b>');
  // 기본 버튼(.btn)에는 이모지 미사용 — 전체 공통 규칙. ▶(→PLAY 아이콘)/✓ 등 기능 기호는 유지.
  const stripEmoji = (s) => String(s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ').trim();
  // 여러 단어(문장) 버튼은 작게(btn-long), 한 단어 버튼은 기본 크기 유지 — 전체 공통
  const btnLong = (html) => (stripEmoji(html).replace(/▶/g, '').trim().split(/\s+/).filter(Boolean).length > 1 ? ' btn-long' : '');
  const skillIcon = (s) => IMG + (THEME === 'A' ? 'a_skill/' + s.aImg : 'b_skill/' + s.bImg);
  const mascot = (name) => IMG + (name || 'lio_face2.png');
  // Figma B_Skill_list 라벨은 2줄. 표시용 HTML (평문 s.name 은 alt/로직에 유지)
  const skillNameHtml = (s) => ({
    'Main Ideas': 'Main<br>Ideas',
    'Recalling Facts 1': 'Recalling<br>Facts 1',
    'Recalling Facts 2': 'Recalling<br>Facts 2',
    'Recalling Facts 3': 'Recalling<br>Facts 3',
    'Drawing Conclusions': 'Drawing<br>Conclusions',
    'Making Inferences': 'Making<br>Inferences',
    'Cause & Effect': 'Cause &amp;<br>Effect',
    'Analyzing Characters': 'Analyzing<br>Characters',
    "Author's Purpose": "Author's<br>Purpose",
    'Literary Genres': 'Literary<br>Genres'
  })[s.name] || String(s.name).replace(' ', '<br>');

  const KR = '<span class="kr" role="button" tabindex="0" aria-label="한국어 번역">KR</span>';
  const TTS = '<img class="tts-ic" src="' + IMG + 'ui/spk_bubble.svg" alt="listen">';   // Figma 스피커 아이콘

  /* ---------- KR 번역 토글 ---------- */
  const plainText = (html) => stripEmoji(String(html || '').replace(/<[^>]+>/g, ''));
  const lookupKr = (html, explicit) => {
    if (explicit) return explicit;
    const map = window.LIO_KR_MAP || {};
    const p = plainText(html);
    return map[p] || map[html] || null;
  };
  /** 영어/한국어 Dual span + (선택) KR 버튼 — 번역이 있을 때만 KR 표시 */
  const txBlock = (html, opts = {}) => {
    const en = stripEmoji(kw(html));   // 표시 텍스트에서 이모지 제거 (대화/문제/보기 공통)
    const krRaw = lookupKr(html, opts.krHtml);
    const extras = (opts.tts ? ' ' + TTS : '');
    if (!opts.kr || !krRaw) return en + extras;
    const kr = stripEmoji(kw(krRaw));
    return `<span class="tx"><span class="tx-en">${en}</span><span class="tx-kr" hidden>${kr}</span></span>`
      + extras + ' ' + KR;
  };

  // 버튼용 작은 라운드 삼각형(▶ 대체)
  const PLAY = '<svg class="btn-tri" viewBox="0 0 14 14" fill="currentColor" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M5 3.6 L10 7 L5 10.4 Z"/></svg>';

  // 심플 라인 아이콘 (stroke=currentColor)
  const LI = {
    pin:   '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4h6l-1 6 3 2v2H7v-2l3-2z"/><path d="M12 14v6"/></svg>',
    search:'<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
    list:  '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M3.5 6h.01"/><path d="M3.5 12h.01"/><path d="M3.5 18h.01"/></svg>',
    bulb:  '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5.9 1.2 1 2.3h6c.1-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
    book:  '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg>',
    pencil:'<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    chat:  '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>',
    mic:   '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M8 21h8"/></svg>',
    send:  '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 3.5 10.2 13.8"/><path d="M20.5 3.5 14.2 20.5l-3.5-7.8L3 9.2 20.5 3.5z"/></svg>',
    check: '<svg class="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l5 5L19 7"/></svg>'
  };

  /* ---------------- TTS (아기사자 LIO / 7세 남아 톤) ----------------
     - 성우 오디오 파일이 있으면 그걸 재생(audioUrl), 없으면 Web Speech API 사용.
     - Web Speech: pitch를 높여 어린이/아기사자 느낌. (정확한 성우 음색은 오디오 파일 교체 권장) */
  let _voices = [];
  function loadVoices(){ try{ _voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; }catch(e){ _voices=[]; } }
  if (window.speechSynthesis){ loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }
  let _curAudio = null;
  function stopSpeak(){
    try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){}
    if(_curAudio){ _curAudio.pause(); _curAudio.currentTime=0; _curAudio=null; }
  }
  function speak(text, audioUrl, onEnd){
    stopSpeak();
    if (audioUrl){
      _curAudio = new Audio(audioUrl);
      _curAudio.onended = ()=> onEnd && onEnd();
      _curAudio.onerror = ()=> onEnd && onEnd();
      _curAudio.play().catch(()=> onEnd && onEnd());
      return;
    }
    const clean = String(text).replace(/<[^>]+>/g,'').replace(/[^\p{L}\p{N}\s.,!?'"-]/gu,'').trim();
    if (!window.speechSynthesis || !clean){ later(()=> onEnd && onEnd(), 1400); return; }
    if(!_voices.length) loadVoices();
    const u = new SpeechSynthesisUtterance(clean);
    // 부드럽고 또렷한 톤: 과한 피치는 깨져서 살짝만 높임(아이 느낌) + 조금 느리게
    u.lang = 'en-US'; u.pitch = 1.25; u.rate = 0.92; u.volume = 1;
    u.voice = pickVoice();
    let done = false;
    const finish = () => { if (done) return; done = true; onEnd && onEnd(); };
    u.onend = finish; u.onerror = finish;
    // 안전장치: TTS 종료 이벤트가 안 오는 환경(헤드리스/음성 없음)에서도 다음으로 진행
    later(finish, Math.max(2000, clean.split(/\s+/).length * 380 + 1600));
    try{ window.speechSynthesis.speak(u); }catch(e){ finish(); }
  }
  // 자연스러운(뉴럴) 영어 음성 우선 선택 — 딱딱한 기본 음성 회피
  function pickVoice(){
    if(!_voices.length) loadVoices();
    const en = _voices.filter(v => /^en/i.test(v.lang));
    const prefs = [/natural/i, /online/i, /aria|jenny|ana|libby|maisie/i, /google us english/i, /google/i, /samantha|zira/i];
    for (const rx of prefs){ const v = en.find(x => rx.test(x.name)); if (v) return v; }
    return en.find(v=>/en-US/i.test(v.lang)) || en[0] || null;
  }

  /* ---------------- 인트로 BGM (잔잔 · 루프) ----------------
     기본: IMAGE/bgm/intro.wav (항상 존재). intro.mp3 가 있으면 그걸로 교체.
     인트로 구간(slide 5~9) · 첫 클릭 후 재생. */
  const INTRO_BGM_IDS = new Set(['entry','greeting','greeting_cut3','skill','topic','plan']);
  const INTRO_BGM_VOL = 0.38;   // bright cheerful underscore
  let _bgm = null;
  let _bgmUnlocked = false;
  let _bgmFadeTimer = null;

  function bgmUrl(){
    // designB/index.html 기준 상대경로 — Live Server(5500)에서 검증됨
    return IMG + 'bgm/intro.wav';
  }

  function ensureBgm(){
    if (_bgm) {
      if (document.body && !_bgm.isConnected) { try { document.body.appendChild(_bgm); } catch (e) {} }
      return _bgm;
    }
    _bgm = new Audio(bgmUrl());
    _bgm.loop = true;
    _bgm.preload = 'auto';
    _bgm.volume = INTRO_BGM_VOL;
    _bgm.setAttribute('playsinline', '');
    _bgm.style.display = 'none';
    try { if (document.body) document.body.appendChild(_bgm); } catch (e) {}
    return _bgm;
  }

  function unlockBgm(){
    _bgmUnlocked = true;
    try { const c = actx(); if (c && c.resume) c.resume(); } catch (e) {}
    syncIntroBgm(SCREENS[idx]);
  }

  function isIntroBgmScreen(scr){
    if (!scr) return false;
    if (scr.introBgm === false) return false;
    if (scr.introBgm === true) return true;
    return INTRO_BGM_IDS.has(scr.id);
  }

  function syncIntroBgm(scr){
    const a = ensureBgm();
    if (_bgmFadeTimer) { clearInterval(_bgmFadeTimer); _bgmFadeTimer = null; }
    if (isIntroBgmScreen(scr)) {
      a.muted = false;
      a.volume = INTRO_BGM_VOL;
      if (_bgmUnlocked) {
        const p = a.play();
        if (p && p.catch) p.catch(() => {
          // 제스처 직후 재시도
          later(() => { a.play().catch(() => {}); }, 80);
        });
      }
    } else if (!a.paused) {
      const start = a.volume;
      let i = 0;
      const steps = 10;
      _bgmFadeTimer = setInterval(() => {
        i++;
        a.volume = Math.max(0, start * (1 - i / steps));
        if (i >= steps) {
          clearInterval(_bgmFadeTimer); _bgmFadeTimer = null;
          a.pause(); a.currentTime = 0; a.volume = INTRO_BGM_VOL;
        }
      }, 50);
    }
  }

  /* ---------------- 효과음 (Web Audio · 에셋 불필요) ---------------- */
  let _actx = null;
  function actx(){ try{ if(!_actx) _actx = new (window.AudioContext||window.webkitAudioContext)(); if(_actx.state==='suspended') _actx.resume(); }catch(e){ _actx=null; } return _actx; }
  function beep(freq, dur, type, vol, at){
    const a = actx(); if(!a) return;
    const t = (at!=null ? at : a.currentTime);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type||'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(a.destination);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol||0.12, t+0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t+(dur||0.12));
    o.start(t); o.stop(t+(dur||0.12)+0.02);
  }
  function sfxTick(){ beep(480 + Math.random()*90, 0.05, 'triangle', 0.05); }          // 룰렛 도는 소리
  function sfxFound(){ const a=actx(); if(!a) return; const b=a.currentTime;
    [523.25,659.25,783.99,1046.5].forEach((f,i)=> beep(f,0.22,'sine',0.14, b+i*0.11)); } // 정답/찾았을 때 상승 차임
  function sfxWrong(){ const a=actx(); if(!a) return; const b=a.currentTime;
    // 오답: 하강 톤 + 짧은 buzz
    [392.00, 311.13, 246.94].forEach((f,i)=> beep(f, 0.16, 'triangle', 0.13, b + i * 0.11));
    beep(165, 0.28, 'sawtooth', 0.055, b + 0.30);
  }

  /* ---------------- passage panel ---------------- */
  function passageHTML(scr) {
    const hl = scr.hl || {};
    const focus = (scr.focusWord || '').toLowerCase();
    // <kw> 렌더. focusWord 화면에선 해당 단어만 컬러 강조, 나머지 키워드는 평문 처리.
    const renderKw = (html) => html.replace(/<kw>(.*?)<\/kw>/g, (m, w) => {
      if (focus) return (w.toLowerCase() === focus) ? `<b class="kw kw-focus">${w}</b>` : w;
      return `<b class="kw">${w}</b>`;
    });
    let paras = F.PASSAGE.paras.map((para, pi) => {
      const sents = para.map(s => {
        const cls = ['sent'];
        if (hl[s.id]) cls.push('hl-' + hl[s.id]);
        if (scr.cursor === s.id) cls.push('cursor');
        if (scr.etMode || scr.cursor) cls.push('tappable');
        return `<span class="${cls.join(' ')}" data-id="${s.id}">${renderKw(s.html)}</span>`;
      }).join(' ');
      const listenBtn = scr.listen ? `<button class="listen-btn"><img class="ls-ic" src="${IMG}ui/spk_listen.svg" alt="">Listen</button>` : '';
      return `<p class="ppara">${sents} ${listenBtn}</p>`;
    }).join('');
    return `<div class="passage">
        <div class="passage-scroll">${paras}</div>
      </div>`;
  }

  /* ---------------- chat / activity blocks ---------------- */
  function fcCls(b) {
    if (!b.fc) return '';
    return ` fc-hidden fc-${b.fc}`;
  }
  function interestAttr(b) {
    return b.interest ? ` data-interest="${b.interest}"` : '';
  }
  function blockHTML(b) {
    switch (b.t) {
      case 'label':
        return `<div class="et-label${b.hidden ? ' reveal-hidden' : ''}${b.stage2 ? ' reveal2-hidden' : ''}"${interestAttr(b)}>${b.html}</div>`;
      case 'walkarea':
        return `<div class="walk-area"></div>`;
      case 'lio':
        return `<div class="msg lio ${b.retry ? 'retry' : ''}${b.hidden ? ' reveal-hidden' : ''}${b.stage2 ? ' reveal2-hidden' : ''}${b.afterFly ? ' fly-hidden' : ''}${fcCls(b)}"${interestAttr(b)}>
            <img class="avatar" src="${mascot('lio_face2.png')}" alt="LIO">
            <div class="bubble">${txBlock(b.html, { tts: b.tts, kr: b.kr, krHtml: b.krHtml })}</div>
          </div>`;
      case 'user':
        return `<div class="msg user ${b.side === 'sys' ? 'usys' : ''}${b.hidden ? ' reveal-hidden' : ''}${b.stage2 ? ' reveal2-hidden' : ''}${fcCls(b)}"${interestAttr(b)}>
            <div class="bubble">${stripEmoji(kw(b.html))}</div>
            ${b.side === 'sys' ? '' : `<img class="avatar user-av" src="${IMG}ui/student.png" alt="" onerror="this.removeAttribute('src')">`}
          </div>`;
      case 'sys':
        return `<div class="sysline"><span>${stripEmoji(b.html)}</span></div>`;
      case 'q':
        return `<div class="qbox"><div class="qlabel">QUESTION</div><div class="qtext">${txBlock(b.html, { kr: b.kr, krHtml: b.krHtml })}</div></div>`;
      case 'choices': {
        const variant = b.variant ? ' ' + b.variant : '';
        const grade = b.grade ? ' grade' : '';
        const instant = b.instantGrade ? ' instant-grade' : '';
        const items = b.items.map(it => {
          // 채점/즉시채점 모드: 정오답은 data-state에만 저장(클릭·Check 전까지 숨김)
          const st = (!b.grade && !b.instantGrade && it.state) ? ' ' + it.state : '';
          const ds = it.state ? ` data-state="${it.state}"` : '';
          const badge = b.variant === 'reason' || b.variant === 'multi'
            ? `<span class="cbullet">${it.k}</span>`
            : `<span class="ckey">${it.k}</span>`;
          return `<button class="choice${st}${variant}"${ds}>${badge}<span class="ctext">${txBlock(it.html, { kr: b.kr, krHtml: it.krHtml || it.kr })}</span></button>`;
        }).join('');
        return `<div class="choices${variant}${grade}${instant}${b.hidden ? ' reveal-hidden' : ''}">${items}</div>`;
      }
      case 'menu': {
        const items = b.items.map(it => {
          const ic = it.bImg
            ? `<img class="mi-img" src="${IMG}b_skill/${it.bImg}" alt="">`
            : (LI[it.icon] || it.icon || '');
          return `<button class="menu-item${it.state ? ' ' + it.state : ''}"><span class="mi-ic">${ic}</span><span class="mi-tx">${txBlock(it.html, { kr: b.kr, krHtml: it.krHtml || it.kr })}</span></button>`;
        }).join('');
        return `<div class="menu${b.hidden ? ' reveal-hidden' : ''}">${items}</div>`;
      }
      case 'emoji': {
        // 정답/오답은 data-state에만 저장(미리 색 표시 안 함) → 클릭 시 표시
        const items = b.items.map(it =>
          `<button class="emoji-opt" data-state="${it.state || ''}"><span class="eo-ic">${it.emoji}</span><span class="eo-tx">${txBlock(it.html, { kr: b.kr, krHtml: it.krHtml || it.kr })}</span></button>`
        ).join('');
        return `<div class="emoji-grid${b.reveal ? ' emoji-reveal' : ''}${b.afterFly ? ' fly-hidden' : ''}">${items}</div>`;
      }
      case 'buttons': {
        const items = b.items.map(it => {
          const rev = it.reveal ? ' btn-reveal' : '';
          const chk = it.check ? ' btn-check' : '';
          const act = it.act ? ` data-act="${it.act}"` : '';
          const tst = it.toast ? ` data-toast="${it.toast}"` : '';
          const adv = (it.reveal || it.check || it.act) ? '' : ' data-advance';
          return `<button class="btn ${it.style || 'primary'}${rev}${chk}${btnLong(it.html)}"${adv}${act}${tst}>${stripEmoji(it.html).replace(/▶/g, PLAY)}</button>`;
        }).join('');
        return `<div class="btnrow${b.align === 'end' ? ' end' : ''}${b.nowrap ? ' nowrap' : ''}${b.hidden ? ' reveal-hidden' : ''}${b.stage2 ? ' reveal2-hidden' : ''}"${interestAttr(b)}>${items}</div>`;
      }
      case 'strategy': {
        const items = F.STRATEGY.items.map((it, i) => {
          const ic = it.bImg
            ? `<img class="si-img" src="${IMG}b_skill/${it.bImg}" alt="">`
            : (LI.bulb);
          return `<button type="button" class="strat-item" data-strat="${i}"><span class="si-ic">${ic}</span><span class="si-tx">${it.html}</span></button>`;
        }).join('');
        return `<div class="strategy${b.hidden ? ' reveal-hidden' : ''}"><div class="strat-title">${F.STRATEGY.title}</div>${items}</div>`;
      }
      case 'chip':
        return `<div class="wordchip">${b.html}</div>`;
      case 'note':
        return `<div class="note${b.hidden ? ' reveal-hidden' : ''}${b.stage2 ? ' reveal2-hidden' : ''}">${b.html}</div>`;
      case 'actcard': {
        const ic = b.bImg ? `<img src="${IMG}b_skill/${b.bImg}" alt="">` : (LI[b.icon] || LI.book);
        const sub = b.sub ? `<div class="ac-sub">${b.sub}</div>` : '';
        return `<div class="actcard${b.hidden ? ' reveal-hidden' : ''}${b.stage2 ? ' reveal2-hidden' : ''}${fcCls(b)}">
            <span class="ac-ic">${ic}</span>
            <div class="ac-body"><div class="ac-title">${b.title}</div>${sub}</div>
          </div>`;
      }
      case 'input':
        return `<div class="chatinput${b.hidden ? ' reveal-hidden' : ''}${b.stage2 ? ' reveal2-hidden' : ''}">
            <input type="text" placeholder="${b.placeholder || ''}">
            ${b.send ? `<button class="btn primary btn-send" data-fc-send aria-label="send">${LI.send}</button>` : ''}
            ${b.mic ? `<button class="btn primary btn-send" aria-label="send">${LI.send}</button><button class="btn mic" aria-label="microphone">${LI.mic}</button>` : ''}
            ${b.skip ? `<button class="btn navy btn-fc-skip" data-fc-skip aria-label="skip">Skip</button>` : ''}
          </div>`;
      default:
        return '';
    }
  }

  /* ---------------- layouts ---------------- */
  function layoutReading(scr) {
    const chat = scr.blocks.map(blockHTML).join('');
    const left = scr.passage ? passageHTML(scr) : '';
    return `<div class="reading ${scr.passage ? '' : 'nopassage'} ${scr.freechat ? 'freechat' : ''}">
        ${left}
        <div class="activity"><div class="activity-scroll">${chat}</div></div>
        ${scr.freechat ? `<img class="floating-lio" src="${mascot('lio_face.png')}" alt="">` : ''}
      </div>`;
  }

  // A_Intro_cut2/cut3 : 일러스트 배경 + 순차 말풍선 + TTS
  function layoutIntroSeq(scr) {
    const s = scr.introSeq;
    const bubbles = s.bubbles.map((b, i) =>
      `<div class="ib ib-${b.side}" data-i="${i}"><div class="ib-bubble"><span class="ib-tx">${stripEmoji(kw(b.text))}</span></div></div>`
    ).join('');
    const cta = s.ctaImg
      ? `<button class="introseq-next imgbtn" data-advance style="display:none"><img src="${IMG + s.ctaImg}" alt="${s.cta || ''}"></button>`
      : (s.cta
        ? `<button class="btn primary introseq-next" data-advance style="display:none">${s.cta}</button>`
        : '');
    return `<div class="introseq ${s.fadeIn ? 'fadein' : ''}" style="background-image:url('${IMG + s.image}')">
        <div class="introseq-scrim"></div>
        ${s.mascot ? `<img class="introseq-lio" src="${IMG + s.mascot}" alt="LIO">` : ''}
        <div class="ib-layer">${bubbles}</div>
        ${cta}
      </div>`;
  }

  function layoutCenter(scr) {
    const msg = scr.message.map(m => `<p>${stripEmoji(kw(m))}</p>`).join('');
    const btns = (scr.buttons || []).map(b => `<button class="btn ${b.style}${btnLong(b.html)}" data-advance>${stripEmoji(b.html).replace(/▶/g, PLAY)}</button>`).join('');
    return `<div class="center">
        <img class="center-mascot ${scr.mascotBig ? 'big' : ''}" src="${mascot(scr.mascot)}" alt="LIO">
        <div class="msgcard">${msg}</div>
        <div class="btnrow center">${btns}</div>
      </div>`;
  }

  function layoutSkill(scr) {
    const pick = !!(scr && scr.skillPick);
    const cards = F.SKILLS.map((s, i) =>
      `<div class="skill-card ${s.today && !pick ? 'today' : ''}${pick ? ' pickable' : ''}" data-skill="${i}" style="--sc:${s.color}">
         <div class="sc-icon"><img src="${skillIcon(s)}" alt=""></div>
         <div class="sc-name">${skillNameHtml(s)}</div>
       </div>`).join('');
    const guide = pick
      ? `<div class="skill-pick-guide msg lio">
           <img class="avatar" src="${mascot('lio_face2.png')}" alt="LIO">
           <div class="bubble">${kw(scr.lioLine || '')}</div>
         </div>`
      : '';
    const finish = pick
      ? `<button type="button" class="btn navy skill-pick-finish" data-act="finishSession">FINISH!</button>`
      : '';
    // Design A : Figma A_Skill_list (제목 상단 중앙 + 5열 그리드 + 라이온 좌하단, 풀블리드 골드)
    if (THEME === 'A') {
      return `<div class="skillscreen a-skill${pick ? ' skill-pick' : ''}">
          ${guide}
          <div class="skill-headline">Let's find your skill!</div>
          <div class="skill-grid">${cards}</div>
          <img class="skill-mascot" src="${mascot('lio2.png')}" alt="LIO">
          ${finish}
        </div>`;
    }
    return `<div class="skillscreen${pick ? ' skill-pick' : ''}">
        ${guide}
        <div class="skill-left">
          <img class="skill-mascot" src="${mascot('lio2.png')}" alt="LIO">
          <div class="think-bubble" aria-hidden="true"></div>
          <div class="skill-headline">Let's find<br><span class="skill-headline-l2">your skill!</span></div>
        </div>
        <div class="skill-grid">${cards}</div>
        ${finish}
      </div>`;
  }

  // Design A : A_Skill_selected — 선택된 스킬 확대 + 나머지 흐림 + 라이온이 가리킴
  function layoutSkillSelected() {
    const today = F.SKILLS.find(s => s.today) || F.SKILLS[0];
    const faded = F.SKILLS.map(s =>
      `<div class="skill-card"><div class="sc-icon"><img src="${skillIcon(s)}" alt=""></div></div>`).join('');
    return `<div class="skillscreen a-skill selected">
        <div class="skill-headline">I found your skills!</div>
        <div class="skill-grid dim">${faded}</div>
        <img class="skillsel-mascot" src="${mascot('lio6.png')}" alt="LIO">
        <div class="skillsel-halo"><span class="rays"></span><span class="glow"></span></div>
        <div class="skillsel-card"><img src="${skillIcon(today)}" alt="${today.name}"></div>
      </div>`;
  }

  function layoutTopic(scr) {
    const cards = F.TOPICS.map((t, i) =>
      `<div class="topic-card" data-topic="${i}" style="--tc:${t.color};--tc-from:${t.from || t.color};--tc-to:${t.to || t.color}">
         <div class="tc-img" style="--tc-img:url('${IMG + t.img}')"></div>
         <div class="tc-name">${t.name}</div>
         <div class="tc-check">✓</div>
       </div>`).join('');
    return `<div class="topicscreen">
        <div class="topic-lio"><img src="${mascot(scr.mascot || 'lio_face.png')}" alt="LIO"><div class="topic-line">${kw(scr.lioLine)}</div></div>
        <div class="topic-grid">${cards}</div>
        <button class="btn primary continue-btn" disabled data-advance aria-label="Continue">Continue</button>
      </div>`;
  }

  function layoutGame(scr) {
    // Design A : A_Game_active — 풀 게임 일러스트 + Let's go
    if (THEME === 'A' && scr.gameImage) {
      return `<div class="gamescreen a-game">
          <img class="game-illust" src="${IMG + scr.gameImage}" alt="Game">
          <div class="game-cta">${scr.gameCtaImg
            ? `<button class="imgbtn" data-advance><img src="${IMG + scr.gameCtaImg}" alt=""></button>`
            : `<button class="btn primary" data-advance>${scr.gameCta || "Let's go! ▶"}</button>`}</div>
        </div>`;
    }
    // Design B : 게임 썸네일 풀블리드만 (헤더·UI 없음, 탭하면 다음)
    if (THEME === 'B') {
      const src = IMG + (scr.gameImageB || 'b/game_bg.jpg');
      return `<div class="gamescreen b-game" data-advance role="button" tabindex="0" aria-label="Continue">
          <img class="game-illust" src="${src}" alt="Game">
        </div>`;
    }
    const trans = scr.transition.map(m => `<p>${stripEmoji(kw(m))}</p>`).join('');
    return `<div class="gamescreen">
        <div class="game-board">
          <div class="game-head"><div class="game-title">${scr.gameTitle}</div><div class="game-round">${scr.gameRound}</div></div>
          <div class="puzzle">
            ${Array.from({length:9}).map((_,i)=>`<div class="pcell ${i<5?'filled':''}"></div>`).join('')}
          </div>
          <div class="game-hint">🧩 Drag the pieces to build the picture!</div>
        </div>
        <div class="game-transition">
          <img class="gt-mascot" src="${mascot('lio6.png')}" alt="LIO">
          <div class="msgcard">${trans}</div>
          <div class="btnrow"><button class="btn primary" data-advance>Let's go! ▶</button></div>
        </div>
      </div>`;
  }

  function layoutWordpeek(scr) {
    const kws = F.KEYWORDS.map((k, i) =>
      `<div class="wpcard ${i%2? 'alt':''}" data-flip>
         <div class="wp-inner">
           <div class="wp-front">${k.w}</div>
           <div class="wp-back">
             <div class="wp-w">${k.w}</div>
             <div class="wp-def">${k.def}</div>
             <div class="wp-ex">📖 ${k.ex}</div>
             <div class="wp-kr">${k.kr}</div>
           </div>
         </div>
       </div>`).join('');
    const done = (scr.doneLio||[]).map(d=>`<div class="msg lio"><img class="avatar" src="${mascot('lio_face2.png')}"><div class="bubble">${d} ${KR}</div></div>`).join('');
    const btns = (scr.buttons||[]).map(b=>`<button class="btn ${b.style}" ${b.style==='dark'?'data-advance':''}>${stripEmoji(b.html).replace(/▶/g, PLAY)}</button>`).join('');
    return `<div class="wordpeek">
        <div class="wp-lio"><img src="${mascot('lio_face2.png')}" alt="LIO"><div class="wp-line">${scr.lioLine} ${KR}</div></div>
        <div class="wp-grid ${scr.variant==='findflip'?'findflip':''}">${kws}</div>
        <div class="wp-done">${done}</div>
        <div class="btnrow center">${btns}</div>
      </div>`;
  }

  // 공통 : LIO 말풍선 1줄 (동적 화면용) — 🔊는 클릭 가능한 TTS 아이콘으로 대체
  function lioBubble(html) {
    const clean = String(html).replace(/🔊/g, '').replace(/\s+/g, ' ').trim();
    return `<div class="msg lio"><img class="avatar" src="${mascot('lio_face2.png')}" alt="LIO"><div class="bubble">${txBlock(clean, { tts:true, kr:true })}</div></div>`;
  }

  /* ── Teach : Word Peek (PPTX 21) / Find & Flip 공통 — 지문 좌 / 우측 카드6 + 단어설명카드 ── */
  function layoutTeach(scr) {
    const cards = F.KEYWORDS.map((k, i) =>
      `<button class="tcard" data-w="${k.w}" data-i="${i}">
         <span class="tc-emoji">${k.emoji || ''}</span>
         <span class="tc-w">${k.w}</span>
         <span class="tc-done">✓</span>
       </button>`).join('');
    return `<div class="teach reading">
        ${passageHTML(scr)}
        <div class="activity"><div class="activity-scroll">
          ${scr.intro ? lioBubble(scr.intro) : ''}
          ${scr.label ? `<div class="et-label">${scr.label}</div>` : ''}
          ${lioBubble(scr.lioLine)}
          <div class="tcard-grid">${cards}</div>
          <div class="teach-def"></div>
          <div class="teach-done"></div>
        </div></div>
      </div>`;
  }

  // 게임 선택 탭 (Memory Match / Definition Detective)
  function gamePick(active) {
    return `<div class="game-pick">
        <button class="gp-btn ${active === 'memory' ? 'active' : ''}" data-game="memory">Memory Match</button>
        <button class="gp-btn ${active === 'detective' ? 'active' : ''}" data-game="detective">Definition Detective</button>
      </div>`;
  }

  /* ── Game 1 : Memory Match (PPTX 22) ── 지문 좌 / 우측 대화창에서 게임 */
  function layoutMemory(scr) {
    return `<div class="memory reading">
        ${passageHTML(scr)}
        <div class="activity"><div class="activity-scroll">
          ${lioBubble(scr.lioLine)}
          ${gamePick('memory')}
          <div class="mem-bar">
            <span class="mem-pairs">Pairs <b class="mem-n">0</b> / ${F.KEYWORDS.length}</span>
            <button class="mem-hint">Hint (<b class="hint-n">3</b>)</button>
          </div>
          <div class="mem-grid"></div>
          <div class="mem-done"></div>
        </div></div>
      </div>`;
  }

  /* ── Game 2 : Definition Detective (PPTX 23) ── 지문 좌 / 우측 대화창에서 게임 */
  function layoutDetective(scr) {
    return `<div class="detective reading">
        ${passageHTML(scr)}
        <div class="activity"><div class="activity-scroll">
          ${lioBubble(scr.lioLine)}
          ${gamePick('detective')}
          <div class="det-body"></div>
        </div></div>
      </div>`;
  }

  /* ── Explore Words (PPTX 24) ── 지문 자유 탐색 */
  function explorePassageHTML() {
    const extras = F.EXPLORE_EXTRA.map(e => e.w);
    const renderKw = (html) => html.replace(/<kw>(.*?)<\/kw>/g, (m, w) => `<b class="kw kwbox" data-w="${w.toLowerCase()}">${w}</b>`);
    const wrapExtra = (html) => {
      let out = html;
      extras.forEach(w => { out = out.replace(new RegExp('\\b(' + w + ')\\b'), `<span class="xword" data-w="${w}">$1</span>`); });
      return out;
    };
    const paras = F.PASSAGE.paras.map(para => {
      const sents = para.map(s => `<span class="sent">${wrapExtra(renderKw(s.html))}</span>`).join(' ');
      return `<p class="ppara">${sents}</p>`;
    }).join('');
    return `<div class="passage"><div class="passage-scroll">${paras}</div></div>`;
  }
  function layoutExplore(scr) {
    const done = (scr.doneLio || []).map(d => lioBubble(d)).join('');
    const btns = (scr.buttons || [{ html:'Go to Skill Practice ▶', style:'primary' }])
      .map(b => `<button class="btn ${b.style || 'primary'}${btnLong(b.html)}" ${b.hint ? '' : 'data-advance'}>${stripEmoji(b.html).replace(/▶/g, PLAY)}</button>`).join('');
    return `<div class="explore reading">
        ${explorePassageHTML()}
        <div class="activity"><div class="activity-scroll">
          ${lioBubble(scr.lioLine)}
          <div class="explore-list"></div>
          ${done ? `<div class="explore-done reveal-hidden">${done}</div>` : ''}
          <div class="btnrow">${btns}</div>
        </div></div>
      </div>`;
  }

  /* ── Find & Flip : 본문 단어 탭 → 카드 flip + Teach형 설명 패널(뜻·예문·Got it/Not sure) ── */
  function layoutFindFlip(scr) {
    const cards = F.KEYWORDS.map((k) =>
      `<div class="ffcard" data-w="${k.w.toLowerCase()}">
         <div class="ff-inner">
           <span class="ff-face ff-front"><span class="ff-emo">${k.emoji || ''}</span><b>${k.w}</b></span>
           <span class="ff-face ff-back"><span class="ff-emo">${k.emoji || ''}</span><b>✓ ${k.w}</b></span>
         </div>
       </div>`).join('');
    const done = (scr.doneLio || []).map(d => lioBubble(d)).join('');
    const btns = (scr.buttons || []).map(b =>
      `<button class="btn ${b.style || 'primary'}${btnLong(b.html)}" ${b.hint ? '' : 'data-advance'}>${stripEmoji(b.html).replace(/▶/g, PLAY)}</button>`).join('');
    return `<div class="findflip reading">
        ${explorePassageHTML()}
        <div class="activity"><div class="activity-scroll">
          ${scr.intro ? lioBubble(scr.intro) : ''}
          ${scr.label ? `<div class="et-label">${scr.label}</div>` : ''}
          ${lioBubble(scr.lioLine)}
          <div class="ff-grid">${cards}</div>
          <div class="teach-def ff-defbox"></div>
          ${done ? `<div class="explore-done reveal-hidden">${done}</div>` : ''}
          <div class="btnrow">${btns}</div>
        </div></div>
      </div>`;
  }

  function layoutQuickexit(scr) {
    const bg = scr.bg ? ` style="background-image:url('${IMG + scr.bg}')"` : '';
    // Slide 7(introSeq)과 동일: ib-left / ib-right + SVG 꼬리
    let bubbles = scr.qeSeq;
    if ((!bubbles || !bubbles.length) && scr.question) {
      bubbles = [{ side:'left', html:scr.question }];
    }
    let mid = '';
    if (bubbles && bubbles.length) {
      mid = `<div class="ib-layer">${bubbles.map((b, i) => {
        const side = b.side || (i % 2 === 0 ? 'left' : 'right');
        return `<div class="ib ib-${side}" data-qe-i="${i}"><div class="ib-bubble"><span class="ib-tx">${kw(b.html || b.text || '')}</span></div></div>`;
      }).join('')}</div>`;
    }
    const waitSeq = !!(scr.qeSeq && scr.qeSeq.length);
    let bottom = '';
    if (scr.actions && scr.actions.length) {
      const btns = scr.actions.map(a => {
        if (a.img) {
          return `<button type="button" class="imgbtn qe-imgbtn" data-act="${a.act || ''}" aria-label="${stripEmoji(a.html || '')}"><img src="${IMG + a.img}" alt="${stripEmoji(a.html || '')}"></button>`;
        }
        const label = stripEmoji(a.html).replace(/▶/g, PLAY);
        const chev = a.chevron
          ? `<img class="btn-chev" src="${IMG}ui/btn_chevron.svg" alt="" width="24" height="24">`
          : '';
        return `<button type="button" class="btn ${a.style || 'primary'}${btnLong(a.html)}" data-act="${a.act || ''}"><span>${label}</span>${chev}</button>`;
      }).join('');
      bottom = `<div class="qe-actions${waitSeq ? ' qe-bottom-hidden' : ''}">${btns}</div>`;
    } else if (scr.cards && scr.cards.length) {
      const cards = scr.cards.map(c =>
        `<div class="qe-card ${c.tone || ''}" ${c.go ? `data-go="${c.go}"` : 'data-advance'}>
           <div class="qe-title">${c.title}</div>
           ${c.sub ? `<div class="qe-sub">${c.sub}</div>` : ''}
         </div>`).join('');
      bottom = `<div class="qe-cards${waitSeq ? ' qe-bottom-hidden' : ''}">${cards}</div>`;
    }
    return `<div class="quickexit${scr.bg ? ' has-bg' : ''}"${bg}>
        ${scr.bg ? '<div class="qe-scrim"></div>' : ''}
        ${scr.banner ? `<div class="qe-banner">${scr.banner}</div>` : ''}
        ${mid}
        ${bottom}
      </div>`;
  }

  function layoutSplash() {
    // 인트로 영상(A_Intro_cut1 = intro_a.mp4)이 지정되면 영상 재생
    const vid = window.LIO_SPLASH_VIDEO;
    if (vid) {
      const poster = window.LIO_SPLASH_POSTER ? ` poster="${window.LIO_SPLASH_POSTER}"` : '';
      return `<div class="splash video">
          <video class="splash-video" src="${vid}"${poster} playsinline preload="auto"></video>
          <button class="splash-play" aria-label="play">▶</button>
        </div>`;
    }
    return `<div class="splash">
        <div class="splash-inner">
          <img class="splash-mascot" src="${mascot('lio2.png')}" alt="LIO">
          <div class="splash-logo">
            <span class="sl-lio">Lio</span>
            <span class="sl-sub">SKILL CORE</span>
          </div>
        </div>
        <div class="splash-tap">Tap to start ▶</div>
      </div>`;
  }

  /* ---------------- header ---------------- */
  function headerHTML(scr) {
    if (scr.layout === 'splash') return '';
    // Design B 게임 화면은 썸네일 풀블리드 — 헤더 없음
    if (THEME === 'B' && scr.layout === 'game') return '';
    return `<header class="hd">
        <div class="hd-brand">
          <img class="hd-logo-img" src="${IMG}intro_logo.png" alt="LIO Skill Core">
          <span class="hd-logo-text">Lio<b class="sp">✦</b></span>
        </div>
        <span class="hd-pill">STEP 2 Skill Core</span>
        <span class="hd-divider"></span>
        <span class="hd-skill">Determining Main Ideas</span>
        <span class="hd-title">${scr.section || ''}</span>
      </header>`;
  }

  function bottomNav() {
    return `<div class="bottom-nav"><span class="bn active">⌂</span><span class="bn">▦</span><span class="bn">★</span><span class="bn">⚙</span></div>`;
  }

  /* ---------------- render ---------------- */
  function renderScreen() {
    clearTimers(); stopSpeak();   // 이전 화면의 대기 타이머/음성 모두 취소
    document.querySelectorAll('.kw-fly, .particle-layer, .word-popup, .mem-peek').forEach(el => el.remove());   // 이전 화면 잔여 연출 제거
    const scr = SCREENS[idx];
    const stage = document.getElementById('stage');
    let body = '';
    switch (scr.layout) {
      case 'splash':    body = layoutSplash(scr); break;
      case 'center':    body = scr.introSeq ? layoutIntroSeq(scr) : layoutCenter(scr); break;
      case 'skill':     body = scr.skillSelected ? layoutSkillSelected() : layoutSkill(scr); break;
      case 'topic':     body = layoutTopic(scr); break;
      case 'game':      body = layoutGame(scr); break;
      case 'wordpeek':  body = layoutWordpeek(scr); break;
      case 'teach':     body = layoutTeach(scr); break;
      case 'memory':    body = layoutMemory(scr); break;
      case 'detective': body = layoutDetective(scr); break;
      case 'explore':   body = layoutExplore(scr); break;
      case 'findflip':  body = layoutFindFlip(scr); break;
      case 'quickexit': body = layoutQuickexit(scr); break;
      default:          body = layoutReading(scr);
    }
    const showNav = (scr.layout === 'topic'); // Figma B 하단 pill 네비 (토픽 화면 등)
    stage.innerHTML = `<div class="device layout-${scr.layout} scr-${scr.id} section-${(scr.section||'').split(' ')[0]||'none'}">
        ${headerHTML(scr)}
        <div class="screen">${body}</div>
        ${showNav ? bottomNav() : ''}
        ${scr.confetti ? '<div class="confetti"></div>' : ''}
      </div>`;

    wire(scr);
    updateChrome(scr);
    syncIntroBgm(scr);
    // 정답 축하 파티클: 연출 후 DOM에서 제거 (상시 배경처럼 남지 않도록)
    if (scr.confetti) {
      const conf = stage.querySelector('.confetti');
      if (conf) later(() => { if (conf.isConnected) conf.remove(); }, 1700);
    }
  }

  function updateChrome(scr) {
    const maxSlide = SCREENS.reduce((m, s) => Math.max(m, s.slide || 0), 0);
    document.getElementById('nav-slide').textContent = 'Slide ' + scr.slide + ' / ' + maxSlide;
    // 하단 캡션 = PPTX TITLE 원문. 같은 슬라이드를 쪼갠 화면은 cut 라벨을 흐리게 덧붙인다.
    const nt = document.getElementById('nav-title');
    nt.textContent = scr.title || '';
    if (scr.cut) {
      const cut = document.createElement('span');
      cut.className = 'ct-cut';
      cut.textContent = scr.cut;
      nt.appendChild(cut);
    }
    document.getElementById('btn-prev').disabled = (idx === 0);
    document.getElementById('btn-next').disabled = (idx === SCREENS.length - 1);
    // spec panel
    const sp = document.getElementById('spec-list');
    sp.innerHTML = (scr.spec || []).map((s,i)=>`<li><span class="spn">${i+1}</span>${s}</li>`).join('');
    document.getElementById('spec-slide').textContent = scr.title || ('Slide ' + scr.slide);
  }

  /* ---------------- KR 토글 (모듈 공용) ---------------- */
  function toggleKrBtn(btn) {
    const host = btn.closest('.bubble, .qtext, .ctext, .mi-tx, .eo-tx, .wp-line, .choice, .menu-item, .emoji-opt, .tx-host');
    if (!host) return;
    const root = host.querySelector('.tx'); if (!root) return;
    const en = root.querySelector('.tx-en'), kr = root.querySelector('.tx-kr');
    if (!en || !kr) return;
    const toKr = kr.hasAttribute('hidden');
    if (toKr) { en.setAttribute('hidden', ''); kr.removeAttribute('hidden'); }
    else { kr.setAttribute('hidden', ''); en.removeAttribute('hidden'); }
    btn.classList.toggle('on', toKr);
    btn.textContent = toKr ? 'EN' : 'KR';   // 한국어 표시 중엔 버튼이 EN
    btn.setAttribute('aria-pressed', toKr ? 'true' : 'false');
  }
  function bindKr(root) {
    root.querySelectorAll('.kr').forEach(btn => {
      if (btn._krBound) return; btn._krBound = true;
      btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleKrBtn(btn); });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleKrBtn(btn); }
      });
    });
  }

  // 안내 토스트 : 단어설명 모달팝업 스타일로 잠깐 떴다 사라짐 (anchor 요소 중앙 근처)
  function showToast(msg, anchor) {
    const t = document.createElement('div');
    t.className = 'mem-peek toast';
    t.textContent = msg;
    document.body.appendChild(t);
    const place = () => {
      const el = (anchor && anchor.isConnected) ? anchor : (document.querySelector('#stage .activity-scroll') || document.body);
      const r = el.getBoundingClientRect();
      t.style.left = (r.left + r.width / 2) + 'px';
      t.style.top = (r.top + Math.min(r.height / 2, 90)) + 'px';
    };
    place();
    requestAnimationFrame(() => { place(); t.classList.add('show'); });
    later(() => { t.classList.remove('show'); later(() => { if (t.isConnected) t.remove(); }, 300); }, 2400);
  }

  /* ---------------- interactions ---------------- */
  function wire(scr) {
    const stage = document.getElementById('stage');

    // advance buttons
    stage.querySelectorAll('[data-advance]').forEach(b =>
      b.addEventListener('click', () => { if (!b.disabled) goNext(); }));

    // splash : ▶/탭 → 소리와 함께 처음부터 재생 → 종료 시 페이드아웃 (재생 중 탭 = 스킵)
    if (scr.layout === 'splash') {
      const sp = stage.querySelector('.splash');
      const v = stage.querySelector('.splash-video');
      if (v) {
        const playBtn = stage.querySelector('.splash-play');
        let started = false;
        const startVid = () => {
          unlockBgm();
          if (started) { fadeAdvance(); return; }   // 이미 재생 중이면 스킵
          started = true;
          if (playBtn) playBtn.style.display = 'none';
          v.muted = false; v.currentTime = 0;
          const p = v.play();
          if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(() => {}); }); // 음소거 폴백
        };
        v.addEventListener('ended', () => fadeAdvance());
        sp.addEventListener('click', startVid);
      } else {
        sp.addEventListener('click', () => { unlockBgm(); goNext(); });
      }
    }

    // 인트로 시퀀스 : 말풍선 1개씩 등장 + TTS → 다음 말풍선 → (마지막 후 CTA)
    if (scr.introSeq) {
      runIntroSeq(scr);
      // CTA 버튼 외 클릭은 화면 스킵하지 않음 (말풍선 순차 재생 유지)
    }

    // Quick Exit / Session end : 말풍선 순차 등장 후 버튼 표출
    if (scr.qeSeq) runQeSeq(scr);

    // A 스킬 룰렛 : 카드가 돌다 오늘 스킬에서 멈춤 → 선택완료 화면으로 자동 전환
    if (THEME === 'A' && scr.layout === 'skill' && !scr.skillSelected && !scr.skillPick) runSkillRoulette();

    // B 스킬 선택 : 카드를 직접 탭하면 Figma B_Skill_selected 상태로 전환
    // (A 는 룰렛으로 자동 진행하므로 이 분기에 들어오지 않는다 — THEME 가드로 완전 분리)
    if (THEME === 'B' && scr.layout === 'skill' && !scr.skillSelected && !scr.skillPick) {
      buildSkillLanesB();   // 컬럼 단위 세로 무한 스크롤
      bindSkillPickB();
    }

    // Word Check : 우측 chip은 처음엔 숨기고, 왼쪽 단어가 날아가 박힐 때 나타남
    if (scr.focusWord) {
      const chip0 = stage.querySelector('.wordchip');
      if (chip0) chip0.style.visibility = 'hidden';
      later(runWordFocusFly, 550);
    }

    // choices : 채점 전 선택 토글 (multi=복수, 그 외=단일선택). 이미 채점(correct/wrong)된 건 잠금.
    // instant-grade : 클릭 즉시 채점 + 정답 시 전체 confetti
    stage.querySelectorAll('.choice').forEach(c => {
      c.addEventListener('click', () => {
        if (c.classList.contains('correct') || c.classList.contains('wrong')) return;
        const grp = c.closest('.choices');
        if (grp && grp.classList.contains('instant-grade')) {
          if (grp.dataset.graded) return;
          grp.dataset.graded = '1';
          const isCorrect = c.dataset.state === 'correct';
          grp.querySelectorAll('.choice').forEach(o => {
            o.classList.remove('sel');
            if (o.dataset.state === 'correct') o.classList.add('correct');
            else if (o === c) o.classList.add('wrong');
          });
          if (isCorrect) { sfxFound(); spawnConfetti(); }
          else sfxWrong();
          return;
        }
        const multi = grp && (grp.classList.contains('multi') || grp.classList.contains('reason'));
        if (grp && !multi) grp.querySelectorAll('.choice.sel').forEach(o => { if (o !== c) o.classList.remove('sel'); });
        c.classList.toggle('sel');
      });
    });

    // Check 버튼 : 선택 채점 → 정답 모두 표시 + 선택한 오답 빨강 + 피드백/Next 표출
    stage.querySelectorAll('.btn-check').forEach(btn => btn.addEventListener('click', () => {
      const grp = stage.querySelector('.choices.grade');
      if (!grp || grp.dataset.graded) return;
      grp.dataset.graded = '1';
      let anyWrong = false;
      grp.querySelectorAll('.choice').forEach(c => {
        const isCorrect = c.dataset.state === 'correct';
        const sel = c.classList.contains('sel');
        c.classList.remove('sel');
        if (isCorrect) c.classList.add('correct');
        else if (sel) { c.classList.add('wrong'); anyWrong = true; }
      });
      if (!anyWrong) sfxFound();
      else sfxWrong();
      stage.querySelectorAll('.reveal-hidden').forEach(el => el.classList.remove('reveal-hidden'));
      const row = btn.closest('.btnrow'); if (row) row.style.display = 'none';
    }));

    // topic selection (max 2)
    const tcards = stage.querySelectorAll('.topic-card');
    const cont = stage.querySelector('.continue-btn');
    tcards.forEach(card => card.addEventListener('click', () => {
      const sel = [...tcards].filter(t => t.classList.contains('on'));
      if (!card.classList.contains('on') && sel.length >= 2) sel[0].classList.remove('on');
      card.classList.toggle('on');
      const n = stage.querySelectorAll('.topic-card.on').length;
      if (cont) cont.disabled = (n < 2);
    }));

    // word peek flip
    stage.querySelectorAll('[data-flip]').forEach(w =>
      w.addEventListener('click', () => w.classList.toggle('flipped')));

    // passage sentence tap (evidence)
    stage.querySelectorAll('.sent.tappable').forEach(s =>
      s.addEventListener('click', () => s.classList.toggle('tapped')));

    // Listen ↔ Stop 토글 : 재생 중엔 Stop, 끝나면/누르면 다시 Listen (기획서 스펙)
    const setListen = (b) => { b.classList.remove('playing'); b.innerHTML = `<img class="ls-ic" src="${IMG}ui/spk_listen.svg" alt="">Listen`; };
    const setStop   = (b) => { b.classList.add('playing');    b.innerHTML = `<span class="ls-stop"></span>Stop`; };
    stage.querySelectorAll('.listen-btn').forEach(btn =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.classList.contains('playing')) { stopSpeak(); setListen(btn); return; }
        const para = btn.closest('.ppara'); if (!para) return;
        stage.querySelectorAll('.listen-btn.playing').forEach(setListen);
        const txt = para.textContent.replace(/\s*(Listen|Stop)\s*/g, ' ').trim();
        setStop(btn);
        speak(txt, null, () => setListen(btn));
      }));

    // 말풍선/질문/보기의 스피커 아이콘 탭 → 해당 문장 TTS
    stage.querySelectorAll('.tts-ic').forEach(ic =>
      ic.addEventListener('click', (e) => {
        e.stopPropagation();
        const host = ic.closest('.bubble, .qtext, .choice, .wp-word'); if (!host) return;
        const en = host.querySelector('.tx-en');
        const shown = host.querySelector('.tx-kr:not([hidden])') || en;
        const txt = (shown ? shown.textContent : host.textContent).replace(/\s*KR\s*/g, ' ').trim();
        speak(txt, null, () => {});
      }));

    // KR 버튼 → 해당 문장 영어↔한국어 토글 (동적 삽입 콘텐츠는 각 wire에서 bindKr 재호출)
    bindKr(stage);

    // Next(reveal) 버튼 → 숨겨둔 STRATEGY 박스 표출 (기획서: Next 탭 → strategy cue)
    stage.querySelectorAll('.btn-reveal').forEach(btn =>
      btn.addEventListener('click', () => {
        const hids = [...stage.querySelectorAll('.reveal-hidden, .reveal2-hidden')];
        hids.forEach(el => el.classList.remove('reveal-hidden', 'reveal2-hidden'));
        if (hids.length) hids[hids.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const row = btn.closest('.btnrow'); if (row) row.style.display = 'none';
      }));

    // 마이크 버튼 : 누르면 녹음(발화) 상태 토글 → 빨간 버튼 + 음파 리플
    // (Free Chat처럼 나중에 생기는 mic도 동작하도록 위임)
    stage.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn.mic');
      if (!btn || !stage.contains(btn)) return;
      btn.classList.toggle('recording');
    });

    // "Yes" 옵션(data-act=yes) : 숨겨둔 입력/안내 표출 + (있으면) 안내 토스트 · Y/N 버튼줄 숨김
    stage.querySelectorAll('[data-act="yes"]').forEach(b => b.addEventListener('click', () => {
      stage.querySelectorAll('.reveal-hidden').forEach(el => el.classList.remove('reveal-hidden'));
      const row = b.closest('.btnrow'); if (row) row.style.display = 'none';
      if (b.dataset.toast) showToast(b.dataset.toast, stage.querySelector('.chatinput'));
      // Interest "tell more" — show more/next after send
      if (scr.id === 'interest') {
        stage.querySelectorAll('[data-interest="more"], [data-interest="next"]').forEach(el => el.classList.remove('reveal-hidden'));
      }
    }));

    // Interest Probe: Yes / No → 해당 멘트 + Start Skill Practice
    stage.querySelectorAll('[data-act="interestYes"], [data-act="interestNo"]').forEach(b => b.addEventListener('click', () => {
      const kind = b.dataset.act === 'interestYes' ? 'yes' : 'no';
      const row = b.closest('.btnrow'); if (row) row.style.display = 'none';
      stage.querySelectorAll(`[data-interest="${kind}"], [data-interest="next"]`).forEach(el => el.classList.remove('reveal-hidden'));
      sfxFound();
    }));

    // Quick Exit 카드 분기
    stage.querySelectorAll('.qe-card[data-go]').forEach(card => card.addEventListener('click', () => {
      const id = card.dataset.go;
      const i = SCREENS.findIndex(x => x.id === id);
      if (i >= 0) goTo(i);
      else goNext();
    }));

    // Something else / Interest: Send → 샘플 답변 표출
    stage.querySelectorAll('.chatinput .btn-send:not([data-fc-send])').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.chatinput');
        if (wrap) wrap.style.display = 'none';
        stage.querySelectorAll('.reveal-hidden').forEach(el => el.classList.remove('reveal-hidden'));
        if (scr.id === 'interest') {
          stage.querySelectorAll('[data-interest="more"], [data-interest="next"]').forEach(el => el.classList.remove('reveal-hidden'));
        }
        sfxFound();
      });
    });
    stage.querySelectorAll('.chatinput input').forEach(inp => {
      if (scr.freechat) return;
      inp.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const send = inp.closest('.chatinput')?.querySelector('.btn-send:not([data-fc-send])');
        if (send) send.click();
      });
    });

    // Retry 후 "I'm done!" → 학습 종료 멘트 표출
    stage.querySelectorAll('[data-act="sessionEnd"]').forEach(b => b.addEventListener('click', () => {
      stage.querySelectorAll('.reveal-hidden').forEach(el => el.classList.remove('reveal-hidden'));
      const row = b.closest('.btnrow'); if (row) row.style.display = 'none';
      sfxFound();
    }));

    // Pilot Skill Pick / Session: Finish → 세션 종료 안내
    stage.querySelectorAll('[data-act="finishSession"]').forEach(b => b.addEventListener('click', () => {
      showToast('Session finished. See you next time!', b);
      b.disabled = true;
      sfxFound();
    }));

    // Another skill → Skill Intro (PPTX 7)
    stage.querySelectorAll('[data-act="goSkill"]').forEach(b => b.addEventListener('click', () => {
      const i = SCREENS.findIndex(x => x.id === 'skill');
      if (i >= 0) goTo(i);
    }));

    // Pilot Skill Pick: 스킬 카드 선택
    if (scr.skillPick) {
      stage.querySelectorAll('.skill-card.pickable').forEach(card => {
        card.addEventListener('click', () => {
          stage.querySelectorAll('.skill-card.pickable').forEach(c => c.classList.remove('on', 'today'));
          card.classList.add('on', 'today');
          sfxTick();
        });
      });
    }

    // Word Check: 답(이모지) 선택 → 피드백·Next 표출 (기획서: 답 선택 후 Next 생성)
    stage.querySelectorAll('.emoji-reveal .emoji-opt').forEach(op =>
      op.addEventListener('click', () => {
        const grid = op.closest('.emoji-reveal');
        if (!grid || grid.classList.contains('answered')) return;   // 한 번만 채점
        grid.classList.add('answered');
        const correct = op.dataset.state === 'correct';
        op.classList.add(correct ? 'correct' : 'wrong');            // 클릭한 것 정/오답 표시
        if (!correct) { const cor = grid.querySelector('.emoji-opt[data-state="correct"]'); if (cor) cor.classList.add('correct'); }
        stage.querySelectorAll('.reveal-hidden').forEach(el => el.classList.remove('reveal-hidden'));   // 피드백·Next 표출
        if (correct) {                                              // 정답 → 파티클 + 효과음
          const r = op.getBoundingClientRect();
          burstParticles(r.left + r.width / 2, r.top + r.height / 2);
          sfxFound();
        } else {
          sfxWrong();
        }
      }));

    // 지문 핵심단어 탭 → 하단 어휘 카드 팝업 (기획서 스펙) — explore/teach/findflip/clarify는 자체 핸들러 사용
    if (scr.layout !== 'explore' && scr.layout !== 'teach' && scr.layout !== 'findflip' && !scr.clarify)
      stage.querySelectorAll('.passage .kw').forEach(el =>
        el.addEventListener('click', (e) => { e.stopPropagation(); showWordPopup(el.textContent.trim()); }));

    // menu items → advance
    stage.querySelectorAll('.menu-item').forEach(m =>
      m.addEventListener('click', () => { if (!m.classList.contains('sel')) goNext(); }));

    // strategy 항목 → 하나 선택 후 다음 화면
    stage.querySelectorAll('.strat-item').forEach(btn =>
      btn.addEventListener('click', () => {
        stage.querySelectorAll('.strat-item').forEach(b => b.classList.remove('on', 'sel'));
        btn.classList.add('on', 'sel');
        later(goNext, 320);
      }));

    // Teach / Game / Explore 화면 인터랙션
    if (scr.layout === 'teach')     wireTeach(scr);
    if (scr.layout === 'memory')    wireMemory(scr);
    if (scr.layout === 'detective') wireDetective(scr);
    if (scr.layout === 'explore')   wireExplore(scr);
    if (scr.layout === 'findflip')  wireFindFlip(scr);
    if (scr.walk)                   wireWalk(scr);
    if (scr.clarify)                wireClarify(scr);
    if (scr.freechat)               wireFreeChat(scr);
  }

  /* ================= Free Chat (M22) — 레이아웃 유지, 단계만 표출 ================= */
  function startLioWander(el) {
    const host = el.closest('.reading') || el.parentElement;
    if (!host) return;
    const size = 88;
    const pad = 10;
    let x = host.clientWidth * (0.42 + Math.random() * 0.28);
    let y = host.clientHeight * (0.22 + Math.random() * 0.35);
    let vx = (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.55);
    let vy = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.5);
    let rot = (Math.random() - 0.5) * 6;
    let steer = 0;

    const apply = () => {
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)';
    };
    apply();

    const tick = () => {
      if (!el.isConnected || el.classList.contains('fc-gone')) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      // 가끔 방향 살짝 틀어 자연스럽게
      if (--steer <= 0) {
        steer = 40 + Math.floor(Math.random() * 90);
        vx += (Math.random() - 0.5) * 0.55;
        vy += (Math.random() - 0.5) * 0.55;
      }
      // 속도 클램프
      const sp = Math.hypot(vx, vy) || 0.001;
      const max = 1.25, min = 0.38;
      if (sp > max) { vx *= max / sp; vy *= max / sp; }
      else if (sp < min) { vx *= min / sp; vy *= min / sp; }

      x += vx;
      y += vy;

      // 벽에서 부드럽게 튕김
      if (x < pad) { x = pad; vx = Math.abs(vx) * (0.7 + Math.random() * 0.4); }
      if (y < pad) { y = pad; vy = Math.abs(vy) * (0.7 + Math.random() * 0.4); }
      if (x > w - size - pad) { x = w - size - pad; vx = -Math.abs(vx) * (0.7 + Math.random() * 0.4); }
      if (y > h - size - pad) { y = h - size - pad; vy = -Math.abs(vy) * (0.7 + Math.random() * 0.4); }

      const targetRot = Math.max(-14, Math.min(14, vx * 9));
      rot += (targetRot - rot) * 0.06;
      apply();
      trackRaf(requestAnimationFrame(tick));
    };
    trackRaf(requestAnimationFrame(tick));
  }

  function wireFreeChat(scr) {
    const stage = document.getElementById('stage');
    const scroll = stage.querySelector('.activity-scroll');
    const inputWrap = stage.querySelector('.chatinput');
    const input = inputWrap && inputWrap.querySelector('input');
    const sendBtn = stage.querySelector('[data-fc-send]');
    const skipBtn = stage.querySelector('[data-fc-skip]');
    const float = stage.querySelector('.floating-lio');
    const FREE_REPLIES = [
      "Hmm, interesting! Tell me more — I love hearing your ideas! 🔊",
      "Haha, that's cool! Thanks for chatting with me today! 🔊"
    ];
    let phase = 'ask';   // ask → free → end
    let freeLeft = 2;

    if (float) startLioWander(float);

    const reveal = (cls) => {
      stage.querySelectorAll('.fc-' + cls).forEach(el => el.classList.remove('fc-hidden'));
      if (scroll) scroll.scrollTop = scroll.scrollHeight;
    };
    const endSession = () => {
      phase = 'end';
      reveal('end');
      if (inputWrap) inputWrap.classList.add('fc-gone');
      if (float) float.classList.add('fc-gone');
    };
    const enterFree = () => {
      if (phase !== 'ask') return;
      phase = 'free';
      if (input) {
        input.placeholder = '아무거나 물어봐! Ask me!';
        input.value = '';
      }
      if (float) float.classList.remove('fc-active');
      // Skip → Done 라벨만 교체 (위치·레이아웃 유지)
      if (skipBtn) {
        skipBtn.setAttribute('aria-label', 'done');
        skipBtn.innerHTML = 'Done';
        skipBtn.classList.add('btn-fc-done');
      }
      // mic 추가 (Send 옆, 기존 mic 입력과 동일 패턴)
      if (inputWrap && !inputWrap.querySelector('.btn.mic')) {
        const mic = document.createElement('button');
        mic.className = 'btn mic';
        mic.setAttribute('aria-label', 'microphone');
        mic.innerHTML = LI.mic;
        if (skipBtn) inputWrap.insertBefore(mic, skipBtn);
        else inputWrap.appendChild(mic);
      }
    };
    const appendMsg = (side, html) => {
      const div = document.createElement('div');
      div.className = 'msg ' + side + ' fc-dyn';
      if (side === 'lio') {
        div.innerHTML = `<img class="avatar" src="${mascot('lio_face2.png')}" alt="LIO"><div class="bubble">${txBlock(html, { tts:true, kr:true })}</div>`;
      } else {
        div.innerHTML = `<div class="bubble">${stripEmoji(kw(html))}</div><img class="avatar user-av" src="${IMG}ui/student.png" alt="" onerror="this.removeAttribute('src')">`;
      }
      // turn1 뒤 · end 앞 (기존 블록 순서/레이아웃 유지)
      const endAnchor = stage.querySelector('.fc-end');
      if (endAnchor) scroll.insertBefore(div, endAnchor);
      else if (scroll) scroll.appendChild(div);
      scroll.scrollTop = scroll.scrollHeight;
      return div;
    };
    const doSend = () => {
      if (phase === 'end') return;
      const text = (input && input.value.trim()) || (phase === 'ask' ? '…land' : '…');
      if (phase === 'ask') {
        // 1턴: 미리 숨겨둔 turn1 표출 (레이아웃/블록 구조 그대로)
        const userBubble = stage.querySelector('.fc-turn1.msg.user .bubble');
        if (userBubble && input && input.value.trim()) userBubble.textContent = stripEmoji(input.value.trim());
        if (input) input.value = '';
        reveal('turn1');
        if (float) float.classList.add('fc-active');
        return;
      }
      if (phase === 'free') {
        if (freeLeft <= 0) return;
        if (input) input.value = '';
        appendMsg('user', text === '…' ? '…' : text);
        const reply = FREE_REPLIES[2 - freeLeft] || FREE_REPLIES[FREE_REPLIES.length - 1];
        later(() => appendMsg('lio', reply), 280);
        freeLeft -= 1;
      }
    };

    if (sendBtn) sendBtn.addEventListener('click', doSend);
    if (input) input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doSend(); }
    });
    if (skipBtn) skipBtn.addEventListener('click', endSession);
    if (float) float.addEventListener('click', () => {
      if (phase === 'ask' && float.classList.contains('fc-active')) enterFree();
    });
  }

  /* ================= Passage Clarify (PPTX 32) ================= */
  function wireClarify(scr) {
    const stage = document.getElementById('stage');
    const sents = [...stage.querySelectorAll('.passage .sent')];
    sents.forEach(s => s.classList.add('clarify-dot'));   // 문장 단위 점선 밑줄
    let enabled = false;

    const yesBtn = stage.querySelector('[data-act="yes"]');   // reveal/버튼숨김은 공용 yes 핸들러가 처리
    if (yesBtn) yesBtn.addEventListener('click', () => {
      enabled = true;
      sents.forEach(s => s.classList.add('clarify-live'));               // 탭 가능(커서)
    });

    sents.forEach(s => s.addEventListener('click', () => {
      if (!enabled) return;
      sents.forEach(o => o.classList.remove('tapped'));
      s.classList.add('tapped');                                        // 선택 문장 하이라이트
      enabled = false;
      const txt = s.textContent.replace(/\s+/g, ' ').trim();
      speak(txt, null, () => {});
      stage.querySelectorAll('.reveal2-hidden').forEach(el => el.classList.remove('reveal2-hidden'));  // 설명 + Another/Move on
    }));

    const anotherBtn = stage.querySelector('[data-act="another"]');
    if (anotherBtn) anotherBtn.addEventListener('click', () => { enabled = true; });   // 다른 문장 다시 탭
  }

  /* ================= Teach : Word Peek (PPTX 21) ================= */
  function wireTeach(scr) {
    const stage = document.getElementById('stage');
    const grid  = stage.querySelector('.tcard-grid');
    const defBox  = stage.querySelector('.teach-def');
    const doneBox = stage.querySelector('.teach-done');
    const done = new Set();
    const total = F.KEYWORDS.length;

    const highlightPassage = (w) => {
      stage.querySelectorAll('.passage .kw').forEach(el => {
        const on = !!w && el.textContent.trim().toLowerCase() === w.toLowerCase();
        el.classList.toggle('kw-focus', on);
        el.classList.toggle('tc-hl', false);
      });
    };

    const openDef = (k, card) => {
      grid.querySelectorAll('.tcard').forEach(c => c.classList.remove('cur'));
      card.classList.add('cur');
      highlightPassage(k.w);
      speak(k.w, null, () => {});
      const exEn = '“' + k.ex + '”', exKr = '“' + (k.exKr || k.kr) + '”';
      defBox.innerHTML =
        `<div class="tdef">
           <span class="td-ic">${k.emoji || '📘'}</span>
           <div class="td-body">
             <div class="td-w">${k.w} <img class="tts-ic" src="${IMG}ui/spk_bubble.svg" alt=""></div>
             <div class="td-def"><span class="tx-host">${txBlock(k.def, { kr:true, krHtml:k.kr })}</span></div>
             <div class="td-ex"><span class="td-extag">EXAMPLE</span> <span class="tx-host">${txBlock(exEn, { kr:true, krHtml:exKr })}</span></div>
             <div class="td-recap" hidden></div>
           </div>
         </div>
         <div class="btnrow td-btns">
           <button class="btn primary td-got">Got it!</button>
           <button class="btn ghost td-not">Not sure</button>
         </div>`;
      bindKr(defBox);
      const tts = defBox.querySelector('.tts-ic');
      if (tts) tts.onclick = () => speak(k.w, null, () => {});
      // 재설명 (Not sure → 실시간 LLM 생성 시뮬레이션: 난이도를 낮춘 예문 활용의 설명)
      defBox.querySelector('.td-not').onclick = () => {
        const recap = defBox.querySelector('.td-recap');
        recap.hidden = false;
        recap.innerHTML = `<span class="td-recap-tag">Let me explain it more simply</span>
          <div class="tx-host">${txBlock('“' + k.w + '” means ' + k.easyDef + '.', { kr:true, krHtml:'“' + k.w + '” 은(는) ' + k.easyDefKr + ' 이에요.' })}</div>
          <div class="td-recap-ex"><span class="tx-host">${txBlock(k.exEasy, { kr:true, krHtml:k.exEasyKr })}</span></div>`;
        bindKr(recap);
        speak(k.w + ' means ' + k.easyDef + '. ' + k.exEasy, null, () => {});
      };
      defBox.querySelector('.td-got').onclick = () => {
        done.add(k.w);
        card.classList.add('learned');
        defBox.innerHTML = '';
        highlightPassage('');
        if (done.size >= total) { sfxFound(); finish(); }
      };
      defBox.scrollIntoView({ behavior:'smooth', block:'nearest' });
    };

    grid.querySelectorAll('.tcard').forEach(card => {
      card.addEventListener('click', () => {
        const k = F.KEYWORDS[+card.dataset.i];
        openDef(k, card);
      });
    });

    function finish() {
      const btns = (scr.buttons || []).map(b =>
        `<button class="btn ${b.style === 'dark' ? 'dark' : 'primary'}" ${b.style === 'dark' ? 'data-advance' : 'data-tapmore'}>${stripEmoji(b.html).replace(/▶/g, PLAY)}</button>`).join('');
      doneBox.innerHTML =
        (scr.doneLio || []).map(d => lioBubble(d)).join('') +
        `<div class="btnrow">${btns}</div>`;
      bindKr(doneBox);
      doneBox.querySelectorAll('.tts-ic').forEach(ic => ic.addEventListener('click', () => {
        const b = ic.closest('.bubble'); const en = b && b.querySelector('.tx-en');
        speak((en ? en.textContent : (b ? b.textContent : '')).replace(/KR/g, ''), null, () => {});
      }));
      const adv = doneBox.querySelector('[data-advance]');
      if (adv) adv.addEventListener('click', goNext);
      const more = doneBox.querySelector('[data-tapmore]');
      if (more) more.addEventListener('click', () => more.closest('.btnrow').scrollIntoView({ behavior:'smooth' }));
      doneBox.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  }

  /* ================= Game 1 : Memory Match (PPTX 22) ================= */
  function wireMemory(scr) {
    const stage = document.getElementById('stage');
    // 게임 선택 탭
    stage.querySelectorAll('.game-pick .gp-btn').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.game === 'detective') goNext();   // → Definition Detective 화면
    }));

    const gridEl  = stage.querySelector('.mem-grid');
    const nEl     = stage.querySelector('.mem-n');
    const hintEl  = stage.querySelector('.mem-hint');
    const hintNEl = stage.querySelector('.hint-n');
    const doneEl  = stage.querySelector('.mem-done');

    // 카드 12장 : 단어 6 + 의미 6, 섞기
    const cards = [];
    F.KEYWORDS.forEach((k, i) => {
      cards.push({ pair:i, kind:'word', label:k.w, emoji:k.emoji });
      cards.push({ pair:i, kind:'def',  label:k.short });
    });
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }

    gridEl.innerHTML = cards.map((c, i) =>
      `<button class="mcard" data-i="${i}" data-pair="${c.pair}" data-kind="${c.kind}">
         <span class="mc-inner">
           <span class="mc-face mc-back" aria-hidden="true"><svg class="mc-q" viewBox="0 0 48 64" width="1em" height="1.33em" focusable="false"><path fill="currentColor" d="M24 4c-9.4 0-16 6.2-16 15.2 0 2.6 2.1 4.6 4.7 4.6s4.7-2 4.7-4.6c0-4.3 2.8-6.8 6.6-6.8 3.7 0 6.4 2.4 6.4 6.1 0 2.5-1 4.4-3.2 6.7l-4.6 4.7c-3 3.1-4.5 5.9-4.5 10.2v1.2c0 2.6 2.1 4.6 4.7 4.6s4.7-2 4.7-4.6v-.6c0-2.1.7-3.7 2.9-5.9l4.5-4.6C35.4 25.4 38 21.8 38 16.4 38 8.4 31.8 4 24 4zm0 44.5c-3 0-5.3 2.3-5.3 5.2S21 59 24 59s5.3-2.3 5.3-5.3-2.3-5.2-5.3-5.2z"/></svg></span>
           <span class="mc-face mc-front ${c.kind}">${c.kind === 'word' ? `<b>${c.label}</b>` : c.label}${c.emoji && c.kind === 'word' ? `<em class="mc-emo">${c.emoji}</em>` : ''}</span>
         </span>
       </button>`).join('');

    const els = [...gridEl.querySelectorAll('.mcard')];
    let flipped = [], matched = 0, hints = 3, lock = true, peeking = true;

    const setPeek = (on) => els.forEach(e => e.classList.toggle('show', on));

    // 5초 기억 시간 : 안내는 카드(보기) 바로 위에 토스트로 잠깐 떴다 사라짐 → 뒤집기
    const peekTag = document.createElement('div');
    peekTag.className = 'mem-peek toast';
    peekTag.innerHTML = `Memorize the cards! <b class="peek-t">5</b>`;
    document.body.appendChild(peekTag);
    const placePeek = () => { const gr = gridEl.getBoundingClientRect(); peekTag.style.left = (gr.left + gr.width / 2) + 'px'; peekTag.style.top = (gr.top + gr.height / 2) + 'px'; };
    placePeek();
    requestAnimationFrame(() => { placePeek(); peekTag.classList.add('show'); });
    setPeek(true);
    let t = 5;
    const hidePeek = () => { peekTag.classList.remove('show'); later(() => peekTag.remove(), 300); };
    const countdown = () => {
      t--; const b = peekTag.querySelector('.peek-t'); if (b) b.textContent = t;
      if (t <= 0) { setPeek(false); hidePeek(); lock = false; peeking = false; return; }
      later(countdown, 1000);
    };
    later(countdown, 1000);

    const check = () => {
      const [a, b] = flipped;
      if (a.dataset.pair === b.dataset.pair && a.dataset.kind !== b.dataset.kind) {
        a.classList.add('matched'); b.classList.add('matched');
        sfxFound(); matched++; nEl.textContent = matched;
        flipped = []; lock = false;
        if (matched >= F.KEYWORDS.length) finish();
      } else {
        a.classList.add('miss'); b.classList.add('miss');
        sfxWrong();
        later(() => { a.classList.remove('show', 'miss'); b.classList.remove('show', 'miss'); flipped = []; lock = false; }, 850);
      }
    };

    els.forEach(e => e.addEventListener('click', () => {
      if (lock || e.classList.contains('show') || e.classList.contains('matched')) return;
      e.classList.add('show'); sfxTick(); flipped.push(e);
      if (flipped.length === 2) { lock = true; later(check, 550); }
    }));

    hintEl.addEventListener('click', () => {
      if (hints <= 0 || peeking) return;
      hints--; hintNEl.textContent = hints;
      lock = true; const wasFlipped = els.filter(e => e.classList.contains('show') && !e.classList.contains('matched'));
      els.forEach(e => { if (!e.classList.contains('matched')) e.classList.add('show', 'hint'); });
      later(() => { els.forEach(e => { if (!e.classList.contains('matched') && !wasFlipped.includes(e)) e.classList.remove('show'); e.classList.remove('hint'); }); lock = false; }, 1600);
    });

    function finish() {
      doneEl.innerHTML = lioBubble('You matched them all! Great job! 🎉 🔊') +
        `<div class="btnrow"><button class="btn primary" data-advance>Next ${PLAY}</button></div>`;
      bindKr(doneEl);
      const adv = doneEl.querySelector('[data-advance]'); if (adv) adv.addEventListener('click', goNext);
      spawnConfetti();
      doneEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  }

  /* ================= Game 2 : Definition Detective (PPTX 23) ================= */
  function wireDetective(scr) {
    const stage = document.getElementById('stage');
    stage.querySelectorAll('.game-pick .gp-btn').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.game === 'memory') goPrev();   // → Memory Match 화면(이전)
    }));

    const body = stage.querySelector('.det-body');
    const words = F.KEYWORDS;
    let ci = 0;

    const renderClue = () => {
      const k = words[ci];
      // 오답 후보 1개 (다른 단어) 랜덤
      const others = words.filter((_, i) => i !== ci);
      const distract = others[Math.floor(Math.random() * others.length)];
      const opts = Math.random() < 0.5 ? [k, distract] : [distract, k];
      // 보기 카드는 board 안에서 서로 다른 위치에 떠다니며(움직이며) 클릭 가능
      const spots = [
        { l: 8 + Math.random() * 10, t: 14 + Math.random() * 12 },
        { l: 46 + Math.random() * 12, t: 44 + Math.random() * 14 }
      ];
      const cardsHtml = opts.map((o, i) => {
        const s = spots[i];
        const dur = (3.6 + Math.random() * 2).toFixed(2);
        const del = (Math.random() * 1.4).toFixed(2);
        return `<button class="det-card" data-w="${o.w}" style="left:${s.l.toFixed(1)}%;top:${s.t.toFixed(1)}%;animation-duration:${dur}s;animation-delay:${del}s">${o.w}</button>`;
      }).join('');
      body.innerHTML =
        `<div class="det-clue-head">Clue ${ci + 1} / ${words.length} · <span class="det-q">Which word is it?</span></div>
         <div class="msg lio"><img class="avatar" src="${mascot('lio_face2.png')}" alt="LIO"><div class="bubble">${txBlock('“' + k.clue + '”', { tts:true, kr:true, krHtml:'“' + k.clueKr + '”' })}</div></div>
         <div class="det-board">${cardsHtml}</div>
         <div class="det-feedback"></div>`;
      bindKr(body);
      const fb = body.querySelector('.det-feedback');
      body.querySelectorAll('.det-card').forEach(card => card.addEventListener('click', () => {
        if (card.classList.contains('correct') || body.dataset.solved) return;
        const right = card.dataset.w === k.w;
        if (right) {
          body.dataset.solved = '1';
          card.classList.add('correct');
          const r = card.getBoundingClientRect(); burstParticles(r.left + r.width / 2, r.top + r.height / 2); sfxFound();
          fb.innerHTML = lioBubble('Yes! You found it! 🎉 🔊');
          bindKr(fb);
          later(() => {
            ci++;
            if (ci >= words.length) finish();
            else { delete body.dataset.solved; renderClue(); body.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
          }, 1500);
        } else {
          card.classList.add('wrong');
          sfxWrong();
          fb.innerHTML = lioBubble('Not quite — try once more! 🔊');
          bindKr(fb);
          later(() => card.classList.remove('wrong'), 900);
        }
      }));
    };

    function finish() {
      body.innerHTML = lioBubble('You solved every clue! Amazing detective work! 🎉 🔊') +
        `<div class="btnrow"><button class="btn primary" data-advance>Next ${PLAY}</button></div>`;
      bindKr(body);
      const adv = body.querySelector('[data-advance]'); if (adv) adv.addEventListener('click', goNext);
    }

    renderClue();
  }

  /* ================= Explore Words (PPTX 24) ================= */
  function wireExplore(scr) {
    const stage = document.getElementById('stage');
    const list  = stage.querySelector('.explore-list');
    const doneBox = stage.querySelector('.explore-done');
    const shown = new Set();
    const keyDone = new Set();
    const lookup = (w) => F.KEYWORDS.find(k => k.w.toLowerCase() === w) || F.EXPLORE_EXTRA.find(k => k.w.toLowerCase() === w);

    const addWord = (el, w) => {
      el.classList.add('picked');
      const k = lookup(w); if (!k) return;
      speak(k.w, null, () => {});
      // 핵심어(kwbox) 모두 탭하면 done 말풍선 표출
      if (el.classList.contains('kwbox')) {
        keyDone.add(w);
        if (doneBox && keyDone.size >= F.KEYWORDS.length && doneBox.classList.contains('reveal-hidden')) {
          doneBox.classList.remove('reveal-hidden');
          sfxFound();
        }
      }
      if (shown.has(w)) { const ex = list.querySelector(`.exi[data-w="${w}"]`); if (ex) ex.scrollIntoView({ behavior:'smooth', block:'nearest' }); return; }
      shown.add(w);
      const row = document.createElement('div');
      row.className = 'exi';
      row.dataset.w = w;
      row.innerHTML = `<b class="exi-w ${el.classList.contains('kwbox') ? 'key' : ''}">${k.w}</b> — <span class="tx-host">${txBlock(k.def, { kr:true, krHtml:k.kr })}</span>`;
      list.appendChild(row);
      bindKr(row);
      requestAnimationFrame(() => row.classList.add('show'));
      row.scrollIntoView({ behavior:'smooth', block:'nearest' });
    };

    stage.querySelectorAll('.passage .kwbox, .passage .xword').forEach(el =>
      el.addEventListener('click', () => addWord(el, el.dataset.w)));
  }

  /* ================= Find & Flip (기획서) ================= */
  function wireFindFlip(scr) {
    const stage = document.getElementById('stage');
    const doneBox = stage.querySelector('.explore-done');
    const defBox = stage.querySelector('.ff-defbox');
    const flipped = new Set();

    const sentText = (el) => { const s = el.closest('.sent'); return s ? s.textContent.replace(/\s*(Listen|Stop)\s*/g, ' ').replace(/\s+/g, ' ').trim() : ''; };

    const openDef = (k) => {
      if (!defBox || !k) return;
      const exEn = '“' + k.ex + '”', exKr = '“' + (k.exKr || k.kr) + '”';
      defBox.innerHTML =
        `<div class="tdef">
           <span class="td-ic">${k.emoji || '📘'}</span>
           <div class="td-body">
             <div class="td-w">${k.w} <img class="tts-ic" src="${IMG}ui/spk_bubble.svg" alt=""></div>
             <div class="td-def"><span class="tx-host">${txBlock(k.def, { kr:true, krHtml:k.kr })}</span></div>
             <div class="td-ex"><span class="td-extag">EXAMPLE</span> <span class="tx-host">${txBlock(exEn, { kr:true, krHtml:exKr })}</span></div>
           </div>
         </div>`;
      bindKr(defBox);
      const tts = defBox.querySelector('.tts-ic');
      if (tts) tts.onclick = () => speak(k.w, null, () => {});
      defBox.scrollIntoView({ behavior:'smooth', block:'nearest' });
    };

    const revealWord = (w, fromPassageEl) => {
      const k = F.KEYWORDS.find(x => x.w.toLowerCase() === w);
      const card = stage.querySelector(`.ffcard[data-w="${w}"]`);
      if (fromPassageEl) {
        fromPassageEl.classList.add('picked');
        const sent = fromPassageEl.closest('.sent');
        stage.querySelectorAll('.passage .sent.hl-yellow').forEach(s => s.classList.remove('hl-yellow'));
        if (sent) sent.classList.add('hl-yellow');
        speak(sentText(fromPassageEl) || w, null, () => {});
      } else if (k) {
        speak(k.w, null, () => {});
      }
      if (card && !card.classList.contains('flip')) {
        card.classList.add('flip');
        flipped.add(w);
        card.scrollIntoView({ behavior:'smooth', block:'nearest' });
        if (flipped.size >= F.KEYWORDS.length) {
          const g = stage.querySelector('.ff-grid'); const r = g.getBoundingClientRect();
          burstParticles(r.left + r.width / 2, r.top + r.height / 2); sfxFound();
          if (doneBox) doneBox.classList.remove('reveal-hidden');
        }
      }
      openDef(k);
    };

    // 본문 핵심어 탭 → 카드 flip + Teach형 설명 패널
    stage.querySelectorAll('.passage .kwbox').forEach(el => el.addEventListener('click', () => {
      revealWord(el.dataset.w, el);
    }));
    // 카드 앞면 탭도 동일하게 설명 패널 표출
    stage.querySelectorAll('.ffcard').forEach(card => card.addEventListener('click', () => {
      revealWord(card.dataset.w, null);
    }));
    // 점선 단어(other words) 자유 탐색 → 뜻 팝업
    stage.querySelectorAll('.passage .xword').forEach(el => el.addEventListener('click', () => {
      el.classList.add('picked'); showWordPopup(el.dataset.w);
    }));
  }

  /* ================= Walk the Passage (기획서) : 단계별 진행 ================= */
  function wireWalk(scr) {
    const stage = document.getElementById('stage');
    const area = stage.querySelector('.walk-area');
    const paras = scr.walkParas || [];
    const ppars = [...stage.querySelectorAll('.passage .ppara')];
    let cur = 0;

    const highlightPara = (idx) => {
      stage.querySelectorAll('.passage .sent.hl-yellow').forEach(s => s.classList.remove('hl-yellow'));
      if (ppars[idx]) ppars[idx].querySelectorAll('.sent').forEach(s => s.classList.add('hl-yellow'));
    };

    const renderPara = () => {
      const p = paras[cur]; if (!p || !area) return;
      highlightPara(cur);
      const last = cur >= paras.length - 1;
      area.innerHTML =
        `<div class="et-label">${p.label}</div>` +
        lioBubble(p.text) +
        `<div class="walk-recap reveal-hidden">${lioBubble(p.simple)}</div>` +
        `<div class="btnrow nowrap">
           <button class="btn primary btn-long walk-next">${last ? 'Finish' : 'Next paragraph'} ${PLAY}</button>
           <button class="btn navy btn-long walk-simpler">More simply</button>
           <button class="btn green btn-long walk-q">I have a question</button>
         </div>`;
      bindKr(area);
      area.querySelectorAll('.tts-ic').forEach(ic => ic.addEventListener('click', () => {
        const b = ic.closest('.bubble'); const en = b && b.querySelector('.tx-en');
        speak((en ? en.textContent : (b ? b.textContent : '')).replace(/KR/g, ''), null, () => {});
      }));
      area.querySelector('.walk-next').onclick = () => { if (!last) { cur++; renderPara(); } else goNext(); };
      area.querySelector('.walk-simpler').onclick = () => { const r = area.querySelector('.walk-recap'); if (r) r.classList.remove('reveal-hidden'); };
      area.querySelector('.walk-q').onclick = () => showToast("Tap a sentence you don't understand in the passage.", stage.querySelector('.passage-scroll'));
      area.scrollIntoView({ behavior:'smooth', block:'nearest' });
      speak(p.text, null, () => {});
    };

    stage.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'walkStart') {          // Continue → 단어확인/듣기 선택 표출
        stage.querySelectorAll('.reveal-hidden').forEach(el => { if (!el.closest('.walk-area')) el.classList.remove('reveal-hidden'); });
        const row = b.closest('.btnrow'); if (row) row.style.display = 'none';
      } else if (a === 'walkGo') {      // 단어확인/듣기 → 단락별 설명 시작
        const row = b.closest('.btnrow'); if (row) row.style.display = 'none';
        cur = 0; renderPara();
      }
    }));
  }

  // Quick Exit / Session end : 말풍선 순차 등장(유지) → CTA/카드 표출
  function runQeSeq(scr) {
    const stage = document.getElementById('stage');
    const bubs = [...stage.querySelectorAll('.quickexit .ib[data-qe-i]')];
    const bottom = stage.querySelector('.qe-actions, .qe-cards');
    const data = scr.qeSeq || [];
    let i = 0;
    bubs.forEach(b => b.classList.remove('show'));
    if (bottom) bottom.classList.add('qe-bottom-hidden');
    function step() {
      if (i >= bubs.length) {
        if (bottom) bottom.classList.remove('qe-bottom-hidden');
        return;
      }
      const b = bubs[i];
      b.classList.add('show');
      const raw = data[i] ? (data[i].html || data[i].text || '') : '';
      const plain = plainText(raw);
      speak(plain, data[i] && data[i].audio, () => {
        later(() => { i++; step(); }, 420);
      });
    }
    later(step, 500);
  }

  // A 인트로 시퀀스 실행
  function runIntroSeq(scr) {
    const stage = document.getElementById('stage');
    const bubs = [...stage.querySelectorAll('.ib')];
    const nextBtn = stage.querySelector('.introseq-next');
    const replay = stage.querySelector('.introseq-replay');
    const data = scr.introSeq.bubbles;
    let i = 0;
    function step() {
      if (i >= bubs.length) {
        // cut2 → cut3 : 같은 배경이므로 페이드 없이 즉시 전환(말풍선만 교체)
        if (scr.introSeq.autoNext) { later(goNext, 450); }
        else if (nextBtn) { nextBtn.style.display = ''; }
        return;
      }
      const b = bubs[i];
      b.classList.add('show');
      speak(data[i].text, data[i].audio, () => {
        later(() => {
          b.classList.remove('show'); b.classList.add('done');
          i++; later(step, 400);
        }, 550);
      });
    }
    later(step, 700); // 페이드인 이후 시작
    if (replay) replay.onclick = () => {
      stopSpeak(); clearTimers(); i = 0;
      bubs.forEach(b => b.classList.remove('show', 'done'));
      if (nextBtn) nextBtn.style.display = 'none';
      later(step, 300);
    };
  }

  // A 스킬 룰렛 : 카드 하이라이트가 순환하다 감속하며 오늘 스킬에서 멈춤 → 선택완료로 자동 전환
  function runSkillRoulette() {
    const stage = document.getElementById('stage');
    const cards = [...stage.querySelectorAll('.a-skill .skill-card')];
    const n = cards.length; if (!n) return;
    const todayIdx = Math.max(0, F.SKILLS.findIndex(s => s.today));
    const total = n * 2 + todayIdx + 1;   // 약 2바퀴 후 오늘 스킬에 정지
    let step = 0;
    function tick() {
      if (!cards[0].isConnected) return;   // 화면을 벗어나면 중단
      cards.forEach(c => c.classList.remove('spin-on'));
      cards[step % n].classList.add('spin-on');
      sfxTick();                            // 룰렛 도는 효과음
      step++;
      if (step >= total) {
        cards.forEach((c, ix) => { c.classList.remove('spin-on'); if (ix === todayIdx) c.classList.add('landed'); });
        sfxFound();                         // 찾았을 때 효과음
        later(() => { if (cards[0].isConnected) showSkillFound(); }, 500);   // 제자리에서 리스트 흐려지고 찾은 스킬+LIO 등장
        return;
      }
      const remaining = total - step;
      const delay = remaining > 10 ? 78 : 78 + (11 - remaining) * 44;  // 마지막 10칸 감속
      later(tick, delay);
    }
    later(tick, 1150);   // 책 등장(팝인) 애니메이션 후 룰렛 시작
  }

  // 스킬 찾음 : 화면 전환(페이드) 없이 제자리에서 리스트를 흐리게 + 찾은 스킬·LIO·후광 등장
  /* Design B 전용 : 스킬 그리드를 "줄 트랙" 4개로 재구성해 줄마다 세로 무한 스크롤.
     왕복(alternate)이 아니라 실제로 계속 흐르게 하려면 줄 내용이 세로로 복제돼 있어야
     한다. 각 트랙(.b-lane)은 높이가 한 줄이고 overflow:hidden 이며, 안에 같은 줄 세트를
     두 벌 쌓아(.b-lane-set ×2) translateY 를 한 세트 높이만큼 돌린다 → 이음매 없음.
     A 는 호출되지 않는다(THEME 가드). */
  /* Design B 전용 : 스킬 그리드를 세로 컬럼 트랙 4개로 재구성해 컬럼마다 무한 스크롤.
     각 트랙(.b-lane)은 화면(그리드) 높이를 꽉 쓰고 overflow:hidden 이며,
     안에 그 컬럼의 카드 세트를 여러 벌 이어 붙여(.b-lane-set) 한 세트 높이만큼
     translateY 를 돌린다 → 카드는 온전한 모양을 유지하며 위/아래로 계속 흘러간다.
     세트를 laneH 보다 길게 채워야 이음매가 안 보이므로 필요한 만큼 복제한다.
     컬럼마다 이동 거리(--set)가 달라 keyframes 에서 var() 로 받는다.
     홀수 컬럼은 위로, 짝수 컬럼은 아래로 (교차). A 는 호출되지 않는다(THEME 가드). */
  const B_SKILL_COLS = [[0, 4, 8], [6], [1, 3], [2, 5, 7, 9]];   // 컬럼별 data-skill (Figma 배치)
  const B_CARD_H = 19.8;                                             // .b-cell 높이(cqw) — theme-b.css 와 동기
  const B_CARD_GAP = 2.2;                                            // .b-lane-set gap / padding-bottom
  const B_CARD_PITCH = B_CARD_H + B_CARD_GAP;                        // 22.0
  const B_LANE_H = 68;                                               // .b-lane 높이(cqw) — theme-b.css 와 동기
  function buildSkillLanesB() {
    const stage = document.getElementById('stage');
    const grid = stage.querySelector('.skillscreen .skill-grid');
    if (!grid || grid.classList.contains('b-laned')) return;
    const byIdx = {};
    grid.querySelectorAll('.skill-card').forEach(c => { byIdx[c.dataset.skill] = c.outerHTML; });
    // 끊김 없는 루프용으로 세트를 2벌 쌓는다. 다만 세트 높이가 트랙(68cqw)보다
    // 짧으면 한 화면에 같은 스킬이 두 번 보인다 → 빈 b-cell 로 세트 높이를
    // 트랙 이상 채운 뒤 2벌 복제한다(스크롤 애니/방향/duration 은 그대로).
    const minCells = Math.ceil(B_LANE_H / B_CARD_PITCH);
    const lanes = B_SKILL_COLS.map((col, ci) => {
      const cells = col.map(i => `<div class="b-cell">${byIdx[i] || ''}</div>`);
      while (cells.length < minCells) cells.push('<div class="b-cell b-cell-empty" aria-hidden="true"></div>');
      const setH = cells.length * B_CARD_PITCH;
      const dir  = (ci % 2 === 0) ? 'up' : 'down';   // 1·3열 위로 / 2·4열 아래로
      const set = `<div class="b-lane-set">${cells.join('')}</div>`;
      return `<div class="b-lane b-lane-${dir}">
                <div class="b-lane-inner" style="--set:${setH}cqw">${set}${set}</div>
              </div>`;
    }).join('');
    grid.classList.add('b-laned');
    grid.innerHTML = lanes;
    // 렌더 후 실제 세트 높이로 --set 보정 → 루프 이음매/끊김 방지
    grid.querySelectorAll('.b-lane-inner').forEach(inner => {
      const setEl = inner.querySelector('.b-lane-set');
      if (!setEl) return;
      const h = setEl.getBoundingClientRect().height;
      if (h > 0) inner.style.setProperty('--set', h + 'px');
    });
  }

  /* Design B 전용 : 스킬 카드를 탭하면 Figma B_Skill_selected 구성으로 전환한다.
     - 뒤 카드 그리드는 흐려지고(.dim) 헤드라인이 "I found your skills!" 로 바뀐다
     - 선택한 스킬의 대형 카드 + 마스코트 오버레이가 올라온다
     - 잠시 보여준 뒤 다음 화면(Topic)으로 진행
     A 는 runSkillRoulette 경로를 그대로 쓰고 이 함수는 호출되지 않는다. */
  function bindSkillPickB() {
    const stage = document.getElementById('stage');
    const ss = stage.querySelector('.skillscreen');
    if (!ss) return;
    const grid = ss.querySelector('.skill-grid');
    if (!grid || grid.dataset.pickBound) return;
    grid.dataset.pickBound = '1';
    // 카드가 레인으로 복제되므로 위임 클릭으로 처리 (누른 카드의 data-skill·아이콘·색 사용)
    const scB = {
      0:'#3593FF', 1:'#00BE5F', 2:'#FF9C7E', 3:'#FFC72F', 4:'#F46169',
      5:'#B078FF', 6:'#748CFF', 7:'#FF974C', 8:'#FF7CCF', 9:'#4FC73F'
    };
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.skill-card');
      if (!card || !grid.contains(card) || ss.classList.contains('selected')) return;
      const i = Number(card.getAttribute('data-skill'));
      if (!Number.isFinite(i) || i < 0 || i >= F.SKILLS.length) return;
      const pick = F.SKILLS[i];
      const iconSrc = (card.querySelector('.sc-icon img') || {}).getAttribute?.('src') || skillIcon(pick);
      ss.classList.add('selected');
      grid.classList.add('dim');
      // Figma B_Skill_selected (114:1305) : "I found\n  your skills!"
      const hd = ss.querySelector('.skill-headline');
      if (hd) hd.innerHTML = 'I found<br><span class="skill-headline-l2">your skills!</span>';
      ss.querySelectorAll('.skillfound-overlay').forEach(n => n.remove());
      const ov = document.createElement('div');
      ov.className = 'skillfound-overlay';
      ov.innerHTML =
        `<img class="skillsel-mascot" src="${mascot('lio6.png')}" alt="LIO">
         <div class="skillsel-card" style="--scB:${scB[i]};background:${scB[i]}">
           <img src="${iconSrc}" alt="${pick.name}">
           <div class="sc-name">${skillNameHtml(pick)}</div>
         </div>
         <button type="button" class="skillsel-go" data-advance aria-label="Let's Go!">Let's Go!</button>`;
      ss.appendChild(ov);
      sfxFound();
      // Figma 는 Let's Go 버튼으로 진행 (자동 전환 없음)
      ov.querySelector('.skillsel-go').addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (ss.isConnected) fadeAdvance();
      });
    });
  }

  function showSkillFound() {
    const stage = document.getElementById('stage');
    const ss = stage.querySelector('.skillscreen.a-skill');
    if (!ss || ss.classList.contains('found')) return;
    const today = F.SKILLS.find(s => s.today) || F.SKILLS[0];
    ss.classList.add('found');
    const grid = ss.querySelector('.skill-grid'); if (grid) grid.classList.add('dim');
    const hd = ss.querySelector('.skill-headline'); if (hd) hd.textContent = 'I found your skills!';
    const overlay = document.createElement('div');
    overlay.className = 'skillfound-overlay';
    overlay.innerHTML =
      `<img class="skillsel-mascot" src="${mascot('lio6.png')}" alt="LIO">
       <div class="skillsel-halo"><span class="rays"></span><span class="glow"></span></div>
       <div class="skillsel-card"><img src="${skillIcon(today)}" alt="${today.name}"></div>`;
    ss.appendChild(overlay);
    // 찾은 결과를 잠시 보여준 뒤 자연스럽게 Topic 화면으로 전환
    later(() => { if (stage.querySelector('.a-skill.found')) fadeAdvance(); }, 2600);
  }

  // 하단 어휘 카드 팝업 (핵심단어 탭 시) — 뜻/예문 + KR 토글 (기획서 스펙)
  function showWordPopup(raw) {
    const dev = document.querySelector('#stage .device'); if (!dev) return;
    const key = raw.toLowerCase().replace(/[^a-z]/g, '');
    const k = F.KEYWORDS.find(x => x.w.toLowerCase() === key) || (F.EXPLORE_EXTRA || []).find(x => x.w.toLowerCase() === key);
    const old = dev.querySelector('.word-popup'); if (old) old.remove();
    const pop = document.createElement('div');
    pop.className = 'word-popup';
    pop.innerHTML =
      `<button class="wp-close" aria-label="close">×</button>
       <div class="wp-word">${k ? k.w : raw} <img class="tts-ic" src="${IMG}ui/spk_bubble.svg" alt=""></div>
       <div class="wp-def">${k ? k.def : ''}</div>
       ${k && k.ex ? `<div class="wp-ex" data-en="&ldquo;${k.ex}&rdquo;" data-kr="${k.kr}">&ldquo;${k.ex}&rdquo;</div>` : ''}
       ${k && k.kr ? `<button class="wp-kr">KR</button>` : ''}`;
    dev.appendChild(pop);
    requestAnimationFrame(() => pop.classList.add('show'));
    pop.querySelector('.wp-close').onclick = () => pop.remove();
    const tts = pop.querySelector('.tts-ic');
    if (tts) tts.onclick = () => speak(k ? k.w : raw, null, () => {});
    const krBtn = pop.querySelector('.wp-kr'), exEl = pop.querySelector('.wp-ex');
    if (krBtn && exEl) { let kr = false; krBtn.onclick = () => { kr = !kr; exEl.textContent = kr ? exEl.dataset.kr : exEl.dataset.en; krBtn.classList.toggle('on', kr); krBtn.textContent = kr ? 'EN' : 'KR'; }; }
    if (k) speak(k.w, null, () => {});
  }

  // 정답 파티클 버스트 (특정 지점에서 사방으로)
  function burstParticles(cx, cy) {
    const colors = ['#ffd36b', '#ff7db0', '#6bd0ff', '#7ee787', '#c39bff', '#ff9a3d'];
    const layer = document.createElement('div');
    layer.className = 'particle-layer';
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const ang = Math.random() * Math.PI * 2;
      const dist = 55 + Math.random() * 100;
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
      p.style.setProperty('--dy', (Math.sin(ang) * dist - 30).toFixed(1) + 'px');
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.round(Math.random() * 80) + 'ms';
      if (i % 2) p.style.borderRadius = '50%';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    later(() => layer.remove(), 1300);
  }

  // 전체 화면 confetti (정답 축하)
  function spawnConfetti() {
    const dev = document.querySelector('#stage .device');
    if (!dev) return;
    const c = document.createElement('div');
    c.className = 'confetti';
    dev.appendChild(c);
    later(() => { if (c.isConnected) c.remove(); }, 1700);
  }

  // Word Check: 지문의 포커스 단어가 커지며 우측 chip으로 날아가 박히는 연출
  function runWordFocusFly() {
    const stage = document.getElementById('stage');
    const word = stage.querySelector('.passage .kw-focus');
    const chip = stage.querySelector('.wordchip');
    if (!word || !chip) return;
    chip.style.visibility = 'hidden';
    const wr = word.getBoundingClientRect();
    const fly = word.cloneNode(true);
    fly.className = 'kw-fly';
    fly.textContent = word.textContent;
    fly.style.left = wr.left + 'px';
    fly.style.top = wr.top + 'px';
    fly.style.width = wr.width + 'px';
    fly.style.height = wr.height + 'px';
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      const cr = chip.getBoundingClientRect();
      const dx = (cr.left + cr.width / 2) - (wr.left + wr.width / 2);
      const dy = (cr.top + cr.height / 2) - (wr.top + wr.height / 2);
      fly.style.transform = `translate(${dx}px,${dy}px) scale(2)`;
    });
    later(() => {
      fly.remove(); chip.style.visibility = ''; chip.classList.add('chip-pop');
      stage.querySelectorAll('.fly-hidden').forEach(el => el.classList.remove('fly-hidden'));   // 단어 박힌 뒤 아래 내용 표출
    }, 850);
  }

  function fadeAdvance() {
    const dev = document.querySelector('#stage .device');
    if (dev) dev.classList.add('fadeout');
    later(goNext, 460);
  }

  function goNext() { stopSpeak(); if (idx < SCREENS.length - 1) { idx++; renderScreen(); scrollTop(); } }
  function goPrev() { stopSpeak(); if (idx > 0) { idx--; renderScreen(); scrollTop(); } }
  function goTo(i) { idx = Math.max(0, Math.min(SCREENS.length - 1, i)); renderScreen(); scrollTop(); }
  function scrollTop(){ const s=document.getElementById('stage'); if(s) s.scrollTop=0; }

  /* ---------------- jump menu (Index / slide 2) ---------------- */
  function buildJump() {
    const j = document.getElementById('jump-list');
    // Index 항목 = PPTX 슬라이드 번호 + TITLE 원문 (+ 같은 슬라이드 분할 시 cut 라벨)
    const esc = (t) => String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    j.innerHTML = SCREENS.map((s, i) =>
      `<button class="jump-item" data-i="${i}"><span class="ji-slide">${s.slide}</span><span class="ji-sec">${esc(s.section)||'—'}</span><span class="ji-title">${esc(s.title)}${s.cut ? `<span class="ji-cut">${esc(s.cut)}</span>` : ''}</span></button>`
    ).join('');
    j.querySelectorAll('.jump-item').forEach(b =>
      b.addEventListener('click', () => { goTo(+b.dataset.i); toggleJump(false); }));
  }
  function toggleJump(force) {
    const o = document.getElementById('jump-overlay');
    const show = force !== undefined ? force : o.classList.contains('hidden');
    o.classList.toggle('hidden', !show);
  }
  function toggleSpec(force) {
    const p = document.getElementById('spec-panel');
    const show = force !== undefined ? force : p.classList.contains('hidden');
    p.classList.toggle('hidden', !show);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    // 브라우저 자동재생 정책: 첫 클릭/키 이후 BGM 허용
    document.addEventListener('pointerdown', unlockBgm, { capture:true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Enter' || e.key === ' ') unlockBgm();
    }, { capture:true });

    document.getElementById('btn-prev').addEventListener('click', () => { unlockBgm(); goPrev(); });
    document.getElementById('btn-next').addEventListener('click', () => { unlockBgm(); goNext(); });
    // 페이지 번호 입력 → 해당 슬라이드로 바로 이동
    const pjInput = document.getElementById('pj-input');
    const pjGo = document.getElementById('pj-go');
    const doJump = () => {
      if (!pjInput) return;
      const v = pjInput.value.trim(); if (!v) return;
      const i = SCREENS.findIndex(x => String(x.slide) === v);
      if (i >= 0) { goTo(i); pjInput.value = ''; pjInput.blur(); }
      else { pjInput.value = ''; pjInput.classList.add('err'); later(() => pjInput.classList.remove('err'), 700); }
    };
    if (pjGo) pjGo.addEventListener('click', doJump);
    if (pjInput) pjInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doJump(); } });
    document.getElementById('btn-jump').addEventListener('click', () => toggleJump());
    document.getElementById('btn-spec').addEventListener('click', () => toggleSpec());
    document.getElementById('jump-close').addEventListener('click', () => toggleJump(false));
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    });
    buildJump();
    // ?s=슬라이드번호 또는 ?id=화면id 로 특정 화면부터 시작 (검증/공유용)
    const qs = new URLSearchParams(location.search);
    const qid = qs.get('id'); const sp = qs.get('s');
    if (qid) { const i = SCREENS.findIndex(x => x.id === qid); if (i >= 0) idx = i; }
    else if (sp) { const i = SCREENS.findIndex(x => String(x.slide) === String(sp)); if (i >= 0) idx = i; }
    renderScreen();
  }

  window.LIO_ENGINE = { goNext, goPrev, goTo };
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
