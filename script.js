/* ============================================================
   Мини-лендинг «Постановка звуков» — логика
   - подстановка ссылок мессенджеров (те же боты ЛисицыУМ, тег zvuki)
   - цели Яндекс.Метрики на клики
   - показ sticky-бара после прокрутки мимо hero-кнопок
   ============================================================ */

(function () {
  "use strict";

  // ---- КОНФИГ ----
  // Тег источника "zvuki" передаётся в Wazzup:
  //  - TG/MAX: придёт первым сообщением "/start zvuki" (видно менеджеру в чате)
  //  - VK: ref/ref_source сохранятся в UTM-полях сделки (CRM МойКласс)
  // METRIKA_ID: пока плейсхолдер. Создать отдельный счётчик на домен
  //  zvuki.лисицыум.рф, вписать сюда id и раскомментировать блок в index.html.
  //  Пока значение "METRIKA_ID" — цели не отправляются (защита ниже).
  var CONFIG = {
    TELEGRAM_URL: "https://t.me/LisitsyUm_bot?start=zvuki",
    VK_URL: "https://vk.me/lisicium?ref=zvuki&ref_source=vizitka",
    MAX_URL: "https://max.ru/id780518760353_bot?start=zvuki",
    METRIKA_ID: "METRIKA_ID",
  };

  var urlByCta = {
    telegram: CONFIG.TELEGRAM_URL,
    vk: CONFIG.VK_URL,
    max: CONFIG.MAX_URL,
  };

  // ---- Цели Метрики ----
  function reachGoal(goal) {
    if (
      typeof window.ym === "function" &&
      CONFIG.METRIKA_ID &&
      CONFIG.METRIKA_ID !== "METRIKA_ID"
    ) {
      window.ym(CONFIG.METRIKA_ID, "reachGoal", goal);
    }
  }

  // ---- Подстановка ссылок + трекинг кликов по кнопкам мессенджеров ----
  var ctaLinks = document.querySelectorAll("[data-cta]");
  Array.prototype.forEach.call(ctaLinks, function (link) {
    var cta = link.getAttribute("data-cta");
    var placement = link.getAttribute("data-placement") || "unknown";
    var url = urlByCta[cta];
    if (url) {
      link.setAttribute("href", url);
      // открывать мессенджер в новой вкладке только для реальных http(s)-ссылок
      if (/^https?:\/\//i.test(url)) {
        link.setAttribute("target", "_blank");
      }
    }
    link.addEventListener("click", function () {
      reachGoal("click_" + cta);
      reachGoal("click_" + cta + "_" + placement);
    });
  });

  // ---- Sticky-bar: плавный скролл к финальному блоку ----
  var stickyBtn = document.querySelector("[data-scroll-to]");
  if (stickyBtn) {
    stickyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(".card--final");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      reachGoal("click_sticky_cta");
    });
  }

  // ---- Показ sticky-бара после прокрутки мимо hero-кнопок ----
  var sticky = document.getElementById("stickyCta");
  var heroCta = document.querySelector(".hero .cta-row");
  var finalCard = document.querySelector(".card--final");

  if (sticky && heroCta) {
    var shown = false;

    function updateSticky() {
      // hero-кнопки ушли вверх за экран?
      var heroBottom = heroCta.getBoundingClientRect().bottom;
      // финальный блок уже виден? тогда прячем бар (кнопки и так на экране)
      var finalVisible = false;
      if (finalCard) {
        var fr = finalCard.getBoundingClientRect();
        finalVisible = fr.top < window.innerHeight * 0.85 && fr.bottom > 0;
      }
      var shouldShow = heroBottom < 0 && !finalVisible;
      if (shouldShow !== shown) {
        shown = shouldShow;
        sticky.classList.toggle("is-visible", shown);
        sticky.setAttribute("aria-hidden", shown ? "false" : "true");
      }
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateSticky();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateSticky();
  }
})();
