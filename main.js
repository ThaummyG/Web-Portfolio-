const languageToggle = document.querySelector(".language-toggle");

const readTranslations = async (language) => {
  const response = await fetch(`./locales/${language}.json`);
  if (!response.ok) {
    throw new Error(`Could not load ${language} translations (${response.status}).`);
  }
  return response.json();
};

const setActiveLanguage = (language) => {
  document.documentElement.lang = language;
  document.querySelectorAll(".language-option").forEach((option) => {
    const isActive = option.dataset.lang === language;
    option.classList.toggle("is-active", isActive);
    if (isActive) {
      option.setAttribute("aria-current", "true");
    } else {
      option.removeAttribute("aria-current");
    }
  });
};

const updateContent = () => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = window.i18next.t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = window.i18next.t(element.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", window.i18next.t(element.dataset.i18nAriaLabel));
  });
  document.title = window.i18next.t("meta.title");
  document.querySelector('meta[name="description"]').content = window.i18next.t("meta.description");
  setActiveLanguage(window.i18next.resolvedLanguage);
};

const animatePage = () => {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  window.gsap.utils.toArray(".reveal").forEach((element) => {
    window.gsap.fromTo(
      element,
      { y: 18, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        clearProps: "all",
        ...(window.ScrollTrigger
          ? { scrollTrigger: { trigger: element, start: "top 88%", once: true } }
          : {}),
      },
    );
  });
};

const startPortfolio = async () => {
  if (!window.i18next) {
    console.error("i18next did not load. Check the CDN connection.");
    return;
  }

  const [english, thai] = await Promise.all([
    readTranslations("en"),
    readTranslations("th"),
  ]);

  await window.i18next.init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { translation: english },
      th: { translation: thai },
    },
    interpolation: {
      escapeValue: false,
    },
  });

  updateContent();
  document.getElementById("year").textContent = new Date().getFullYear();
  animatePage();

  languageToggle.addEventListener("click", async () => {
    const nextLanguage = window.i18next.resolvedLanguage === "en" ? "th" : "en";
    await window.i18next.changeLanguage(nextLanguage);
    updateContent();
  });
};

startPortfolio().catch((error) => {
  console.error("Portfolio initialization failed:", error);
});
