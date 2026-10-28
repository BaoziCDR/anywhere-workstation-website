/* AnyWhere WorkStation · 站点脚本
   语言：每段文案在页面里并列中英两份（lang="zh-CN" / lang="en"），这里切换 html[data-lang]，并同步标题、描述和 aria-label。
   其余是动效：顶栏、滚动浮现、主视觉微尘、卡片光晕、运行计时、任务演示、眼睛跟随。 */
(function () {
  var root = document.documentElement;
  var KEY = 'aws-lang';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 语言 ---------- */
  function applyLang(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang));
    });
    var t = document.querySelector('meta[name="i18n-title"]');
    if (t && t.getAttribute('data-' + lang)) document.title = t.getAttribute('data-' + lang);
    var d = document.querySelector('meta[name="description"]');
    if (d && d.getAttribute('data-' + lang)) d.setAttribute('content', d.getAttribute('data-' + lang));
    document.querySelectorAll('[data-label-zh]').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('data-label-' + lang));
    });
  }
  applyLang(root.getAttribute('data-lang') === 'en' ? 'en' : 'zh');
  document.querySelectorAll('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.getAttribute('data-set-lang');
      applyLang(lang);
      try { localStorage.setItem(KEY, lang); } catch (e) { /* 无痕模式等情况忽略 */ }
    });
  });

  /* ---------- 顶栏 ---------- */
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('open')) {
        header.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  /* ---------- 滚动浮现：只隐藏还在视口以下的元素 ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var vh = window.innerHeight;
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in');
    });
    root.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
  }

  /* ---------- 主视觉：暖光里的微尘 ---------- */
  var canvas = document.querySelector('.hero-dust');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], running = true;
    var resize = function () {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var spawn = function (initial) {
      var cx = W / 2, spread = Math.min(W, 900) * 0.55;
      return {
        x: cx + (Math.random() - 0.5) * spread * 2,
        y: initial ? Math.random() * H : H + 10,
        r: 0.5 + Math.random() * 1.7,
        vy: 0.12 + Math.random() * 0.38,
        vx: (Math.random() - 0.5) * 0.15,
        a: 0.15 + Math.random() * 0.55,
        t: Math.random() * Math.PI * 2
      };
    };
    resize();
    var count = W < 600 ? 40 : W < 1100 ? 60 : 90;
    for (var i = 0; i < count; i++) parts.push(spawn(true));
    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        if (!reduce) {
          p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.12; p.t += 0.01;
          if (p.y < -10) parts[j] = p = spawn(false);
        }
        var dx = (p.x - W / 2) / (W / 2), fade = Math.max(0, 1 - dx * dx);
        ctx.globalAlpha = p.a * (0.5 + 0.5 * Math.sin(p.t * 3)) * fade;
        ctx.fillStyle = p.r > 1.6 ? '#FFC6A3' : '#FF9B6E';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running && !reduce) requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(draw); }
        running = vis;
      }).observe(canvas);
    }
  }

  /* ---------- 卡片：光晕跟随鼠标 ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- 稳定运行计时（从打开页面开始算） ---------- */
  var up = document.querySelector('[data-uptime]');
  if (up) {
    var start = Date.now();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var s = Math.floor((Date.now() - start) / 1000);
      up.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 任务演示：一步步完成，再重新开始 ---------- */
  var tw = document.querySelector('.task-win');
  if (tw) {
    var items = Array.prototype.slice.call(tw.querySelectorAll('.steps-list li'));
    var bar = tw.querySelector('.tw-progress span');
    var step = 3;
    var render = function () {
      items.forEach(function (li, k) { li.setAttribute('data-s', k < step ? 'done' : k === step ? 'run' : 'wait'); });
      bar.style.setProperty('--p', Math.round(step / items.length * 100) + '%');
      if (step >= items.length) tw.setAttribute('data-done', ''); else tw.removeAttribute('data-done');
    };
    render();
    if (!reduce) {
      setInterval(function () {
        step = step >= items.length ? 0 : step + 1;
        render();
      }, 1500);
    }
  }

  /* ---------- 小形象的眼睛跟着鼠标 ---------- */
  var lookers = document.querySelectorAll('[data-look]');
  if (lookers.length && !reduce) {
    window.addEventListener('pointermove', function (e) {
      lookers.forEach(function (svg) {
        var r = svg.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.55);
        var len = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, len / 300);
        var g = svg.querySelector('.mm-look');
        if (g) g.style.transform = 'translate(' + (dx / len * 6 * k).toFixed(2) + 'px,' + (dy / len * 4 * k).toFixed(2) + 'px)';
      });
    }, { passive: true });
  }
})();
