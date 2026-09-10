/* =========================================================
   FULL PROJECT DANCE STUDIO — script.js
   Interazioni: menu mobile, header on scroll, smooth scroll,
   nav attiva, contatori animati, reveal on scroll, form contatti.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Ogni init è isolata: se una funzione fallisce (browser datato, elemento
  // mancante, ecc.) le altre continuano a funzionare normalmente.
  const safeInit = (fn) => {
    try { fn(); } catch (err) { console.error(`Errore in ${fn.name}:`, err); }
  };

  safeInit(initHeaderScroll);
  safeInit(initMobileNav);
  safeInit(initActiveNav);
  safeInit(initRevealOnScroll);
  safeInit(initCounters);
  safeInit(initBackToTop);
  safeInit(initContactForm);
  safeInit(initGadgetForm);

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ---------- Header che si compatta allo scroll ---------- */
function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Menu mobile (hamburger) ---------- */
function initMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  if (!hamburger || !nav) return;

  const closeNav = () => {
    nav.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  // Chiudi il menu quando si clicca un link
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  // Chiudi il menu con il tasto ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
}

/* ---------- Evidenzia la voce di menu attiva durante lo scroll ---------- */
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Animazione "reveal" degli elementi allo scroll ---------- */
function initRevealOnScroll() {
  const items = document.querySelectorAll("[data-aos]");
  if (!items.length) return;

  const revealAll = () => items.forEach((el) => el.classList.add("in-view"));

  // Rispetta la preferenza utente per animazioni ridotte
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Se il browser non supporta IntersectionObserver, mostra tutto subito
  // invece di lasciare le sezioni invisibili per sempre.
  if (prefersReduced || typeof IntersectionObserver === "undefined") {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((el) => observer.observe(el));

  // Rete di sicurezza: se per qualsiasi motivo dopo 4 secondi ci sono ancora
  // elementi nascosti (scroll estremamente rapido, tab in background, ecc.),
  // mostrali comunque. Meglio senza animazione che invisibili.
  setTimeout(() => {
    document.querySelectorAll("[data-aos]:not(.in-view)").forEach((el) => {
      el.classList.add("in-view");
      observer.unobserve(el);
    });
  }, 4000);
}

/* ---------- Contatori numerici animati (es. 500+ allievi) ---------- */
function initCounters() {
  const counters = document.querySelectorAll(".stat-num[data-count]");
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------- Bottone "torna su" ---------- */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 500);
    },
    { passive: true }
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Validazione e invio (demo) dei form ----------
   NOTA: questi form NON inviano realmente email. Prima di pubblicare il
   sito, collega l'azione di invio a un servizio come Formspree, EmailJS,
   Netlify Forms oppure a un tuo backend, sostituendo il console.log
   qui sotto con una vera chiamata (fetch/POST). La stessa funzione
   generica gestisce sia il form "Prova gratuita" che il form "Gadget". */
function initFormValidation(formId, successId, demoLabel) {
  const form = document.getElementById(formId);
  if (!form) return;

  const successMsg = document.getElementById(successId);

  const validators = {
    nome: (value) => value.trim().length >= 2,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    telefono: (value) => value.trim() === "" || /^[0-9+\s()-]{6,}$/.test(value.trim()),
  };

  const setFieldState = (field, isValid) => {
    const row = field.closest(".form-row");
    if (!row) return;
    row.classList.toggle("invalid", !isValid);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (successMsg) successMsg.hidden = true;

    let formIsValid = true;

    ["nome", "email", "telefono"].forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      const isValid = validators[name] ? validators[name](field.value) : true;
      setFieldState(field, isValid);
      if (!isValid) formIsValid = false;
    });

    if (!formIsValid) return;

    // Demo: qui andrebbe la vera chiamata di invio (fetch a un servizio esterno).
    console.log(`${demoLabel} (demo):`, Object.fromEntries(new FormData(form)));

    if (successMsg) successMsg.hidden = false;
    form.reset();
  });

  // Rimuovi lo stato di errore non appena l'utente ricomincia a scrivere
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      el.closest(".form-row")?.classList.remove("invalid");
    });
  });
}

function initContactForm() {
  initFormValidation("contact-form", "form-success", "Richiesta prova gratuita");
}

function initGadgetForm() {
  initFormValidation("gadget-form", "gadget-form-success", "Richiesta ordine gadget");
}
