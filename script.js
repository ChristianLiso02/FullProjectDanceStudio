/* =========================================================
   FULL PROJECT DANCE STUDIO — script.js
   Interazioni: menu mobile, header on scroll, smooth scroll,
   nav attiva, contatori animati, reveal on scroll, form contatti.
   ========================================================= */

/* ---------- Invio del form "Richiedi la tua prova gratuita" ----------
   Tre modalità possibili, scelte automaticamente in quest'ordine:
   1) EmailJS  — se EMAILJS_PUBLIC_KEY/SERVICE_ID/TEMPLATE_ID sono compilati:
      invia l'email direttamente dal browser, nessun backend necessario.
      Vedi EMAILJS-SETUP.txt per come attivarlo (2 minuti).
   2) Backend  — se EmailJS non è configurato ma BOOKING_API_URL sì: usa il
      backend Java (repo separato github.com/ChristianLiso02/
      FullProjectDanceStudio-backend), quando sarà online.
   3) Demo     — se nessuna delle due è configurata (stato attuale): nessuna
      chiamata di rete, solo un console.log. */

// MODIFICA: vedi EMAILJS-SETUP.txt
const EMAILJS_PUBLIC_KEY = "";
const EMAILJS_SERVICE_ID = "";
const EMAILJS_TEMPLATE_ID = "";

// MODIFICA: URL pubblico del backend Java, quando sarà online.
const BOOKING_API_URL = "";

if (EMAILJS_PUBLIC_KEY && window.emailjs) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

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

/* ---------- Validazione e invio dei form ----------
   Se non è configurato né EmailJS né apiUrl, il form resta in modalità
   dimostrativa (nessuna chiamata di rete, solo un console.log). Il form
   "Gadget" non è ancora collegato a nessun servizio e resta in demo. */
function initFormValidation(formId, successId, demoLabel, options = {}) {
  const { apiUrl = "" } = options;
  const form = document.getElementById(formId);
  if (!form) return;

  const successMsg = document.getElementById(successId);
  const errorMsg = document.getElementById(`${formId}-error`);
  const submitBtn = form.querySelector('button[type="submit"]');
  const emailJsReady = Boolean(
    EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && window.emailjs
  );

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (successMsg) successMsg.hidden = true;
    if (errorMsg) errorMsg.hidden = true;

    let formIsValid = true;

    ["nome", "email", "telefono"].forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      const isValid = validators[name] ? validators[name](field.value) : true;
      setFieldState(field, isValid);
      if (!isValid) formIsValid = false;
    });

    if (!formIsValid) return;

    const data = Object.fromEntries(new FormData(form));

    if (data.website) {
      // Honeypot anti-spam compilato: risposta "finta" di successo, nessun
      // invio reale. Con EmailJS non c'è un server davanti che possa
      // filtrarlo, quindi il controllo va fatto qui.
      if (successMsg) successMsg.hidden = false;
      form.reset();
      return;
    }

    if (!emailJsReady && !apiUrl) {
      // Modalità dimostrativa: nessun servizio ancora collegato.
      console.log(`${demoLabel} (demo):`, data);
      if (successMsg) successMsg.hidden = false;
      form.reset();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      if (emailJsReady) {
        const { website, ...emailData } = data;
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailData);
      } else {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Risposta del server: ${response.status}`);
      }

      if (successMsg) successMsg.hidden = false;
      form.reset();
    } catch (err) {
      console.error(`${demoLabel}: invio fallito`, err);
      if (errorMsg) errorMsg.hidden = false;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Rimuovi lo stato di errore non appena l'utente ricomincia a scrivere
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      el.closest(".form-row")?.classList.remove("invalid");
    });
  });
}

function initContactForm() {
  initFormValidation("contact-form", "form-success", "Richiesta prova gratuita", { apiUrl: BOOKING_API_URL });
}

function initGadgetForm() {
  initFormValidation("gadget-form", "gadget-form-success", "Richiesta ordine gadget");
}
