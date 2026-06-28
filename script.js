"use strict";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const lerp = (a, b, n) => (1 - n) * a + n * b;

/* ============================================================
   Preloader — QA "boot" sequence
   ============================================================ */
(function preloader() {
  const el = document.getElementById("preloader");
  const log = document.getElementById("preloaderLog");
  const bar = document.getElementById("preloaderBar");
  if (!el) return;

  document.body.classList.add("is-loading");

  const finish = () => {
    el.classList.add("done");
    document.body.classList.remove("is-loading");
    document.dispatchEvent(new Event("intro:done"));
  };

  if (prefersReduced) {
    finish();
    return;
  }

  const lines = [
    "> initializing test suite…",
    "> loading 6 years of QA experience",
    "> running regression checks",
    '<span class="ok">✓ 148 passed · 0 failed</span>',
    '<span class="ok">✓ all systems green</span>',
  ];

  let i = 0;
  const tick = () => {
    if (i < lines.length) {
      log.innerHTML += (i ? "\n" : "") + lines[i];
      bar.style.width = `${Math.round(((i + 1) / lines.length) * 100)}%`;
      i += 1;
      setTimeout(tick, 230 + Math.random() * 160);
    } else {
      setTimeout(finish, 480);
    }
  };
  setTimeout(tick, 260);

  // Safety net
  setTimeout(finish, 4200);
})();

/* ============================================================
   Pointer-driven background (spotlight + dot grid)
   ============================================================ */
(function pointerBackground() {
  if (!finePointer) return;
  const root = document.documentElement;
  window.addEventListener(
    "pointermove",
    (e) => {
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
    },
    { passive: true }
  );
})();

/* ============================================================
   Custom cursor
   ============================================================ */
(function customCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor || !finePointer || prefersReduced) return;

  document.body.classList.add("cursor-active");
  const dot = cursor.querySelector(".cursor-dot");
  const ring = cursor.querySelector(".cursor-ring");

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let running = false;

  const render = () => {
    rx = lerp(rx, mx, 0.2);
    ry = lerp(ry, my, 0.2);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    // Keep animating only until the ring has caught up to the pointer.
    if (Math.abs(rx - mx) > 0.4 || Math.abs(ry - my) > 0.4) {
      requestAnimationFrame(render);
    } else {
      running = false;
    }
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (!running) {
        running = true;
        requestAnimationFrame(render);
      }
    },
    { passive: true }
  );

  const hoverables = "a, button, .magnetic, .bento-card, .tags span, .marquee-track span";
  document.querySelectorAll(hoverables).forEach((node) => {
    node.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
    node.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
  });
})();

/* ============================================================
   Magnetic elements
   ============================================================ */
(function magnetic() {
  if (!finePointer || prefersReduced) return;
  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.32;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
})();

/* ============================================================
   Spotlight + 3D tilt cards
   ============================================================ */
(function spotlightTilt() {
  document.querySelectorAll(".spotlight").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--cx", `${px * 100}%`);
      card.style.setProperty("--cy", `${py * 100}%`);
      if (card.classList.contains("tilt") && finePointer && !prefersReduced) {
        const rx = (py - 0.5) * -7;
        const ry = (px - 0.5) * 7;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
})();

/* ============================================================
   Reveal on scroll + count-up
   ============================================================ */
(function reveals() {
  const items = document.querySelectorAll("[data-reveal]");

  // stagger siblings
  document.querySelectorAll(".bento, .stack-grid, .credentials, .stats, .hero-chips").forEach((group) => {
    [...group.children].forEach((child, idx) => {
      if (child.hasAttribute("data-reveal")) {
        child.style.setProperty("--reveal-delay", `${Math.min(idx * 90, 540)}ms`);
      }
    });
  });

  const countUp = (el) => {
    const to = parseFloat(el.dataset.to);
    const suffix = el.dataset.suffix || "";
    const dur = 1200;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        entry.target.querySelectorAll?.(".count").forEach((c) => {
          if (!c.dataset.done) {
            c.dataset.done = "1";
            if (prefersReduced) {
              c.textContent = c.dataset.to + (c.dataset.suffix || "");
            } else {
              countUp(c);
            }
          }
        });
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => io.observe(el));
})();

/* ============================================================
   Hero terminal typing
   ============================================================ */
(function heroTerminal() {
  const code = document.getElementById("termCode");
  if (!code) return;

  const lines = [
    { t: "$ dotnet test --filter Regression", c: "dim" },
    { t: "  ✓ checkout.pays_with_card", c: "ok" },
    { t: "  ✓ pos.offline_sync", c: "ok" },
    { t: "  ✓ api.orders → 200", c: "ok" },
    { t: "  ✓ ipad.landscape_renders", c: "ok" },
    { t: "  148 passed · 0 failed", c: "ok" },
  ];

  if (prefersReduced) {
    code.innerHTML = lines.map((l) => `<span class="${l.c}">${l.t}</span>`).join("\n");
    return;
  }

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    code.innerHTML = "";
    let li = 0;
    const typeLine = () => {
      if (li >= lines.length) {
        code.insertAdjacentHTML("beforeend", '<span class="caret"></span>');
        return;
      }
      const { t, c } = lines[li];
      const span = document.createElement("span");
      span.className = c;
      code.appendChild(span);
      let ci = 0;
      const typeChar = () => {
        span.textContent = t.slice(0, ci);
        ci += 1;
        if (ci <= t.length) {
          setTimeout(typeChar, 14 + Math.random() * 22);
        } else {
          code.appendChild(document.createTextNode("\n"));
          li += 1;
          setTimeout(typeLine, 180);
        }
      };
      typeChar();
    };
    typeLine();
  };

  document.addEventListener("intro:done", () => setTimeout(start, 400), { once: true });
  // Fallback if the intro event never fires (guarded by `started`)
  setTimeout(start, 4600);
})();

/* ============================================================
   Header state + scroll progress + active nav + timeline fill
   ============================================================ */
(function scrollEffects() {
  const header = document.querySelector(".site-header");
  const progress = document.getElementById("scrollProgress");
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const timeline = document.getElementById("timeline");
  const timelineFill = document.getElementById("timelineFill");

  const onScroll = () => {
    const y = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const p = scrollable > 0 ? y / scrollable : 0;
    if (progress) progress.style.setProperty("--p", p.toFixed(4));
    if (header) header.classList.toggle("scrolled", y > 40);

    // timeline fill
    if (timeline && timelineFill) {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh * 0.4;
      const passed = Math.min(Math.max(vh * 0.6 - r.top, 0), total);
      timelineFill.style.setProperty("--fill", `${(passed / total) * 100}%`);
    }
  };

  // active nav link via IO
  const navIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  sections.forEach((s) => navIO.observe(s));

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );
  onScroll();
})();

/* ============================================================
   Copy email
   ============================================================ */
(function copyEmail() {
  const btn = document.getElementById("copyEmail");
  const label = document.getElementById("copyEmailLabel");
  if (!btn || !label) return;
  const email = btn.dataset.email;
  const original = label.textContent;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      label.textContent = "Copied to clipboard ✓";
    } catch {
      label.textContent = email;
      window.location.href = `mailto:${email}`;
    }
    setTimeout(() => {
      label.textContent = original;
    }, 1800);
  });
})();

/* ============================================================
   Footer year
   ============================================================ */
(function year() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();
