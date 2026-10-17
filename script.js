/* CHIRANTHAN L® — interaction script */
(() => {
  const init = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const year = document.getElementById("year");

    if (year) year.textContent = new Date().getFullYear();

    // Enable reveal animations only after JS is running, preventing hidden content if JS fails.
    document.documentElement.classList.add("js-ready");

    // Scroll reveal with IntersectionObserver.
    const revealItems = document.querySelectorAll(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(item => item.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -25px 0px" });

      revealItems.forEach((item, index) => {
        if (item.classList.contains("project") || item.classList.contains("skill") || item.classList.contains("stat")) {
          item.style.setProperty("--delay", `${(index % 4) * 70}ms`);
        }
        observer.observe(item);
      });
    }

    // Highlight the nav link for the section currently in view.
    const navLinks = [...document.querySelectorAll(".navlinks a")];
    const sections = navLinks
      .map(link => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if ("IntersectionObserver" in window) {
      const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navLinks.forEach(link => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });

      sections.forEach(section => navObserver.observe(section));
    }

    // Smooth internal links, respecting reduced-motion preferences.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });
        history.replaceState(null, "", href);
      });
    });

    // Desktop-only ambient cursor light.
    if (finePointer && !reducedMotion) {
      let pending = false;
      let x = 0;
      let y = 0;

      document.addEventListener("pointermove", event => {
        x = event.clientX;
        y = event.clientY;
        if (pending) return;
        pending = true;

        requestAnimationFrame(() => {
          document.documentElement.style.setProperty("--mouse-x", `${x}px`);
          document.documentElement.style.setProperty("--mouse-y", `${y}px`);
          pending = false;
        });
      }, { passive: true });
    }

    // Small, restrained pointer tilt on project cards.
    if (finePointer && !reducedMotion) {
      document.querySelectorAll(".project").forEach(card => {
        card.addEventListener("pointermove", event => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          const rotateX = (0.5 - y) * 2.2;
          const rotateY = (x - 0.5) * 2.2;

          card.style.setProperty("--tilt-x", `${rotateX}deg`);
          card.style.setProperty("--tilt-y", `${rotateY}deg`);
        });

        card.addEventListener("pointerleave", () => {
          card.style.removeProperty("--tilt-x");
          card.style.removeProperty("--tilt-y");
        });
      });
    }

    // Pause marquee while the tab is hidden to reduce background work.
    const ticker = document.querySelector(".ticker-track");
    document.addEventListener("visibilitychange", () => {
      if (ticker) ticker.style.animationPlayState = document.hidden ? "paused" : "";
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
