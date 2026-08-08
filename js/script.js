/* =================================================================
   MARS — site interactions
   Star field + orbit canvas · scroll reveal · nav · mailto form
   ================================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GOLD = ["#E9D2B3", "#C9A87E", "#A07858"];

  /* ---------------------- Year ---------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------- Nav scroll state ---------------------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------------- Mobile menu ---------------------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const subToggle = document.getElementById("mobileSvcToggle");
  const subMenu = document.getElementById("mobileSvc");

  const setSub = (open) => {
    if (!subToggle || !subMenu) return;
    subToggle.setAttribute("aria-expanded", String(open));
    subMenu.hidden = !open;
  };

  if (toggle && menu) {
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      if (!open) setSub(false);
    };
    toggle.addEventListener("click", () => setMenu(menu.hidden));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); }
    });
  }

  if (subToggle && subMenu) {
    subToggle.addEventListener("click", () => setSub(subMenu.hidden));
  }

  /* ---------------------- Services dropdown (desktop) ---------------------- */
  const dd = document.querySelector(".nav__dd");
  const ddBtn = document.querySelector(".nav__dd-btn");
  if (dd && ddBtn) {
    const setDd = (open) => ddBtn.setAttribute("aria-expanded", String(open));

    ddBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setDd(ddBtn.getAttribute("aria-expanded") !== "true");
    });

    // Close on outside click, on Escape, and when focus leaves the whole group
    document.addEventListener("click", (e) => { if (!dd.contains(e.target)) setDd(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && ddBtn.getAttribute("aria-expanded") === "true") {
        setDd(false);
        ddBtn.focus();
      }
    });
    dd.addEventListener("focusout", () => {
      // relatedTarget is null when focus leaves the document entirely — leave it open then
      requestAnimationFrame(() => { if (!dd.contains(document.activeElement)) setDd(false); });
    });
  }

  /* ---------------------- Scroll reveal ---------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const sibs = Array.from(entry.target.parentElement.querySelectorAll(":scope > .reveal"));
            const idx = Math.max(0, sibs.indexOf(entry.target));
            entry.target.style.transitionDelay = Math.min(idx * 90, 360) + "ms";
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------- Count-up signal ---------------------- */
  const counters = document.querySelectorAll("[data-count]");
  if (!prefersReduced && "IntersectionObserver" in window) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        let cur = 0;
        const step = () => {
          cur += Math.ceil(target / 22);
          if (cur >= target) { el.textContent = target + suffix; return; }
          el.textContent = cur + suffix;
          requestAnimationFrame(step);
        };
        step();
        cObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cObs.observe(c));
  }

  /* ---------------------- Sky canvas (star field + orbit) ---------------------- */
  function initSky(canvas, opts) {
    if (!canvas) return;
    opts = opts || {};
    const ctx = canvas.getContext("2d");
    let w, h, dpr, stars = [], satAngle = Math.random() * Math.PI * 2, raf = null;

    function fourStar(x, y, r, alpha, color) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      const t = r * 0.32; // waist
      ctx.moveTo(0, -r); ctx.lineTo(t, -t); ctx.lineTo(r, 0); ctx.lineTo(t, t);
      ctx.lineTo(0, r); ctx.lineTo(-t, t); ctx.lineTo(-r, 0); ctx.lineTo(-t, -t);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // density stays low so it reads as sky, not confetti
      const count = Math.round((w * h) / 16000 * (opts.density || 1));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.5,
          base: Math.random() * 0.5 + 0.15,
          amp: Math.random() * 0.35,
          spd: Math.random() * 0.9 + 0.3,
          ph: Math.random() * Math.PI * 2,
          big: Math.random() > 0.86,
          color: GOLD[(Math.random() * GOLD.length) | 0]
        });
      }
    }

    // Orbit geometry: an ellipse tilted -16deg, echoing the logo satellite path
    function orbit(now) {
      if (!opts.orbit) return;
      const cx = w * (opts.orbitX || 0.5);
      const cy = h * (opts.orbitY || 0.42);
      const rx = Math.min(w, 900) * 0.42;
      const ry = rx * 0.34;
      const tilt = -16 * Math.PI / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.strokeStyle = "rgba(201,168,126,0.14)";
      ctx.lineWidth = 1;
      [1, 0.66, 0.4].forEach((s) => {
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * s, ry * s, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      // satellite on outer ring
      const a = satAngle;
      const sx = Math.cos(a) * rx;
      const sy = Math.sin(a) * ry;
      ctx.fillStyle = "#C9A87E";
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let last = 0, running = false, visible = true;
    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, w, h);
      orbit(now);
      satAngle += dt * 0.16;
      for (const s of stars) {
        s.ph += dt * s.spd;
        const alpha = Math.max(0, s.base + Math.sin(s.ph) * s.amp);
        if (s.big) fourStar(s.x, s.y, s.r * 2.4, alpha, s.color);
        else { ctx.globalAlpha = alpha; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(frame);
    }

    // Exactly one rAF chain at a time — `running` stops start() and the visibility
    // observer from each spinning up their own loop over the same canvas.
    function play() {
      if (prefersReduced || running || !visible) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() { running = false; cancelAnimationFrame(raf); raf = null; }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      orbit(0);
      for (const s of stars) {
        const alpha = s.base + s.amp * 0.5;
        if (s.big) fourStar(s.x, s.y, s.r * 2.4, alpha, s.color);
        else { ctx.globalAlpha = alpha; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }

    function start() {
      pause();
      build();
      if (prefersReduced) { drawStatic(); return; }
      play();
    }

    // Pause when offscreen to save cycles
    if ("IntersectionObserver" in window) {
      const vis = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          visible = en.isIntersecting;
          if (prefersReduced) return;
          if (visible) play(); else pause();
        });
      }, { threshold: 0 });
      vis.observe(canvas);
    }

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(start, 180); });
    start();
  }

  // One pattern per surface (brand rule): the logo already carries an orbit,
  // so every star-field canvas uses the STAR FIELD only. Orbit rings live on
  // the Approach section as a separate surface.
  document.querySelectorAll("canvas.sky").forEach((c) => {
    const d = parseFloat(c.dataset.density);
    initSky(c, { orbit: false, density: isNaN(d) ? 1 : d });
  });

  /* ---------------------- Active nav (multi-page) ---------------------- */
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const SERVICE_PAGES = ["services.html", "nfc.html", "websites.html", "automation.html", "marketing.html"];

  document.querySelectorAll('.nav__links a, .mobile-menu a:not(.btn)').forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === here || (here === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  // Light up the "Services" parent whenever we're on any page beneath it
  if (SERVICE_PAGES.indexOf(here) !== -1) {
    document.querySelectorAll(".nav__dd-btn, .mobile-menu__toggle")
      .forEach((b) => b.classList.add("is-active"));
  }

  /* ---------------------- Contact form ---------------------- */
  // Posts to Formspree, which forwards each enquiry to MARS_EMAIL. If the endpoint hasn't
  // been filled in yet, we fall back to opening the visitor's email app so the form is
  // never a dead end.
  const MARS_EMAIL = "infomarsdigital@gmail.com";
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  const submitBtn = document.getElementById("cf-submit");

  if (form) {
    const setNote = (msg, state) => {
      if (!note) return;
      note.textContent = msg;
      note.classList.remove("is-ok", "is-error");
      if (state) note.classList.add(state);
    };

    const fields = () => {
      const d = new FormData(form);
      const get = (k) => (d.get(k) || "").toString().trim();
      return { name: get("name"), email: get("email"), company: get("company"), message: get("message") };
    };

    const mailtoFallback = () => {
      const f = fields();
      const subject = `New project enquiry: ${f.name}${f.company ? " · " + f.company : ""}`;
      const body =
        `Name: ${f.name}\n` +
        `Email: ${f.email}\n` +
        (f.company ? `Company: ${f.company}\n` : "") +
        `\nWhere I want to be seen:\n${f.message}\n`;
      window.location.href =
        `mailto:${MARS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setNote(`Opening your email app. If nothing happens, write to us at ${MARS_EMAIL}.`, "is-ok");
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1 || action.indexOf("formspree.io") === -1) {
        mailtoFallback();
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      setNote("Sending your enquiry…");

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then((res) => {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          setNote("Thanks, that's landed. We'll come back to you within one working day.", "is-ok");
        })
        .catch(() => {
          setNote(`That didn't send. Please email us directly at ${MARS_EMAIL}.`, "is-error");
        })
        .finally(() => {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Map my launch"; }
        });
    });
  }
})();
