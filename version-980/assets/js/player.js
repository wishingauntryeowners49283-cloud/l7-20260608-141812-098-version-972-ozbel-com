(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var hlsInstance = null;
        var started = false;

        function startPlayer() {
            if (!video) {
                return;
            }

            var url = video.getAttribute('data-video');

            if (!url) {
                return;
            }

            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                started = true;
            }

            shell.classList.add('playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayer);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started || video.paused) {
                    startPlayer();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    shell.classList.remove('playing');
                }
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
