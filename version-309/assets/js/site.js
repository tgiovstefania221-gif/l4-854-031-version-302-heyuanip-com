(function () {
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('is-open');
      if (searchPanel.classList.contains('is-open')) {
        var input = searchPanel.querySelector('input');
        if (input) {
          input.focus();
        }
      }
    });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"], input[type="search"]');
      var value = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || 'search.html';
      window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
    });
  });

  document.querySelectorAll('[data-local-filter-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterInput && filterList) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }

    var filterItems = Array.prototype.slice.call(filterList.querySelectorAll('[data-filter-item]'));
    var emptyBox = filterList.querySelector('[data-filter-empty]');
    var applyFilter = function () {
      var value = filterInput.value.trim().toLowerCase();
      var visible = 0;
      filterItems.forEach(function (item) {
        var text = item.getAttribute('data-filter-text') || item.textContent.toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (emptyBox) {
        emptyBox.classList.toggle('is-visible', visible === 0);
      }
    };
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    var begin = function () {
      if (!video || !stream || started) {
        return;
      }
      started = true;
      player.classList.add('is-playing');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = stream;
      video.play().catch(function () {});
    };

    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var scrollTop = document.querySelector('[data-scroll-top]');
  if (scrollTop) {
    scrollTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
