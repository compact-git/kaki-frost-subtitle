/* Kaki Frost Web - 表示レンダラー(アプリ内プレビュー / 小窓 / OBS用ファイルで共通) */
(function (root) {
  'use strict';

  const BOX_IDS = ['fol', 'tmr', 'cnt', 'crank', 'quiz', 'qrank', 'board'];
  const BOX_LABEL = {
    fol: 'フォロワー', tmr: '同時視聴タイマー', cnt: 'コメント数', crank: 'コメントランキング',
    quiz: '早押し(出題・正解者)', qrank: '早押しランキング', board: 'ホワイトボード',
  };
  const SHAPES = [
    ['plain', '文字だけ(縁取り)'], ['band', '帯(横いっぱい)'], ['card', 'カード(角丸の枠)'], ['pill', 'カプセル'],
    ['neon', 'ネオン(光る枠)'], ['tag', 'ラベル付き(見出しが色付きの札)'], ['under', '下線'], ['digital', 'デジタル(液晶風)'],
  ];
  const MEDAL = ['🥇', '🥈', '🥉'];
  const SRC_MARK = { twitch: '🟣', youtube: '🔴' };

  const SAMPLE = {
    fol: { rows: [{ src: 'twitch', n: 1234 }], label: 'FOLLOWERS', goal: 1500 },
    tmr: { running: false, base: -5000, anchor: 0, fmt: 'auto', tenths: false, negStyle: 'clock', label: '同時視聴' },
    cnt: { n: 2580, label: 'コメント数' },
    crank: { label: 'コメントランキング', rows: [{ name: 'alice', val: 128, src: 'twitch' }, { name: 'bob', val: 96, src: 'twitch' }, { name: 'carol', val: 51, src: 'twitch' }] },
    quiz: { state: 'result', title: '第1問', ans: '富士山', winners: [{ name: 'alice', pts: 10, src: 'twitch' }], label: '早押し' },
    qrank: { label: '早押しランキング', rows: [{ name: 'alice', val: 30, src: 'twitch' }, { name: 'dave', val: 20, src: 'youtube' }, { name: 'bob', val: 10, src: 'twitch' }] },
    board: { strokes: [{ c: '#ff5fa2', w: 12, e: 0, p: [1500, 6000, 50, 2500, 3500, 50, 3800, 6200, 50, 5200, 3000, 50, 6500, 6000, 50, 8200, 3600, 50] }], rev: 1, bg: 'white', bgColor: '#ffffff' },
  };

  const CSS = `
.kf-stage{position:relative;width:100%;height:100%;overflow:hidden}
.kf-box{position:absolute;box-sizing:border-box;display:flex;align-items:center;overflow:visible}
.kf-box.ah-left{justify-content:flex-start}.kf-box.ah-center{justify-content:center}.kf-box.ah-right{justify-content:flex-end}
.kf-box.av-top{align-items:flex-start}.kf-box.av-bottom{align-items:flex-end}
.kf-in{box-sizing:border-box;max-width:100%;display:flex;flex-direction:column;gap:.08em;padding:.12em .55em;line-height:1.15;position:relative}
.kf-box.ah-left .kf-in{align-items:flex-start}.kf-box.ah-center .kf-in{align-items:center}.kf-box.ah-right .kf-in{align-items:flex-end}
.kf-in.lp-left{flex-direction:row;align-items:center!important;gap:.45em}
.kf-lbl{font-size:.45em;letter-spacing:.06em;opacity:.95;white-space:nowrap}
.kf-val{font-variant-numeric:tabular-nums;white-space:nowrap}
.kf-sub{font-size:.42em;opacity:.9;white-space:nowrap}
.kf-pair{display:flex;align-items:baseline;gap:.25em;white-space:nowrap}
.kf-mark{font-size:.55em}
.kf-goal{width:100%;min-width:6em;height:.22em;border-radius:.2em;background:rgba(255,255,255,.25);overflow:hidden;margin-top:.1em}
.kf-goal i{display:block;height:100%;background:var(--ac2,#ffd23f);border-radius:.2em;transition:width .6s}
.kf-pop{position:absolute;right:-.2em;top:-.6em;font-size:.55em;font-weight:800;color:#ffd23f;pointer-events:none;animation:kfPop 1.6s ease-out forwards}
@keyframes kfPop{0%{opacity:0;transform:translateY(.6em) scale(.6)}15%{opacity:1;transform:translateY(0) scale(1.15)}75%{opacity:1}100%{opacity:0;transform:translateY(-.8em)}}
.kf-bump{animation:kfBump .5s ease-out}
@keyframes kfBump{30%{transform:scale(1.18)}}
.kf-list{display:grid;grid-template-columns:auto minmax(3em,1fr) auto;gap:.05em .45em;font-size:.62em;align-items:baseline;min-width:8em;width:100%}
.kf-list .r{text-align:center}.kf-list .n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}.kf-list .v{text-align:right;font-variant-numeric:tabular-nums}
.kf-list .v small{font-size:.7em;margin-left:.1em}
.kf-q{display:flex;flex-direction:column;align-items:inherit;gap:.1em}
.kf-q .big{font-size:1em;white-space:nowrap}
.kf-q .ans{font-size:.8em}
.kf-q .live{animation:kfBlink 1s steps(2) infinite}
@keyframes kfBlink{50%{opacity:.55}}
.kf-q .win{font-size:.72em;white-space:nowrap}
.kf-in.kf-anim{animation:kfIn .3s ease-out}
@keyframes kfIn{from{opacity:0;transform:translateY(.3em) scale(.96)}}
.kf-box.sh-band .kf-in{width:100%;background:var(--ac)}
.kf-box.sh-card .kf-in{background:var(--bg);border:3px solid var(--ac);border-radius:.32em}
.kf-box.sh-pill .kf-in{background:var(--ac);border-radius:999px;padding:.12em .95em}
.kf-box.sh-neon .kf-in{background:var(--bg);border:3px solid var(--acs);border-radius:.3em;box-shadow:0 0 .35em var(--acs),inset 0 0 .3em var(--acs)}
.kf-box.sh-tag .kf-in{flex-direction:row;align-items:stretch!important;gap:0;padding:0;background:var(--bg);border-radius:.25em;overflow:hidden}
.kf-box.sh-tag .kf-lbl{background:var(--acs);color:var(--tagc);display:flex;align-items:center;padding:.25em .55em;font-size:.45em;text-shadow:none}
.kf-box.sh-tag .kf-body{padding:.08em .5em;display:flex;flex-direction:column;justify-content:center}
.kf-box.sh-tag.kf-col .kf-in{flex-direction:column;align-items:stretch!important;width:100%}
.kf-box.sh-tag.kf-col .kf-lbl{justify-content:center;padding:.18em .5em}
.kf-box.sh-tag.kf-col .kf-body{padding:.12em .5em .2em}
.kf-box.kf-col .kf-in{width:100%;box-sizing:border-box}
.kf-box.sh-under .kf-val,.kf-box.sh-under .kf-q .big{border-bottom:.1em solid var(--acs);padding-bottom:.02em}
.kf-box.sh-digital .kf-in{background:var(--bg);border:3px solid rgba(255,255,255,.18);border-radius:.18em;box-shadow:inset 0 0 .5em rgba(0,0,0,.6)}
.kf-box.sh-digital .kf-val{letter-spacing:.06em}
.kf-board{position:absolute;inset:0;width:100%;height:100%;display:block}
.kf-box[data-id=board]{overflow:hidden}
.kf-edit .kf-box{--bx:#ffd23f;outline:3px dashed var(--bx);box-shadow:0 0 0 2px rgba(0,0,0,.5),inset 0 0 0 2px rgba(0,0,0,.5);cursor:move}
.kf-edit .kf-box.sel{outline:4px solid var(--bx)}
.kf-edit .kf-box .kf-tag{text-shadow:none;z-index:3;position:absolute;left:4px;top:2px;font:800 11px sans-serif;background:var(--bx);color:#2b1d4a;padding:1px 6px;border-radius:6px;pointer-events:none;box-shadow:0 0 0 2px rgba(0,0,0,.5);letter-spacing:0}
.kf-edit .kf-box .kf-rs{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;z-index:3;background:linear-gradient(135deg,transparent 50%,var(--bx) 50%)}
.kf-edit .kf-box.off{opacity:.25}
.kf-edit .kf-box[data-id=fol]{--bx:#9146ff}.kf-edit .kf-box[data-id=tmr]{--bx:#ffb020}.kf-edit .kf-box[data-id=cnt]{--bx:#5bc0ff}
.kf-edit .kf-box[data-id=crank]{--bx:#2fe0b5}.kf-edit .kf-box[data-id=quiz]{--bx:#ff5fa2}.kf-edit .kf-box[data-id=qrank]{--bx:#ff8a3d}.kf-edit .kf-box[data-id=board]{--bx:#a3e635}
`;

  function hexA(hex, a) {
    const h = String(hex || '#000000').replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16) || 0;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a == null ? 1 : a})`;
  }
  function outline(color, w) {
    w = Number(w) || 0;
    if (w <= 0) return '';
    const s = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      s.push(`${(Math.cos(a) * w).toFixed(1)}px ${(Math.sin(a) * w).toFixed(1)}px 0 ${color}`);
    }
    return s.join(',');
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => (n == null || isNaN(n)) ? '—' : Number(n).toLocaleString('ja-JP');

  // ---------- タイマー ----------
  function tmrValue(d, now) {
    if (!d) return 0;
    return d.running ? d.base + ((now || Date.now()) - d.anchor) : d.base;
  }
  function fmtTime(ms, d) {
    d = d || {};
    const neg = ms < 0;
    const a = Math.abs(ms);
    let s = neg ? Math.ceil(a / 1000 - 1e-9) : Math.floor(a / 1000);
    if (neg && s === 0) s = 0;
    if (neg && d.negStyle === 'sec') return '-' + s;
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const p2 = v => String(v).padStart(2, '0');
    let t;
    if (d.fmt === 'hms' || (d.fmt !== 'ms' && h > 0)) t = `${h}:${p2(m)}:${p2(sec)}`;
    else if (d.fmt === 'ms') t = `${p2(Math.floor(s / 60))}:${p2(sec)}`;
    else t = `${m}:${p2(sec)}`;
    if (d.tenths && !neg) t += '.' + Math.floor((a % 1000) / 100);
    return (neg ? '-' : '') + t;
  }

  // ---------- 中身 ----------
  function labelHtml(c, text) {
    if (!c.labelOn || !text) return '';
    return `<span class="kf-lbl">${esc(text)}</span>`;
  }
  function wrap(c, lbl, body) {
    if (c.shape === 'tag') return `${lbl}<span class="kf-body">${body}</span>`;
    return lbl + body;
  }
  function content(id, c, d) {
    const lbl = labelHtml(c, c.label);
    if (id === 'fol') {
      const rows = (d.rows || []).filter(r => r);
      let body;
      if (!rows.length) body = '<span class="kf-val">—</span>';
      else if (rows.length === 1 || d.sum) {
        const n = rows.reduce((a, r) => a + (Number(r.n) || 0), 0);
        const mk = (c.showMark && rows.length === 1) ? `<span class="kf-mark">${SRC_MARK[rows[0].src] || ''}</span>` : '';
        body = `<span class="kf-pair">${mk}<span class="kf-val" data-cnt="fol">${num(n)}</span></span>`;
      } else {
        body = rows.map(r => `<span class="kf-pair"><span class="kf-mark">${SRC_MARK[r.src] || ''}</span><span class="kf-val" data-cnt="fol-${r.src}">${num(r.n)}</span></span>`).join('');
      }
      if (d.goal > 0) {
        const n = rows.reduce((a, r) => a + (Number(r.n) || 0), 0);
        const pc = Math.max(0, Math.min(100, n / d.goal * 100));
        body += `<span class="kf-sub">目標 ${num(d.goal)}</span><span class="kf-goal"><i style="width:${pc.toFixed(1)}%"></i></span>`;
      }
      return wrap(c, lbl, body);
    }
    if (id === 'tmr') {
      return wrap(c, lbl, `<span class="kf-val" data-tmr="1">${esc(fmtTime(tmrValue(d), d))}</span>`);
    }
    if (id === 'cnt') {
      return wrap(c, lbl, `<span class="kf-val" data-cnt="cnt">${num(d.n)}</span>`);
    }
    if (id === 'crank' || id === 'qrank') {
      const rows = d.rows || [];
      const unit = id === 'qrank' ? 'pt' : '';
      const body = rows.length ? `<div class="kf-list">${rows.map((r, i) =>
        `<span class="r">${MEDAL[i] || (i + 1) + '.'}</span><span class="n">${c.showMark && SRC_MARK[r.src] ? SRC_MARK[r.src] + ' ' : ''}${esc(r.name)}</span><span class="v">${num(r.val)}${unit ? '<small>' + unit + '</small>' : ''}</span>`).join('')}</div>`
        : '<span class="kf-sub">まだいません</span>';
      return wrap(c, lbl, body);
    }
    if (id === 'quiz') {
      const st = d.state || 'idle';
      if (st === 'idle') return '';
      let body = '<div class="kf-q">';
      if (st === 'open') {
        body += `<span class="big live">${esc(d.title || '')} 受付中!</span>`;
        if (d.deadline) body += `<span class="win" data-qdl="${Number(d.deadline)}"></span>`;
      } else if (st === 'judging') {
        body += `<span class="big">${esc(d.title || '')} 締め切り!</span><span class="win">判定中…</span>`;
      } else {
        body += `<span class="big">${esc(d.title || '')}${d.ans ? ' 正解:' + esc(d.ans) : ' 結果'}</span>`;
        const w = d.winners || [];
        if (!w.length) body += '<span class="win">正解者なし</span>';
        w.forEach((x, i) => { body += `<span class="win">${MEDAL[i] || (i + 1) + '位'} ${c.showMark && SRC_MARK[x.src] ? SRC_MARK[x.src] + ' ' : ''}${esc(x.name)}${x.pts ? ` +${num(x.pts)}pt` : ''}</span>`; });
      }
      body += '</div>';
      return wrap(c, lbl, body);
    }
    return '';
  }

  // ---------- ホワイトボード ----------
  const BOARD_BG = { white: '#ffffff', black: '#1d2a24', green: '#1f5a3d', cream: '#fff8e7' };
  function boardBg(d) {
    if (!d || d.bg === 'none') return 'transparent';
    if (d.bg === 'custom') return d.bgColor || '#ffffff';
    return BOARD_BG[d.bg] || 'transparent';
  }
  /** ストローク: {c:色, w:太さ(横幅の1/1000単位), e:消しゴム(1), p:[x,y,筆圧(0-100), ...] (x,yは0-10000)} */
  /** 文字: {t:1, x,y(左上 0-10000), z:大きさ(横幅の1/1000), c:色, f:フォント, b:太字, o:縁取りの色, text} */
  function textFont(s, W) { return `${s.b ? 800 : 500} ${Math.max(1, (Number(s.z) || 40) / 1000 * W)}px "${s.f || 'M PLUS Rounded 1c'}", "M PLUS Rounded 1c", sans-serif`; }
  function textRect(ctx, s, W, H) {
    ctx.save(); ctx.font = textFont(s, W);
    const px = (Number(s.z) || 40) / 1000 * W, lines = String(s.text || '').split('\n');
    const w = Math.max(...lines.map(l => ctx.measureText(l).width), px * 0.5);
    ctx.restore();
    return { x: s.x / 10000 * W, y: s.y / 10000 * H, w, h: lines.length * px * 1.25, px, lines };
  }
  function drawText(ctx, s, W, H) {
    const r = textRect(ctx, s, W, H);
    ctx.save(); ctx.font = textFont(s, W); ctx.textBaseline = 'top'; ctx.lineJoin = 'round';
    r.lines.forEach((ln, i) => {
      const y = r.y + i * r.px * 1.25 + r.px * 0.1;
      if (s.o) { ctx.strokeStyle = s.o; ctx.lineWidth = Math.max(2, r.px * 0.16); ctx.strokeText(ln, r.x, y); }
      ctx.fillStyle = s.c || '#2b1d4a'; ctx.fillText(ln, r.x, y);
    });
    ctx.restore();
  }
  /** 図形: {t:'sh', k:'line'|'arrow'|'rect'|'ellipse', a:[x1,y1,x2,y2](0-10000), c:色, w:太さ, f:中を塗る(1)} */
  function drawShape(ctx, s, W, H) {
    const [x1, y1, x2, y2] = (s.a || [0, 0, 0, 0]).map((v, i) => v / 10000 * (i % 2 ? H : W));
    const lw = Math.max(1, (Number(s.w) || 6) / 1000 * W);
    ctx.save();
    ctx.strokeStyle = s.c || '#000'; ctx.fillStyle = s.c || '#000'; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (s.k === 'rect') ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
    else if (s.k === 'ellipse') ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2);
    else { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
    if (s.f && (s.k === 'rect' || s.k === 'ellipse')) ctx.fill(); else ctx.stroke();
    if (s.k === 'arrow') {
      const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.max(lw * 3.2, 14);
      ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - L * Math.cos(ang - 0.45), y2 - L * Math.sin(ang - 0.45));
      ctx.lineTo(x2 - L * Math.cos(ang + 0.45), y2 - L * Math.sin(ang + 0.45));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  /** 塗りつぶし: {t:'fill', x,y(0-10000), c:色} … その時点の絵の、つながった同じ色の部分を塗る */
  /**
   * 塗りつぶしは、どの画面(アプリ・小窓・OBS・補助exe)でも同じ結果になるよう、
   * 決まった大きさ(横 FILL_W)の下書きで計算してから、表示の大きさに広げて描く。
   */
  const FILL_W = 1600;
  function floodFill(ctx, s, W, H) {
    const x0 = Math.min(W - 1, Math.max(0, Math.round(s.x / 10000 * W))), y0 = Math.min(H - 1, Math.max(0, Math.round(s.y / 10000 * H)));
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    const i0 = (y0 * W + x0) * 4;
    const tr = d[i0], tg = d[i0 + 1], tb = d[i0 + 2], ta = d[i0 + 3];
    const hx = String(s.c || '#000000').replace('#', ''), n = parseInt(hx, 16) || 0;
    const fr = (n >> 16) & 255, fg = (n >> 8) & 255, fb = n & 255;
    const tol = 90;
    const same = i => {
      const a = d[i + 3];
      if (ta < 30) return a < 140;                       // 透明なところを塗る時は、うすい線のふちまで
      return Math.abs(d[i] - tr) + Math.abs(d[i + 1] - tg) + Math.abs(d[i + 2] - tb) + Math.abs(a - ta) <= tol;
    };
    const mark = new Uint8Array(W * H);
    const stack = [x0, y0];
    while (stack.length) {
      const y = stack.pop(); let x = stack.pop();
      let p = y * W + x;
      while (x > 0 && !mark[p - 1] && same((p - 1) * 4)) { x--; p--; }
      let up = false, dn = false;
      for (; x < W && !mark[p] && same(p * 4); x++, p++) {
        mark[p] = 1;
        if (y > 0) { const q = p - W; if (!mark[q] && same(q * 4)) { if (!up) { stack.push(x, y - 1); up = true; } } else up = false; }
        if (y < H - 1) { const q = p + W; if (!mark[q] && same(q * 4)) { if (!dn) { stack.push(x, y + 1); dn = true; } } else dn = false; }
      }
    }
    // すき間が出ないよう、塗った所を1ピクセル広げる
    const grow = new Uint8Array(mark);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x; if (!mark[p]) continue;
      if (x > 0) grow[p - 1] = 1; if (x < W - 1) grow[p + 1] = 1; if (y > 0) grow[p - W] = 1; if (y < H - 1) grow[p + W] = 1;
    }
    for (let p = 0; p < W * H; p++) if (grow[p]) { const i = p * 4; d[i] = fr; d[i + 1] = fg; d[i + 2] = fb; d[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    // 塗った部分だけの画像(表示用)
    const doc = ctx.canvas.ownerDocument;
    const mc = doc.createElement('canvas'); mc.width = W; mc.height = H;
    const mctx = mc.getContext('2d'); const mi = mctx.createImageData(W, H), md = mi.data;
    for (let p = 0; p < W * H; p++) if (grow[p]) { const i = p * 4; md[i] = fr; md[i + 1] = fg; md[i + 2] = fb; md[i + 3] = 255; }
    mctx.putImageData(mi, 0, 0);
    return mc;
  }
  function drawStroke(ctx, s, W, H) {
    if (s.t === 'sh') { drawShape(ctx, s, W, H); return; }
    if (s.t === 'fill') return;                                  // 塗りつぶしは drawBoard で描く
    if (s.t) { drawText(ctx, s, W, H); return; }
    const p = s.p || []; if (p.length < 3) return;
    const base = (Number(s.w) || 6) / 1000 * W;
    ctx.save();
    ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
    if (s.op && !s.e) ctx.globalAlpha = s.op;
    ctx.strokeStyle = s.e ? '#000' : (s.c || '#000'); ctx.fillStyle = ctx.strokeStyle;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const X = i => p[i] / 10000 * W, Y = i => p[i + 1] / 10000 * H;
    const pw = i => s.pr ? base * (0.25 + 1.5 * (p[i + 2] / 100)) : base;
    if (p.length === 3) { ctx.beginPath(); ctx.arc(X(0), Y(0), pw(0) / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
    if (!s.pr) {
      ctx.lineWidth = base; ctx.beginPath(); ctx.moveTo(X(0), Y(0));
      for (let i = 3; i < p.length - 3; i += 3) {
        const mx = (X(i) + X(i + 3)) / 2, my = (Y(i) + Y(i + 3)) / 2;
        ctx.quadraticCurveTo(X(i), Y(i), mx, my);
      }
      ctx.lineTo(X(p.length - 3), Y(p.length - 3)); ctx.stroke();
    } else {
      for (let i = 3; i < p.length; i += 3) {
        ctx.lineWidth = (pw(i - 3) + pw(i)) / 2;
        ctx.beginPath(); ctx.moveTo(X(i - 3), Y(i - 3)); ctx.lineTo(X(i), Y(i)); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawBoard(canvas, d, force) {
    const r = canvas.getBoundingClientRect();
    const dpr = (canvas.ownerDocument.defaultView || window).devicePixelRatio || 1;
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    const key = (d.rev || 0) + ':' + W + 'x' + H + ':' + (d.strokes ? d.strokes.length : 0) + ':' + (d.live ? (d.live.p ? d.live.p.length : String(d.live.a)) : 0);
    if (!force && canvas._kfKey === key) return;
    canvas._kfKey = key;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const list = d.strokes || [];
    // 塗りつぶし:決まった大きさの下書きで計算(結果は覚えておき、絵が変わった時だけ計算し直す)
    // 縦横比はボードの枠の比率(d.aspect)を使う。画面ごとの丸めの違いで塗れる範囲が変わらないように
    const FW = FILL_W, FH = Math.max(1, Math.round(FILL_W / (Number(d.aspect) > 0 ? Number(d.aspect) : W / H)));
    const fkey = FW + 'x' + FH + ':' + (d.rev || 0) + ':' + list.length;
    let masks = canvas._kfMasks;
    if (list.some(s => s.t === 'fill') && (!masks || masks.key !== fkey)) {
      masks = { key: fkey, m: new Map() };
      let off = canvas._kfOff;
      if (!off) { off = canvas.ownerDocument.createElement('canvas'); canvas._kfOff = off; }
      off.width = FW; off.height = FH;
      const octx = off.getContext('2d', { willReadFrequently: true });
      octx.clearRect(0, 0, FW, FH);
      const last = list.map(s => s.t === 'fill').lastIndexOf(true);
      for (let i = 0; i <= last; i++) {
        const s = list[i];
        if (s.t === 'fill') masks.m.set(i, floodFill(octx, s, FW, FH)); else drawStroke(octx, s, FW, FH);
      }
      canvas._kfMasks = masks;
    }
    list.forEach((s, i) => {
      if (s.t === 'fill') { const mc = masks && masks.m.get(i); if (mc) { ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(mc, 0, 0, W, H); ctx.restore(); } }
      else drawStroke(ctx, s, W, H);
    });
    if (d.live) drawStroke(ctx, d.live, W, H);
    // 文字のフォントが読み込まれる前に描いた時は、読み込み後に描き直す
    const fonts = canvas.ownerDocument.fonts;
    if (fonts && fonts.status !== 'loaded' && (d.strokes || []).some(s => s.t === 1) && !canvas._kfFontWait) {
      canvas._kfFontWait = true;
      fonts.ready.then(() => { canvas._kfFontWait = false; drawBoard(canvas, d, true); });
    }
  }

  /**
   * stage: 描画先 / boxes: {id:{cfg, d}} / opts: {edit, sel, onlyOutput:'pip'|'obs'}
   */
  function render(stage, boxes, opts) {
    opts = opts || {};
    const doc = stage.ownerDocument;
    stage.classList.add('kf-stage');
    stage.classList.toggle('kf-edit', !!opts.edit);
    for (const id of BOX_IDS) {
      const b = boxes[id];
      let el = stage.querySelector(`.kf-box[data-id="${id}"]`);
      const visible = b && b.cfg.on && (!opts.onlyOutput || (b.cfg.out && b.cfg.out[opts.onlyOutput]));
      if (!visible && !opts.edit) { if (el) el.remove(); continue; }
      if (!b) { if (el) el.remove(); continue; }
      if (!el) { el = doc.createElement('div'); el.className = 'kf-box'; el.dataset.id = id; stage.appendChild(el); }
      const c = b.cfg;
      let d = b.d || {};
      if (opts.edit && isEmpty(id, d)) d = Object.assign({}, SAMPLE[id], id === 'board' ? { bg: d.bg, bgColor: d.bgColor } : {});
      el.className = `kf-box sh-${c.shape || 'plain'} ah-${c.align || 'center'} av-${c.valign || 'middle'}` + (id === 'crank' || id === 'qrank' ? ' kf-col' : '') + (visible ? '' : ' off') + (opts.sel === id ? ' sel' : '');
      const fontFam = `"${c.font}", "M PLUS Rounded 1c", sans-serif`;
      const glow = c.shape === 'neon' ? `0 0 .25em ${hexA(c.accent, 1)}` : '';
      const ol = outline(c.stroke, c.strokeW);
      Object.assign(el.style, {
        left: c.x + '%', top: c.y + '%', width: c.w + '%', height: c.h + '%',
        fontFamily: fontFam, fontSize: c.size + 'px', fontWeight: c.bold ? '800' : '500', color: c.color,
        textShadow: [ol, glow].filter(Boolean).join(',') || 'none', textAlign: c.align || 'center',
      });
      el.style.setProperty('--ac', hexA(c.accent, c.accentA));
      el.style.setProperty('--acs', hexA(c.accent, 1));
      el.style.setProperty('--bg', hexA(c.bg, c.bgA));
      el.style.setProperty('--tagc', c.tagColor || '#ffffff');
      el.style.setProperty('--ac2', hexA(c.accent2 || '#ffd23f', 1));

      if (id === 'board') {
        let cv = el.querySelector('canvas.kf-board');
        if (!cv) { el.innerHTML = ''; cv = doc.createElement('canvas'); cv.className = 'kf-board'; el.appendChild(cv); }
        el.style.background = boardBg(d);
        el.style.borderRadius = c.shape === 'card' ? '12px' : '0';
        el.style.border = c.shape === 'card' ? `3px solid ${hexA(c.accent, 1)}` : 'none';
        drawBoard(cv, d);
        editDeco(doc, el, id, opts);
        continue;
      }
      el.style.background = ''; el.style.border = ''; el.style.borderRadius = '';
      const html = content(id, c, d);
      const sig = id + '|' + c.shape + '|' + c.labelOn + '|' + c.labelPos + '|' + html.replace(/data-tmr="1">[^<]*</, 'data-tmr="1"><');
      if (el._kfSig !== sig) {
        const prevVals = {};
        el.querySelectorAll('[data-cnt]').forEach(x => { prevVals[x.dataset.cnt] = Number(x.textContent.replace(/[^\d]/g, '')); });
        const firstShow = !el._kfSig || (id === 'quiz' && el._kfState !== d.state);
        el._kfSig = sig; el._kfState = d.state;
        el.innerHTML = html ? `<div class="kf-in lp-${c.labelPos || 'top'}${firstShow && !opts.edit ? ' kf-anim' : ''}">${html}</div>` : '';
        // 増えた時の演出(フォロワー・コメント数)
        if (!opts.edit && c.fx !== false) {
          el.querySelectorAll('[data-cnt]').forEach(x => {
            const k = x.dataset.cnt, now = Number(x.textContent.replace(/[^\d]/g, ''));
            if (prevVals[k] != null && !isNaN(prevVals[k]) && now > prevVals[k]) {
              x.classList.add('kf-bump');
              if (k.startsWith('fol')) {
                const pop = doc.createElement('span'); pop.className = 'kf-pop'; pop.textContent = '+' + (now - prevVals[k]);
                const host = el.querySelector('.kf-in'); if (host) host.appendChild(pop);
              }
            }
          });
        }
      }
      editDeco(doc, el, id, opts);
      el._kfSize = c.size; el._kfFit = c.autoFit !== false;
      fitBox(el);
    }
    tick(stage);
  }
  /** 中身が枠からはみ出す時は、文字を小さくして枠に収める */
  function fitBox(el) {
    const inn = el.querySelector(':scope>.kf-in');
    const base = Number(el._kfSize) || 40;
    if (el.style.fontSize !== base + 'px') el.style.fontSize = base + 'px';
    if (!inn || !el._kfFit) return;
    const bw = el.clientWidth, bh = el.clientHeight;
    if (!bw || !bh) return;
    for (let i = 0; i < 4; i++) {
      const w = Math.max(inn.scrollWidth, inn.offsetWidth), h = Math.max(inn.scrollHeight, inn.offsetHeight);
      const k = Math.min(1, bw / w, bh / h);
      if (k >= 0.995) break;
      const cur = parseFloat(el.style.fontSize) || base;
      el.style.fontSize = Math.max(6, Math.floor(cur * k * 0.98 * 10) / 10) + 'px';
    }
  }
  function editDeco(doc, el, id, opts) {
    el.querySelectorAll(':scope>.kf-tag,:scope>.kf-rs').forEach(x => x.remove());
    if (!opts.edit) return;
    const tag = doc.createElement('div'); tag.className = 'kf-tag'; tag.textContent = BOX_LABEL[id];
    const rs = doc.createElement('div'); rs.className = 'kf-rs';
    el.append(tag, rs);
  }
  function isEmpty(id, d) {
    if (!d) return true;
    if (id === 'fol') return !(d.rows && d.rows.some(r => r && r.n != null));
    if (id === 'crank' || id === 'qrank') return !(d.rows && d.rows.length);
    if (id === 'quiz') return !d.state || d.state === 'idle';
    if (id === 'board') return !(d.strokes && d.strokes.length) && !d.live;
    if (id === 'cnt') return !d.n;
    return false;
  }

  /** タイマーと締め切りの残り秒数だけを書き換える(100msごとに呼ぶ) */
  function tick(stage, boxes) {
    const now = Date.now();
    stage.querySelectorAll('.kf-box[data-id=tmr] [data-tmr]').forEach(x => {
      const d = stage._kfTmr; if (!d) return;
      const t = fmtTime(tmrValue(d, now), d);
      if (x.textContent !== t) {
        const relen = x.textContent.length !== t.length;
        x.textContent = t;
        if (relen) { const box = x.closest('.kf-box'); if (box) fitBox(box); }
      }
    });
    stage.querySelectorAll('[data-qdl]').forEach(x => {
      const left = Math.max(0, Math.ceil((Number(x.dataset.qdl) - now) / 1000));
      const t = `のこり ${left} 秒`;
      if (x.textContent !== t) x.textContent = t;
    });
  }
  /** render の前に、タイマーのデータをステージに覚えさせる */
  function renderAll(stage, boxes, opts) {
    const t = boxes.tmr && boxes.tmr.d;
    stage._kfTmr = t || SAMPLE.tmr;
    render(stage, boxes, opts);
  }

  root.KFR = { BOX_IDS, BOX_LABEL, SHAPES, CSS, render: renderAll, tick, hexA, fmtTime, tmrValue, drawStroke, drawBoard, boardBg, textRect, textFont };
})(typeof window !== 'undefined' ? window : globalThis);
