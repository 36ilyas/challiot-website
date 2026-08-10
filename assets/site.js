/* Challiot — Interaktionen. Vanilla-Port der Logik aus Challiot.dc.html. */
(function () {
  'use strict';

  var ACCENT = '#0B63CE';

  function boot() {
    document.documentElement.style.setProperty('--acc', ACCENT);

    var on = function (el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o); };
    var q = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
    var mob = false;
    var pvTimer = null;

    // kaputte Medien hinterlassen nie ein Loch
    q('[data-img]').forEach(function (img) {
      var hide = function () { img.style.display = 'none'; };
      if (img.complete && img.naturalWidth === 0) hide();
      on(img, 'error', hide);
    });
    var vid = document.querySelector('[data-herovid]');
    on(vid, 'error', function () { vid.style.display = 'none'; });

    // Scroll-Reveals — enden immer sichtbar, der Observer ist nur die Kür
    var rv = q('[data-reveal]');
    var show = function (el) {
      if (el.dataset.shown) return;
      el.dataset.shown = '1';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };
    var sweep = function () {
      var h = window.innerHeight || 800;
      var k = 0;
      rv.forEach(function (el) {
        if (el.dataset.shown || el.getBoundingClientRect().top >= h * 0.96) return;
        el.style.transitionDelay = Math.min(k * 70, 280) + 'ms';
        k++;
        show(el);
      });
    };
    if ('IntersectionObserver' in window) {
      rv.forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(26px)';
        el.style.transition = 'opacity .9s cubic-bezier(.22,1,.36,1), transform 1s cubic-bezier(.22,1,.36,1)';
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e, i) {
          if (!e.isIntersecting) return;
          var el = e.target;
          el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
          show(el);
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      rv.forEach(function (el) { io.observe(el); });
    } else {
      rv.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
    }
    requestAnimationFrame(function () { requestAnimationFrame(sweep); });
    on(window, 'scroll', sweep, { passive: true });
    on(window, 'resize', sweep);
    on(window, 'hashchange', sweep);
    on(window, 'load', sweep);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) rv.forEach(show);
    var guard = setInterval(sweep, 400);
    setTimeout(function () { clearInterval(guard); }, 20000);

    // Header-Zustand
    var hd = document.querySelector('[data-hd]');
    var links = q('[data-hdlink]');
    var cta = document.querySelector('[data-hdcta]');
    var burger = document.querySelector('[data-burger]');
    var last = 0, solid = null, menuOpen = false;
    var paint = function () {
      var y = window.scrollY;
      var s = y > 60;
      if (s !== solid) {
        solid = s;
        hd.style.background = s ? 'rgba(242,242,239,.86)' : 'transparent';
        hd.style.backdropFilter = s ? 'saturate(160%) blur(14px)' : 'none';
        hd.style.webkitBackdropFilter = s ? 'saturate(160%) blur(14px)' : 'none';
        hd.style.boxShadow = s ? '0 1px 0 rgba(13,17,20,.1)' : 'none';
        hd.style.padding = s ? '10px clamp(18px,4vw,56px)' : '16px clamp(18px,4vw,56px)';
        var c = s ? '#0D1114' : '#F2F2EF';
        var lb = document.querySelector('[data-logobox]');
        if (lb) {
          lb.style.background = s ? '#0D1114' : 'transparent';
          lb.style.padding = s ? '7px 11px' : '0';
        }
        links.forEach(function (l) { l.style.color = c; });
        if (cta) { cta.style.background = s ? '#0D1114' : '#F2F2EF'; cta.style.color = s ? '#F2F2EF' : '#0D1114'; }
        if (burger) { burger.style.color = c; burger.style.background = s ? 'rgba(13,17,20,.07)' : 'rgba(242,242,239,.12)'; }
      }
      if (!menuOpen) {
        var down = y > last && y > 220;
        hd.style.transform = down ? 'translateY(-102%)' : 'translateY(0)';
        hd.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1),background .6s,padding .5s,box-shadow .5s';
      }
      last = y;
    };
    on(window, 'scroll', paint, { passive: true });
    paint();

    // Burger-Menü
    var menu = document.querySelector('[data-menu]');
    var l1 = document.querySelector('[data-bl1]');
    var l2 = document.querySelector('[data-bl2]');
    var setMenu = function (o) {
      menuOpen = o;
      menu.style.opacity = o ? '1' : '0';
      menu.style.visibility = o ? 'visible' : 'hidden';
      menu.style.transform = o ? 'translateY(0)' : 'translateY(-14px)';
      if (burger) burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (l1) l1.style.transform = o ? 'translateY(2.75px) rotate(42deg)' : 'none';
      if (l2) l2.style.transform = o ? 'translateY(-2.75px) rotate(-42deg)' : 'none';
      document.body.style.overflow = o ? 'hidden' : '';
      if (o) hd.style.transform = 'translateY(0)';
      var c = o ? '#F2F2EF' : (solid ? '#0D1114' : '#F2F2EF');
      if (burger) { burger.style.color = c; burger.style.background = o ? 'rgba(242,242,239,.12)' : (solid ? 'rgba(13,17,20,.07)' : 'rgba(242,242,239,.12)'); }
      q('[data-mlink]').forEach(function (el, i) {
        el.style.transition = 'opacity .5s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transitionDelay = (o ? 120 + i * 55 : 0) + 'ms';
        el.style.opacity = o ? '1' : '0';
        el.style.transform = o ? 'translateY(0)' : 'translateY(18px)';
      });
    };
    setMenu(false);
    on(burger, 'click', function () { setMenu(!menuOpen); });
    on(window, 'keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });

    // sanftes Anker-Scrolling
    q('[data-nav]').forEach(function (a) {
      on(a, 'click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id.charAt(0) !== '#' || id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        if (menuOpen) setMenu(false);
        var y = t.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });

    // Produkt-Index
    var rows = q('[data-prod]');
    var pvT = document.querySelector('[data-pvtitle]');
    var pvD = document.querySelector('[data-pvdesc]');
    var pvN = document.querySelector('[data-pvnum]');
    var pvI = document.querySelector('[data-pvimg]');
    var pal = ['#00A45E', '#FFD400', '#4A93EA', '#E5251F'];
    var glow = ['rgba(0,164,94,.26)', 'rgba(255,212,0,.22)', 'rgba(74,147,234,.26)', 'rgba(229,37,31,.22)'];
    var pvG = document.querySelector('[data-pvglow]');

    // Vorschaubilder vorladen, damit der Wechsel nicht flackert
    rows.forEach(function (r) {
      var src = r.getAttribute('data-pic');
      if (src) { var im = new Image(); im.src = src; }
    });

    var activate = function (row) {
      var ci = rows.indexOf(row) % 4;
      var col = pal[ci];
      rows.forEach(function (r) {
        var isA = r === row;
        r.style.paddingLeft = isA ? '14px' : '4px';
        r.style.borderTopColor = isA ? col : 'rgba(242,242,239,.14)';
        var t = r.querySelector('[data-ptitle]');
        var ar = r.querySelector('[data-parrow]');
        if (t) { t.style.color = isA ? col : '#F2F2EF'; t.style.opacity = isA ? '1' : '.72'; }
        if (ar) { ar.style.color = col; ar.style.opacity = isA ? '1' : '0'; ar.style.transform = isA ? 'translateX(0)' : 'translateX(-8px)'; }
      });
      if (pvG) pvG.style.background = 'radial-gradient(90% 70% at 30% 0%,' + glow[ci] + ',transparent 62%)';
      if (pvN) pvN.style.color = col;
      if (!pvT) return;
      [pvT, pvD, pvN].forEach(function (el) { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; });
      if (pvI) pvI.style.opacity = '0';
      clearTimeout(pvTimer);
      pvTimer = setTimeout(function () {
        pvN.textContent = row.getAttribute('data-i');
        pvT.innerHTML = row.getAttribute('data-title');
        pvD.textContent = row.getAttribute('data-desc');
        if (pvI) {
          var src = row.getAttribute('data-pic');
          if (src) {
            pvI.src = src;
            pvI.alt = row.getAttribute('data-title').replace(/&amp;/g, '&') + ' von Ernst Challiot & Sohn';
            pvI.style.display = '';
          }
          pvI.style.opacity = '1';
        }
        pvN.style.opacity = '1';
        pvT.style.opacity = '1'; pvT.style.transform = 'translateY(0)';
        pvD.style.opacity = '.72'; pvD.style.transform = 'translateY(0)';
      }, 180);
    };
    rows.forEach(function (r) {
      on(r, 'mouseenter', function () { if (!mob) activate(r); });
      on(r, 'focusin', function () { if (!mob) activate(r); });
      on(r, 'click', function () {
        if (mob) {
          var t = document.querySelector('#kontakt');
          if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
        } else activate(r);
      });
    });
    if (rows[0]) activate(rows[0]);

    // FAQ
    q('[data-faq]').forEach(function (item) {
      var btn = item.querySelector('[data-fq]');
      var ans = item.querySelector('[data-fa]');
      var ic = item.querySelector('[data-fi]');
      on(btn, 'click', function () {
        var open = ans.style.maxHeight && ans.style.maxHeight !== '0px';
        q('[data-faq]').forEach(function (o) {
          var a = o.querySelector('[data-fa]'), i = o.querySelector('[data-fi]'), b = o.querySelector('[data-fq]');
          a.style.maxHeight = '0px';
          if (i) i.style.transform = 'rotate(0deg)';
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          ans.style.maxHeight = ans.scrollHeight + 'px';
          if (ic) ic.style.transform = 'rotate(135deg)';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // responsive Umschalter (ohne Media Queries im Stylesheet)
    var mq = window.matchMedia('(max-width: 900px)');
    var apply = function () {
      var m = mq.matches;
      mob = m;
      var dn = document.querySelector('[data-desknav]');
      if (dn) dn.style.display = m ? 'none' : 'flex';
      if (burger) burger.style.display = m ? 'inline-flex' : 'none';
      var pv = document.querySelector('[data-preview]');
      if (pv) pv.style.display = m ? 'none' : 'block';
      q('[data-pmob]').forEach(function (p) { p.style.display = m ? 'block' : 'none'; });
      if (!m && menuOpen) setMenu(false);
      q('[data-faq] [data-fa]').forEach(function (a) {
        if (a.style.maxHeight && a.style.maxHeight !== '0px') a.style.maxHeight = a.scrollHeight + 'px';
      });
    };
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    on(window, 'resize', apply);

    // nahtlose Partner-Laufschrift
    var track = document.querySelector('[data-track]');
    if (track && !track.dataset.dup) {
      track.dataset.dup = '1';
      Array.prototype.slice.call(track.children).forEach(function (c) { track.appendChild(c.cloneNode(true)); });
      track.querySelectorAll('img').forEach(function (img) {
        on(img, 'error', function () { img.style.display = 'none'; });
      });
    }

    // Zeigegefühl auf Buttons
    q('[data-btn]').forEach(function (b) {
      on(b, 'mouseenter', function () { b.style.transform = 'translateY(-2px)'; });
      on(b, 'mouseleave', function () { b.style.transform = 'translateY(0)'; });
      on(b, 'focus', function () { b.style.transform = 'translateY(-2px)'; });
      on(b, 'blur', function () { b.style.transform = 'translateY(0)'; });
    });
    if (cta) {
      on(cta, 'mouseenter', function () { cta.style.transform = 'translateY(-2px)'; });
      on(cta, 'mouseleave', function () { cta.style.transform = 'translateY(0)'; });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
