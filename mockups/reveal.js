// Mockups — reveal au scroll, filtre projets, burger mobile, curseur or
(function () {
  // 1. Reveal au scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });

  // 2. Filtre projets
  const pills = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-cat]");
  pills.forEach((p) =>
    p.addEventListener("click", () => {
      pills.forEach((x) => x.classList.remove("active"));
      p.classList.add("active");
      const f = p.dataset.filter;
      cards.forEach((c) => {
        c.style.display = f === "all" || c.dataset.cat === f ? "" : "none";
      });
    })
  );

  // 3. Burger + menu mobile
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    const toggle = (open) => {
      burger.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () =>
      toggle(!menu.classList.contains("open"))
    );
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => toggle(false))
    );
  }

  // 4. Nav : fond au scroll
  const nav = document.querySelector(".nav[data-scrollfx]");
  if (nav) {
    const onScroll = () =>
      nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // 5. Curseur or (desktop uniquement)
  const dot = document.querySelector(".cursor-dot");
  if (dot && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
    });
    document.querySelectorAll("a, button, [data-magnet]").forEach((el) => {
      el.addEventListener("mouseenter", () => dot.classList.add("big"));
      el.addEventListener("mouseleave", () => dot.classList.remove("big"));
    });
  }
})();
