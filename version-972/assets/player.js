(function () {
  function initMoviePlayer(source) {
    var video = document.querySelector("[data-video]");
    var overlay = document.querySelector("[data-play-overlay]");
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function showOverlay(show) {
      if (overlay) {
        overlay.classList.toggle("is-hidden", !show);
      }
    }

    function startPlayback() {
      attachSource();
      showOverlay(false);
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showOverlay(true);
        });
      }
    }

    attachSource();
    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      showOverlay(false);
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showOverlay(true);
      }
    });
    video.addEventListener("ended", function () {
      showOverlay(true);
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
