(function () {
    function closestForm(element) {
        while (element && element !== document) {
            if (element.classList && element.classList.contains('site-search')) {
                return element;
            }
            element = element.parentNode;
        }
        return null;
    }

    function escapeText(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function rootPrefix() {
        return document.body.getAttribute('data-root-prefix') || '';
    }

    function resolveUrl(url) {
        return rootPrefix() + url;
    }

    function setupNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        setSlide(0);
        startTimer();
    }

    function buildSearchResults(query) {
        var list = window.SITE_MOVIES || [];
        var terms = query.trim().toLowerCase();
        if (!terms) {
            return [];
        }
        return list.filter(function (item) {
            return item.search.toLowerCase().indexOf(terms) !== -1;
        }).slice(0, 12);
    }

    function renderSearch(form, results) {
        var panel = form.querySelector('.site-search-results');
        if (!panel) {
            return;
        }
        if (!results.length) {
            panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
            panel.classList.add('is-visible');
            return;
        }
        panel.innerHTML = results.map(function (item) {
            return '<a class="search-result-item" href="' + escapeText(resolveUrl(item.url)) + '">' +
                '<img src="' + escapeText(resolveUrl(item.cover)) + '" alt="' + escapeText(item.title) + '">' +
                '<span><strong>' + escapeText(item.title) + '</strong>' +
                '<span>' + escapeText(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></span>' +
                '</a>';
        }).join('');
        panel.classList.add('is-visible');
    }

    function setupSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
        forms.forEach(function (form) {
            var input = form.querySelector('.site-search-input');
            var panel = form.querySelector('.site-search-results');
            if (!input || !panel) {
                return;
            }

            input.addEventListener('input', function () {
                var results = buildSearchResults(input.value);
                if (!input.value.trim()) {
                    panel.classList.remove('is-visible');
                    panel.innerHTML = '';
                    return;
                }
                renderSearch(form, results);
            });

            input.addEventListener('focus', function () {
                if (input.value.trim()) {
                    renderSearch(form, buildSearchResults(input.value));
                }
            });

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var results = buildSearchResults(input.value);
                if (results.length) {
                    window.location.href = resolveUrl(results[0].url);
                }
            });
        });

        document.addEventListener('click', function (event) {
            if (!closestForm(event.target)) {
                document.querySelectorAll('.site-search-results.is-visible').forEach(function (panel) {
                    panel.classList.remove('is-visible');
                });
            }
        });
    }

    function setupFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        var list = document.querySelector('[data-filter-list]');
        if (!scope || !list) {
            return;
        }
        var keyword = scope.querySelector('[data-filter-keyword]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var year = scope.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));

        function applyFilter() {
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';

            cards.forEach(function (card) {
                var matchesKeyword = !keywordValue || card.getAttribute('data-search').toLowerCase().indexOf(keywordValue) !== -1;
                var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                card.classList.toggle('is-filter-hidden', !(matchesKeyword && matchesRegion && matchesType && matchesYear));
            });
        }

        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupSearch();
        setupFilters();
    });
}());
