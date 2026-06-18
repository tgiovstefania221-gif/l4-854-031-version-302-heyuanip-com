(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function matchYear(mode, value) {
    var year = parseInt(value || '0', 10);
    if (mode === 'all') {
      return true;
    }
    if (!year) {
      return false;
    }
    if (mode === '2020') {
      return year >= 2020;
    }
    if (mode === '2010') {
      return year >= 2010 && year <= 2019;
    }
    if (mode === '2000') {
      return year >= 2000 && year <= 2009;
    }
    return year < 2000;
  }

  function setupFilters() {
    var cards = selectAll('.movie-card');
    if (!cards.length) {
      return;
    }
    var input = document.querySelector('.movie-filter-input');
    var typeFilter = document.querySelector('.type-filter');
    var yearFilter = document.querySelector('.year-filter');
    var categoryFilter = document.querySelector('.category-filter');
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : 'all';
      var yearValue = yearFilter ? yearFilter.value : 'all';
      var categoryValue = categoryFilter ? categoryFilter.value : 'all';
      var shown = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (typeValue !== 'all' && cardType !== typeValue) {
          ok = false;
        }
        if (!matchYear(yearValue, cardYear)) {
          ok = false;
        }
        if (categoryValue !== 'all' && cardCategory !== categoryValue) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [input, typeFilter, yearFilter, categoryFilter].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });

    apply();
  }

  window.setupPlayer = function (videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !sourceUrl) {
      return;
    }
    var started = false;
    var hlsInstance = null;

    function begin() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = sourceUrl;
        video.play().catch(function () {});
      }
    }

    cover.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
