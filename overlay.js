/* Kaki Frost 表示の描画(アプリと同じ kakirender.js を使う) */
(() => {
  'use strict';
  const stage = document.getElementById('stage');
  const hint = document.getElementById('hint');
  const st = document.createElement('style'); st.textContent = KFR.CSS; document.head.appendChild(st);
  let hideT = 0, last = null, strokes = [];
  const state = {};
  function say(msg, keep) {
    hint.textContent = 'Kaki Frost 表示: ' + msg; hint.classList.remove('hide');
    clearTimeout(hideT); if (!keep) hideT = setTimeout(() => hint.classList.add('hide'), 5000);
  }
  /** アプリの「画面の大きさ」で作った配置を、この窓の大きさに合わせて拡大する(縦横比を保って中央) */
  function fit(p) {
    const W = Number(p.pipW) || 1280, H = Number(p.pipH) || 720;
    const k = Math.min(innerWidth / W, innerHeight / H);
    Object.assign(stage.style, { width: W + 'px', height: H + 'px', left: ((innerWidth - W * k) / 2) + 'px', top: ((innerHeight - H * k) / 2) + 'px', transform: `scale(${k})` });
  }
  function draw(p) {
    last = p; fit(p);
    const boxes = {};
    for (const id of KFR.BOX_IDS) {
      const b = p.boxes && p.boxes[id];
      if (!b) continue;
      const d = Object.assign({}, b.d);
      if (id === 'board') { if (d.strokes) strokes = d.strokes; else d.strokes = strokes; }
      boxes[id] = { cfg: Object.assign({}, b.cfg, { out: { exe: true } }), d };
    }
    KFR.render(stage, boxes, { onlyOutput: 'exe' });
  }
  addEventListener('resize', () => { if (last) draw(last); });
  setInterval(() => KFR.tick(stage), 100);   // タイマーと残り秒数はこの窓の中で進める
  window.kfExe.onPayload(p => {
    if (!state.got) { state.got = true; say('受信中 ✨'); }
    draw(p);
  });
  window.kfExe.onState(s => {
    const was = state.clients;
    Object.assign(state, s);
    document.body.classList.toggle('editing', !!s.editing);
    if (s.editing) say(`位置とサイズの調整中(終わったら「調整おわり」か ${s.shortcut})`, true);
    else if (!s.clients) { state.got = false; if (was !== 0) say(`アプリを待っています(ポート ${s.port})。アプリの🪟表示タブで「補助exeに送る」をオンにしてね`); }
    else say('アプリと接続しました');
  });
  document.getElementById('done').addEventListener('click', () => window.kfExe.endEdit());
})();
