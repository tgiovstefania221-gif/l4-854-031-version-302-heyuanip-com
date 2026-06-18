(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var next = document.querySelector("[data-hero-next]");
        var prev = document.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var section = panel.parentElement;
            var list = section ? section.querySelector("[data-filter-list]") : null;
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]"));
            var activeFilter = "all";

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    card.classList.toggle("is-filtered-out", !(matchKeyword && matchFilter));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter-button") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var mask = document.querySelector("[data-player-mask]");
        var starters = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
        if (!video || !source) {
            return;
        }
        var bound = false;

        function bind() {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            bind();
            video.controls = true;
            if (mask) {
                mask.classList.add("is-hidden");
            }
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        }

        starters.forEach(function (starter) {
            starter.addEventListener("click", start);
        });
        video.addEventListener("click", start);
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
