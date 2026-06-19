(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");

    if (toggle && header) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("mobile-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      showSlide(0);
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var searchRoot = document.querySelector("[data-search-root]");
    if (searchRoot) {
      var input = searchRoot.querySelector("[data-search-input]");
      var region = searchRoot.querySelector("[data-region-filter]");
      var year = searchRoot.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(searchRoot.querySelectorAll(".movie-card"));
      var empty = searchRoot.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";

      if (input && q) {
        input.value = q;
      }

      function filterCards() {
        var words = input ? input.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = card.getAttribute("data-search") || "";
          var matchWords = words.every(function (word) {
            return haystack.indexOf(word) !== -1;
          });
          var matchRegion = !regionValue || haystack.indexOf(regionValue.toLowerCase()) !== -1;
          var matchYear = !yearValue || haystack.indexOf(yearValue.toLowerCase()) !== -1;
          var show = matchWords && matchRegion && matchYear;

          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          searchRoot.classList.toggle("no-results", visible === 0);
        }
      }

      [input, region, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", filterCards);
          element.addEventListener("change", filterCards);
        }
      });

      filterCards();
    }

    Array.prototype.slice.call(document.querySelectorAll(".player")).forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var streamUrl = player.getAttribute("data-video");
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !video || !streamUrl) {
          return;
        }
        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        prepare();
        player.classList.add("is-playing");
        if (video) {
          var action = video.play();
          if (action && action.catch) {
            action.catch(function () {});
          }
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
      }
    });
  });
})();
