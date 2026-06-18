(function () {
    'use strict';

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function toggleHidden(element) {
        if (!element) {
            return;
        }
        element.hidden = !element.hidden;
    }

    function initHeader() {
        var searchToggle = qs('.search-toggle');
        var searchPanel = qs('.header-search');
        var menuToggle = qs('.menu-toggle');
        var mobilePanel = qs('.mobile-panel');

        if (searchToggle && searchPanel) {
            searchToggle.addEventListener('click', function () {
                toggleHidden(searchPanel);
                var input = qs('input[type="search"]', searchPanel);
                if (!searchPanel.hidden && input) {
                    input.focus();
                }
            });
        }

        if (menuToggle && mobilePanel) {
            menuToggle.addEventListener('click', function () {
                toggleHidden(mobilePanel);
            });
        }
    }

    function initHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        var prev = qs('.hero-prev');
        var next = qs('.hero-next');
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 6000);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                startAutoPlay();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startAutoPlay();
            });
        }

        qs('.hero-carousel').addEventListener('mouseenter', stopAutoPlay);
        qs('.hero-carousel').addEventListener('mouseleave', startAutoPlay);
        startAutoPlay();
    }

    function initPlayer() {
        var shell = qs('.video-shell');
        if (!shell) {
            return;
        }

        var video = qs('.movie-player', shell);
        var cover = qs('.player-cover', shell);
        var source = shell.getAttribute('data-video-src');
        var poster = shell.getAttribute('data-poster');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        function loadAndPlay() {
            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = source;
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener('click', loadAndPlay);
        }

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
    }

    function initLocalFilter() {
        var input = qs('.local-filter-input');
        var yearSelect = qs('.local-year-select');
        var cards = qsa('.local-card-list .movie-card');
        var count = qs('.filter-count');

        if (!cards.length) {
            return;
        }

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var cardYear = card.getAttribute('data-year') || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var show = matchedKeyword && matchedYear;
                card.classList.toggle('is-hidden-card', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <span class="poster-wrap">',
            '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '            <span class="poster-shade"></span>',
            '            <span class="play-badge">▶</span>',
            '            <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '        </span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine || '') + '</p>',
            '        <div class="card-tags">',
            '            <span>' + escapeHtml(movie.category || '') + '</span>',
            '            <span>' + escapeHtml(movie.type || '') + '</span>',
            '            <span>' + escapeHtml(movie.region || '') + '</span>',
            '        </div>',
            '        <div class="tiny-tags">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        if (document.body.getAttribute('data-page') !== 'search') {
            return;
        }

        var data = window.SEARCH_MOVIES || [];
        var form = qs('#searchTool');
        var input = qs('#searchInput');
        var category = qs('#searchCategory');
        var results = qs('#searchResults');
        var status = qs('#searchStatus');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (!form || !input || !results || !status) {
            return;
        }

        input.value = initialQuery;

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function render() {
            var keyword = normalize(input.value);
            var selectedCategory = category ? category.value : '';
            var matched = data.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedCategory = !selectedCategory || movie.category === selectedCategory;
                return matchedKeyword && matchedCategory;
            }).slice(0, 120);

            status.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length >= 120 ? '，已显示前 120 条。' : '。');
            results.innerHTML = matched.map(createSearchCard).join('');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
        input.addEventListener('input', render);
        if (category) {
            category.addEventListener('change', render);
        }
        render();
    }

    function initBackTop() {
        qsa('.back-top').forEach(function (button) {
            button.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initHero();
        initPlayer();
        initLocalFilter();
        initSearchPage();
        initBackTop();
    });
}());
