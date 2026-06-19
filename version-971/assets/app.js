(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        const button = document.querySelector("[data-menu-button]");
        const menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;
        let timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function setupFilters() {
        const scope = document.querySelector("[data-filter-scope]");
        if (!scope) {
            return;
        }
        const grid = scope.querySelector("[data-movie-grid]");
        if (!grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll(".movie-card"));
        const textInput = scope.querySelector("[data-filter-text]");
        const regionInput = scope.querySelector("[data-filter-region]");
        const typeInput = scope.querySelector("[data-filter-type]");
        const categoryInput = scope.querySelector("[data-filter-category]");
        const countOutput = scope.querySelector("[data-filter-count]");

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-site-category")
            ].join(" "));
        }

        function apply() {
            const query = normalize(textInput && textInput.value);
            const region = normalize(regionInput && regionInput.value);
            const type = normalize(typeInput && typeInput.value);
            const category = normalize(categoryInput && categoryInput.value);
            let visible = 0;
            cards.forEach(function (card) {
                const text = cardText(card);
                const ok = (!query || text.indexOf(query) !== -1) &&
                    (!region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1) &&
                    (!type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1) &&
                    (!category || normalize(card.getAttribute("data-site-category")).indexOf(category) !== -1);
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (countOutput) {
                countOutput.textContent = visible + " 部";
            }
        }

        [textInput, regionInput, typeInput, categoryInput].forEach(function (input) {
            if (input) {
                input.addEventListener("input", apply);
                input.addEventListener("change", apply);
            }
        });
        apply();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function createMovieCard(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\" title=\"" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-shade\"></span>",
            "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
            "<span class=\"score-badge\">" + escapeHtml(movie.score) + "</span>",
            "</a>",
            "<div class=\"movie-body\">",
            "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
            "<p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.category) + "</p>",
            "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
            "</div>",
            "</article>"
        ].join("");
    }

    function setupSearchPage() {
        const results = document.querySelector("[data-search-results]");
        const status = document.querySelector("[data-search-status]");
        const pages = document.querySelector("[data-search-pages]");
        const input = document.querySelector("[data-search-page-input]");
        if (!results || !status || !pages || !window.MOVIES) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";
        if (input) {
            input.value = query;
        }
        const pageSize = 36;
        let page = 1;
        const movies = window.MOVIES.filter(function (movie) {
            const text = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.category,
                movie.oneLine
            ].join(" "));
            return !query || text.indexOf(normalize(query)) !== -1;
        });

        function render() {
            const totalPages = Math.max(1, Math.ceil(movies.length / pageSize));
            page = Math.min(page, totalPages);
            const start = (page - 1) * pageSize;
            const chunk = movies.slice(start, start + pageSize);
            results.innerHTML = chunk.map(createMovieCard).join("");
            status.textContent = query ? "找到 " + movies.length + " 部相关影片" : "推荐浏览 " + movies.length + " 部影片";
            const buttons = [];
            for (let i = 1; i <= totalPages; i += 1) {
                if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
                    buttons.push("<button type=\"button\" class=\"" + (i === page ? "is-active" : "") + "\" data-page=\"" + i + "\">" + i + "</button>");
                }
            }
            pages.innerHTML = buttons.join("");
            Array.from(pages.querySelectorAll("button")).forEach(function (button) {
                button.addEventListener("click", function () {
                    page = Number(button.getAttribute("data-page"));
                    render();
                    window.scrollTo({ top: results.offsetTop - 120, behavior: "smooth" });
                });
            });
        }
        render();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
