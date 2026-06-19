(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dotsWrap = carousel.querySelector('[data-hero-dots]');
        if (!slides.length || !dotsWrap) {
            return;
        }
        var current = 0;
        var dots = slides.map(function (_, index) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'hero-dot' + (index === 0 ? ' is-active' : '');
            dot.setAttribute('aria-label', '切换推荐 ' + (index + 1));
            dot.addEventListener('click', function () {
                showSlide(index);
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        function showSlide(index) {
            slides[current].classList.remove('is-active');
            dots[current].classList.remove('is-active');
            current = index;
            slides[current].classList.add('is-active');
            dots[current].classList.add('is-active');
        }

        window.setInterval(function () {
            showSlide((current + 1) % slides.length);
        }, 5200);
    }

    function setupFiltering() {
        var toolbar = document.querySelector('[data-filter-toolbar]');
        var grid = document.querySelector('[data-filter-grid]');
        if (!toolbar || !grid) {
            return;
        }
        var input = toolbar.querySelector('[data-filter-input]');
        var category = toolbar.querySelector('[data-category-filter]');
        var year = toolbar.querySelector('[data-year-filter]');
        var count = toolbar.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        function getQueryFromUrl() {
            try {
                return new URLSearchParams(window.location.search).get('q') || '';
            } catch (error) {
                return '';
            }
        }

        if (input && !input.value) {
            input.value = getQueryFromUrl();
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var categoryValue = category ? category.value : '';
            var yearValue = year && year.value ? parseInt(year.value, 10) : 0;
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (categoryValue && cardCategory !== categoryValue) {
                    matched = false;
                }
                if (yearValue && cardYear < yearValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部';
            }
        }

        [input, category, year].forEach(function (node) {
            if (!node) {
                return;
            }
            node.addEventListener('input', applyFilter);
            node.addEventListener('change', applyFilter);
        });

        applyFilter();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-video-src]');
            var button = shell.querySelector('[data-play-button]');
            if (!video || !button) {
                return;
            }
            var loaded = false;

            function loadAndPlay() {
                if (!loaded) {
                    var source = video.getAttribute('data-video-src');
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls();
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else {
                        video.src = source;
                    }
                    loaded = true;
                }
                button.classList.add('is-hidden');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }

            button.addEventListener('click', loadAndPlay);
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFiltering();
        setupPlayers();
    });
}());
