(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function textOf(card) {
    return [
      card.dataset.title || "",
      card.dataset.year || "",
      card.dataset.region || "",
      card.dataset.genre || "",
      card.dataset.tags || ""
    ].join(" ").toLowerCase();
  }

  function applyLocalSearch(input) {
    var value = (input.value || "").trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var matched = 0;
    cards.forEach(function(card) {
      var ok = !value || textOf(card).indexOf(value) !== -1;
      card.hidden = !ok;
      if (ok) {
        matched += 1;
      }
    });
    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.hidden = matched !== 0;
    }
  }

  function setupSorting(select) {
    var grid = document.querySelector("[data-sort-container]");
    if (!grid) {
      return;
    }
    select.addEventListener("change", function() {
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      var value = select.value;
      cards.sort(function(a, b) {
        if (value === "year-desc") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (value === "year-asc") {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (value === "title") {
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        }
        return Number(a.dataset.defaultOrder || 0) - Number(b.dataset.defaultOrder || 0);
      });
      cards.forEach(function(card) {
        grid.appendChild(card);
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupHeader() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("is-open");
      });
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./library.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  window.initMoviePlayer = function(config) {
    var video = document.getElementById(config.videoId);
    var cover = document.getElementById(config.coverId);
    var button = document.getElementById(config.buttonId);
    var loaded = false;
    var hls = null;

    if (!video) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      var url = config.source;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      loaded = true;
    }

    function start() {
      load();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function() {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function() {
      if (!loaded) {
        start();
      }
    });
    video.addEventListener("play", function() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function() {
    setupHeader();
    setupHero();

    var localSearch = document.querySelector("[data-local-search]");
    if (localSearch) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        localSearch.value = q;
      }
      localSearch.addEventListener("input", function() {
        applyLocalSearch(localSearch);
      });
      applyLocalSearch(localSearch);
    }

    var sortSelect = document.querySelector("[data-sort-select]");
    if (sortSelect) {
      setupSorting(sortSelect);
    }
  });
})();
