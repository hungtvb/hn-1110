/* Hành trình 6 năm v2 — Bật Hưng ♥ Diệu Huyền */
(function () {
'use strict';

/* ================= Helpers ================= */
function $(id) { return document.getElementById(id); }

var HEART_SVG = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M50,90 C22,66 6,48 6,30 C6,15 17,6 30,6 C39,6 47,11 50,19 C53,11 61,6 70,6 C83,6 94,15 94,30 C94,48 78,66 50,90 Z" ' +
  'fill="COLOR"/>' +
  '<ellipse cx="33" cy="26" rx="9" ry="6" fill="rgba(255,255,255,.45)" transform="rotate(-24 33 26)"/>' +
  '</svg>';

function heartSVG(color) { return HEART_SVG.replace('COLOR', color); }

/* ================= FX engine (canvas, tự vẽ) ================= */
var fx = $('fx'), fctx = fx.getContext('2d');
var parts = [], fxMode = 'ambient', rafId = null;

function resizeFx() { fx.width = window.innerWidth; fx.height = window.innerHeight; }
window.addEventListener('resize', resizeFx); resizeFx();

function drawHeartShape(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  c.beginPath();
  c.moveTo(0, s * 0.9);
  c.bezierCurveTo(-s * 1.35, -s * 0.05, -s * 0.65, -s * 1.05, 0, -s * 0.32);
  c.bezierCurveTo(s * 0.65, -s * 1.05, s * 1.35, -s * 0.05, 0, s * 0.9);
  c.closePath(); c.fill(); c.restore();
}

function drawPetal(c, x, y, s, rot, color) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath();
  c.moveTo(0, -s);
  c.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.72, s * 0.62, 0, s);
  c.bezierCurveTo(-s * 0.72, s * 0.62, -s * 0.95, -s * 0.55, 0, -s);
  c.closePath();
  c.fillStyle = color; c.fill();
  c.restore();
}

var PETAL_COLORS = ['#ffb3c6', '#ff8fab', '#ffc8d8', '#f9a8c0', '#ffd6e0'];
var HEART_COLORS = ['#ff5e8a', '#ff8eab', '#ff3366', '#ffb3c6'];

function spawnPetal() {
  parts.push({ k: 'petal',
    x: Math.random() * fx.width, y: -24,
    s: Math.random() * 9 + 7,
    vy: Math.random() * 0.9 + 0.7,
    sway: Math.random() * 1.6 + 0.6, ph: Math.random() * 6.28,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.04,
    c: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
    a: Math.random() * 0.35 + 0.6 });
}
function spawnFloatHeart() {
  parts.push({ k: 'fh',
    x: Math.random() * fx.width, y: fx.height + 24,
    s: Math.random() * 8 + 6,
    vy: -(Math.random() * 0.7 + 0.4),
    sway: Math.random() * 1.1 + 0.4, ph: Math.random() * 6.28,
    c: HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0],
    a: Math.random() * 0.3 + 0.5 });
}
function spawnSparkle() {
  parts.push({ k: 'spark',
    x: Math.random() * fx.width, y: Math.random() * fx.height,
    r: Math.random() * 1.8 + 0.7,
    life: 1, decay: 0.008 + Math.random() * 0.012,
    tw: Math.random() * 6.28 });
}
function spawnHeartBurst(x, y, n) {
  for (var i = 0; i < (n || 14); i++) {
    var ang = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4;
    parts.push({ k: 'burst', x: x, y: y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2,
      s: Math.random() * 9 + 6,
      c: HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0],
      rot: (Math.random() - 0.5) * 0.8, vr: (Math.random() - 0.5) * 0.1,
      life: 1, decay: 0.014 + Math.random() * 0.01 });
  }
}
function spawnPetalBurst(x, y, n) {
  for (var i = 0; i < (n || 26); i++) {
    var ang = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 5;
    parts.push({ k: 'pburst', x: x, y: y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3,
      s: Math.random() * 8 + 6,
      c: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.25,
      life: 1, decay: 0.01 + Math.random() * 0.008 });
  }
}
function spawnRainHeart() {
  parts.push({ k: 'rain', x: Math.random() * fx.width, y: -24,
    s: Math.random() * 11 + 8,
    c: HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0],
    vy: Math.random() * 1.7 + 1.3,
    sway: Math.random() * 1.4 + 0.4, ph: Math.random() * 6.28,
    rot: (Math.random() - 0.5) * 0.5 });
}
/* ---- pháo hoa ---- */
var FW_COLORS = ['#ff5e8a', '#ffd166', '#ff8fab', '#f3d38b', '#fff3f8', '#f25c84'];
function launchFirework() {
  var c = FW_COLORS[(Math.random() * FW_COLORS.length) | 0];
  parts.push({ k: 'rocket',
    x: fx.width * 0.15 + Math.random() * fx.width * 0.7,
    y: fx.height + 10,
    vy: -(10 + Math.random() * 4),
    targetY: fx.height * 0.18 + Math.random() * fx.height * 0.3,
    c: c, trail: [] });
}
function explodeFirework(x, y, color) {
  var n = 46 + ((Math.random() * 26) | 0);
  for (var i = 0; i < n; i++) {
    var ang = (i / n) * Math.PI * 2 + Math.random() * 0.2;
    var sp = 2.2 + Math.random() * 3.6;
    parts.push({ k: 'spark2',
      x: x, y: y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
      r: Math.random() * 2.2 + 1.1,
      c: Math.random() < 0.25 ? '#ffffff' : color,
      life: 1, decay: 0.011 + Math.random() * 0.009 });
  }
  // vòng tim nhỏ ở tâm vụ nổ
  spawnHeartBurst(x, y, 6);
}

function fxLoop() {
  fctx.clearRect(0, 0, fx.width, fx.height);

  if (fxMode === 'ambient') {
    if (parts.length < 110 && Math.random() < 0.30) spawnPetal();
    if (Math.random() < 0.10) spawnFloatHeart();
    if (Math.random() < 0.25) spawnSparkle();
  } else if (fxMode === 'celebrate') {
    if (parts.length < 130 && Math.random() < 0.45) spawnRainHeart();
    if (Math.random() < 0.05) launchFirework();
  }

  for (var i = parts.length - 1; i >= 0; i--) {
    var p = parts[i], dead = false;
    if (p.k === 'petal') {
      p.ph += 0.025; p.y += p.vy; p.x += Math.sin(p.ph) * p.sway; p.rot += p.vr;
      fctx.globalAlpha = p.a;
      drawPetal(fctx, p.x, p.y, p.s, p.rot, p.c);
      fctx.globalAlpha = 1;
      if (p.y > fx.height + 30) dead = true;
    } else if (p.k === 'fh') {
      p.ph += 0.03; p.y += p.vy; p.x += Math.sin(p.ph) * p.sway;
      fctx.globalAlpha = p.a; fctx.fillStyle = p.c;
      drawHeartShape(fctx, p.x, p.y, p.s, Math.sin(p.ph) * 0.25);
      fctx.globalAlpha = 1;
      if (p.y < -30) dead = true;
    } else if (p.k === 'spark') {
      p.tw += 0.06; p.life -= p.decay;
      var a = Math.max(p.life, 0) * (0.55 + 0.45 * Math.sin(p.tw));
      fctx.globalAlpha = a;
      fctx.fillStyle = '#e8b95d';
      fctx.shadowColor = '#f3d38b'; fctx.shadowBlur = 6;
      fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, 6.29); fctx.fill();
      fctx.shadowBlur = 0; fctx.globalAlpha = 1;
      if (p.life <= 0) dead = true;
    } else if (p.k === 'burst' || p.k === 'pburst') {
      p.vy += 0.14; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.life -= p.decay;
      fctx.globalAlpha = Math.max(p.life, 0);
      if (p.k === 'burst') { fctx.fillStyle = p.c; drawHeartShape(fctx, p.x, p.y, p.s, p.rot); }
      else drawPetal(fctx, p.x, p.y, p.s, p.rot, p.c);
      fctx.globalAlpha = 1;
      if (p.life <= 0) dead = true;
    } else if (p.k === 'rain') {
      p.ph += 0.03; p.y += p.vy; p.x += Math.sin(p.ph) * p.sway;
      fctx.globalAlpha = 0.92; fctx.fillStyle = p.c;
      drawHeartShape(fctx, p.x, p.y, p.s, p.rot + Math.sin(p.ph) * 0.2);
      fctx.globalAlpha = 1;
      if (p.y > fx.height + 30) dead = true;
    } else if (p.k === 'rocket') {
      p.y += p.vy;
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 9) p.trail.shift();
      fctx.globalAlpha = 0.85;
      for (var t = 0; t < p.trail.length; t++) {
        fctx.fillStyle = p.c;
        fctx.beginPath();
        fctx.arc(p.trail[t].x, p.trail[t].y, 1.6 * (t / p.trail.length) + 0.6, 0, 6.29);
        fctx.fill();
      }
      fctx.globalAlpha = 1;
      if (p.y <= p.targetY) { explodeFirework(p.x, p.y, p.c); dead = true; }
    } else if (p.k === 'spark2') {
      p.vy += 0.06; p.vx *= 0.985; p.x += p.vx; p.y += p.vy;
      p.life -= p.decay;
      fctx.globalAlpha = Math.max(p.life, 0);
      fctx.fillStyle = p.c;
      fctx.shadowColor = p.c; fctx.shadowBlur = 5;
      fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, 6.29); fctx.fill();
      fctx.shadowBlur = 0; fctx.globalAlpha = 1;
      if (p.life <= 0) dead = true;
    }
    if (dead) parts.splice(i, 1);
  }
  rafId = requestAnimationFrame(fxLoop);
}
function setFxMode(m) { fxMode = m; }
fxLoop();

/* ================= Nhạc nền (MP3) ================= */
var MusicBox = (function () {
  var audio = null, playing = false;

  function ensure() {
    if (!audio) {
      audio = new Audio('assets/nhac-nen.mp3');
      audio.loop = true;
      audio.volume = 0.7;
    }
    return true;
  }

  return {
    start: function () {
      if (!ensure() || playing) return;
      playing = true;
      audio.play().catch(function () { playing = false; });
      $('music-toggle').classList.remove('muted');
    },
    stop: function () {
      playing = false;
      if (audio) audio.pause();
      $('music-toggle').classList.add('muted');
    },
    toggle: function () {
      if (playing) this.stop();
      else this.start();
    },
    isPlaying: function () { return playing; }
  };
})();

$('music-toggle').addEventListener('click', function (e) {
  e.stopPropagation();
  MusicBox.toggle();
});

/* ================= cầu vồng pastel theo chặng ================= */
var RB_CLASSES = ['rb0', 'rb1', 'rb2', 'rb3', 'rb4', 'rb5'];
function setRainbow(i) {
  RB_CLASSES.forEach(function (c) { document.body.classList.remove(c); });
  if (i >= 0 && i < RB_CLASSES.length) document.body.classList.add(RB_CLASSES[i]);
}

/* ================= chạm bất kỳ đâu → tim bung ================= */
document.addEventListener('pointerdown', function (e) {
  if (e.target.closest('button, canvas, .envelope, .tap-heart, .puzzle-piece, #music-toggle')) return;
  spawnHeartBurst(e.clientX, e.clientY, 4);
});

/* ================= 2 nhân vật lấp ló rình xem ================= */
var PEEKERS = [
  { src: 'assets/chu-re-lap-lo.webp', alt: 'Bật Hưng lấp ló' },
  { src: 'assets/co-dau-lap-lo.webp', alt: 'Diệu Huyền lấp ló' }
];
/* màn envelope/finale: nội dung căn giữa nên 4 góc viewport luôn trống */
var PEEK_SPOTS = {
  envelope: [ {top:'76px',left:'10px'}, {top:'76px',right:'10px'}, {bottom:'18px',left:'10px'}, {bottom:'18px',right:'10px'} ],
  finale:   [ {top:'76px',left:'10px'}, {top:'76px',right:'10px'}, {bottom:'18px',left:'10px'}, {bottom:'18px',right:'10px'} ]
};
function clearPeekers() {
  var box = $('peekers');
  if (box) box.innerHTML = '';
  var olds = document.querySelectorAll('.peeker-card');
  for (var i = 0; i < olds.length; i++) olds[i].parentNode.removeChild(olds[i]);
}
function spawnPeekers(screen) {
  clearPeekers();
  var chars = PEEKERS.slice().sort(function () { return Math.random() - 0.5; });
  var n = 1 + (Math.random() < 0.6 ? 1 : 0); // 1-2 đứa
  /* màn thư / chặng: lấp ló sau 2 góc trên của card — không bao giờ che chữ */
  if (screen === 'stage' || screen === 'letter') {
    var host = document.querySelector(screen === 'stage' ? '#scr-stage .stage-card' : '#scr-letter .paper');
    if (!host) return;
    var sides = ['pl', 'pr'].sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < Math.min(n, 2); i++) {
      var img = document.createElement('img');
      img.className = 'peeker-card ' + sides[i];
      img.src = chars[i % chars.length].src;
      img.alt = chars[i % chars.length].alt;
      img.style.animationDelay = (i * 0.35) + 's, ' + (0.6 + i * 0.35) + 's';
      host.appendChild(img);
    }
    return;
  }
  var box = $('peekers');
  if (!box) return;
  var spots = (PEEK_SPOTS[screen] || []).slice().sort(function () { return Math.random() - 0.5; });
  n = Math.min(spots.length, n);
  for (var j = 0; j < n; j++) {
    var im = document.createElement('img');
    im.className = 'peeker';
    im.src = chars[j % chars.length].src;
    im.alt = chars[j % chars.length].alt;
    var sp = spots[j];
    if (sp.top) im.style.top = sp.top;
    if (sp.bottom) im.style.bottom = sp.bottom;
    if (sp.left) im.style.left = sp.left;
    if (sp.right) im.style.right = sp.right;
    im.style.animationDelay = (j * 0.35) + 's, ' + (0.6 + j * 0.35) + 's';
    box.appendChild(im);
  }
}

/* ================= Screens ================= */
var screens = {
  envelope: $('scr-envelope'),
  letter: $('scr-letter'),
  stage: $('scr-stage'),
  finale: $('scr-finale')
};
function show(name) {
  Object.keys(screens).forEach(function (k) { screens[k].classList.remove('active'); });
  void screens[name].offsetWidth;
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
  spawnPeekers(name); // 2 đứa lấp ló đổi vị trí random mỗi màn
}

/* ================= Phong bì ================= */
var envelopeOpened = false;
function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;
  $('envelope').classList.add('open');
  $('env-hint').textContent = 'Đang mở thư…';
  // nổ cánh hoa khi mở
  var r = $('envelope').getBoundingClientRect();
  setTimeout(function () {
    spawnPetalBurst(r.left + r.width / 2, r.top + 40, 40);
    spawnHeartBurst(r.left + r.width / 2, r.top + 60, 16);
  }, 700);
  // bắt đầu nhạc sau gesture của user
  MusicBox.start();
  setTimeout(function () { showLetter(); }, 1900);
}
$('envelope').addEventListener('click', openEnvelope);
$('env-hint').addEventListener('click', openEnvelope);

/* ================= Lá thư + bộ đếm ================= */
var WEDDING = new Date(2020, 9, 11, 0, 0, 0); // 11/10/2020
var counterTimer = null;

function tickCounter() {
  var now = new Date();
  var diff = Math.max(0, now - WEDDING);
  var d = Math.floor(diff / 86400000);
  var h = Math.floor(diff / 3600000) % 24;
  var m = Math.floor(diff / 60000) % 60;
  var s = Math.floor(diff / 1000) % 60;
  $('c-days').textContent = d.toLocaleString('vi-VN');
  $('c-hours').textContent = (h < 10 ? '0' : '') + h;
  $('c-mins').textContent = (m < 10 ? '0' : '') + m;
  $('c-secs').textContent = (s < 10 ? '0' : '') + s;
}

function showLetter() {
  show('letter');
  setFxMode('ambient');
  setRainbow(-1);
  tickCounter();
  if (counterTimer) clearInterval(counterTimer);
  counterTimer = setInterval(tickCounter, 1000);
  // cặp đôi bước ra nắm tay + vệt tim
  var cw = $('couple-walkin');
  cw.classList.remove('walkin');
  void cw.offsetWidth;
  cw.classList.add('walkin');
  var trailN = 0;
  var trailIv = setInterval(function () {
    var r = cw.getBoundingClientRect();
    spawnHeartBurst(r.left + r.width / 2 + (Math.random() - 0.5) * 70, r.top + r.height / 2, 3);
    if (++trailN >= 8) clearInterval(trailIv);
  }, 160);
}

$('btn-journey').addEventListener('click', function (e) {
  var r = e.target.getBoundingClientRect();
  spawnPetalBurst(r.left + r.width / 2, r.top, 30);
  spawnHeartBurst(r.left + r.width / 2, r.top, 12);
  setTimeout(function () { startStage(0); }, 600);
});

/* ================= Các chặng 2020 → 2026 ================= */
var STAGES = [
  { year: '2020', type: 'quiz',
    msg: 'Ngày anh đeo nhẫn vào tay em — từ hôm đó, mọi kế hoạch của anh đều có em trong đó.' },
  { year: '2021', type: 'tap',
    msg: 'Năm đầu làm vợ chồng. Mình cãi nhau, mình làm hòa — và mình thương nhau hơn.' },
  { year: '2022', type: 'catch',
    msg: 'Có những ngày rất mệt. Nhưng về đến nhà, thấy em cười là anh lại ổn.' },
  { year: '2023', type: 'rest',
    msg: 'Cảm ơn em vì những bữa cơm nóng, và những đêm thức khuya cùng anh lo toan.' },
  { year: '2024', type: 'puzzle',
    msg: 'Đời anh như một bức tranh ghép — mảnh nào cũng có bóng dáng em.' },
  { year: '2025', type: 'rest', btn: 'Đến năm 2026 →',
    msg: 'Sáu năm rồi. Vẫn là em — người anh muốn nắm tay đi đến cuối con đường.' }
];

var stageIdx = 0, catchRAF = null;

function renderDots() {
  var dots = $('stage-dots'); dots.innerHTML = '';
  for (var i = 0; i < STAGES.length; i++) {
    var d = document.createElement('i');
    if (i <= stageIdx) d.className = 'on';
    dots.appendChild(d);
  }
}

function startStage(i) {
  stageIdx = i;
  stopCatch();
  show('stage');
  setFxMode('ambient');
  setRainbow(i);
  renderDots();
  var st = STAGES[i];
  $('stage-year').textContent = st.year;
  $('stage-count').textContent = (i + 1) + ' / ' + STAGES.length;
  $('stage-msg').textContent = st.msg;
  $('stage-action').innerHTML = '';
  var body = $('stage-body'); body.innerHTML = '';
  if (st.type === 'quiz') buildQuiz(body);
  else if (st.type === 'tap') buildTap(body);
  else if (st.type === 'catch') buildCatch(body);
  else if (st.type === 'puzzle') buildPuzzle(body);
  else if (st.type === 'rest') buildRest(body, st.btn || 'Tiếp tục →');
}

function nextStage() {
  if (stageIdx + 1 < STAGES.length) startStage(stageIdx + 1);
  else startFinale();
}
function stageButton(label, fn) {
  var b = document.createElement('button');
  b.className = 'btn-ghost'; b.textContent = label;
  b.addEventListener('click', fn);
  $('stage-action').appendChild(b);
}
function celebrateAt(el) {
  var r = el.getBoundingClientRect();
  spawnPetalBurst(r.left + r.width / 2, r.top + r.height / 2, 36);
  spawnHeartBurst(r.left + r.width / 2, r.top + r.height / 2, 14);
}

/* ---- 2020: quiz ---- */
function buildQuiz(body) {
  var q = document.createElement('div'); q.className = 'stage-q';
  q.textContent = 'Ngày cưới của chúng mình là ngày nào?';
  var opts = document.createElement('div'); opts.className = 'quiz-opts';
  var hint = document.createElement('div'); hint.className = 'quiz-hint';
  ['11 / 10 / 2019', '11 / 10 / 2020', '11 / 10 / 2021'].forEach(function (t, idx) {
    var b = document.createElement('button');
    b.className = 'quiz-opt'; b.textContent = t;
    b.addEventListener('click', function () {
      if (idx === 1) {
        b.classList.add('right'); hint.textContent = 'Chính xác! Trí nhớ tốt lắm.';
        celebrateAt(b);
        setTimeout(nextStage, 1100);
      } else {
        b.classList.add('wrong');
        hint.textContent = 'Sai rồi… thử lại nhé em.';
        setTimeout(function () { b.classList.remove('wrong'); }, 600);
      }
    });
    opts.appendChild(b);
  });
  body.appendChild(q); body.appendChild(opts); body.appendChild(hint);
}

/* ---- 2021: chạm tim x6 ---- */
function buildTap(body) {
  var need = 6, got = 0;
  var heart = document.createElement('div'); heart.className = 'tap-heart';
  heart.innerHTML = heartSVG('#f25c84');
  var count = document.createElement('div'); count.className = 'tap-count';
  count.textContent = '0 / ' + need;
  var label = document.createElement('div'); label.className = 'tap-label';
  label.textContent = 'Chạm vào trái tim đang đập 6 lần';
  heart.addEventListener('pointerdown', function (e) {
    if (got >= need) return;
    got++; count.textContent = got + ' / ' + need;
    var r = heart.getBoundingClientRect();
    spawnHeartBurst(e.clientX || (r.left + r.width / 2), e.clientY || (r.top + r.height / 2), 6);
    heart.style.transform = 'scale(0.88)';
    setTimeout(function () { heart.style.transform = ''; }, 120);
    if (got >= need) {
      label.textContent = 'Trái tim này đập vì em.';
      celebrateAt(heart);
      stageButton('Tiếp tục →', nextStage);
    }
  });
  body.appendChild(heart); body.appendChild(count); body.appendChild(label);
}

/* ---- 2022: hứng tim rơi ---- */
function buildCatch(body) {
  var need = 6, got = 0, over = false;
  var hud = document.createElement('div'); hud.className = 'catch-hud';
  var tip = document.createElement('div'); tip.className = 'catch-tip';
  tip.textContent = 'Kéo ngón tay để hứng những trái tim đang rơi';
  var cv = document.createElement('canvas'); cv.id = 'catch-canvas';
  var W = Math.min(400, window.innerWidth - 84), H = 330;
  cv.width = W; cv.height = H;
  cv.style.height = H + 'px';
  body.appendChild(hud); body.appendChild(cv); body.appendChild(tip);

  var c = cv.getContext('2d');
  var basket = { x: W / 2, w: 78, h: 14, y: H - 26 };
  var hearts = [], lastSpawn = 0;
  var colors = ['#ff5e8a', '#ff8eab', '#f25c84', '#ff3366'];

  function spawn() {
    hearts.push({
      x: 20 + Math.random() * (W - 40), y: -20,
      s: 10 + Math.random() * 8, vy: 1.8 + Math.random() * 1.6 + got * 0.15,
      c: colors[(Math.random() * colors.length) | 0], rot: (Math.random() - 0.5) * 0.6
    });
  }
  function drawBasket() {
    c.save();
    c.fillStyle = '#d4a24e';
    c.shadowColor = '#f3d38b'; c.shadowBlur = 12;
    c.beginPath();
    var bx = basket.x - basket.w / 2, by = basket.y;
    if (c.roundRect) c.roundRect(bx, by, basket.w, basket.h, 7); else c.rect(bx, by, basket.w, basket.h);
    c.fill(); c.restore();
  }
  function loop(t) {
    if (over) return;
    c.clearRect(0, 0, W, H);
    if (t - lastSpawn > 750) { spawn(); lastSpawn = t; }
    drawBasket();
    for (var i = hearts.length - 1; i >= 0; i--) {
      var h = hearts[i];
      h.y += h.vy;
      c.fillStyle = h.c;
      drawHeartShape(c, h.x, h.y, h.s, h.rot);
      if (h.y > basket.y - 8 && h.y < basket.y + basket.h + 10 &&
          Math.abs(h.x - basket.x) < basket.w / 2 + 6) {
        hearts.splice(i, 1); got++;
        hud.innerHTML = '<span>Đã hứng: ' + got + ' / ' + need + '</span><span>♥</span>';
        var r = cv.getBoundingClientRect();
        spawnHeartBurst(r.left + h.x * (r.width / W), r.top + h.y * (r.height / H), 7);
        if (got >= need) { win(); return; }
      } else if (h.y > H + 24) {
        hearts.splice(i, 1);
      }
    }
    catchRAF = requestAnimationFrame(loop);
  }
  function win() {
    over = true; cancelAnimationFrame(catchRAF); catchRAF = null;
    hud.innerHTML = '<span>Đã hứng: ' + need + ' / ' + need + '</span><span>♥</span>';
    tip.textContent = 'Anh sẽ hứng hết mọi muộn phiền, chỉ để lại niềm vui cho em.';
    celebrateAt(cv);
    stageButton('Tiếp tục →', nextStage);
  }
  function moveTo(clientX) {
    var r = cv.getBoundingClientRect();
    var x = (clientX - r.left) * (W / r.width);
    basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, x));
  }
  cv.addEventListener('pointermove', function (e) { moveTo(e.clientX); });
  cv.addEventListener('pointerdown', function (e) { moveTo(e.clientX); });
  cv.addEventListener('touchmove', function (e) { e.preventDefault(); moveTo(e.touches[0].clientX); }, { passive: false });
  hud.innerHTML = '<span>Đã hứng: 0 / ' + need + '</span><span>♥</span>';
  catchRAF = requestAnimationFrame(loop);
}
function stopCatch() {
  if (catchRAF) { cancelAnimationFrame(catchRAF); catchRAF = null; }
}

/* ---- 2024: ghép tim 4 mảnh ----
   Mỗi mảnh là TRỌN trái tim 200x200 (khớp khít lưới slot), chỉ hiện 1/4 nhờ
   clip-path. Khi đặt, mảnh bay về đúng gốc lưới, scale 1 — 4 mảnh tile khít
   tuyệt đối, không khe hở (không còn công thức scale quanh tâm dễ lệch). */
function buildPuzzle(body) {
  var clips = ['inset(0 50% 50% 0)', 'inset(0 0 50% 50%)', 'inset(50% 50% 0 0)', 'inset(50% 0 0 50%)'];
  var GRID_L = 24, GRID_T = 0;   // gốc lưới slot 200x200 trong board
  var PS = 0.28;                 // mảnh thu nhỏ trong khay: 200*0.28 = 56px
  var trayX = [8, 68, 128, 188], trayY = 248;

  var board = document.createElement('div'); board.className = 'puzzle-board';
  var slots = document.createElement('div'); slots.className = 'puzzle-slots';
  var slotEls = [];
  for (var s = 0; s < 4; s++) {
    var sl = document.createElement('div');
    sl.className = 'puzzle-slot s' + s;
    slots.appendChild(sl); slotEls.push(sl);
  }
  board.appendChild(slots);
  // tim mẫu mờ làm nền — thấy ngay đích đến
  var ghost = document.createElement('div'); ghost.className = 'puzzle-ghost';
  ghost.innerHTML = heartSVG('#f25c84');
  board.appendChild(ghost);

  var order = [0, 1, 2, 3].sort(function () { return Math.random() - 0.5; });
  var pos = [0, 1, 2, 3].sort(function () { return Math.random() - 0.5; });
  var placed = 0, done = false;
  order.forEach(function (qi, k) {
    var p = document.createElement('div');
    p.className = 'puzzle-piece';
    p.dataset.q = qi;
    var tx = trayX[pos[k]];
    p.style.left = tx + 'px';
    p.style.top = trayY + 'px';
    p.style.transform = 'scale(' + PS + ')';
    p.innerHTML = heartSVG('#f25c84').replace('<svg', '<svg style="clip-path:' + clips[qi] + '"');
    p.addEventListener('click', function () {
      if (done || p.classList.contains('placed')) return;
      // về đúng gốc lưới, scale 1 — 4 mảnh ráp khít thành tim liền mạch
      p.style.transform = 'translate(' + (GRID_L - tx) + 'px,' + (GRID_T - trayY) + 'px) scale(1)';
      p.classList.add('placed');
      placed++;
      var r = p.getBoundingClientRect();
      spawnHeartBurst(r.left + r.width / 2, r.top + r.height / 2, 5);
      if (placed === 4) {
        done = true;
        setTimeout(function () {
          var d = document.createElement('div');
          d.className = 'puzzle-done';
          d.textContent = 'Hoàn chỉnh — như tình yêu của mình vậy.';
          body.appendChild(d);
          celebrateAt(board);
          stageButton('Tiếp tục →', nextStage);
        }, 650);
      }
    });
    board.appendChild(p);
  });
  var label = document.createElement('div'); label.className = 'tap-label';
  label.textContent = 'Chạm từng mảnh để ghép thành trái tim';
  body.appendChild(board); body.appendChild(label);
}

/* ---- 2023 / 2025: nghỉ ---- */
function buildRest(body, btnLabel) {
  var d = document.createElement('div');
  d.style.cssText = 'width:120px;height:120px;opacity:.95';
  d.innerHTML = heartSVG('#ff8fab');
  var sh = d.querySelector('svg');
  if (sh) sh.style.filter = 'drop-shadow(0 8px 16px rgba(255,143,171,.5))';
  body.appendChild(d);
  stageButton(btnLabel, function () { celebrateAt(d); setTimeout(nextStage, 350); });
}

/* ================= FINALE ================= */
function startFinale() {
  stopCatch();
  if (counterTimer) { clearInterval(counterTimer); counterTimer = null; }
  show('finale');
  setFxMode('celebrate');
  setRainbow(-1);
  // loạt pháo hoa chào mừng
  var n = 0;
  var iv = setInterval(function () {
    launchFirework();
    if (++n >= 5) clearInterval(iv);
  }, 450);
}

$('btn-replay').addEventListener('click', function () {
  parts = [];
  envelopeOpened = false;
  setRainbow(-1);
  $('couple-walkin').classList.remove('walkin');
  $('envelope').classList.remove('open');
  $('env-hint').textContent = 'Chạm vào phong bì để mở';
  show('envelope');
  setFxMode('ambient');
});

/* ================= Boot ================= */
setFxMode('ambient');
spawnPeekers('envelope'); // 2 đứa lấp ló ngay từ màn phong bì

})();
