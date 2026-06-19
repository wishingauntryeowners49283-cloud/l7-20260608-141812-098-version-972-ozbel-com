(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restartTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var search = panel.querySelector('[data-card-search]');
        var year = panel.querySelector('[data-year-filter]');
        var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-chip]'));
        var grid = document.querySelector('[data-card-grid]');
        var selectedChip = '';

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            if (!grid) {
                return;
            }
            var query = normalize(search ? search.value : '');
            var yearValue = year ? year.value : '';
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var matchChip = !selectedChip || text.indexOf(normalize(selectedChip)) !== -1;
                card.classList.toggle('hidden', !(matchQuery && matchYear && matchChip));
            });
        }

        if (search) {
            search.addEventListener('input', applyFilter);
        }

        if (year) {
            year.addEventListener('change', applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                selectedChip = chip.getAttribute('data-filter-chip') || '';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                applyFilter();
            });
        });
    });

    var searchApp = document.querySelector('[data-search-app]');

    if (searchApp && typeof MOVIE_SEARCH_INDEX !== 'undefined' && Array.isArray(MOVIE_SEARCH_INDEX)) {
        var input = searchApp.querySelector('[data-global-search]');
        var form = searchApp.querySelector('.search-form');
        var results = searchApp.querySelector('[data-search-results]');
        var data = MOVIE_SEARCH_INDEX;
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function render(query) {
            var normalized = String(query || '').trim().toLowerCase();
            var list = data.filter(function (item) {
                if (!normalized) {
                    return false;
                }
                return [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' '), item.summary]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(normalized) !== -1;
            }).slice(0, 60);

            if (!normalized) {
                results.innerHTML = '<p class="empty-result">请输入关键词开始搜索。</p>';
                return;
            }

            if (!list.length) {
                results.innerHTML = '<p class="empty-result">没有找到匹配内容。</p>';
                return;
            }

            results.innerHTML = list.map(function (item) {
                return '<a class="search-result-item" href="' + escapeHtml(item.url) + '">' +
                    '<span class="thumb poster-fallback"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" onerror="this.style.display=\'none\'"></span>' +
                    '<span><h2>' + escapeHtml(item.title) + '</h2>' +
                    '<p>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
                    '<p>' + escapeHtml(item.summary) + '</p></span>' +
                    '</a>';
            }).join('');
        }

        if (input) {
            input.value = initialQuery;
            input.addEventListener('input', function () {
                render(input.value);
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render(input ? input.value : '');
            });
        }

        render(initialQuery);
    }
})();
