(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.classList.toggle("is-open", open);
      document.body.classList.toggle("is-locked", open);
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        restart();
      });
    });
    if (next) {
      next.addEventListener("click", function () {
        activate(current + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        activate(current - 1);
        restart();
      });
    }
    activate(0);
    restart();
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function setupMovieFilter() {
    var grid = document.querySelector("[data-movie-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-page-search]");
    var category = document.querySelector("[data-category-select]");
    var sort = document.querySelector("[data-sort-select]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function matches(card, query, categoryValue) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.textContent
      ].map(normalize).join(" ");
      var cardCategory = card.getAttribute("data-category") || "";
      var queryMatched = !query || haystack.indexOf(query) !== -1;
      var categoryMatched = !categoryValue || categoryValue === "all" || cardCategory === categoryValue;
      return queryMatched && categoryMatched;
    }

    function sortCards(visibleCards) {
      var mode = sort ? sort.value : "default";
      if (mode === "default") {
        visibleCards.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      if (mode === "year-desc") {
        visibleCards.sort(function (a, b) {
          return (parseInt(b.getAttribute("data-year"), 10) || 0) - (parseInt(a.getAttribute("data-year"), 10) || 0);
        });
      }
      if (mode === "year-asc") {
        visibleCards.sort(function (a, b) {
          return (parseInt(a.getAttribute("data-year"), 10) || 0) - (parseInt(b.getAttribute("data-year"), 10) || 0);
        });
      }
      if (mode === "title") {
        visibleCards.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
        });
      }
      visibleCards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function apply() {
      var query = normalize(search ? search.value : "");
      var categoryValue = category ? category.value : "";
      var visibleCards = [];
      cards.forEach(function (card) {
        var show = matches(card, query, categoryValue);
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visibleCards.push(card);
        }
      });
      sortCards(visibleCards);
      if (empty) {
        empty.classList.toggle("is-visible", visibleCards.length === 0);
      }
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (category) {
      category.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 420);
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupMovieFilter();
    setupBackTop();
  });
})();
