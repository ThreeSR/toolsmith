/* ToolSmith project page: theme, sparks, forge ticker, charts, pipeline player, cases. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  /* ---------- theme ---------- */
  var root = document.documentElement, themeBtn = $('#themeBtn');
  function syncTheme() { themeBtn.setAttribute('aria-checked', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false'); }
  syncTheme();
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ts-theme', next); } catch (e) {}
    syncTheme();
    drawBars();
  });

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (n) { io.observe(n); });
  } else {
    $$('.reveal').forEach(function (n) { n.classList.add('in'); });
  }

  /* ---------- nav active link ---------- */
  var navLinks = $$('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) secIO.observe(s); });
  }

  /* ---------- sparks (forge embers) ---------- */
  var cv = $('#sparks'), ctx = cv && cv.getContext('2d'), parts = [], logo = $('#heroLogo');
  function sizeCanvas() {
    var r = cv.parentNode.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function origin() {
    var h = cv.parentNode.getBoundingClientRect(), l = logo.getBoundingClientRect();
    return { x: l.left - h.left + l.width * 0.42, y: l.top - h.top + l.height * 0.35 };
  }
  function spawn(n, burst) {
    var o = origin();
    for (var i = 0; i < n; i++) {
      var a = burst ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      var sp = burst ? 1.5 + Math.random() * 4.5 : 0.4 + Math.random() * 1.2;
      parts.push({ x: o.x + (Math.random() - 0.5) * 40, y: o.y + (Math.random() - 0.5) * 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, decay: 0.006 + Math.random() * (burst ? 0.02 : 0.01), r: 0.8 + Math.random() * 1.8 });
    }
  }
  function tick() {
    var w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);
    if (Math.random() < 0.35) spawn(1, false);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy -= 0.012; p.vx *= 0.995; p.life -= p.decay;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      var g = Math.floor(170 + 70 * p.life);
      ctx.fillStyle = 'rgba(255,' + g + ',' + Math.floor(90 * p.life) + ',' + (p.life * 0.9).toFixed(3) + ')';
      ctx.shadowColor = 'rgba(255,190,90,0.8)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  if (cv && ctx && !reduce) {
    sizeCanvas(); window.addEventListener('resize', sizeCanvas);
    requestAnimationFrame(tick);
    logo.addEventListener('click', function () { spawn(70, true); });
    setTimeout(function () { spawn(40, true); }, 650);
  }

  /* ---------- forge ticker ---------- */
  var ticker = [
    ['Phase 1', 'mining failed trajectories'],
    ['Phase 2', 'no existing tool fits &rarr; <b>grow</b>'],
    ['Phase 3', 'generating <b>Event_In_Image</b>(&hellip;)'],
    ['Phase 4', 'gate 1 &check; sandbox &middot; gate 2 &check; code review'],
    ['Library', '<b>Event_In_Image</b> registered'],
    ['Inference', 'top-K retrieval &rarr; <b>State_Context_Lookup</b>']
  ], ti = 0, flPh = $('#flPh'), flMsg = $('#flMsg');
  function typeMsg(html) {
    if (reduce) { flMsg.innerHTML = html; return; }
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var nodes = [], walk = function (n) { n.childNodes.forEach(function (c) { if (c.nodeType === 3) nodes.push(c); else walk(c); }); };
    walk(tmp);
    var texts = nodes.map(function (n) { return n.textContent; }); nodes.forEach(function (n) { n.textContent = ''; });
    flMsg.innerHTML = ''; flMsg.appendChild(tmp);
    var ni = 0, ci = 0;
    (function step() {
      if (ni >= nodes.length) return;
      nodes[ni].textContent += texts[ni].charAt(ci++);
      if (ci >= texts[ni].length) { ni++; ci = 0; }
      setTimeout(step, 22);
    })();
  }
  function nextTick() { flPh.textContent = ticker[ti][0]; typeMsg(ticker[ti][1]); ti = (ti + 1) % ticker.length; }
  nextTick(); setInterval(nextTick, 2800);

  /* ---------- count-up stats ---------- */
  function countUp(n) {
    var to = parseFloat(n.getAttribute('data-count')), dec = +(n.getAttribute('data-dec') || 0), t0 = null;
    if (reduce) return;
    (function f(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      n.textContent = (to * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(f);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (n) { cio.observe(n); });
  }

  /* ---------- grouped bar chart ---------- */
  var RES = {
    id:  [['Qwen3-VL-8B', 47.94, 50.14], ['Qwen3-VL-32B', 55.47, 57.14], ['GPT-5', 51.80, 52.84]],
    ood: [['Qwen3-VL-8B', 26.57, 27.90], ['Qwen3-VL-32B', 31.27, 34.25], ['GPT-5', 39.80, 42.20]]
  };
  var split = 'id', barHost = $('#barChart'), barsDrawn = false;
  function drawBars() {
    var W = Math.max(480, Math.min(900, barHost.clientWidth || 900)), H = W < 700 ? 300 : 330, L = 44, R = 10, T = 26, B = 40;
    var lo = split === 'id' ? 40 : 20, hi = split === 'id' ? 60 : 45, stepY = 5;
    var svg = barHost.querySelector('svg');
    var first = !svg;
    if (first) svg = el('svg', { preserveAspectRatio: 'xMidYMid meet' }, barHost);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = '';
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    for (var g = lo; g <= hi + 1e-9; g += stepY) {
      el('line', { class: 'grid', x1: L, x2: W - R, y1: y(g), y2: y(g) }, svg);
      el('text', { x: L - 10, y: y(g) + 4, 'text-anchor': 'end' }, svg).textContent = g;
    }
    var rows = RES[split], gw = (W - L - R) / rows.length, bw = Math.min(92, gw * 0.3);
    rows.forEach(function (r, i) {
      var cx = L + gw * (i + 0.5);
      [[r[1], 'var(--s-base)', -1], [r[2], 'var(--s-ours)', 1]].forEach(function (b) {
        var x = cx + (b[2] < 0 ? -bw - 4 : 4);
        var rect = el('rect', { class: 'bar', x: x, width: bw, rx: 5, y: y(lo), height: 0, fill: b[1] }, svg);
        var val = el('text', { class: 'val', x: x + bw / 2, y: y(b[0]) - 8, 'text-anchor': 'middle', opacity: 0 }, svg);
        val.textContent = b[0].toFixed(2);
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          rect.setAttribute('y', y(b[0])); rect.setAttribute('height', y(lo) - y(b[0])); val.setAttribute('opacity', 1);
        }); });
      });
      var gain = el('text', { class: 'gain', x: cx + 4 + bw / 2, y: y(r[2]) - 28, 'text-anchor': 'middle' }, svg);
      gain.textContent = '+' + (r[2] - r[1]).toFixed(2);
      el('text', { class: 'xl', x: cx, y: H - 12, 'text-anchor': 'middle' }, svg).textContent = r[0];
    });
    barsDrawn = true;
  }
  $$('#splitSeg button').forEach(function (b) {
    b.addEventListener('click', function () {
      split = b.getAttribute('data-v');
      $$('#splitSeg button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      drawBars();
    });
  });
  if ('IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { drawBars(); bio.disconnect(); } }, { threshold: 0.3 });
    bio.observe(barHost);
  } else drawBars();
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (barsDrawn) drawBars(); }, 200); });

  /* ---------- pipeline player ---------- */
  var BASE = ['Text Search', 'Image Search', 'Webpage Visit', 'OCR', 'Visual Grounding', 'Zoom In', 'Depth Estimation', 'Code'];
  var GEN = ['Event In Image', 'Image Entity Canonical Name', 'Celebrated Person From Image', 'Event Name From Image', 'State Context Lookup'];
  var PH = [
    { pn: 'Phase 1', t: 'Trajectory Mining', dur: 6500,
      d: 'The agent runs on training samples with only the base tools. ToolSmith keeps its failed trajectories and asks why they failed.',
      li: ['A deterministic judge gate flags failed trajectories.', 'An LLM self-critique decides whether the failure needs a new tool.'],
      viz: vizMine },
    { pn: 'Phase 2', t: 'Reuse-or-Grow', dur: 6000,
      d: 'Failures that need a new tool are clustered into capability gaps. Each gap is checked against the current catalog, and generation is escalated only when no existing tool fits.',
      li: ['One representative failure per cluster.', 'Reuse an existing tool when one fits; grow a new one otherwise.'],
      viz: vizCluster },
    { pn: 'Phase 3', t: 'Tool Generation', dur: 7000,
      d: 'A generator LLM authors the new tool as Python source under structural and anti-hardcode constraints, composing the base primitives into a reusable routine.',
      li: ['Inputs must drive the logic, not hard-coded answers.', 'Each tool describes a class of queries, not a single one.'],
      viz: vizGen },
    { pn: 'Phase 4', t: 'Two-Gate Verification', dur: 6500,
      d: 'A candidate is admitted only after a sandboxed execution check and an LLM static code review. A final pass removes near-duplicates of existing tools.',
      li: ['Gate 1: AST ban list and smoke test in a sandbox.', 'Gate 2: review for parametric, abstract, edge-case-safe, aligned code.'],
      viz: vizVerify },
    { pn: 'Inference', t: 'Top-K Routing', dur: 7000,
      d: 'At inference, a lightweight retriever routes the top-K generated tools to each query alongside the always-visible base primitives.',
      li: ['Base primitives stay visible for every query.', 'Only the generated tools relevant to the query are shown.'],
      viz: vizInfer }
  ];
  var phases = $$('#pipe .phase'), pdText = $('#pdText'), pdViz = $('#pdViz'), cur = -1, timer = null, auto = true, vizTimers = [];
  function later(fn, ms) { vizTimers.push(setTimeout(fn, reduce ? 0 : ms)); }
  function show(i) {
    vizTimers.forEach(clearTimeout); vizTimers = [];
    cur = i;
    var p = PH[i];
    phases.forEach(function (b, k) {
      b.classList.remove('on'); b.classList.toggle('done', auto && k < i);
      b.style.setProperty('--dur', p.dur + 'ms');
    });
    void phases[i].offsetWidth;
    phases[i].classList.add('on');
    var pipeEl = $('#pipe');
    if (pipeEl.scrollWidth > pipeEl.clientWidth) pipeEl.scrollTo({ left: phases[i].offsetLeft - pipeEl.offsetLeft - 4, behavior: reduce ? 'auto' : 'smooth' });
    pdText.innerHTML = '<div class="swap"><div class="pn">' + p.pn + '</div><h3>' + p.t + '</h3><p>' + p.d + '</p><ul>' +
      p.li.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    pdViz.innerHTML = '';
    var box = document.createElement('div'); box.className = 'swap'; box.style.width = '100%'; box.style.display = 'flex'; box.style.justifyContent = 'center';
    pdViz.appendChild(box);
    p.viz(box);
    clearTimeout(timer);
    if (auto && !reduce) timer = setTimeout(function () { show((i + 1) % PH.length); }, p.dur);
  }
  phases.forEach(function (b, k) {
    b.addEventListener('click', function () { auto = false; $('#pipe').classList.add('paused'); show(k); });
  });
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && cur < 0) show(0);
    }, { threshold: 0.25 });
    pio.observe($('#phaseDetail'));
  } else show(0);

  function term(title) {
    var t = document.createElement('div'); t.className = 'term';
    t.innerHTML = '<div class="tb"><i></i><i></i><i></i><span>' + title + '</span></div><pre></pre>';
    return t;
  }
  function typeLines(pre, lines, gap) {
    var acc = '';
    lines.forEach(function (ln, k) { later(function () { acc += ln + '\n'; pre.innerHTML = acc; }, k * gap); });
  }
  function vizMine(box) {
    var t = term('trajectory_mining'); box.appendChild(t);
    typeLines(t.querySelector('pre'), [
      '<span class="c"># replay of case 1, base tools only</span>',
      '<span class="f">Q</span> "What year did he give $50M to create',
      '   the Hastings Initiative?"',
      '  Text_Search  <span class="s">"$50M Hastings Initiative donation"</span>',
      '  Text_Search  <span class="s">"Hastings Initiative founder year"</span>',
      '  answer: <span class="s">"Eric Schmidt donated to AI&hellip;"</span>',
      '<span class="k">judge gate</span>   <span class="no">&#10007; failed</span>',
      '<span class="k">self-critique</span> never identifies <span class="g">WHO</span> is in the image',
      '<span class="k">verdict</span>      <span class="g">needs a NEW tool</span>'
    ], 520);
  }
  function vizCluster(box) {
    var wrap = document.createElement('div'); wrap.className = 'clusters'; box.appendChild(wrap);
    var svg = el('svg', { viewBox: '0 0 440 300' }, wrap);
    var C = [
      { x: 100, y: 60, lab: 'identify the person', grow: true },
      { x: 330, y: 60, lab: 'identify the event', grow: true },
      { x: 100, y: 200, lab: 'read the map', grow: true },
      { x: 330, y: 200, lab: 'already covered', grow: false }
    ];
    var dots = [];
    for (var i = 0; i < 36; i++) {
      var c = C[i % 4];
      var d = el('circle', { cx: 20 + Math.random() * 400, cy: 20 + Math.random() * 250, r: 5, fill: 'var(--ink-3)', opacity: 0.75 }, svg);
      dots.push({ e: d, c: c, a: Math.random() * Math.PI * 2, rr: 8 + Math.random() * 26 });
    }
    later(function () {
      dots.forEach(function (d) {
        d.e.setAttribute('cx', d.c.x + Math.cos(d.a) * d.rr); d.e.setAttribute('cy', d.c.y + Math.sin(d.a) * d.rr * 0.7);
        d.e.setAttribute('fill', d.c.grow ? 'var(--blue)' : 'var(--ink-3)');
      });
    }, 500);
    later(function () {
      C.forEach(function (c) {
        el('circle', { cx: c.x, cy: c.y, r: 9, fill: c.grow ? 'var(--gold)' : 'var(--surface)', stroke: c.grow ? 'var(--gold)' : 'var(--ink-3)', 'stroke-width': 2 }, svg);
      });
    }, 1900);
    later(function () {
      C.forEach(function (c) {
        var tx = el('text', { x: c.x, y: c.y + 52, 'text-anchor': 'middle' }, svg); tx.textContent = c.lab;
        var tag = el('text', { x: c.x, y: c.y + 66, 'text-anchor': 'middle', style: 'font-weight:600;fill:' + (c.grow ? 'var(--gold)' : 'var(--ink-3)') }, svg);
        tag.textContent = c.grow ? 'grow' : 'reuse';
      });
    }, 2700);
  }
  function vizGen(box) {
    var t = term('generator_llm &rarr; event_in_image.py'); box.appendChild(t);
    typeLines(t.querySelector('pre'), [
      '<span class="c"># schematic: generated tools compose base primitives</span>',
      '<span class="k">class</span> <span class="f">EventInImage</span>(GeneratedTool):',
      '    name = <span class="s">"Event_In_Image"</span>',
      '    description = <span class="s">"Find the event linked to</span>',
      '<span class="s">        the entity shown in an image."</span>',
      '',
      '    <span class="k">def</span> <span class="f">run</span>(self, image):',
      '        entity = <span class="g">image_search</span>(image)',
      '        pages  = <span class="g">text_search</span>(entity)',
      '        <span class="k">return</span> <span class="g">webpage_visit</span>(pages)'
    ], 420);
  }
  function vizVerify(box) {
    var wrap = document.createElement('div'); wrap.className = 'lib'; box.appendChild(wrap);
    var rows = [
      ['Gate 1 &middot; Sandbox', ['AST ban', 'Smoke test']],
      ['Gate 2 &middot; LLM code review', ['Parametric', 'Abstractness', 'Edge-case', 'Alignment']],
      ['Post de-duplicate', ['Did we make a similar tool?']]
    ];
    var k = 0;
    rows.forEach(function (r) {
      var h = document.createElement('div'); h.className = 'lh'; h.innerHTML = r[0]; wrap.appendChild(h);
      var cs = document.createElement('div'); cs.className = 'chips'; wrap.appendChild(cs);
      r[1].forEach(function (name) {
        var c = document.createElement('span'); c.className = 'chip'; c.innerHTML = '<span class="st" style="color:var(--ink-3)">&#9675;</span>' + name; cs.appendChild(c);
        later(function () { c.classList.add('gen', 'pop'); c.querySelector('.st').outerHTML = ''; }, 500 + 520 * (k++));
      });
    });
    var ok = document.createElement('div'); ok.className = 'query'; ok.style.margin = '4px 0 0'; ok.style.opacity = 0;
    ok.innerHTML = '<b>ADMITTED</b><code>Event_In_Image</code> joins the tool library';
    wrap.appendChild(ok);
    later(function () { ok.style.transition = 'opacity .5s'; ok.style.opacity = 1; }, 500 + 520 * k + 200);
  }
  function vizInfer(box) {
    var wrap = document.createElement('div'); wrap.className = 'lib'; box.appendChild(wrap);
    wrap.innerHTML = '<div class="query"><b>QUERY</b>Who is the governor of the state marked in red?</div>' +
      '<div class="lh">Base primitives &middot; always visible</div><div class="chips" id="vB"></div>' +
      '<div class="lh">Generated tools &middot; top-K retrieval</div><div class="chips" id="vG"></div>';
    var vB = $('#vB', wrap), vG = $('#vG', wrap);
    BASE.forEach(function (n) { var c = document.createElement('span'); c.className = 'chip'; c.textContent = n; vB.appendChild(c); });
    var gens = GEN.map(function (n, k) {
      var c = document.createElement('span'); c.className = 'chip gen'; c.textContent = n; c.style.opacity = 0; vG.appendChild(c);
      later(function () { c.style.opacity = ''; c.classList.add('pop'); }, 300 + k * 260);
      return c;
    });
    later(function () {
      gens.forEach(function (c) { c.classList.toggle('hit', c.textContent === 'State Context Lookup'); c.classList.toggle('dim', c.textContent !== 'State Context Lookup' && c.textContent !== 'Image Entity Canonical Name'); });
    }, 2400);
  }

  /* ---------- cases ---------- */
  var CASES = [
    ['case1.png', 'Image Entity Canonical Name', 'What year did he give $50M to create the Hastings Initiative?'],
    ['case3.png', 'Celebrated Person From Image', 'What event is this person associated with?'],
    ['case4.png', 'State Context Lookup', 'Who is the governor of the state marked in red?'],
    ['case2.png', 'Event Name From Image', 'What event does this map represent?']
  ];
  var ci = 0, tabs = $('#caseTabs'), img = $('#caseImg');
  CASES.forEach(function (c, k) {
    var b = document.createElement('button'); b.className = 'case-tab'; b.type = 'button'; b.setAttribute('role', 'tab');
    b.innerHTML = '<span class="cn">Case ' + (k + 1) + ' &middot; ' + esc(c[1]) + '</span><span class="ct">' + esc(c[2]) + '</span>';
    b.addEventListener('click', function () { showCase(k); });
    tabs.appendChild(b);
  });
  function showCase(k) {
    ci = (k + CASES.length) % CASES.length;
    img.src = 'static/images/' + CASES[ci][0];
    img.alt = 'Case study: ' + CASES[ci][2] + ' Base tools fail; ToolSmith uses ' + CASES[ci][1] + '.';
    img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap');
    $$('.case-tab', tabs).forEach(function (b, j) { b.setAttribute('aria-selected', j === ci ? 'true' : 'false'); });
    $('#caseView').setAttribute('data-zoom', 'static/images/' + CASES[ci][0]);
  }
  $('#casePrev').addEventListener('click', function () { showCase(ci - 1); });
  $('#caseNext').addEventListener('click', function () { showCase(ci + 1); });
  showCase(0);

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox');
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('[data-zoom]');
    if (z) { lb.querySelector('img').src = z.getAttribute('data-zoom'); lb.hidden = false; }
  });
  lb.addEventListener('click', function () { lb.hidden = true; });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') lb.hidden = true;
    if (!lb.hidden) return;
  });

  /* ---------- copy bibtex ---------- */
  $('#copyBib').addEventListener('click', function () {
    var btn = this, txt = $('#bibText').textContent;
    var done = function () { btn.classList.add('ok'); btn.querySelector('span').textContent = 'Copied'; setTimeout(function () { btn.classList.remove('ok'); btn.querySelector('span').textContent = 'Copy'; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
  });
})();
