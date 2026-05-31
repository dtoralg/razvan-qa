const revealItems = document.querySelectorAll(".section-reveal");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const cursorLight = document.querySelector(".cursor-light");
const animatedChildren = [
  ".hero-name",
  ".role-line",
  "h1",
  "h2",
  ".hero-text",
  ".hero-actions",
  ".hero-visual",
  ".metric-grid article",
  ".timeline-item",
  ".stack-cloud span",
  ".platform-copy",
  ".platform-showcase",
  ".education-card",
  ".contact-section p",
  ".contact-card",
].join(",");

revealItems.forEach((section) => {
  section.querySelectorAll(animatedChildren).forEach((child, index) => {
    child.classList.add("reveal-child");
    child.style.setProperty("--reveal-delay", `${Math.min(index * 80, 560)}ms`);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

document.querySelectorAll("section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

const updateScrollEffects = () => {
  const topLink = navLinks.find((link) => link.getAttribute("href") === "#top");
  if (topLink) {
    topLink.classList.toggle("active", window.scrollY < window.innerHeight * 0.55);
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  document.body.style.setProperty("--scroll-progress", progress.toFixed(4));

  document.querySelectorAll(".platform-showcase").forEach((showcase) => {
    const rect = showcase.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const shift = (midpoint - window.innerHeight / 2) / window.innerHeight;
    showcase.style.setProperty("--section-shift", shift.toFixed(3));
  });
};

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  window.requestAnimationFrame(() => {
    updateScrollEffects();
    ticking = false;
  });
  ticking = true;
});

updateScrollEffects();

window.addEventListener("pointermove", (event) => {
  if (!cursorLight) return;
  cursorLight.style.left = `${event.clientX}px`;
  cursorLight.style.top = `${event.clientY}px`;
});
